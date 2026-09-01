import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { VueQueryPlugin } from '@tanstack/vue-query'

import './assets/main.css'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'
import { getUser } from './features/auth/api'

const app = createApp(App)

app.use(createPinia())
app.use(VueQueryPlugin)

const authStore = useAuthStore()
try {
  const user = await getUser()
  authStore.setUser(user)
} catch {
  authStore.setUser(null)
}

app.use(router)
app.mount('#app')
