<template>
  <div v-if="project" class="p-4 planning-view">

    <!-- HEADER -->
    <div class="d-flex justify-content-between align-items-center mb-3">
      <div>
        <h2 class="h5 text-muted">Project Planning</h2>
      </div>

      <!-- ZOOM & CUSTOM -->
      <div class="d-flex flex-column align-items-end gap-2">

        <div class="btn-group">
          <button
            class="btn btn-outline-secondary btn-sm"
            :class="{active: zoom==='week'}"
            @click="zoom='week'; selectMode=null"
          >Week</button>

          <button
            class="btn btn-outline-secondary btn-sm"
            :class="{active: zoom==='month'}"
            @click="zoom='month'; selectMode=null"
          >Month</button>

          <button
            class="btn btn-outline-secondary btn-sm"
            :class="{active: zoom==='3m'}"
            @click="zoom='3m'; selectMode=null"
          >3 Months</button>

          <button
            class="btn btn-outline-secondary btn-sm"
            :class="{active: zoom==='all'}"
            @click="zoom='all'; selectMode=null"
          >All</button>

          <button
            class="btn btn-outline-secondary btn-sm"
            :class="{active: zoom==='custom'}"
            @click="zoom='custom'; selectMode=null"
          >Custom</button>
        </div>

        <!-- CUSTOM RANGE: nur anzeigen, wenn Custom aktiv -->
        <div
          v-if="zoom === 'custom'"
          class="d-flex align-items-center gap-1 custom-range"
        >
          <small class="text-muted me-1">from</small>
          <input type="date" v-model="customStart" class="form-control form-control-sm w-auto" />
          <small class="text-muted mx-1">to</small>
          <input type="date" v-model="customEnd" class="form-control form-control-sm w-auto" />
        </div>

        <!-- MODE INDICATOR -->
        <small v-if="selectMode === 'edit'" class="text-primary">
          Edit mode aktiv – Task anklicken
        </small>
        <small v-else-if="selectMode === 'delete'" class="text-danger">
          Delete mode aktiv – Task anklicken
        </small>
      </div>

      <!-- ACTION BUTTONS (global) -->
      <div class="d-flex align-items-center gap-2">
        <button
          class="btn btn-primary btn-sm"
          data-bs-toggle="modal"
          data-bs-target="#addTaskModal"
          @click="startAdd"
        >
          + Add Task
        </button>

        <button
          class="btn btn-outline-secondary btn-sm"
          :class="{ 'btn-primary text-white': selectMode==='edit' }"
          @click="toggleSelectMode('edit')"
        >
          Edit Task
        </button>

        <button
          class="btn btn-outline-danger btn-sm"
          :class="{ 'btn-danger text-white': selectMode==='delete' }"
          @click="toggleSelectMode('delete')"
        >
          Delete Task
        </button>
      </div>
    </div>

    <!-- MAIN GRID -->
    <div class="gantt-wrapper shadow-sm">

      <!-- LEFT TABLE -->
      <div class="task-table">
        <div class="task-header">
          <div>Task</div>
          <div>Assigned</div>
          <div>%</div>
          <div>Start</div>
          <div>End</div>
        </div>

        <div v-for="phase in project.phases" :key="phase.index">
          <div class="phase-row">Phase {{ phase.index }}</div>

          <div
            v-for="task in phase.tasks"
            :key="task.id"
            class="task-row"
            :class="{'row-selectable': !!selectMode}"
            :data-bs-toggle="selectMode === 'edit' ? 'modal' : null"
            :data-bs-target="selectMode === 'edit' ? '#addTaskModal' : null"
            @click="onTaskClick(phase.index, task)"
          >
            <div>{{ task.title }}</div>
            <div>{{ task.assignee }}</div>
            <div>{{ task.progress }}%</div>
            <div>{{ fmt(task.startDate) }}</div>
            <div>{{ fmt(task.endDate) }}</div>
          </div>
        </div>
      </div>

      <!-- RIGHT DIAGRAM -->
      <div class="gantt-diagram" :class="'zoom-' + zoom">


      <!-- TODAY MARKER -->
        <div
          v-if="todayMarker.visible"
          class="today-marker"
          :style="todayMarker.style"
        ></div>

        <!-- TIMELINE -->
        <div class="timeline">
          <div v-for="(d,i) in timeline" :key="i" class="tcell">
            <div class="d">{{ new Date(d).getDate() }}</div>
            <div class="m">{{ month(new Date(d)) }}</div>
          </div>
        </div>

        <!-- ROWS -->
        <div class="rows">
          <div v-for="phase in project.phases" :key="phase.index">
            <div class="row-spacer"></div>

            <div
              v-for="task in phase.tasks"
              :key="task.id"
              class="gantt-row"
            >
              <div v-for="(d,i) in timeline" :key="i" class="gcell"></div>

              <div class="bar" :style="bar(task)">
                <div class="bar-progress" :style="barProgress(task)"></div>
                <span class="bar-label">
                  {{ task.progress != null ? task.progress + '%' : '' }}
                  </span>
              </div>


            </div>
          </div>
        </div>

      </div>

    </div>

    <!-- MODAL -->
    <div class="modal fade" id="addTaskModal" tabindex="-1" ref="taskModalEl">
      <div class="modal-dialog">
        <div class="modal-content p-3">
          <h5>{{ isEditing ? 'Edit Task' : 'Add Task' }}</h5>

          <label>Phase</label>
          <select v-model.number="newTask.phaseIndex" class="form-select mb-2">
            <option v-for="p in project.phases" :key="p.index" :value="p.index">
              Phase {{ p.index }}
            </option>
          </select>

          <label>Title</label>
          <input v-model="newTask.title" class="form-control mb-2">

          <label>Assigned</label>
          <input v-model="newTask.assignee" class="form-control mb-2">

          <label>Progress</label>
          <input
            v-model.number="newTask.progress"
            type="number"
            min="0"
            max="100"
            class="form-control mb-2"
          >

          <div class="row g-2 mb-2">
            <div class="col">
              <label>Start</label>
              <input v-model="newTask.startDate" type="date" class="form-control">
            </div>
            <div class="col">
              <label>End</label>
              <input v-model="newTask.endDate" type="date" class="form-control">
            </div>
          </div>

          <button
            class="btn btn-primary w-100"
            data-bs-dismiss="modal"
            @click="saveTask"
          >
            {{ isEditing ? 'Save' : 'Add' }}
          </button>
        </div>
      </div>
    </div>

  </div>

  <div v-else class="p-4">
    <div class="alert alert-warning">Project not found.</div>
  </div>
</template>


<script setup>
import { ref, computed, watch, onMounted } from "vue"
import { useRoute } from "vue-router"
import { useProjectsStore } from "@/stores/projects"
import { storeToRefs } from "pinia"

const route = useRoute()
const store = useProjectsStore()
const { projects } = storeToRefs(store)

const project = computed(() => projects.value.find(p => p.id === route.params.id))

/* INIT PHASES */
/* INIT PHASES based on phaseCount */
watch(project, p => {
  if (!p) return
  const count = p.phaseCount || 1
  if (!p.phases) p.phases = []

  for (let i = 1; i <= count; i++) {
    if (!p.phases.find(x => x.index === i)) {
      p.phases.push({ index: i, tasks: [] })
    }
  }

  // optional: old phases delete if too many
  p.phases = p.phases.filter(x => x.index <= count)

  p.phases.sort((a, b) => a.index - b.index)
}, { immediate: true })


/* MODAL / ADD / EDIT */
const taskModalEl = ref(null)

const newTask = ref({
  phaseIndex: 1,
  title: "",
  assignee: "",
  progress: 0,
  startDate: "",
  endDate: ""
})

const isEditing = ref(false)
const editPhaseIndex = ref(null)
const editTaskId = ref(null)

/* Edit/Delete-Auswahlmodus */
const selectMode = ref(null) // 'edit' | 'delete' | null

onMounted(() => {
  const el = taskModalEl.value
  if (!el) return

  el.addEventListener("hidden.bs.modal", () => {
    reset()
  })
})

function reset() {
  newTask.value = {
    phaseIndex: 1,
    title: "",
    assignee: "",
    progress: 0,
    startDate: "",
    endDate: ""
  }
  isEditing.value = false
  editPhaseIndex.value = null
  editTaskId.value = null
}

function startAdd() {
  reset()
  selectMode.value = null
  if (project.value?.phases?.length) {
    newTask.value.phaseIndex = project.value.phases[0].index
  }
}

function toggleSelectMode(mode) {
  selectMode.value = selectMode.value === mode ? null : mode
}

function onTaskClick(phaseIndex, task) {
  if (!selectMode.value) return

  if (selectMode.value === "edit") {
    isEditing.value = true
    editPhaseIndex.value = phaseIndex
    editTaskId.value = task.id

    newTask.value = {
      phaseIndex,
      title: task.title,
      assignee: task.assignee,
      progress: task.progress,
      startDate: task.startDate,
      endDate: task.endDate
    }
    // Modal wird über data-bs-toggle auf der Zeile geöffnet
  } else if (selectMode.value === "delete") {
    if (confirm("Do you really want to delete this task?")) {
      deleteTask(phaseIndex, task.id)
      selectMode.value = null
    }
  }
}

function saveTask() {
  if (!newTask.value.title || !newTask.value.startDate || !newTask.value.endDate) return
  if (!project.value) return

  if (isEditing.value && editPhaseIndex.value != null && editTaskId.value != null) {
    // UPDATE – ggf. Phase wechseln
    const oldPhase = project.value.phases.find(x => x.index === editPhaseIndex.value)
    if (!oldPhase) return

    const taskIdx = oldPhase.tasks.findIndex(t => t.id === editTaskId.value)
    if (taskIdx === -1) return

    const updated = {
      ...oldPhase.tasks[taskIdx],
      ...newTask.value
    }

    if (newTask.value.phaseIndex !== editPhaseIndex.value) {
      oldPhase.tasks.splice(taskIdx, 1)
      const newPhase = project.value.phases.find(x => x.index === newTask.value.phaseIndex)
      if (newPhase) newPhase.tasks.push(updated)
    } else {
      oldPhase.tasks[taskIdx] = updated
    }
  } else {
    // ADD
    const phase = project.value.phases.find(x => x.index === newTask.value.phaseIndex)
    if (!phase) return
    phase.tasks.push({ id: Date.now(), ...newTask.value })
  }

  // nach Edit/Add Modus verlassen
  selectMode.value = null
}

/* Delete */
function deleteTask(phaseIndex, taskId) {
  if (!project.value) return
  const phase = project.value.phases.find(x => x.index === phaseIndex)
  if (!phase) return
  phase.tasks = phase.tasks.filter(t => t.id !== taskId)
}

/* TIME HELPERS */
const ONE = 86400000

const normalizeDate = (d) => {
  const x = new Date(d)
  x.setHours(0,0,0,0)
  return x
}

const diffInDaysRaw = (a, b) => {
  return (normalizeDate(b).getTime() - normalizeDate(a).getTime()) / ONE
}

const diffInDaysInclusive = (a, b) => {
  return Math.round(diffInDaysRaw(a, b)) + 1
}

/* ZOOM + CUSTOM RANGE */
const zoom = ref("month")
const customStart = ref("")
const customEnd = ref("")

/* BASISSPANNE FÜR TASKS (für "All") */
const baseRange = computed(() => {
  const tasks = project.value?.phases.flatMap(p => p.tasks) || []
  const ds = tasks
    .flatMap(x => [x.startDate, x.endDate])
    .filter(Boolean)
    .map(d => normalizeDate(d).getTime())

  if (!ds.length) {
    const now = new Date()
    const start = normalizeDate(now)
    const end = new Date(start.getTime() + ONE * 6) // 7 Tage
    return { min: start, max: end }
  }

  const min = new Date(Math.min(...ds))
  const max = new Date(Math.max(...ds))
  return { min: normalizeDate(min), max: normalizeDate(max) }
})

/* RANGE ABHÄNGIG VON ZOOM */
const range = computed(() => {
  const today = normalizeDate(new Date())
  const baseMin = baseRange.value.min
  const baseMax = baseRange.value.max

  let min
  let max

  if (zoom.value === "week") {
    const day = today.getDay() || 7 // So = 7
    min = new Date(today)
    min.setDate(today.getDate() - (day - 1))  // Montag
    max = new Date(min)
    max.setDate(min.getDate() + 6)           // Sonntag
  } else if (zoom.value === "month") {
    min = new Date(today.getFullYear(), today.getMonth(), 1)
    max = new Date(today.getFullYear(), today.getMonth() + 1, 0)
  } else if (zoom.value === "3m") {
    min = new Date(today.getFullYear(), today.getMonth(), 1)
    const after = new Date(today.getFullYear(), today.getMonth() + 3, 1)
    max = new Date(after.getTime() - ONE)
  } else if (zoom.value === "all") {
    min = new Date(baseMin)
    max = new Date(baseMax)
  } else if (zoom.value === "custom" && customStart.value && customEnd.value) {
    const s = normalizeDate(customStart.value)
    const e = normalizeDate(customEnd.value)
    if (s <= e) {
      min = s
      max = e
    } else {
      min = e
      max = s
    }
  } else {
    // Fallback: All
    min = new Date(baseMin)
    max = new Date(baseMax)
  }

  return { min: normalizeDate(min), max: normalizeDate(max) }
})

/* TIMELINE AUF BASIS DER RANGE */
const timeline = computed(() => {
  const arr = []
  let cur = new Date(range.value.min)
  const end = range.value.max

  const spanDays = diffInDaysInclusive(range.value.min, range.value.max)

  if (zoom.value === "week" || zoom.value === "month") {
    while (cur <= end) {
      arr.push(cur.getTime())
      cur = new Date(cur.getTime() + ONE)
    }
  } else if (zoom.value === "3m") {
    while (cur <= end) {
      arr.push(cur.getTime())
      cur = new Date(cur.getTime() + ONE * 7)
    }
  } else if (zoom.value === "custom" || zoom.value === "all") {
    if (spanDays <= 31) {
      while (cur <= end) {
        arr.push(cur.getTime())
        cur = new Date(cur.getTime() + ONE)
      }
    } else if (spanDays <= 120) {
      while (cur <= end) {
        arr.push(cur.getTime())
        cur = new Date(cur.getTime() + ONE * 7)
      }
    } else {
      cur.setDate(1)
      while (cur <= end) {
        arr.push(cur.getTime())
        cur.setMonth(cur.getMonth() + 1)
        cur.setDate(1)
      }
    }
  } else {
    cur.setDate(1)
    while (cur <= end) {
      arr.push(cur.getTime())
      cur.setMonth(cur.getMonth() + 1)
      cur.setDate(1)
    }
  }

  return arr
})

/* TODAY MARKER */
const todayMarker = computed(() => {
  const today = normalizeDate(new Date())
  const min = range.value.min
  const max = range.value.max

  if (today < min || today > max) {
    return { visible: false, style: {} }
  }

  const totalDays = Math.max(1, diffInDaysInclusive(min, max))
// +0.5 = halber Tag → Mitte der Zelle
  const offsetDays = diffInDaysRaw(min, today) + 0.5
  const left = (offsetDays / totalDays) * 100


  return {
    visible: true,
    style: {
      left: left + "%"
    }
  }
})

/* BAR POSITION — TAGGENAU, TASKS AUßERHALB AUSBLENDEN */
function bar(t) {
  if (!t.startDate || !t.endDate) return {}

  const axisStartDate = normalizeDate(range.value.min)
  const axisEndDate = normalizeDate(range.value.max)

  const axisStart = axisStartDate.getTime()
  const axisEnd = axisEndDate.getTime()

  const totalDays = Math.max(1, diffInDaysInclusive(axisStartDate, axisEndDate))

  const taskStartDate = normalizeDate(t.startDate)
  const taskEndDate = normalizeDate(t.endDate)

  if (taskEndDate.getTime() < axisStart || taskStartDate.getTime() > axisEnd) {
    return { display: "none" }
  }

  const clampedStartDate = new Date(Math.max(axisStart, taskStartDate.getTime()))
  const clampedEndDate = new Date(Math.min(axisEnd, taskEndDate.getTime()))

  const startOffsetDays = Math.round(diffInDaysRaw(axisStartDate, clampedStartDate))
  const durationDays = diffInDaysInclusive(clampedStartDate, clampedEndDate)

  const left = (startOffsetDays / totalDays) * 100
  const width = (durationDays / totalDays) * 100

  return {
    left: left + "%",
    width: width + "%"
  }
}

/* Bar Progress */
function barProgress(t) {
  if (t.progress == null) return {}

  const pct = Math.max(0, Math.min(100, t.progress)) // clamp 0–100

  return {
    width: pct + '%'
  }
}


/* HELPERS */
const fmt = d => d ? new Date(d).toLocaleDateString("de-DE") : ""
const month = d => d.toLocaleString("en-US",{month:"short"})
</script>


<style scoped>
.planning-view {
  background: #f8f9fa;
}

.gantt-wrapper {
  display: flex;
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

/* Left table */
.task-table {
  width: 480px;
  border-right: 1px solid #ddd;
  flex-shrink: 0;
}

.task-header,
.task-row {
  display: grid;
  grid-template-columns: 170px 80px 50px 90px 90px;
  height: 42px;
  align-items: center;
  padding: 0 12px;
}

.phase-row {
  background: #e6edfa;
  padding: 10px 12px;
  font-weight: 600;
}

/* clickable rows */
.row-selectable {
  cursor: pointer;
}
.row-selectable:hover {
  background-color: #eef3ff;
}

/* Gantt diagram */
.gantt-diagram {
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
}

/* timeline header */
.timeline {
  display: flex;
  height: 52px;
  border-bottom: 2px solid #ddd;
  width: 100%;
}

/* each timeline cell dynamically adjusts */
.tcell {
  flex: 1;
  text-align: center;
  padding-top: 4px;
  min-width: 0; /* prevents overflow */
}

.d {
  font-weight: 700;
}
.m {
  font-size: 0.7rem;
  opacity: 0.7;
}

/* rows */
.rows {
  flex: 1;
  width: 100%;
}
.row-spacer {
  height: 42px;
  border-bottom: 1px solid #eee;
}

.gantt-row {
  height: 42px;
  position: relative;
  display: flex;
  width: 100%;
  border-bottom: 1px solid #f0f0f0;
}

.gcell {
  flex: 1;
  border-right: 1px solid #f5f5f5;
}

/* Today marker */
.today-marker {
  position: absolute;
  top: 52px;
  bottom: 0;
  border-left: 2px dashed #dc3545;
  pointer-events: none;
  z-index: 2;
}

/* active zoom button */
.btn-group .btn.active {
  color: #fff;
  background-color: #0d6efd;
  border-color: #0d6efd;
}

/* Custom range input */
.custom-range input {
  font-size: 0.75rem;
  padding: 0.15rem 0.25rem;
}

/* task bar */
.bar {
  position: absolute;
  top: 8px;
  bottom: 8px;
  background: #fbbf24;
  border-radius: 10px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  z-index: 1;
}

/* grey progress part */
.bar-progress {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  background: #adb5bd;
  border-radius: 10px 0 0 10px;
  width: 0%;
  z-index: 2;
  pointer-events: none;
}

/* bar text */
.bar-label {
  position: relative;
  z-index: 3;
  color: #000;
}
</style>

