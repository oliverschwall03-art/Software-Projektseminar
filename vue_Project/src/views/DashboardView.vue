<template>
  <div class="p-3 dashboard-root">
    <GoalsTable />
    <ProjectDaysSection />
    <SkillNeedSection />
  </div>
</template>

<script setup>
import GoalsTable from '@/components/dashboard/GoalsTable.vue'
import ProjectDaysSection from '@/components/dashboard/ProjectDaysSection.vue'
import SkillNeedSection from '@/components/dashboard/SkillNeedSection.vue'
</script>

<style scoped>
.dashboard-root {
  background-color: #f8f9fa;
}
</style>
