<script setup>
// App layout: left sidebar + main content area
import SideNav from '@/components/SideNav.vue'
</script>

<template>
  <!-- Full-height flex layout -->
  <div class="app d-flex min-vh-100">
    <!-- Left: persistent navigation sidebar -->
    <SideNav />

    <!-- Right: page content from the router -->
    <main class="flex-grow-1 bg-light">
      <!-- Optional container padding for page content -->
      <div class="container-fluid py-3">
        <!-- RouterView swaps in the active route's component (Dashboard, Projects, etc.) -->
        <RouterView />
      </div>
    </main>
  </div>
</template>

<style>
/* App-wide background (subtle, like a dashboard surface) */
.app { background: #f6f7f9; }

/* Ensure body has no unexpected scroll gaps in some browsers */
html, body, #app { height: 100%; margin: 0; }
</style>
