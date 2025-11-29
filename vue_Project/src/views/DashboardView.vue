<template>
  <div class="p-3 dashboard-root">
    <!-- =======================================================
         1) PROJECT GOALS
         ======================================================= -->
    <div class="card-box mb-3">
      <h2 class="h5 mb-3 text-center">Project Goals</h2>

      <div v-if="projects.length" class="table-responsive small">
        <table class="table table-sm mb-0 align-middle goals-table">
          <thead>
          <tr>
            <th class="fw-semibold">Goal / Objectives</th>
            <th
                v-for="p in projects"
                :key="p.id"
                class="text-center"
            >
              {{ p.name }}
            </th>
          </tr>
          </thead>

          <tbody>
          <!-- Goal row -->
          <tr>
            <th>Goal</th>
            <td
                v-for="p in projects"
                :key="p.id + '-goal'"
            >
              {{ p.goal || '–' }}
            </td>
          </tr>

          <!-- Objective rows (dynamic max across all projects) -->
          <tr
              v-for="row in objectiveRows"
              :key="'obj-' + row"
          >
            <th>Objective {{ row }}</th>
            <td
                v-for="p in projects"
                :key="p.id + '-obj-' + row"
            >
              {{
                (p.objectives || []).find(o => o.order === row)?.text || '–'
              }}
            </td>
          </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="small text-muted text-center">
        No projects yet. Please create a project first.
      </div>
    </div>

    <!-- =======================================================
         2) PROJECT DAYS REQUIRED
         ======================================================= -->
    <div class="card-box mb-3">
      <h2 class="h5 mb-3 text-center">Project Days Required</h2>

      <!-- TABLE: like Excel -->
      <div v-if="projects.length && phaseIndices.length" class="table-responsive small mb-3">
        <table class="table table-sm mb-0 align-middle text-center">
          <thead>
          <tr>
            <th class="text-start">Project Days</th>
            <th v-for="p in projects" :key="p.id">{{ p.name }}</th>
            <th>Total</th>
          </tr>
          </thead>
          <tbody>
          <tr
              v-for="row in projectDaysMatrix.rows"
              :key="'phase-' + row.phaseIndex"
          >
            <th class="text-start">Phase {{ row.phaseIndex }}</th>
            <td
                v-for="(val, idx) in row.perProject"
                :key="'pd-' + row.phaseIndex + '-' + idx"
            >
              {{ val }}
            </td>
            <td>{{ row.rowTotal }}</td>
          </tr>

          <!-- Total row -->
          <tr class="fw-semibold">
            <th class="text-start">Total</th>
            <td
                v-for="(val, idx) in projectDaysMatrix.colTotals"
                :key="'total-col-' + idx"
            >
              {{ val }}
            </td>
            <td>{{ projectDaysMatrix.grandTotal }}</td>
          </tr>
          </tbody>
        </table>
      </div>

      <!-- Charts row -->
      <div class="row g-3">
        <!-- PIE: Project Days per Project -->
        <div class="col-lg-6">
          <h3 class="h6 text-center mb-2">Project Days per Project</h3>
          <div ref="pieRef" class="chart-box"></div>
        </div>

        <!-- STACKED BAR: Project Days per Phase -->
        <div class="col-lg-6">
          <h3 class="h6 text-center mb-2">Project Days per Phase</h3>
          <div ref="barRef" class="chart-box"></div>
        </div>
      </div>
    </div>

    <!-- =======================================================
         3) SKILL NEED PER PROJECT & PHASE
         ======================================================= -->
    <div class="card-box">
      <h2 class="h5 mb-2 text-center">Skill Need Per Project &amp; Project Phase</h2>
      <p class="small text-muted text-center mb-3">
        Overview of skill profiles per project and project phase
        (0 = project meaningful; 1 = analytical; 2 = creative; 3 = ambidextrous)
      </p>

      <!-- TABLE: project x phase skill codes -->
      <div v-if="projects.length && phaseIndices.length" class="table-responsive small mb-3">
        <table class="table table-sm mb-0 align-middle text-center">
          <thead>
          <tr>
            <th class="text-start">Project</th>
            <th v-for="ph in phaseIndices" :key="'skill-head-' + ph">
              Phase {{ ph }}
            </th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="p in projects" :key="'skill-row-' + p.id">
            <th class="text-start">{{ p.name }}</th>
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
  </div>
</template>

<script setup>
/**
 * Dashboard view
 * ==========================================================
 * 1) Project Goals
 *    - Table: columns = projects, rows = goal + objectives
 *
 * 2) Project Days Required
 *    - Table: Phase x Project + Totals
 *    - Pie chart: Project Days per Project
 *    - Stacked bar chart: Project Days per Phase (phases on X, stacked by project)
 *
 * 3) Skill Need Per Project & Phase
 *    - Table: skill codes (0–3) per project & phase
 *    - Stacked area chart (0–100%) across phases:
 *        0 = project meaningful
 *        1 = analytical
 *        2 = creative
 *        3 = ambidextrous
 *
 * Charts are implemented with plain ECharts.
 */

import { computed, ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useProjectsStore } from '@/stores/projects'
import { storeToRefs } from 'pinia'
import * as echarts from 'echarts'

const store = useProjectsStore()
const { projects } = storeToRefs(store)

// ---------------------------------------------------------
// Helpers: Objectives rows
// ---------------------------------------------------------
const objectiveRows = computed(() => {
  let max = 0
  for (const p of projects.value) {
    if (Array.isArray(p.objectives)) {
      max = Math.max(max, p.objectives.length)
    }
  }
  // At least 3, to match the Excel layout
  return Array.from({ length: Math.max(max, 3) }, (_, i) => i + 1)
})

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

// ---------------------------------------------------------
// Project Days matrix (table + charts)
// ---------------------------------------------------------
const projectDaysMatrix = computed(() => {
  const phases = phaseIndices.value
  const projs = projects.value

  const rows = phases.map(phaseIndex => {
    const perProject = projs.map(p => {
      const idx = phaseIndex - 1
      if (!Array.isArray(p.plannedProjectDays)) return 0
      const val = Number(p.plannedProjectDays[idx] ?? 0)
      return Number.isNaN(val) ? 0 : val
    })
    const rowTotal = perProject.reduce((s, v) => s + v, 0)
    return {
      phaseIndex,
      perProject,
      rowTotal,
    }
  })

  const colTotals = projs.map((_, colIdx) =>
      rows.reduce((sum, row) => sum + (row.perProject[colIdx] ?? 0), 0)
  )

  const grandTotal = colTotals.reduce((s, v) => s + v, 0)

  // For bar-chart max
  const maxPhaseTotal = rows.reduce((m, r) => Math.max(m, r.rowTotal), 0)

  return {
    rows,
    colTotals,
    grandTotal,
    maxPhaseTotal,
  }
})

// Helper to compute a "nice" top for bar chart axis
function niceAxisMax(value) {
  if (!value || value <= 0) return 10
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)))
  const normalized = value / magnitude

  let niceNorm
  if (normalized <= 1) niceNorm = 1
  else if (normalized <= 2) niceNorm = 2
  else if (normalized <= 5) niceNorm = 5
  else niceNorm = 10

  return niceNorm * magnitude
}

// ---------------------------------------------------------
// Skill logic (from Ambidexterity ratings)
// ---------------------------------------------------------
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

/**
 * Map category → numeric code (table + legend in dashboard)
 * 0 = project meaningful (Excel "project reasonable?")
 * 1 = analytical       (exploitative)
 * 2 = creative         (explorative)
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

/**
 * Per project + phase → skill code 0–3
 */
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

/**
 * distributionByPhase: Map(phaseIndex → [count0, count1, count2, count3])
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

// ---------------------------------------------------------
// ECharts instances & DOM refs
// ---------------------------------------------------------
const pieRef = ref(null)
const barRef = ref(null)
const skillRef = ref(null)

let pieChart = null
let barChart = null
let skillChart = null

function initCharts() {
  if (pieRef.value && !pieChart) {
    pieChart = echarts.init(pieRef.value)
  }
  if (barRef.value && !barChart) {
    barChart = echarts.init(barRef.value)
  }
  if (skillRef.value && !skillChart) {
    skillChart = echarts.init(skillRef.value)
  }
}

function disposeCharts() {
  if (pieChart) {
    pieChart.dispose()
    pieChart = null
  }
  if (barChart) {
    barChart.dispose()
    barChart = null
  }
  if (skillChart) {
    skillChart.dispose()
    skillChart = null
  }
}

// ---------------------------------------------------------
// Update pie + bar + skill charts
// ---------------------------------------------------------
function updateCharts() {
  if (!projects.value.length) return
  initCharts()

  // --- Pie: Project Days per Project ---
  if (pieChart) {
    const data = projectDaysMatrix.value.colTotals.map((val, idx) => ({
      name: projects.value[idx].name,
      value: val,
    }))

    pieChart.setOption({
      tooltip: { trigger: 'item' },
      legend: {
        top: 5,
        left: 'center',
      },
      series: [
        {
          name: 'Project Days',
          type: 'pie',
          radius: ['35%', '65%'],
          avoidLabelOverlap: false,
          label: { formatter: '{b}: {c}' },
          data,
        },
      ],
    })
  }

  // --- Bar: Project Days per Phase (stacked) ---
  if (barChart) {
    const xLabels = phaseIndices.value.map(i => `Phase ${i}`)

    const maxPhaseTotal = projectDaysMatrix.value.maxPhaseTotal
    const yMax = niceAxisMax(maxPhaseTotal)

    const series = projects.value.map((p, projIdx) => ({
      name: p.name,
      type: 'bar',
      stack: 'total',
      emphasis: { focus: 'series' },
      data: projectDaysMatrix.value.rows.map(row => row.perProject[projIdx]),
    }))

    barChart.setOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
      },
      legend: {
        top: 5,
        left: 'center',
      },
      grid: {
        left: '8%',
        right: '4%',
        top: 40,
        bottom: 40,
      },
      xAxis: {
        type: 'category',
        data: xLabels,
        axisLine: { show: true },
        axisTick: { show: true },
        axisLabel: { margin: 10 },
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: yMax,
        axisLabel: { formatter: '{value}' },
        splitLine: { show: true },
      },
      series,
    })
  }

  // --- Skill area chart ---
  if (skillChart && phaseIndices.value.length) {
    const xLabels = phaseIndices.value.map(i => `Phase ${i}`)

    // Build percentage series for each code 0–3
    const seriesData = [0, 1, 2, 3].map(code =>
        phaseIndices.value.map(phIndex => {
          const dist = distributionByPhase.value.get(phIndex) || [0, 0, 0, 0]
          const total = dist[0] + dist[1] + dist[2] + dist[3]
          if (!total) return 0
          return (dist[code] / total) * 100
        })
    )

    const legendNames = [
      'Project meaningful (0)',
      'analytical (1)',
      'creative (2)',
      'ambidextrous (3)',
    ]

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
      series: [0, 1, 2, 3].map((code, idx) => ({
        name: legendNames[idx],
        type: 'line',
        stack: 'total',
        areaStyle: {},
        symbol: 'none',
        smooth: false,
        data: seriesData[code],
      })),
    })
  } else if (skillChart) {
    // No phases → clear chart
    skillChart.clear()
  }
}

// ---------------------------------------------------------
// Lifecycle & watchers
// ---------------------------------------------------------
onMounted(() => {
  initCharts()
  updateCharts()

  // optional: resize on window resize
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  disposeCharts()
})

function handleResize() {
  pieChart && pieChart.resize()
  barChart && barChart.resize()
  skillChart && skillChart.resize()
}

// Whenever projects / phases / planned days / ratings change → update charts
watch(
    () => projects.value,
    () => {
      updateCharts()
    },
    { deep: true }
)
</script>

<style scoped>
.dashboard-root {
  background-color: #f8f9fa;
}

/* Card container */
.card-box {
  background-color: #ffffff;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
  padding: 1rem 1.25rem 1.5rem;
}

/* Tables */
.table-sm th,
.table-sm td {
  vertical-align: middle;
}

/* Charts */
.chart-box {
  width: 100%;
  height: 260px;
}

.skill-chart {
  margin-top: 0.5rem;
}

/* Goals table tweaks */
.goals-table th:first-child,
.goals-table td:first-child {
  white-space: nowrap;
}
</style>