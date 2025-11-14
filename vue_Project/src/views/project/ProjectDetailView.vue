<template>
  <div class="p-3">
    <!--
      Top navigation bar for project-related pages.
      This component shows the tabs: Overview, Planning, Ambidexterity, etc.
      It receives the current project ID so the tabs can link correctly.
      Only visible when inside a project's route (/projects/:id/...).
    -->
    <ProjectTopNav :project-id="String(route.params.id)" class="mb-3" />

    <RouterView />
  </div>
</template>

<script setup>
// Import composable to access the active route
import { useRoute } from 'vue-router'

// Import the top navigation component used for each project
import ProjectTopNav from '@/components/ProjectTopNav.vue'

// The route object gives access to dynamic parameters like :id
const route = useRoute()
</script>
