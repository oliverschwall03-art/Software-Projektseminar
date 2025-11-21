<script setup>
import skillOverview from "@/data/skill-overview.json";

const rows = [
  { key: "exploitative", label: "Exploitative" },
  { key: "explorative", label: "Explorative" },
  { key: "ambidextrous", label: "Ambidextrous" }
];

const cols = [
  { key: "personal", label: "Personal Capabilities", sub: "handling abilities with respect to oneself" },
  { key: "professional", label: "Professional Capabilities", sub: "handling abilities of known fields/issues" },
  { key: "methodical", label: "Methodic Capabilities", sub: "handling abilities of unknown fields/issues" },
  { key: "social", label: "Social Capabilities", sub: "handling abilities with respect to other persons" },
  { key: "summary", label: "Summary", sub: "" }
];

function asList(val) {
  return Array.isArray(val) ? val : [];
}
</script>

<template>
  <div class="skill-page">
    <h1 class="page-title">Skill Overview</h1>

    <div class="table-wrap">
      <table class="skill-table">
        <thead>
          <tr>
            <th class="corner"></th>
            <th v-for="c in cols" :key="c.key" class="col-head">
              <div class="col-title">{{ c.label }}</div>
              <div v-if="c.sub" class="col-sub">{{ c.sub }}</div>
            </th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="r in rows" :key="r.key">
            <th class="row-head">{{ r.label }}</th>

            <!-- Personal / Professional / Methodical / Social -->
            <td v-for="c in cols.slice(0,4)" :key="c.key" class="cell">
              <ul class="cell-list">
                <li v-for="item in asList(skillOverview[r.key][c.key])" :key="item">
                  {{ item }}
                </li>
              </ul>
            </td>

            <!-- Summary -->
            <td class="cell summary-cell">
              {{ skillOverview[r.key].summary }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.skill-page {
  padding: 24px;
  background: #f7f8fa;
  min-height: 100%;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 16px;
}

.table-wrap {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  overflow: auto;
  box-shadow: 0 2px 6px rgba(0,0,0,0.04);
}

.skill-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  min-width: 1100px; /* 避免太窄 */
}

.skill-table th,
.skill-table td {
  border: 1px solid #e5e7eb;
  vertical-align: top;
  padding: 12px 14px;
  font-size: 14px;
  line-height: 1.5;
}

.corner {
  width: 140px;
  background: #fafafa;
}

.col-head {
  background: #fafafa;
  text-align: left;
}

.col-title {
  font-weight: 700;
  font-size: 15px;
}

.col-sub {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
  font-style: italic;
}

.row-head {
  width: 140px;
  background: #fcfcfd;
  font-weight: 700;
  font-size: 15px;
}

.cell-list {
  margin: 0;
  padding-left: 18px;
}

.cell-list li {
  margin: 2px 0;
}

.summary-cell {
  white-space: pre-wrap;
}
</style>
