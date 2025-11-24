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
    addProject(payload = {}) {
      const id = payload.id || nanoid(6)
      const name = payload.name || 'New Project'
      const p = { id, name, ...payload }
      this.projects.push(p)
      return p
    },

    // EXPORT FUNCTION
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

    // IMPORT FUNCTION
    importStore(event) {
      const file = event.target.files[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result)
          if (Array.isArray(data.projects)) {
            this.projects = data.projects
            alert('Projects successfully imported!')
          } else {
            alert('Invalid JSON structure – "projects" array missing.')
          }
        } catch (err) {
          alert('Import failed: Invalid JSON file.')
          console.error(err)
        }
      }
      reader.readAsText(file)
    },
  },
})
