import { useMutation } from '@tanstack/vue-query'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { logout } from '../api'

export function useLogout() {
  const authStore = useAuthStore()
  const router = useRouter()

  return useMutation({
    mutationFn: logout,
    onSuccess() {
      authStore.setUser(null)
      router.push('/login')
    },
  })
}
