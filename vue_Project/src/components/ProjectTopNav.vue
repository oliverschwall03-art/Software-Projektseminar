<template>
  <!--
    Top navigation bar shown on all project-related pages.
    It contains 3 navigation tabs (Overview, Planning, Ambidexterity)
    and displays the project name on the right side.
  -->
  <nav class="project-topnav border-bottom mb-3">
    <div class="d-flex justify-content-between align-items-center">

      <!--
        LEFT SIDE: Navigation Tabs
        ---------------------------
        Each tab links to a different sub-page of the selected project.
        Vue Router will highlight the active tab based on the current route.
      -->
      <ul class="nav nav-pills">

        <!-- Overview Tab -->
        <li class="nav-item">
          <RouterLink
            class="nav-link"
            :class="{ active: route.name === 'project-overview' }"
            :to="{ name: 'project-overview', params: { id: projectId } }"
          >
            <i class="bi bi-house me-1"></i>
            Overview
          </RouterLink>
        </li>

        <!-- Planning Tab -->
        <li class="nav-item">
          <RouterLink
            class="nav-link"
            :class="{ active: route.name === 'project-planning' }"
            :to="{ name: 'project-planning', params: { id: projectId } }"
          >
            <i class="bi bi-calendar4-week me-1"></i>
            Planning
          </RouterLink>
        </li>

        <!-- Ambidexterity Tab -->
        <li class="nav-item">
          <RouterLink
            class="nav-link"
            :class="{ active: route.name === 'project-ambidexterity' }"
            :to="{ name: 'project-ambidexterity', params: { id: projectId } }"
          >
            <i class="bi bi-diagram-3 me-1"></i>
            Ambidexterity
          </RouterLink>
        </li>

      </ul>

      <!--
        RIGHT SIDE: Project Name Display
        --------------------------------
        Shows the name of the current project.
        The project information is dynamically loaded from the Pinia store.
      -->
      <div class="project-name text-end">
        <span class="project-prefix">Project:</span>
        <span class="project-title">{{ project?.name || 'Unnamed project' }}</span>
      </div>

    </div>
  </nav>
</template>

<script setup>
/*
  SCRIPT SECTION
  ===============
  This section retrieves the currently active project using:
  - the incoming projectId prop
  - the Pinia project store

  It also reads the current route to determine which tab is active.
*/

import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useProjectsStore } from '@/stores/projects'
import { storeToRefs } from 'pinia'

const route = useRoute()

const props = defineProps({
  projectId: { type: String, required: true },
})

const store = useProjectsStore()
const { projects } = storeToRefs(store)

const project = computed(() =>
  projects.value.find(p => p.id === props.projectId)
)
</script>

<style scoped>

.project-topnav {
  background: #fff;
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
}

/* Default tab styling */
.nav-pills .nav-link {
  border-radius: 0.5rem;
  font-weight: 500;
  color: var(--bs-body-color);
  padding: 0.5rem 1rem;
  transition: background 0.15s ease;
}

/* Hover effect for tabs */
.nav-pills .nav-link:hover {
  background: #f2f4f8;
  color: var(--bs-primary);
}

/* Active tab (when it's the current route) */
.nav-pills .nav-link.active {
  background-color: var(--bs-primary);
  color: #fff;
  font-weight: 600;
}

/* Container for the project name on the right side */
.project-name {
  display: flex;
  flex-direction: row;
  align-items: baseline;
  gap: 0.4rem;
}

/* Smaller "Project:" prefix */
.project-prefix {
  font-size: 0.85rem;
  color: #6c757d;
  font-weight: 500;
}

/* Main project title (larger and bold) */
.project-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #212529;
  white-space: nowrap;
  max-width: 260px;
  overflow: hidden;
  text-overflow: ellipsis; /* Prevent long names from overflowing */
}

</style>
