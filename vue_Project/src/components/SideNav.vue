<template>
  <!--
    Entire LEFT sidebar container.
    Contains:
    - toggle button (for small screens)
    - "New Project" modal trigger
    - navigation links (dashboard, projects, skills, import, how-to)
  -->
  <aside
    class="sidenav border-end bg-white"
    :class="{ collapsed: isCollapsed }"
  >
    <div class="p-3">
      <!--
        Collapse toggle button
        ----------------------
        Only visible on large-down screens
        When clicked, it toggles the `collapsed` state of the sidebar,
        which hides the labels and shows only icons.
      -->
      <button
        class="btn btn-outline-secondary w-100 d-lg-none mb-3 d-flex align-items-center justify-content-center gap-2"
        type="button"
        @click="isCollapsed = !isCollapsed"
      >
        <i class="bi bi-list"></i>
        <span class="nav-label">Menu</span>
      </button>

      <!--
        "New Project" button
        --------------------
        Opens a Bootstrap modal that asks for the project name.
      -->
      <button
        class="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2 mb-3"
        type="button"
        data-bs-toggle="modal"
        data-bs-target="#newProjectModal"
      >
        <i class="bi bi-plus-lg"></i>
        <span class="nav-label">New Project</span>
      </button>

      <!--
        Modal: Create New Project
        -------------------------
        Simple Bootstrap modal where the user can type a new project name.
      -->
      <div
        class="modal fade"
        id="newProjectModal"
        tabindex="-1"
        aria-labelledby="newProjectModalLabel"
        aria-hidden="true"
        ref="modalEl"
      >
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <!-- Modal header with title + close icon -->
            <div class="modal-header">
              <h5 class="modal-title" id="newProjectModalLabel">Create New Project</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>

            <!-- Modal body with input field -->
            <div class="modal-body">
              <label class="form-label">Project Name</label>
              <input
                id="projectNameInput"
                type="text"
                v-model="newProjectName"
                class="form-control"
                placeholder="Enter project name"
                @keyup.enter="handleEnter"
              />
            </div>

            <!-- Modal footer with Cancel + OK -->
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Cancel
              </button>
              <button
                type="button"
                class="btn btn-primary"
                @click="confirmCreate"
                data-bs-dismiss="modal"
                ref="okButtonEl"
              >
                OK
              </button>

            </div>
          </div>
        </div>
      </div>

      <!--
        Main navigation items
        =====================
        Uses RouterLink to navigate between the main views.
      -->
      <nav class="nav flex-column">
        <!-- Dashboard -->
        <RouterLink
          class="nav-link px-0 py-2"
          :class="linkClass('dashboard')"
          to="/"
        >
          <i class="bi bi-speedometer2 me-2"></i>
          <span class="nav-label">Dashboard</span>
        </RouterLink>

        <!-- Projects header row (link + toggle for collapsible list) -->
        <div class="d-flex align-items-center">
          <RouterLink
            class="nav-link px-0 py-2 flex-grow-1"
            :class="linkClass('projects')"
            to="/projects"
          >
            <i class="bi bi-folder2-open me-2"></i>
            <span class="nav-label">Projects</span>
          </RouterLink>
          <!-- Chevron button to expand/collapse the project list -->
          <button
            class="icon-toggle ms-2"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#projectsMenu"
            :aria-expanded="isProjectsOpen.toString()"
            @click="isProjectsOpen = !isProjectsOpen"
            aria-label="Toggle project list"
          >
            <i class="bi" :class="isProjectsOpen ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
          </button>
        </div>

        <!--
          Collapsible project submenu
          ---------------------------
          Displays all projects from the Pinia store.
          Active project is highlighted.
        -->
        <div id="projectsMenu" class="collapse" :class="{ show: isProjectsOpen }">
          <ul class="list-unstyled ms-3 my-1">
            <li v-for="p in projects" :key="p.id">
              <RouterLink
                class="submenu-link d-block px-2 py-1 rounded"
                :class="isActiveProject(p.id) ? 'active' : ''"
                :to="`/projects/${p.id}`"
              >
                <i class="bi bi-file-earmark me-2"></i>
                <span class="nav-label">{{ p.name }}</span>
              </RouterLink>
            </li>
          </ul>
        </div>

        <!-- Remaining menu items -->

        <!-- Skill overview page -->
        <RouterLink
          class="nav-link px-0 py-2"
          :class="linkClass('skills')"
          to="/skills"
        >
          <i class="bi bi-bar-chart-line me-2"></i>
          <span class="nav-label">Skill Overview</span>
        </RouterLink>

        <!-- Import & export page -->
        <RouterLink
          class="nav-link px-0 py-2"
          :class="linkClass('import')"
          to="/import"
        >
          <i class="bi bi-upload me-2"></i>
          <span class="nav-label">Import & Export</span>
        </RouterLink>

        <!-- How-to / help page -->
        <RouterLink
          class="nav-link px-0 py-2"
          :class="linkClass('howto')"
          to="/howto"
        >
          <i class="bi bi-question-circle me-2"></i>
          <span class="nav-label">How To</span>
        </RouterLink>
      </nav>
    </div>
  </aside>
</template>

<script setup>
/*
  SCRIPT SECTION
  ==============
  Controls:
  - sidebar collapsed state
  - which menu item is active
  - which project submenu is open
  - create-new-project modal behavior
*/

import { ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useProjectsStore } from '@/stores/projects'

// Current route (used to highlight active links and detect project views)
const route = useRoute()

// Pinia store for projects
const store = useProjectsStore()
const { projects } = storeToRefs(store)

// Whether the "Projects" submenu is open or not
// Initially open if we're on a project-related route
const isProjectsOpen = ref(route.name === 'project-detail' || route.name === 'projects')

// Whether the entire sidebar is collapsed (icon-only mode)
const isCollapsed = ref(false)

// Modal-related refs
const newProjectName = ref('')  // user input for new project name
const modalEl = ref(null)       // reference to the modal DOM element
const okButtonEl = ref(null)    // reference to the OK button in the modal

onMounted(() => {
  // Collapse sidebar by default on smaller screens
  if (window.innerWidth < 992) {
    isCollapsed.value = true
  }

  // When the modal is shown, reset the input and focus the text field
  modalEl.value?.addEventListener('shown.bs.modal', () => {
    newProjectName.value = ''
    const input = document.getElementById('projectNameInput')
    input && input.focus()
  })
})

// Watch the route and automatically open/close the project submenu
// based on whether we are on a project-related route.
watch(
  () => route.name,
  (name) => {
    isProjectsOpen.value = name === 'project-detail' || name === 'projects'
  }
)

// Helper to compute classes for top-level navigation links
const linkClass = (name) =>
  route.name === name ? 'active fw-semibold text-primary' : 'text-body-secondary'

// Check if a given project ID matches the currently active project route
const isActiveProject = (id) =>
  route.name === 'project-detail' && route.params.id === id

// Create a new project when user confirms in the modal
function confirmCreate() {
  const name = newProjectName.value.trim()
  if (!name) return

  // Generate a simple project ID like "P001", "P002", ...
  const id = 'P' + (store.projects.length + 1).toString().padStart(3, '0')

  // Add to Pinia project store
  store.addProject({ id, name })

  // Reset the input field for the next time
  newProjectName.value = ''
}

// Handle Enter key inside the project name input
// Behaves like clicking the OK button (which triggers confirmCreate
// and also has data-bs-dismiss to close the modal)
function handleEnter() {
  if (!newProjectName.value.trim()) return
  okButtonEl.value?.click()
}
</script>

<style scoped>
/* Base sidebar styling */
.sidenav {
  width: 260px;
  min-height: 100vh;
  background: #fff;
  transition: width 0.2s ease;

  flex-shrink: 0;
}

/* Collapsed = only icons are visible, labels are hidden */
.sidenav.collapsed {
  width: 64px;
}

.sidenav.collapsed .nav-label {
  display: none;
}

.sidenav.collapsed .nav-link,
.sidenav.collapsed .submenu-link {
  text-align: center;
}

.sidenav.collapsed .nav-link i,
.sidenav.collapsed .submenu-link i {
  margin-right: 0;
}

/* Base styling for nav links */
.nav-link {
  border-radius: 0.5rem;
  text-align: left;
}

/* Appearance of active top-level nav link */
.nav-link.active {
  background-color: #f0f6ff;
}

/* Small chevron button to toggle Projects submenu */
.icon-toggle {
  border: none;
  background: transparent;
  padding: 0.25rem 0.4rem;
  border-radius: 0.5rem;
  line-height: 1;
}
.icon-toggle:hover {
  background: #f6f8fc;
}

/* In collapsed mode, hide the chevron toggle (no room) */
.sidenav.collapsed .icon-toggle {
  display: none;
}

/* Project submenu link styles */
.submenu-link {
  color: var(--bs-secondary-color);
  text-decoration: none;
}
.submenu-link.active {
  background: #eef5ff;
  color: var(--bs-primary);
  font-weight: 600;
}
.submenu-link:hover {
  background: #f6f8fc;
}

/* Responsive tweaks for small screens */
@media (max-width: 992px) {
  .sidenav {
    /* Width is handled by the collapsed class, no extra rule needed here */
  }
}
</style>
