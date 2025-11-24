<template>
  <div class="p-4">
    <h1 class="h4 mb-3">Import & Export</h1>
    <p class="text-muted mb-4">
      This page allows you to export your current project data as a JSON file or import it back later.
    </p>

    <div class="d-flex gap-3 align-items-start">
      <button class="btn btn-primary btn-sm" @click="store.exportStore()">
        Export Projects
      </button>

      <label class="btn btn-outline-secondary btn-sm mb-0">
        Import Projects
        <input type="file" accept=".json" hidden @change="store.importStore" />
      </label>
    </div>
  </div>
</template>

<script setup>
import { useProjectsStore } from '@/stores/projects'
const store = useProjectsStore()
</script>

<style scoped>
div {
  min-height: 100vh;
  background-color: #fff;
}
</style>
