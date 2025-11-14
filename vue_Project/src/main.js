// ---- CSS & JS frameworks (load first) ----
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js' // bundle = Bootstrap JS + Popper
import 'bootstrap-icons/font/bootstrap-icons.css'  // optional, for <i class="bi ...">

// ---- Vue app bootstrapping ----
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

// global plugins
app.use(createPinia())
app.use(router)

// mount
app.mount('#app')
