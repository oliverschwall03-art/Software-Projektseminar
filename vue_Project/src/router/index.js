import { createRouter, createWebHistory } from 'vue-router'

/*
  Lazy-loaded route components
  ============================
  Each view is imported only when needed.
  This keeps the initial bundle small and improves performance.
*/

const DashboardView        = () => import('@/views/DashboardView.vue')
const ProjectsView         = () => import('@/views/project/ProjectsView.vue')
const ProjectDetailView    = () => import('@/views/project/ProjectDetailView.vue')

// Sub-pages inside a single project
const ProjectOverview      = () => import('@/views/project/ProjectOverview.vue')
const ProjectPlanning      = () => import('@/views/project/ProjectPlanning.vue')
const ProjectAmbidexterity = () => import('@/views/project/ProjectAmbidexterity.vue')
const ProjectSettings      = () => import('@/views/project/ProjectSettings.vue')

/*
  Router configuration
  ====================
  This defines all paths (URLs) your application can display.
  Vue Router will load the respective component when a path is visited.
*/
export default createRouter({
  // Use browser history API (clean URLs without #hash)
  history: createWebHistory(import.meta.env.BASE_URL),

  // All available routes in the application
  routes: [
    /*
      Main pages (top-level routes)
      -----------------------------
      Accessible directly from the sidebar.
    */
    { path: '/',         name: 'dashboard', component: DashboardView },
    { path: '/projects', name: 'projects',  component: ProjectsView },

    /*
      Project detail route (with nested child routes)
      ------------------------------------------------
      /projects/:id
        - This route shows the general layout for a single project:
            Sidebar stays the same
            Top navigation (Overview / Planning / Ambidexterity)
            <RouterView> loads the specific subpage
    */
    {
      path: '/projects/:id',
      name: 'project-detail',
      component: ProjectDetailView,

      /*
        Child routes under a single project
        -----------------------------------
        These define the 3 tabs.

        Example URLs:
          /projects/001/overview
          /projects/001/planning
          /projects/001/ambidexterity

        The parent view (ProjectDetailView) includes a <RouterView> that renders these.
      */
      children: [
        // Default route → redirect to "overview"
        { path: '', redirect: { name: 'project-overview' } },

        // Tab: Overview page
        { path: 'overview', name: 'project-overview', component: ProjectOverview },

        // Tab: Planning page (Gantt chart)
        { path: 'planning', name: 'project-planning', component: ProjectPlanning },

        // Tab: Ambidexterity assessment page
        { path: 'ambidexterity', name: 'project-ambidexterity', component: ProjectAmbidexterity },
        { path: '/project/:id/settings', name: 'project-settings', component: ProjectSettings },
      ],
    },

    /*
      Other standalone pages
      -----------------------
      These do not belong to a specific project.
    */
    { path: '/skills', name: 'skills', component: () => import('@/views/SkillsView.vue') },
    { path: '/import', name: 'import', component: () => import('@/views/ImportView.vue') },
    { path: '/howto',  name: 'howto',  component: () => import('@/views/HowToView.vue') },
  ],
})
