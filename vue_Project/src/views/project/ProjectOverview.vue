<template>
  <div class="p-4 project-overview" v-if="project">
    <div class="mb-4">
      <h2 class="h5 text-muted">Project Scope</h2>
    </div>

    <hr class="mb-4" />

    <!-- =========================
         PROBLEM STATEMENT
         ========================= -->
    <section class="mb-4">
      <h3 class="section-title">Problem Statement</h3>
      <div class="field-box">
        <textarea
          v-model="project.problemStatement"
          class="form-control field-control"
          rows="3"
          placeholder="Describe the core problem this project addresses..."
        ></textarea>
      </div>
    </section>

    <!-- =========================
         GOAL
         ========================= -->
    <section class="mb-4">
      <h3 class="section-title">Goal</h3>
      <div class="field-box">
        <input
          v-model="project.goal"
          type="text"
          class="form-control field-control"
          placeholder="Summarize the goal in one sentence..."
        />
      </div>
    </section>

    <!-- =========================
         OBJECTIVES + LIMITATIONS
         ========================= -->
    <section class="mb-4">
      <div class="row g-3">
        <!-- LEFT COLUMN: Objectives -->
        <div class="col-md-6">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <h3 class="section-title mb-0">Objectives</h3>
            <div class="d-flex gap-2">
              <button class="btn btn-sm btn-primary" @click="addObjective">+ Add</button>
              <button
                class="btn btn-sm"
                :class="selectMode === 'objective' ? 'btn-danger text-white' : 'btn-outline-danger'"
                @click="toggleDeleteMode('objective')"
              >
                {{ selectMode === 'objective' ? 'Delete Mode On' : 'Delete' }}
              </button>
            </div>
          </div>

          <div class="field-box">
            <div
              v-for="obj in project.objectives"
              :key="obj.order"
              class="mb-2 d-flex align-items-center row-selectable"
              @click="onItemClick('objective', obj.order)"
            >
              <div class="me-2 text-muted">{{ obj.order }}.</div>
              <input
                v-model="obj.text"
                type="text"
                class="form-control field-control"
                :placeholder="`Objective ${obj.order}`"
              />
            </div>
          </div>
        </div>

        <!-- RIGHT COLUMN: Limitations -->
        <div class="col-md-6">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <h3 class="section-title mb-0">Limitations</h3>
            <div class="d-flex gap-2">
              <button class="btn btn-sm btn-primary" @click="addLimitation">+ Add</button>
              <button
                class="btn btn-sm"
                :class="selectMode === 'limitation' ? 'btn-danger text-white' : 'btn-outline-danger'"
                @click="toggleDeleteMode('limitation')"
              >
                {{ selectMode === 'limitation' ? 'Delete Mode On' : 'Delete' }}
              </button>
            </div>
          </div>

          <div class="field-box">
            <div
              v-for="lim in project.limitations"
              :key="lim.order"
              class="mb-2 d-flex align-items-center row-selectable"
              @click="onItemClick('limitation', lim.order)"
            >
              <div class="me-2 text-muted">{{ lim.order }}.</div>
              <input
                v-model="lim.text"
                type="text"
                class="form-control field-control"
                :placeholder="`Limitation ${lim.order}`"
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- =========================
         MILESTONES
         ========================= -->
    <section class="mb-4">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <h3 class="section-title mb-0">Milestones</h3>
        <div class="d-flex gap-2">
          <button class="btn btn-sm btn-primary" @click="addMilestone">+ Add</button>
          <button
            class="btn btn-sm"
            :class="selectMode === 'milestone' ? 'btn-danger text-white' : 'btn-outline-danger'"
            @click="toggleDeleteMode('milestone')"
          >
            {{ selectMode === 'milestone' ? 'Delete Mode On' : 'Delete' }}
          </button>
        </div>
      </div>

      <div class="field-box">
        <div class="row fw-semibold small text-muted mb-2">
          <div class="col-7 col-md-8">Milestone</div>
          <div class="col-5 col-md-4">Done until</div>
        </div>

        <div
          v-for="ms in project.milestones"
          :key="ms.order"
          class="row mb-2 align-items-center row-selectable"
          @click="onItemClick('milestone', ms.order)"
        >
          <div class="col-1 text-muted small">{{ ms.order }}.</div>
          <div class="col-6 col-md-7">
            <input
              v-model="ms.name"
              type="text"
              class="form-control field-control"
              :placeholder="`Milestone ${ms.order}`"
            />
          </div>
          <div class="col-5 col-md-4">
            <input
              v-model="ms.doneUntil"
              type="date"
              class="form-control field-control"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- =========================
         DEPENDENCIES
         ========================= -->
    <section class="mb-2">
      <h3 class="section-title">Dependencies</h3>
      <div class="field-box">
        <textarea
          v-model="project.dependencies"
          class="form-control field-control"
          rows="3"
          placeholder="Describe dependencies to other projects, teams or systems..."
        ></textarea>
      </div>
    </section>
  </div>

  <div v-else class="p-4">
    <div class="alert alert-warning">
      Project not found. Please select a project from the sidebar.
    </div>
  </div>
</template>




<script setup>
// This component displays the Project Overview information.
// It loads project data from the store based on the current route ID.

import { useRoute } from 'vue-router'
import { useProjectsStore } from '@/stores/projects'
import { storeToRefs } from 'pinia'
import { ref, computed, watch } from 'vue'


// Access current route to read the project ID
const route = useRoute()

// Load project store
const store = useProjectsStore()
const { projects } = storeToRefs(store)

// Find the active project based on URL parameter :id
const project = computed(() =>
  projects.value.find((p) => p.id === route.params.id)
)

const selectMode = ref(null) // 'delete' | null

function toggleDeleteMode(type) {
  // type = 'objective' | 'limitation' | 'milestone'
  selectMode.value = selectMode.value === type ? null : type
}


// Initialize missing fields so the UI does not break
function initProject(p) {
  if (!p) return

  // Basic text fields (ensure they always exist)
  if (p.problemStatement == null) p.problemStatement = ''
  if (p.goal == null) p.goal = ''
  if (p.dependencies == null) p.dependencies = ''

  // Objectives: always ensure at least 1 entry
  if (!Array.isArray(p.objectives)) p.objectives = []
  if (p.objectives.length === 0)
    p.objectives.push({ order: 1, text: '' })

// Limitations: always ensure at least 1 entry
  if (!Array.isArray(p.limitations)) p.limitations = []
  if (p.limitations.length === 0)
    p.limitations.push({ order: 1, text: '' })

// Milestones: always ensure at least 1 entry
  if (!Array.isArray(p.milestones)) p.milestones = []
  if (p.milestones.length === 0)
    p.milestones.push({ order: 1, name: '', doneUntil: '' })

}

// When project changes (new selection or first load), initialize it
watch(project, (p) => initProject(p), { immediate: true })

function addObjective() {
  if (!project.value) return
  const arr = project.value.objectives
  arr.push({ order: arr.length + 1, text: '' })
}

function removeObjective() {
  if (!project.value) return
  project.value.objectives.pop()
}

function addLimitation() {
  if (!project.value) return
  const arr = project.value.limitations
  arr.push({ order: arr.length + 1, text: '' })
}

function removeLimitation() {
  if (!project.value) return
  project.value.limitations.pop()
}

function addMilestone() {
  if (!project.value) return
  const arr = project.value.milestones
  arr.push({ order: arr.length + 1, name: '', doneUntil: '' })
}

function removeMilestone() {
  if (!project.value) return
  project.value.milestones.pop()
}

function onItemClick(type, order) {
  if (selectMode.value !== type) return

  if (confirm(`Delete ${type} ${order}?`)) {
    const arr = project.value?.[`${type}s`]
    if (!arr) return
    const idx = arr.findIndex(i => i.order === order)
    if (idx !== -1) arr.splice(idx, 1)

    // Reindex
    arr.forEach((i, k) => (i.order = k + 1))
    selectMode.value = null
  }
}

</script>



<style scoped>
/* Background of entire view */
.project-overview {
  background-color: #f8f9fa;
}

/* Small black section titles */
.section-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #1a1a1a;
}

/* Light gray, rounded input container */
.field-box {
  background-color: #f3f4f6;
  border-radius: 0.75rem;
  padding: 0.85rem 1rem;
}

/* Clean input style without borders */
.field-control {
  border: none;
  background-color: transparent;
  box-shadow: none !important;
  padding-left: 0;
  padding-right: 0;
}

.field-control:focus {
  outline: none;
  box-shadow: none;
}

.btn {
  font-size: 0.8rem;
  padding: 0.25rem 0.5rem;
}
.section-title {
  margin-bottom: 0; /* align buttons neatly */
}

.btn-sm {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
}

.field-box {
  margin-top: 0.25rem;
}

</style>
