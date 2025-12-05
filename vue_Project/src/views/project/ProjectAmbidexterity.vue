<template>
  <!-- Main wrapper for the Ambidexterity view -->
  <!-- This page shows project management settings + skill rating + chart -->
  <div class="p-4 ambi-view" v-if="project">

    <!-- Section: Header -->
    <div class="mb-4">
      <!-- Light subtitle for the page -->
      <h2 class="h5 text-muted">Project Management and Skill Planning</h2>
    </div>

    <hr class="mb-4" />

    <!-- TOP BLOCK: PROJECT MANAGEMENT SETTINGS + CHART -->
    <section class="mb-5">
      <div class="field-box">
        <div class="row g-4">

          <!-- LEFT COLUMN: Input fields for project management meta-info -->
          <div class="col-lg-7">

            <!-- Intro text -->
            <p class="small mb-4">
              The third step is to determine the skill requirements for project implementation.
              This includes the number of PTs as well as the specific skills needed by the
              project team members.
            </p>

            <!-- PROJECT TYPE DROPDOWN -->
            <div class="mb-3">
              <div class="small fw-semibold mb-1">
                Based on the scope (step 1) and planning (step 2) what type of project is it?
              </div>
              <!-- Type-of-project selector -->
              <select
                v-model="project.projectType"
                class="form-select form-select-sm"
              >
                <option :value="''">Select type…</option>
                <option v-for="opt in PROJECT_TYPES" :key="opt" :value="opt">
                  {{ opt }}
                </option>
              </select>
            </div>

            <!-- MANAGEMENT STYLE + REASON -->
            <div class="mb-3">
              <div class="small fw-semibold mb-1">
                Based on the scope (step 1) and planning (step 2) which project management
                style should be applied?
              </div>

              <div class="row g-2">

                <!-- Style dropdown -->
                <div class="col-md-6">
                  <select
                    v-model="project.managementStyle"
                    class="form-select form-select-sm"
                  >
                    <option :value="''">Select style…</option>
                    <option v-for="opt in MANAGEMENT_STYLES" :key="opt" :value="opt">
                      {{ opt }}
                    </option>
                  </select>
                </div>

                <!-- Reason text -->
                <div class="col-md-6">
                  <input
                    v-model="project.managementStyleReason"
                    type="text"
                    class="form-control form-control-sm"
                    placeholder="Reason…"
                  />
                </div>
              </div>
            </div>

            <!-- PLANNED PROJECT DAYS TABLE -->
            <div>
              <div class="small fw-semibold mb-1">
                How many PT are needed based on project planning?
              </div>

              <!-- Scroll wrapper to prevent layout breaks -->
              <div class="planned-table-wrapper">

                <table class="table table-sm mb-0 align-middle planned-table">
                  <thead>
                  <tr>
                    <th class="small">Planned Project Days</th>

                    <!-- One column per phase -->
                    <th
                      v-for="(ph, i) in project.phases"
                      :key="ph.index"
                      class="text-center small"
                    >
                      Phase {{ ph.index }}
                    </th>

                    <!-- Final sum column -->
                    <th class="text-center small">Sum</th>
                  </tr>
                  </thead>

                  <tbody>
                  <tr>
                    <td class="small text-muted">Days</td>

                    <!-- Editable inputs: planned project days per phase -->
                    <td
                      v-for="(ph, i) in project.phases"
                      :key="'days-' + ph.index"
                    >
                      <input
                        v-model.number="project.plannedProjectDays[i]"
                        type="number"
                        min="0"
                        class="form-control form-control-sm text-end"
                      />
                    </td>

                    <!-- Computed sum -->
                    <td class="text-center fw-semibold">
                      {{ plannedDaysSum }}
                    </td>
                  </tr>
                  </tbody>
                </table>

              </div>
            </div>
          </div>

          <!-- RIGHT COLUMN: EXPLORATION–EXPLOITATION CHART (SVG) -->
          <div class="col-lg-5">

            <h3 class="section-title mb-2">Exploration vs. Exploitation</h3>

            <!-- Text explaining the chart -->
            <p class="small text-muted mb-3">
              Each dot represents a project phase based on its average ratings:
              the left column (Exploration) and the right column (Exploitation).
            </p>

            <!-- SVG Container -->
            <div class="chart-wrapper">
              <svg viewBox="0 0 100 100" class="ambi-chart">

                <!-- Chart background rectangle -->
                <rect x="10" y="5" width="80" height="80" class="chart-area" />

                <!-- 更细的网格：评分 1–5 的横线 & 竖线 -->
                <!-- vertical grid for Exploration (x) -->
                <g class="grid-group">
                  <line
                      v-for="t in [1,2,3,4,5]"
                      :key="'vx-' + t"
                      :x1="scaleX(t)"
                      y1="5"
                      :x2="scaleX(t)"
                      y2="85"
                      class="chart-grid"
                  />
                </g>

                <!-- horizontal grid for Exploitation (y) -->
                <g class="grid-group">
                  <line
                      v-for="t in [1,2,3,4,5]"
                      :key="'hy-' + t"
                      x1="10"
                      :y1="scaleY(t)"
                      x2="90"
                      :y2="scaleY(t)"
                      class="chart-grid"
                  />
                </g>

                <!-- Axis labels -->
                <text x="50" y="98" text-anchor="middle" class="chart-label">
                  Exploration
                </text>

                <text
                    x="4"
                    y="45"
                    text-anchor="middle"
                    class="chart-label"
                    transform="rotate(-90 4 45)"
                >
                  Exploitation
                </text>

                <!-- X ticks -->
                <g class="axis-ticks">
                  <g
                      v-for="t in [1,2,3,4,5]"
                      :key="'xt-' + t"
                  >
                    <text
                        :x="scaleX(t)"
                        y="88"
                        text-anchor="middle"
                        class="tick-label"
                    >
                      {{ t }}
                    </text>
                  </g>
                </g>

                <!-- Y ticks -->
                <g class="axis-ticks">
                  <g
                      v-for="t in [1,2,3,4,5]"
                      :key="'yt-' + t"
                  >
                    <text
                        x="8"
                        :y="scaleY(t) + 1"
                        text-anchor="end"
                        class="tick-label"
                    >
                      {{ t }}
                    </text>
                  </g>
                </g>

                <!-- 如果还没有任何有效点，显示提示文本 -->
                <text
                    v-if="!phasePoints.some(p => p.x != null && p.y != null && !Number.isNaN(p.x) && !Number.isNaN(p.y))"
                    x="50"
                    y="50"
                    text-anchor="middle"
                    class="chart-empty-text"
                >
                  Please rate the phases below to see the chart.
                </text>

                <!-- Phase points (one per project phase) -->
                <g v-for="p in phasePoints" :key="p.index">
                  <!-- Dot：颜色根据 phase index 变化 + hover 高亮 -->
                  <circle
                      :class="['phase-dot', { 'phase-dot--active': hoverIndex === p.index }]"
                      :cx="scaleX(p.x)"
                      :cy="scaleY(p.y)"
                      :r="hoverIndex === p.index ? 3 : 2.4"
                      :fill="phaseColor(p.index)"
                      @mouseenter="hoverIndex = p.index"
                      @mouseleave="hoverIndex = null"
                  >
                    <!-- 原生 tooltip：显示两列平均值 -->
                    <title>
                      Phase {{ p.index }}
                      &#10;Exploration: {{ p.x != null && !Number.isNaN(p.x) ? p.x.toFixed(2) : '–' }}
                      &#10;Exploitation: {{ p.y != null && !Number.isNaN(p.y) ? p.y.toFixed(2) : '–' }}
                    </title>
                  </circle>
                  <!-- Label next to the dot -->
                  <text
                      class="chart-point-label"
                      :x="scaleX(p.x) + (p.x >= 3 ? 3 : -3)"
                      :y="scaleY(p.y) + (p.y >= 3 ? -3 : 5)"
                      text-anchor="middle"
                  >
                    {{ p.index }}
                  </text>

                </g>


              </svg>

              <!-- Hover 信息面板 -->
              <div v-if="hoveredPhase" class="chart-tooltip-panel small mt-1">
                <strong>Phase {{ hoveredPhase.index }}</strong>
                &nbsp;·&nbsp;
                Exploration:
                {{
                  hoveredPhase.x != null && !Number.isNaN(hoveredPhase.x)
                      ? hoveredPhase.x.toFixed(2)
                      : "–"
                }}
                &nbsp;·&nbsp;
                Exploitation:
                {{
                  hoveredPhase.y != null && !Number.isNaN(hoveredPhase.y)
                      ? hoveredPhase.y.toFixed(2)
                      : "–"
                }}
              </div>

              <!-- Legend：Phase 1/2/3/... 用颜色区分（正确位置） -->
              <div class="chart-legend small mt-2">
  <span
      v-for="ph in chartLegendPhases"
      :key="ph.index"
      class="legend-item"
  >
    <span
        class="legend-dot"
        :style="{ backgroundColor: phaseColor(ph.index) }"
    ></span>
    Phase {{ ph.index }}
  </span>
              </div>

            </div> <!-- ⬅️ chart-wrapper 的结束标签，到这里才结束 -->




          </div>
        </div>
      </div>
    </section>

    <!-- SECOND BIG BLOCK: SKILL ASSESSMENT -->
    <div class="mb-2">
      <h2 class="h5 text-muted">Ambidexterity Skill Assessment</h2>
    </div>

    <hr class="mb-2" />

    <!-- Tooltip text -->
    <p class="small text-muted mb-4">
      How do these phases differ in skill requirements? Please rate the
      following statements for each project phase (1 = strongly disagree;
      5 = strongly agree) and the corresponding skill needs based on your
      ratings will appear below.
    </p>

    <!-- FOR EACH PHASE render a block with questions + capabilities -->
    <section
      v-for="phase in project.phases"
      :key="phase.index"
      class="mb-5"
    >
      <h3 class="phase-title">Phase {{ phase.index }}</h3>

      <!-- QUESTIONS BLOCK (two columns with separate averages) -->
      <div class="field-box mb-3">

        <div class="row g-4">

          <!-- LEFT COLUMN: Exploration-related questions -->
          <div class="col-lg-6">

            <!-- Header row for text + rating column -->
            <div class="row fw-semibold small text-muted mb-2">
              <div class="col-8">The project phase…</div>
              <div class="col-4 text-end">Rating (1–5)</div>
            </div>

            <!-- Loop through left-side questions -->
            <div
              v-for="(q, qi) in QUESTIONS_LEFT"
              :key="'L-' + qi"
              class="row align-items-center mb-2"
            >
              <!-- Question text -->
              <div class="col-8 small">
                {{ q }}
              </div>

              <!-- Rating dropdown -->
              <div class="col-4">
                <select
                  v-model="phase.ambiRatingsLeft[qi]"
                  class="form-select form-select-sm"
                >
                  <option :value="null">–</option>
                  <option v-for="n in 5" :key="n" :value="n">{{ n }}</option>
                </select>
              </div>
            </div>

            <hr class="my-3" />

            <!-- Average for left column -->
            <div class="row fw-bold">
              <div class="col-8">Average</div>
              <div class="col-4 text-end">
                {{ formatAvg(phase.ambiRatingsLeft) }}
              </div>
            </div>

          </div>

          <!-- RIGHT COLUMN: Exploitation-related questions -->
          <div class="col-lg-6">

            <div class="row fw-semibold small text-muted mb-2">
              <div class="col-8">The project phase…</div>
              <div class="col-4 text-end">Rating (1–5)</div>
            </div>

            <!-- Loop through right-side questions -->
            <div
              v-for="(q, qi) in QUESTIONS_RIGHT"
              :key="'R-' + qi"
              class="row align-items-center mb-2"
            >
              <div class="col-8 small">
                {{ q }}
              </div>

              <div class="col-4">
                <select
                  v-model="phase.ambiRatingsRight[qi]"
                  class="form-select form-select-sm"
                >
                  <option :value="null">–</option>
                  <option v-for="n in 5" :key="n" :value="n">{{ n }}</option>
                </select>
              </div>
            </div>

            <hr class="my-3" />

            <!-- Average for right column -->
            <div class="row fw-bold">
              <div class="col-8">Average</div>
              <div class="col-4 text-end">
                {{ formatAvg(phase.ambiRatingsRight) }}
              </div>
            </div>

          </div>
        </div>
      </div>

      <!-- CAPABILITY BOX BELOW THE QUESTIONS -->
      <div class="field-box capabilities-box">
        <!-- Column titles -->
        <div class="row fw-semibold text-center mb-2">
          <div class="col-3">Personal Capabilities</div>
          <div class="col-3">Professional Capabilities</div>
          <div class="col-3">Methodological Capabilities</div>
          <div class="col-3">Social Capabilities</div>
        </div>

        <div v-if="catForPhase(phase.index) !== 'reasonable'" class="row small">
          <div class="col-3">
            <ul><li v-for="s in skillList(phase.index, 'personal')" :key="s">{{ s }}</li></ul>
          </div>
          <div class="col-3">
            <ul><li v-for="s in skillList(phase.index, 'professional')" :key="s">{{ s }}</li></ul>
          </div>
          <div class="col-3">
            <ul><li v-for="s in skillList(phase.index, 'methodical')" :key="s">{{ s }}</li></ul>
          </div>
          <div class="col-3">
            <ul><li v-for="s in skillList(phase.index, 'social')" :key="s">{{ s }}</li></ul>
          </div>
        </div>

        <div v-else class="row small text-center text-muted">
          <div class="col-3">Project reasonable?</div>
          <div class="col-3">Project reasonable?</div>
          <div class="col-3">Project reasonable?</div>
          <div class="col-3">Project reasonable?</div>
        </div>


      </div>

    </section>
  </div>

  <!-- Fallback if project cannot be found -->
  <div v-else class="alert alert-warning p-4">
    Project not found.
  </div>
</template>



<script setup>
// IMPORTS ===============================================================
// Vue reactivity tools
import { computed, watch, ref } from "vue"

// Router (for reading project ID)
import { useRoute } from "vue-router"

// Pinia store (projects)
import { useProjectsStore } from "@/stores/projects"
import { storeToRefs } from "pinia"

import skillOverview from "@/data/skill-overview.json"



// ROUTE + STORE SETUP ===================================================
const route = useRoute()
const store = useProjectsStore()
const { projects } = storeToRefs(store)

// Read the currently active project based on URL
const project = computed(() =>
  projects.value.find(p => p.id === route.params.id)
)


// CONSTANT DATA =========================================================
// Possible types of project
const PROJECT_TYPES = ["operational", "strategic"]

// Possible management styles
const MANAGEMENT_STYLES = ["Scrum", "Agile", "Kanban", "Six Sigma", "Waterfall"]


// QUESTIONS =============================================================
// Statements for the left column (Exploration)
const QUESTIONS_LEFT = [
  "looks for novel technological or business ideas by thinking outside the box",
  "explores new technologies for the firm",
  "creates products or services that are innovative for the firm",
  "looks for creative ways to satisfy (internal) customers’ needs",
  "aggressively ventures into new market segments",
  "actively targets new (internal) customer groups"
]

// Statements for the right column (Exploitation)
const QUESTIONS_RIGHT = [
  "commits to improve product/service quality or lower costs",
  "continuously improves the reliability of its products and services",
  "increases the level of automation in its operations",
  "constantly surveys existing customers’ satisfaction and reacts to their feedback",
  "fine-tunes what it offers to keep its current customers satisfied",
  "penetrates more deeply into its existing customer base"
]


// WATCHER: Initialize project structure safely ==========================
// Ensures the project object always has the fields needed for this page
watch(
  project,
  (p) => {
    if (!p) return

    // High-level project fields
    if (p.projectType == null) p.projectType = ""
    if (p.managementStyle == null) p.managementStyle = ""
    if (p.managementStyleReason == null) p.managementStyleReason = ""

    // Planned project days array
    if (!Array.isArray(p.plannedProjectDays)) p.plannedProjectDays = []
    if (Array.isArray(p.phases)) {
      while (p.plannedProjectDays.length < p.phases.length) {
        p.plannedProjectDays.push(null)
      }
    }

    // Initialize ambidexterity rating arrays per phase
    if (!Array.isArray(p.phases)) return
    p.phases.forEach(phase => {
      if (!Array.isArray(phase.ambiRatingsLeft)) {
        phase.ambiRatingsLeft = Array(QUESTIONS_LEFT.length).fill(null)
      }
      if (!Array.isArray(phase.ambiRatingsRight)) {
        phase.ambiRatingsRight = Array(QUESTIONS_RIGHT.length).fill(null)
      }
    })
  },
  { immediate: true }
)

// Keep plannedProjectDays aligned with number of phases
watch(
  () => project.value?.phases?.length,
  (newLen) => {
    if (!project.value) return
    if (!Array.isArray(project.value.plannedProjectDays))
      project.value.plannedProjectDays = []

    const len = project.value.plannedProjectDays.length

    // Add missing entries
    if (newLen > len) {
      for (let i = len; i < newLen; i++) {
        project.value.plannedProjectDays.push(null)
      }
    }
    // Remove extra entries
    else if (newLen < len) {
      project.value.plannedProjectDays.splice(newLen)
    }
  },
  { immediate: true }
)


// AVERAGE CALCULATION ====================================================
// Compute average of an array of rating values, ignoring null/empty values
function avg(arr) {
  if (!arr || !arr.length) return null

  const nums = arr
    .map(v => (v === null || v === "" ? NaN : Number(v)))
    .filter(v => !Number.isNaN(v))

  if (!nums.length) return null

  return nums.reduce((a, b) => a + b, 0) / nums.length
}

// Format average for display (2 decimals or dash)
function formatAvg(arr) {
  const a = avg(arr)
  return a === null ? "–" : a.toFixed(2)
}


// CHART COMPUTATIONS ====================================================
// Convert the average exploration/exploitation ratings into chart points
const phasePoints = computed(() => {
  if (!project.value?.phases) return []
  return project.value.phases.map(phase => {
    const x = avg(phase.ambiRatingsLeft)
    const y = avg(phase.ambiRatingsRight)
    const cat = skillCategory(x, y)
    return { index: phase.index, x, y, category: cat }
  })
})

// Hover 状态：当前鼠标悬停在哪个 phase 点上
const hoverIndex = ref(null)
const hoveredPhase = computed(() => {
  if (hoverIndex.value == null) return null
  return phasePoints.value.find(p => p.index === hoverIndex.value) || null
})



// 给不同 Phase 着色的调色板（最多 6 个 phase，循环使用）
// 给不同 Phase 着色的调色板（颜色会循环使用）
const PHASE_COLORS = [
  "#0d6efd", // 蓝
  "#ec4899", // 粉
  "#22c55e", // 绿
  "#f97316", // 橙
  "#8b5cf6", // 紫
  "#14b8a6", // 青
  "#eab308", // 黄
  "#f43f5e", // 红
  "#6366f1", // 靛
  "#10b981"  // 深绿
]

function phaseColor(phaseIndex) {
  if (!phaseIndex && phaseIndex !== 0) return "#6b7280"
  const i = (Number(phaseIndex) - 1 + PHASE_COLORS.length) % PHASE_COLORS.length
  return PHASE_COLORS[i]
}

// Legend 用：按 index 排序的一份 phase 列表
const chartLegendPhases = computed(() => {
  if (!project.value?.phases) return []
  return [...project.value.phases]
      .filter(p => p && p.index != null)
      .sort((a, b) => a.index - b.index)
})


// Chart rating range (1–5)
const minRating = 0
const maxRating = 5

// Chart coordinate system boundaries inside the SVG
const plotX = { min: 10, max: 90 }
const plotY = { min: 5, max: 85 }

// Convert rating (1–5) to X coordinate
function scaleX(value) {
  const t = (value - minRating) / (maxRating - minRating)
  return plotX.min + t * (plotX.max - plotX.min)
}

function scaleY(value) {
  const t = (value - minRating) / (maxRating - minRating)
  return plotY.max - t * (plotY.max - plotY.min)
}


// PLANNED PROJECT DAYS SUM ==============================================
const plannedDaysSum = computed(() => {
  if (!project.value?.plannedProjectDays) return 0
  return project.value.plannedProjectDays.reduce(
    (sum, val) => sum + (Number(val) || 0),
    0
  )
})

function skillCategory(leftAvg, rightAvg) {
  if (leftAvg < 2.5 && rightAvg >= 2.5) return "exploitative"
  if (leftAvg < 2.5 && rightAvg < 2.5) return "reasonable"
  if (leftAvg >= 2.5 && rightAvg >= 2.5) return "ambidextrous"
  if (leftAvg >= 2.5 && rightAvg < 2.5) return "explorative"
}

function catForPhase(index) {
  const point = phasePoints.value.find(p => p.index === index)
  return point?.category || "reasonable"
}

function skillList(index, type) {
  const cat = catForPhase(index)
  if (cat === "reasonable") return []
  return skillOverview[cat]?.[type] || []
}

</script>



<style scoped>
/* General background */
.ambi-view {
  background-color: #f8f9fa;
}

/* Phase title styling */
.phase-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

/* Grey rounded boxes used all over the page */
.field-box {
  background-color: #f3f4f6;
  border-radius: 0.75rem;
  padding: 1rem 1.25rem;
}

/* Capability box special background */
.capabilities-box {
  background-color: #e8f5e9;
}

/* Section title (smaller heading) */
.section-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

/* Scroll container for planned project table */
.planned-table-wrapper {
  overflow-x: auto;
}

/* Table cell alignment */
.planned-table th,
.planned-table td {
  vertical-align: middle;
}

/* Chart container */
.chart-wrapper {
  max-width: 480px;
}

/* Chart container */
.chart-wrapper {
  max-width: 480px;
}

/* 让 SVG 外层保持 1:1 比例的自适应盒子 */
.chart-responsive {
  position: relative;
  width: 100%;
  padding-top: 100%; /* 高度 = 宽度，形成正方形 */
  overflow: hidden;
}

/* 让 SVG 填满这个正方形盒子 */
.chart-responsive .ambi-chart {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}


/* Chart area background */
.chart-area {
  fill: #ffffff;
  stroke: #d4d4d8;
  stroke-width: 0.6;
}

/* Grid lines */
.chart-grid {
  stroke: #e5e7eb;
  stroke-dasharray: 2 2;
  stroke-width: 0.4;
}

/* Axis text labels */
.chart-label {
  font-size: 3px;
  fill: #4b5563;
}

/* Tick labels */
.tick-label {
  font-size: 2.6px;
  fill: #6b7280;
}



/* Phase dot styling：只定义边框，填充颜色由 :fill 控制 */
.phase-dot {
  stroke: #ffffff;
  stroke-width: 0.7;
  transition: r 0.15s ease-out;
}

/* Hover 时高亮一点 */
.phase-dot--active {
  filter: drop-shadow(0 0 1px rgba(15, 23, 42, 0.5));
}


/* Dot label */
.chart-point-label {
  font-size: 3px;
  fill: #374151;
}

/* Legend */
.chart-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center; /* 居中 legend */
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}
.legend-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 999px;
}


/* Small form controls */
.form-select-sm,
.form-control-sm {
  font-size: 0.875rem;
}

.capabilities-box .fw-semibold.text-center {
  text-align: left !important;
  padding-left: 1.25rem;
}

.chart-empty-text {
  font-size: 3px;
  fill: #9ca3af;
}

.chart-tooltip-panel {
  text-align: center;
  color: #374151;
}
.chart-tooltip-panel strong {
  font-weight: 600;
}


</style>
