<template>
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
</template>

<script setup>
import { computed } from 'vue'
import { useProjectsStore } from '@/stores/projects'
import { storeToRefs } from 'pinia'

const store = useProjectsStore()
const { projects } = storeToRefs(store)

// 动态决定需要多少行 Objective
const objectiveRows = computed(() => {
  let max = 0
  for (const p of projects.value) {
    if (Array.isArray(p.objectives)) {
      max = Math.max(max, p.objectives.length)
    }
  }
  // 至少 3 行，保持和 Excel 布局一致
  return Array.from({ length: Math.max(max, 3) }, (_, i) => i + 1)
})
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

/* Goals table tweaks */
.goals-table th:first-child,
.goals-table td:first-child {
  white-space: nowrap;
}
</style>
