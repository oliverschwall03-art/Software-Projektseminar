<template>
  <!-- Main wrapper for the Project Overview page -->
  <!-- Contains basic project scope information (problem, goals, objectives, milestones, etc.) -->
  <div class="p-4 project-overview" v-if="project">

    <!-- Page header -->
    <div class="mb-4">
      <h2 class="h5 text-muted">Project Scope</h2>
    </div>

    <hr class="mb-4" />

    <!-- =========================
         PROBLEM STATEMENT
         ========================= -->
    <section class="mb-4">
      <!-- Section title -->
      <h3 class="section-title">Problem Statement</h3>

      <!-- Input field inside styled box -->
      <div class="field-box">
        <textarea
          v-model="project.problemStatement"
          class="form-control field-control"
          rows="3"
          placeholder="Describe the core problem this project addresses..."
        />
      </div>
    </section>

    <!-- =========================
         GOAL
         ========================= -->
    <section class="mb-4">
      <h3 class="section-title">Goal</h3>

      <div class="field-box">
        <!-- Single sentence project goal -->
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
         Two half-width columns
         ========================= -->
    <section class="mb-4">
      <div class="row g-3">

        <!-- LEFT COLUMN: Objectives -->
        <div class="col-md-6">
          <h3 class="section-title">Objectives</h3>

          <div class="field-box">
            <!-- Render predefined number of objective items -->
            <div
              v-for="obj in project.objectives"
              :key="obj.order"
              class="mb-2 d-flex align-items-center"
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
          <h3 class="section-title">Limitations</h3>

          <div class="field-box">
            <!-- Render predefined number of limitation items -->
            <div
              v-for="lim in project.limitations"
              :key="lim.order"
              class="mb-2 d-flex align-items-center"
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
      <h3 class="section-title">Milestones</h3>

      <div class="field-box">

        <!-- Column headers -->
        <div class="row fw-semibold small text-muted mb-2">
          <div class="col-7 col-md-8">Milestone</div>
          <div class="col-5 col-md-4">Done until</div>
        </div>

        <!-- List of milestone items -->
        <div
          v-for="ms in project.milestones"
          :key="ms.order"
          class="row mb-2 align-items-center"
        >
          <!-- Item number -->
          <div class="col-1 text-muted small">{{ ms.order }}.</div>

          <!-- Milestone name -->
          <div class="col-6 col-md-7">
            <input
              v-model="ms.name"
              type="text"
              class="form-control field-control"
              :placeholder="`Milestone ${ms.order}`"
            />
          </div>

          <!-- Deadline -->
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
        />
      </div>
    </section>

  </div>

  <!-- Fallback when project ID is invalid -->
  <div v-else class="p-4">
    <div class="alert alert-warning">
      Project not found. Please select a project from the sidebar.
    </div>
  </div>
</template>



<script setup>
// This component displays the Project Overview information.
// It loads project data from the store based on the current route ID.

import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useProjectsStore } from '@/stores/projects'
import { storeToRefs } from 'pinia'

// Access current route to read the project ID
const route = useRoute()

// Load project store
const store = useProjectsStore()
const { projects } = storeToRefs(store)

// Find the active project based on URL parameter :id
const project = computed(() =>
  projects.value.find((p) => p.id === route.params.id)
)


// Initialize missing fields so the UI does not break
function initProject(p) {
  if (!p) return

  // Basic text fields (ensure they always exist)
  if (p.problemStatement == null) p.problemStatement = ''
  if (p.goal == null) p.goal = ''
  if (p.dependencies == null) p.dependencies = ''

  // Objectives: always ensure at least 3 entries
  if (!Array.isArray(p.objectives)) p.objectives = []
  while (p.objectives.length < 3)
    p.objectives.push({
      order: p.objectives.length + 1,
      text: '',
    })

  // Limitations: always ensure at least 3 entries
  if (!Array.isArray(p.limitations)) p.limitations = []
  while (p.limitations.length < 3)
    p.limitations.push({
      order: p.limitations.length + 1,
      text: '',
    })

  // Milestones: always ensure at least 5 entries (name + due date)
  if (!Array.isArray(p.milestones)) p.milestones = []
  while (p.milestones.length < 5)
    p.milestones.push({
      order: p.milestones.length + 1,
      name: '',
      doneUntil: '',
    })
}

// When project changes (new selection or first load), initialize it
watch(project, (p) => initProject(p), { immediate: true })
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
</style>
