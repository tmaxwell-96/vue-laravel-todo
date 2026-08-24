import { useAuthStore } from '@/stores/auth'
import { getUser } from '../api'

export function useAuth() {
  const authStore = useAuthStore()

  async function initAuth() {
    try {
      const user = await getUser()
      authStore.setUser(user)
    } catch {
      authStore.setUser(null)
    }
  }

  return { initAuth, user: authStore.user }
}
