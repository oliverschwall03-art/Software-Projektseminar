<template>
  <div v-if="project" class="p-4">
    <h1 class="h4 mb-3">Project Settings</h1>
    <p class="text-muted mb-4">
      Here you can update project details, adjust the number of phases, or delete the entire project.
    </p>

    <div class="card shadow-sm p-4 mb-4">

      <!-- HEADER with Edit / Save -->
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h5 class="mb-0 fw-semibold">Project Configuration</h5>
        <button
          class="btn btn-sm"
          :class="isEditing ? 'btn-success' : 'btn-outline-secondary'"
          @click="toggleEdit"
        >
          <i :class="isEditing ? 'bi bi-check-lg me-1' : 'bi bi-pencil me-1'"></i>
          {{ isEditing ? 'Save' : 'Edit' }}
        </button>
      </div>

      <!-- Project Name -->
      <div class="mb-3">
        <label class="form-label fw-semibold">Project Name</label>
        <input
          v-model="editableName"
          type="text"
          class="form-control"
          :disabled="!isEditing"
        />
      </div>

      <!-- Number of Phases -->
      <div class="mb-3">
        <label class="form-label fw-semibold">Number of Phases</label>
        <input
          v-model.number="editablePhaseCount"
          type="number"
          min="1"
          class="form-control"
          :disabled="!isEditing"
        />
        <small class="text-muted">
          Changing this will add or remove phases.
        </small>
      </div>

      <hr />

      <!-- Delete Project -->
      <div class="mt-4">
        <label class="form-label fw-semibold text-danger">Danger Zone</label>
        <p class="small text-muted">
          Deleting this project will remove all its data permanently.
        </p>
        <button class="btn btn-outline-danger" @click="deleteProject">
          <i class="bi bi-trash me-1"></i> Delete Project
        </button>
      </div>

    </div>
  </div>

  <!-- Fallback -->
  <div v-else class="alert alert-warning m-4">
    Project not found.
  </div>
</template>

<script setup>
import { ref, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProjectsStore } from '@/stores/projects'
import { storeToRefs } from 'pinia'

const route = useRoute()
const router = useRouter()
const store = useProjectsStore()
const { projects } = storeToRefs(store)

// Find current project from store
const project = ref(null)
watchEffect(() => {
  project.value = projects.value.find(p => p.id === route.params.id) || null
})

// Local editable fields
const isEditing = ref(false)
const editableName = ref('')
const editablePhaseCount = ref(0)

// Keep editable fields synced when project changes
watchEffect(() => {
  if (project.value) {
    editableName.value = project.value.name || ''
    editablePhaseCount.value = project.value.phases?.length || 0
  }
})

// Toggle edit mode
function toggleEdit() {
  if (!isEditing.value) {
    isEditing.value = true
    return
  }

  // Save changes
  if (!project.value) return

  project.value.name = editableName.value
  updatePhaseCount()
  project.value.phaseCount = project.value.phases.length
  isEditing.value = false
}

// Update number of phases dynamically
function updatePhaseCount() {
  if (!project.value) return
  const current = project.value.phases?.length || 0
  const desired = editablePhaseCount.value

  // Add new phases
  if (desired > current) {
    for (let i = current + 1; i <= desired; i++) {
      project.value.phases.push({
        index: i,
        tasks: [],
        ambiRatingsLeft: [],
        ambiRatingsRight: []
      })
    }
  }
  // Remove excess phases
  else if (desired < current) {
    if (confirm(`Remove ${current - desired} phase(s)?`)) {
      project.value.phases.splice(desired)
    } else {
      editablePhaseCount.value = current
    }
  }

  // Synchronize stored phaseCount
  project.value.phaseCount = project.value.phases.length
}

// Delete project
function deleteProject() {
  if (!project.value) return
  const confirmed = confirm(`Delete project "${project.value.name}" permanently?`)
  if (!confirmed) return

  store.projects = store.projects.filter(p => p.id !== project.value.id)
  router.push({ name: 'dashboard' })
}
</script>

<style scoped>
.card {
  background: #fff;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
}
.btn-outline-secondary,
.btn-success {
  min-width: 90px;
}
.form-label {
  font-size: 0.95rem;
}
</style>
