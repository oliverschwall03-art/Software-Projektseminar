import { defineStore } from 'pinia'
import { nanoid } from 'nanoid' // Used for generating unique project IDs

/*
  Project Store
  =============
  This Pinia store holds all project data used throughout the application.

  It provides:
  - "projects" state (list of all projects)
  - getters to retrieve project lists or single projects
  - an action to create new projects

  Every component in the app can easily access and modify this data.
*/
export const useProjectsStore = defineStore('projects', {
  /*
    STATE
    =====
    A store's state function returns the reactive data container.

    Here:
    - "projects" is an array that will store objects like:
        { id: "abc123", name: "My Project" }
  */
  state: () => ({
    projects: [],
  }),

  /*
    GETTERS
    =======
    Getters are like computed properties for stores.
    They give convenient ways to read store data.
  */
  getters: {
    // Returns the full list of projects
    all: (s) => s.projects,

    // Returns a function that finds a project by its ID
    getById: (s) => (id) => s.projects.find(p => p.id === id),
  },

  /*
    ACTIONS
    =======
    Actions modify the store state.
    They behave like component methods and CAN be async.

    Here we define:
    - addProject → adds a new project to the list
  */
  actions: {
    /*
      addProject(payload)
      --------------------
      Creates a new project with:
      - an auto-generated or provided ID
      - a provided name or a fallback default name

      Example project object:
        {
          id: "A1B2C3",
          name: "New Project"
        }
    */
    addProject(payload = {}) {
      // Generate ID (use provided ID if available, otherwise nanoid)
      const id = payload.id || nanoid(6)

      // Use provided name or fallback label
      const name = payload.name || 'New Project'

      // New project object
      const p = { id, name }

      // Add to the reactive projects array
      this.projects.push(p)

      // Return the project so caller components can use it
      return p
    },
  },
})
