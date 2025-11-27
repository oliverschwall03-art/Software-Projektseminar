import { defineStore } from 'pinia'
import { nanoid } from 'nanoid'

export const useProjectsStore = defineStore('projects', {
  state: () => ({
    projects: [],
  }),

  getters: {
    all: (s) => s.projects,
    getById: (s) => (id) => s.projects.find(p => p.id === id),
  },

  actions: {
    /* CREATE NEW PROJECT*/
    addProject(payload = {}) {
      const id = payload.id || nanoid(6)
      const name = payload.name || 'New Project'
      const phaseCount = payload.phaseCount || 3 // Default: 3 Phases

      //  Direkt Phasen erstellen
      const phases = []
      for (let i = 1; i <= phaseCount; i++) {
        phases.push({
          index: i,
          tasks: [],
          ambiRatingsLeft: [],
          ambiRatingsRight: []
        })
      }

      const project = {
        id,
        name,
        phaseCount,
        phases,
        problemStatement: '',
        goal: '',
        limitations: [],
        objectives: [],
        milestones: [],
        dependencies: '',
        plannedProjectDays: [],
        projectType: '',
        managementStyle: '',
        managementStyleReason: '',
      }

      this.projects.push(project)
      return project
    },

    /*  EXPORT FUNCTION*/
    exportStore() {
      try {
        const dataStr = JSON.stringify({ projects: this.projects }, null, 2)
        const blob = new Blob([dataStr], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'ProjectStore.json'
        a.click()
        URL.revokeObjectURL(url)
      } catch (err) {
        console.error('Export failed:', err)
      }
    },

    importStore(event) {
      const file = event.target.files[0]
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result)

          // --- Validate basic structure ---
          // Check if the top-level object contains a "projects" array
          if (!data || !Array.isArray(data.projects)) {
            alert('❌ Invalid JSON structure – missing "projects" array.')
            return
          }

          // Check if the first project contains at least an id
          const first = data.projects[0]
          if (!first || !first.id) {
            alert('❌ Invalid project entries in JSON file.')
            return
          }

          // --- If everything looks fine, import the projects ---
          this.projects = data.projects
          alert(`✅ Successfully imported ${data.projects.length} project(s)!`)

        } catch (err) {
          console.error('Import failed:', err)
          alert('❌ Import failed – invalid JSON file.')
        }
      }

      reader.readAsText(file)
    }
  },
})
