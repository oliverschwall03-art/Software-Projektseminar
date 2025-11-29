<template>
  <div class="skill-block">
    <h2 class="h6 mb-1 text-center">Skill Need Per Project &amp; Project Phase</h2>
    <p class="small text-muted text-center mb-3">
      Overview of skill profiles per project and project phase
      (0 = project meaningful; 1 = analytical; 2 = creative; 3 = ambidextrous)
    </p>

    <!-- TABLE: project x phase with 0–3 codes -->
    <div class="table-responsive small mb-3" v-if="projects.length && phaseIndices.length">
      <table class="table table-sm mb-0 align-middle text-center">
        <thead>
        <tr>
          <th class="text-start"></th>
          <th v-for="ph in phaseIndices" :key="ph">Phase {{ ph }}</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="p in projects" :key="p.id">
          <th class="text-start">{{ p.name }}</th>
          <td
              v-for="ph in phaseIndices"
              :key="ph"
          >
            {{ skillCodeFor(p, ph) ?? '–' }}
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="small text-muted text-center mb-3">
      No skill data available yet.
    </div>

    <!-- AREA CHART -->
    <v-chart
        v-if="phaseIndices.length"
        class="skill-chart"
        :option="chartOption"
        autoresize
    />
  </div>
</template>

<script setup>
/**
 * Skill area chart, Excel-style.
 *
 * DATA SOURCE:
 *   - projects[] from Pinia store
 *   - each project.phases[] with ambiRatingsLeft / ambiRatingsRight (1–5)
 *
 * LOGIC:
 *   1) For each project+phase, compute averages:
 *        leftAvg  = avg(phase.ambiRatingsLeft)
 *        rightAvg = avg(phase.ambiRatingsRight)
 *
 *   2) Map (leftAvg, rightAvg) → category according to Excel logic:
 *
 *      IF either avg missing → "reasonable"
 *      ELSE IF left < 2.5 AND right >= 2.5 → "exploitative"
 *      ELSE IF left < 2.5 AND right < 2.5  → "reasonable"
 *      ELSE IF left >= 2.5 AND right >= 2.5 → "ambidextrous"
 *      ELSE IF left >= 2.5 AND right < 2.5 → "explorative"
 *
 *   3) Map category → numeric skill code used in the table/legend:
 *
 *      "reasonable"    → 0  ("Project meaningful (0)")
 *      "exploitative"  → 1  ("analytical (1)")
 *      "explorative"   → 2  ("creative (2)")
 *      "ambidextrous"  → 3  ("ambidextrous (3)")
 *
 *   4) For each phase, count how many projects fall into each code (0–3),
 *      and convert counts into percentages that always sum to 100%.
 *
 *   5) Render a stacked area chart (line with fill) over the phases.
 */

import { computed } from 'vue'
import { useProjectsStore } from '@/stores/projects'
import { storeToRefs } from 'pinia'
import VChart from 'vue-echarts'

const store = useProjectsStore()
const { projects } = storeToRefs(store)

// ---- UTILITIES --------------------------------------------------------

function avg(arr) {
  if (!Array.isArray(arr) || !arr.length) return null
  const nums = arr
      .map(v => (v === null || v === '' ? NaN : Number(v)))
      .filter(v => !Number.isNaN(v))
  if (!nums.length) return null
  return nums.reduce((a, b) => a + b, 0) / nums.length
}

/**
 * Excel-based skill category from left/right averages.
 *
 * Returns one of: "exploitative", "explorative", "ambidextrous", "reasonable"
 */
function skillCategory(leftAvg, rightAvg) {
  if (leftAvg == null || rightAvg == null) return 'reasonable'

  if (leftAvg < 2.5 && rightAvg >= 2.5) return 'exploitative'
  if (leftAvg < 2.5 && rightAvg < 2.5) return 'reasonable'
  if (leftAvg >= 2.5 && rightAvg >= 2.5) return 'ambidextrous'
  if (leftAvg >= 2.5 && rightAvg < 2.5) return 'explorative'

  return 'reasonable'
}

/**
 * Map category → numeric code for table + legend.
 *
 * 0 = Project meaningful   (Excel: "project reasonable?")
 * 1 = analytical
 * 2 = creative
 * 3 = ambidextrous
 */
function categoryToCode(cat) {
  switch (cat) {
    case 'reasonable':
      return 0
    case 'exploitative':
      return 1
    case 'explorative':
      return 2
    case 'ambidextrous':
      return 3
    default:
      return null
  }
}

// ---- PHASE INDEX LIST -------------------------------------------------

const phaseIndices = computed(() => {
  const set = new Set()
  for (const p of projects.value) {
    if (!Array.isArray(p.phases)) continue
    for (const ph of p.phases) {
      if (typeof ph.index === 'number') set.add(ph.index)
    }
  }
  return Array.from(set).sort((a, b) => a - b)
})

// ---- PER PROJECT+PHASE → SKILL CODE (0–3) -----------------------------

function skillCodeFor(project, phaseIndex) {
  if (!project || !Array.isArray(project.phases)) return null
  const phase = project.phases.find(ph => ph.index === phaseIndex)
  if (!phase) return null

  const leftAvg = avg(phase.ambiRatingsLeft)
  const rightAvg = avg(phase.ambiRatingsRight)
  const cat = skillCategory(leftAvg, rightAvg)
  const code = categoryToCode(cat)

  return code
}

// ---- DISTRIBUTION PER PHASE ------------------------------------------

/**
 * distributionByPhase[phaseIndex] = [count0, count1, count2, count3]
 */
const distributionByPhase = computed(() => {
  const map = new Map()

  for (const p of projects.value) {
    if (!Array.isArray(p.phases)) continue
    for (const ph of p.phases) {
      const code = skillCodeFor(p, ph.index)
      if (code == null) continue

      if (!map.has(ph.index)) {
        map.set(ph.index, [0, 0, 0, 0])
      }
      const arr = map.get(ph.index)
      arr[code] += 1
    }
  }

  return map
})

// ---- ECHARTS OPTION ---------------------------------------------------

const chartOption = computed(() => {
  if (!phaseIndices.value.length) return {}

  // X axis labels: "Phase 1", "Phase 2", ...
  const xLabels = phaseIndices.value.map(i => `Phase ${i}`)

  // For each category 0–3, build percentage series data per phase
  const seriesData = [0, 1, 2, 3].map(code =>
      phaseIndices.value.map(phIndex => {
        const dist = distributionByPhase.value.get(phIndex) || [0, 0, 0, 0]
        const total =
            dist[0] + dist[1] + dist[2] + dist[3]

        if (!total) return 0
        return (dist[code] / total) * 100
      })
  )

  // Legend labels (same wording as in Excel)
  const legendNames = [
    'Project meaningful (0)',
    'analytical (1)',
    'creative (2)',
    'ambidextrous (3)'
  ]

  return {
    color: ['#4472c4', '#ed7d31', '#a5a5a5', '#ffc000'],
    tooltip: {
      trigger: 'axis',
      formatter: params => {
        // params is array of series at this phase
        const lines = []
        if (params.length) {
          lines.push(params[0].axisValueLabel)
        }
        params.forEach(p => {
          lines.push(
              `${p.marker} ${p.seriesName}: ${p.value.toFixed(0)}%`
          )
        })
        return lines.join('<br/>')
      }
    },
    legend: {
      bottom: 0,
      left: 'center',
      icon: 'circle',
      itemWidth: 10,
      itemHeight: 10
    },
    grid: {
      left: '8%',
      right: '4%',
      top: 40,
      bottom: 40
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: xLabels,
      axisLine: { show: true },
      axisTick: { show: true },
      axisLabel: {
        margin: 12 // ensure labels stay clearly under the axis
      }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      interval: 10,
      axisLabel: {
        formatter: '{value}%'
      },
      splitLine: {
        show: false // no horizontal grid lines, like in Excel
      }
    },
    series: [0, 1, 2, 3].map((code, idx) => ({
      name: legendNames[idx],
      type: 'line',
      stack: 'total',
      areaStyle: {},
      symbol: 'none',
      smooth: false,
      data: seriesData[code]
    }))
  }
})
</script>

<style scoped>
.skill-block {
  background-color: #ffffff;
  border-radius: 0.75rem;
  padding: 1rem 1.25rem 1.5rem;
}

.skill-chart {
  width: 100%;
  height: 260px; /* 可以根据需要再调整 */
}
</style>