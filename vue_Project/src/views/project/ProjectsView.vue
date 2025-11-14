<template>
  <div class="p-3">

    <!-- Page title -->
    <h1 class="h5 mb-3">Projects</h1>

    <!-- Responsive grid of project cards -->
    <div class="row g-2">

      <!-- Loop through all projects from the store -->
      <div class="col-md-6 col-lg-4" v-for="p in projects" :key="p.id">

        <!-- Each project shown as a card -->
        <div class="card h-100">
          <div class="card-body d-flex flex-column">

            <!-- Project name -->
            <h2 class="h6 mb-2">{{ p.name }}</h2>

            <!-- Project ID displayed below -->
            <p class="text-muted mb-4">ID: {{ p.id }}</p>

            <!-- Spacer pushes the button to the bottom of the card -->
            <div class="mt-auto">

              <!-- Link to the single project detail page -->
              <RouterLink
                class="btn btn-outline-primary btn-sm"
                :to="`/projects/${p.id}`"
              >
                Open
              </RouterLink>

            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- This view intentionally has no "Create Project" button -->
  </div>
</template>

<script setup>
/*
  Import Pinia helpers to access the global state.
  storeToRefs() ensures reactivity stays intact when destructuring.
*/
import { storeToRefs } from 'pinia'

/* Import our custom store that holds all projects */
import { useProjectsStore } from '@/stores/projects'

/* Initialize the store instance */
const store = useProjectsStore()

/*
  Extract the "projects" list as a reactive reference.
  Any changes in the store will automatically update this view.
*/
const { projects } = storeToRefs(store)
</script>
