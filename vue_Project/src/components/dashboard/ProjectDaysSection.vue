<template>
  <div class="card-box mb-3">
    <h2 class="h5 mb-3 text-center">Project Days Required</h2>

    <!-- TABLE: like Excel -->
    <div v-if="hasPhases" class="table-responsive small mb-3">
      <table class="table table-sm mb-0 align-middle text-center">
        <thead>
        <tr>
          <th class="text-start">Project Days</th>
          <th v-for="p in projects" :key="p.id">
            {{ p.name }}
          </th>
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
// Project Days matrix (table + charts)
// ---------------------------------------------------------
const projectDaysMatrix = computed(() => {
  const phases = phaseIndices.value
  const projs = projects.value

  const rows = phases.map(phaseIndex => {
    const perProject = projs.map(p => {
      if (
          !Array.isArray(p.plannedProjectDays) ||
          !Array.isArray(p.phases)
      ) {
        return 0
      }

      // Find the index of this phase inside THIS project's phases array
      const phaseIdxInProject = p.phases.findIndex(
          ph => ph.index === phaseIndex
      )

      // If the project doesn’t have this phase → treat PD as 0
      if (phaseIdxInProject === -1) return 0

      const raw = p.plannedProjectDays[phaseIdxInProject]
      const val = Number(raw ?? 0)
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
  const maxPhaseTotal = rows.reduce(
      (m, r) => Math.max(m, r.rowTotal),
      0
  )

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

  const max = niceNorm * magnitude
  return Math.max(max, 10) // 至少 10，视觉更舒服
}

// ---------------------------------------------------------
// ECharts instances & DOM refs
// ---------------------------------------------------------
const pieRef = ref(null)
const barRef = ref(null)

let pieChart = null
let barChart = null

function initCharts() {
  if (pieRef.value && !pieChart) {
    pieChart = echarts.init(pieRef.value)
  }
  if (barRef.value && !barChart) {
    barChart = echarts.init(barRef.value)
  }
}

function clearCharts() {
  pieChart && pieChart.clear()
  barChart && barChart.clear()
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
}

// ---------------------------------------------------------
// Update pie + bar charts
// ---------------------------------------------------------
function updateCharts() {
  initCharts()

  if (!hasPhases.value) {
    clearCharts()
    return
  }

  // --- Pie: Project Days per Project ---
  if (pieChart) {
    const data = projectDaysMatrix.value.colTotals.map(
        (val, idx) => ({
          name: projects.value[idx].name,
          value: val,
        })
    )

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
      data: projectDaysMatrix.value.rows.map(
          row => row.perProject[projIdx]
      ),
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
  safeResize(pieChart, pieRef.value)
  safeResize(barChart, barRef.value)
}

// ---------------------------------------------------------
// Lifecycle & watchers
// ---------------------------------------------------------
onMounted(() => {
  initCharts()
  updateCharts()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  disposeCharts()
})

// Whenever projects change → update charts
watch(
    () => projects.value,
    () => {
      updateCharts()
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
</style>
