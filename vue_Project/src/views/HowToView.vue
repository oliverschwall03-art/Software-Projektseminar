<script setup>
import howto from '@/data/howto.json'
</script>

<template>
  <div class="howto-page">
    <h1 class="mb-4">How-To: Explanations about this Tool</h1>

    <div class="howto-card">
      <!-- Goal -->
      <div class="howto-row">
        <div class="howto-label">Goal</div>
        <div class="howto-content">
          {{ howto.goal }}
        </div>
      </div>

      <!-- User -->
      <div class="howto-row">
        <div class="howto-label">User</div>
        <div class="howto-content">
          {{ howto.user }}
        </div>
      </div>

      <!-- Structure -->
      <div class="howto-row">
        <div class="howto-label">Structure</div>
        <div class="howto-content">
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
        <div class="howto-label">Usage</div>
        <div class="howto-content">
          {{ howto.usage }}
        </div>
      </div>

      <!-- Suitability -->
      <div class="howto-row">
        <div class="howto-label">Suitability</div>
        <div class="howto-content">
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
  grid-template-columns: 140px 1fr;
  margin-bottom: 12px;
}

.howto-label {
  background: #5da9e9; /* 接近 Excel 的藍色 */
  color: #ffffff;
  font-weight: 600;
  padding: 10px 14px;
  border-radius: 6px 0 0 6px;
  display: flex;
  align-items: center;
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
