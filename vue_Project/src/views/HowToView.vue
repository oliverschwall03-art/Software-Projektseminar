<script setup>
import { ref } from 'vue'
import howto from '@/data/howto.json'

// 目前打開哪一個 section：'goal' | 'user' | 'structure' | 'usage' | 'suitability'
const openSection = ref('goal')

function toggle(section) {
  openSection.value = openSection.value === section ? '' : section
}
</script>


<template>
  <div class="howto-page">
    <h1 class="mb-4">How-To: Explanations about this Tool</h1>

    <div class="howto-card">
      <!-- Goal -->
      <div class="howto-row">
        <button class="howto-label btn-reset" @click="toggle('goal')">
          <span>Goal</span>
          <i class="bi" :class="openSection === 'goal' ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
        </button>
        <div v-if="openSection === 'goal'" class="howto-content">
          {{ howto.goal }}
        </div>
      </div>

      <!-- User -->
      <div class="howto-row">
        <button class="howto-label btn-reset" @click="toggle('user')">
          <span>User</span>
          <i class="bi" :class="openSection === 'user' ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
        </button>
        <div v-if="openSection === 'user'" class="howto-content">
          {{ howto.user }}
        </div>
      </div>

      <!-- Structure -->
      <div class="howto-row">
        <button class="howto-label btn-reset" @click="toggle('structure')">
          <span>Structure</span>
          <i class="bi" :class="openSection === 'structure' ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
        </button>
        <div v-if="openSection === 'structure'" class="howto-content">
          <p class="mb-2">
            The tool has 3 parts: The dashboard view, the project views and the help pages (How To &amp; Filling Aid).
          </p>

          <div class="structure-block">
            <h6>Project View</h6>
            <p>{{ howto.structure['Project View'] }}</p>
          </div>
          <div class="structure-block">
            <h6>Dashboard</h6>
            <p>{{ howto.structure['Dashboard'] }}</p>
          </div>
          <div class="structure-block mb-0">
            <h6>Help Pages</h6>
            <p>{{ howto.structure['Help Pages'] }}</p>
          </div>
        </div>
      </div>

      <!-- Usage -->
      <div class="howto-row">
        <button class="howto-label btn-reset" @click="toggle('usage')">
          <span>Usage</span>
          <i class="bi" :class="openSection === 'usage' ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
        </button>
        <div v-if="openSection === 'usage'" class="howto-content">
          {{ howto.usage }}
        </div>
      </div>

      <!-- Suitability -->
      <div class="howto-row">
        <button class="howto-label btn-reset" @click="toggle('suitability')">
          <span>Suitability</span>
          <i class="bi" :class="openSection === 'suitability' ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
        </button>
        <div v-if="openSection === 'suitability'" class="howto-content">
          {{ howto.suitability }}
        </div>
      </div>
    </div>
  </div>
</template>


<style scoped>
.howto-page {
  padding: 24px;
}

.howto-card {
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  padding: 24px;
}

.howto-row {
  display: grid;
  grid-template-columns: 200px 1fr;
  margin-bottom: 12px;
  align-items: stretch;
}

.btn-reset {
  border: none;
  background: transparent;
  padding: 0;
  text-align: left;
}

.howto-label {
  background: #5da9e9;
  color: #ffffff;
  font-weight: 600;
  padding: 10px 14px;
  border-radius: 6px 0 0 6px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  cursor: pointer;
}

.howto-content {
  background: #f5f5f5;
  padding: 10px 14px;
  border-radius: 0 6px 6px 0;
  font-size: 14px;
  line-height: 1.5;
}

.structure-block {
  margin-bottom: 10px;
}

.structure-block h6 {
  font-weight: 600;
  margin-bottom: 4px;
}
</style>


