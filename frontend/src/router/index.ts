import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/features/auth/components/LoginForm.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/features/auth/components/RegisterForm.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/',
      name: 'home',
      component: () => import('@/features/todos/components/TodoList.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach((to) => {
  const authStore = useAuthStore()
  const isLoggedIn = authStore.user !== null

  if (to.meta.requiresAuth && !isLoggedIn) {
    return { name: 'login' }
  }

  if (to.meta.requiresGuest && isLoggedIn) {
    return { name: 'home' }
  }
})

export default router
