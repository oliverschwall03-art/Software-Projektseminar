<template>
  <div class="card-box">
    <h2 class="h5 mb-2 text-center">
      Skill Need Per Project &amp; Project Phase
    </h2>
    <p class="small text-muted text-center mb-3">
      Overview of skill profiles per project and project phase
      (0 = project meaningful; 1 = analytical; 2 = creative; 3 =
      ambidextrous)
    </p>

    <!-- TABLE: project x phase skill codes -->
    <div v-if="hasPhases" class="table-responsive small mb-3">
      <table class="table table-sm mb-0 align-middle text-center">
        <thead>
        <tr>
          <th class="text-start">Project</th>
          <th
              v-for="ph in phaseIndices"
              :key="'skill-head-' + ph"
          >
            Phase {{ ph }}
          </th>
        </tr>
        </thead>
        <tbody>
        <tr
            v-for="p in projects"
            :key="'skill-row-' + p.id"
        >
          <th class="text-start">
            {{ p.name }}
          </th>
          <td
              v-for="ph in phaseIndices"
              :key="'skill-' + p.id + '-' + ph"
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
    <div ref="skillRef" class="chart-box skill-chart"></div>
  </div>
</template>

<script setup>
import {
  computed,
  ref,
  onMounted,
  onBeforeUnmount,
  watch,
} from 'vue'
import { useProjectsStore } from '@/stores/projects'
import { storeToRefs } from 'pinia'
import * as echarts from 'echarts'

const store = useProjectsStore()
const { projects } = storeToRefs(store)

// ---------------------------------------------------------
// Phase indices across all projects
// ---------------------------------------------------------
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

const hasPhases = computed(
    () => projects.value.length && phaseIndices.value.length
)

// ---------------------------------------------------------
// Skill logic (from Ambidexterity ratings)
// ---------------------------------------------------------
const SKILL_TYPES = [
  {
    key: 'reasonable',
    code: 0,
    label: 'Project meaningful (0)',
  },
  {
    key: 'exploitative',
    code: 1,
    label: 'analytical (1)',
  },
  {
    key: 'explorative',
    code: 2,
    label: 'creative (2)',
  },
  {
    key: 'ambidextrous',
    code: 3,
    label: 'ambidextrous (3)',
  },
]

function avg(arr) {
  if (!Array.isArray(arr) || !arr.length) return null
  const nums = arr
      .map(v => (v === null || v === '' ? NaN : Number(v)))
      .filter(v => !Number.isNaN(v))
  if (!nums.length) return null
  return nums.reduce((a, b) => a + b, 0) / nums.length
}

/**
 * Excel-based category from left/right averages.
 *
 * IF (left or right missing)              → "reasonable"
 * ELSE IF left < 2.5 AND right >= 2.5     → "exploitative"
 * ELSE IF left < 2.5 AND right < 2.5      → "reasonable"
 * ELSE IF left >= 2.5 AND right >= 2.5    → "ambidextrous"
 * ELSE IF left >= 2.5 AND right < 2.5     → "explorative"
 */
function skillCategory(leftAvg, rightAvg) {
  if (leftAvg == null || rightAvg == null) return 'reasonable'

  if (leftAvg < 2.5 && rightAvg >= 2.5) return 'exploitative'
  if (leftAvg < 2.5 && rightAvg < 2.5) return 'reasonable'
  if (leftAvg >= 2.5 && rightAvg >= 2.5) return 'ambidextrous'
  if (leftAvg >= 2.5 && rightAvg < 2.5) return 'explorative'

  return 'reasonable'
}

function categoryToCode(cat) {
  const entry = SKILL_TYPES.find(t => t.key === cat)
  return entry ? entry.code : null
}

// Phase 对象级别的计算，避免重复 find
function skillCodeForPhaseObj(phase) {
  if (!phase) return null
  const leftAvg = avg(phase.ambiRatingsLeft)
  const rightAvg = avg(phase.ambiRatingsRight)
  const cat = skillCategory(leftAvg, rightAvg)
  return categoryToCode(cat)
}

/**
 * Per project + phaseIndex → skill code 0–3
 * 用在上面的表格渲染
 */
function skillCodeFor(project, phaseIndex) {
  if (!project || !Array.isArray(project.phases)) return null
  const phase = project.phases.find(ph => ph.index === phaseIndex)
  return skillCodeForPhaseObj(phase)
}

/**
 * distributionByPhase: Map(phaseIndex → [count0, count1, count2, count3])
 */
const distributionByPhase = computed(() => {
  const map = new Map()

  for (const p of projects.value) {
    if (!Array.isArray(p.phases)) continue
    for (const ph of p.phases) {
      const code = skillCodeForPhaseObj(ph)
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

// ---------------------------------------------------------
// ECharts instances & DOM refs
// ---------------------------------------------------------
const skillRef = ref(null)
let skillChart = null

function initChart() {
  if (skillRef.value && !skillChart) {
    skillChart = echarts.init(skillRef.value)
  }
}

function clearChart() {
  skillChart && skillChart.clear()
}

function disposeChart() {
  if (skillChart) {
    skillChart.dispose()
    skillChart = null
  }
}

// ---------------------------------------------------------
// Update skill area chart
// ---------------------------------------------------------
function updateSkillChart() {
  initChart()

  if (!skillChart || !phaseIndices.value.length) {
    clearChart()
    return
  }

  const xLabels = phaseIndices.value.map(i => `Phase ${i}`)

  // Build percentage series for each code 0–3
  const seriesDataByCode = new Map(
      SKILL_TYPES.map(t => [
        t.code,
        phaseIndices.value.map(phIndex => {
          const dist =
              distributionByPhase.value.get(phIndex) || [0, 0, 0, 0]
          const total = dist.reduce((s, v) => s + v, 0)
          if (!total) return 0
          return (dist[t.code] / total) * 100
        }),
      ])
  )

  skillChart.setOption({
    color: ['#4472c4', '#ed7d31', '#a5a5a5', '#ffc000'],
    tooltip: {
      trigger: 'axis',
      formatter: params => {
        const lines = []
        if (params.length) lines.push(params[0].axisValueLabel)
        params.forEach(p => {
          lines.push(
              `${p.marker} ${p.seriesName}: ${p.value.toFixed(0)}%`
          )
        })
        return lines.join('<br/>')
      },
    },
    legend: {
      bottom: 0,
      left: 'center',
      icon: 'circle',
      itemWidth: 10,
      itemHeight: 10,
      data: SKILL_TYPES.map(t => t.label),
    },
    grid: {
      left: '8%',
      right: '4%',
      top: 40,
      bottom: 40,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: xLabels,
      axisLine: { show: true },
      axisTick: { show: true },
      axisLabel: {
        margin: 12, // label clearly under axis
      },
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      interval: 10,
      axisLabel: {
        formatter: '{value}%',
      },
      splitLine: {
        show: false, // no horizontal lines (like Excel)
      },
    },
    series: SKILL_TYPES.map(t => ({
      name: t.label,
      type: 'line',
      stack: 'total',
      areaStyle: {},
      symbol: 'none',
      smooth: false,
      data: seriesDataByCode.get(t.code),
    })),
  })
}

// ---------------------------------------------------------
// Resize 处理
// ---------------------------------------------------------
function safeResize(chart, el) {
  if (!chart || !el) return
  if (el.offsetWidth === 0 || el.offsetHeight === 0) return
  chart.resize()
}

function handleResize() {
  safeResize(skillChart, skillRef.value)
}

// ---------------------------------------------------------
// Lifecycle & watchers
// ---------------------------------------------------------
onMounted(() => {
  initChart()
  updateSkillChart()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  disposeChart()
})

// Whenever projects / phases / ratings change → update chart
watch(
    () => projects.value,
    () => {
      updateSkillChart()
    },
    { deep: true }
)
</script>

<style scoped>
.card-box {
  background-color: #ffffff;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
  padding: 1rem 1.25rem 1.5rem;
}

.table-sm th,
.table-sm td {
  vertical-align: middle;
}

/* Charts */
.chart-box {
  width: 100%;
  height: 280px;
}
.skill-chart {
  height: 320px;
}
</style>
