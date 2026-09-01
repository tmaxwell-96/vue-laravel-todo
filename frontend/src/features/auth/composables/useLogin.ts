import { useMutation } from '@tanstack/vue-query'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { login } from '../api'
import type { LoginCredentials } from '../types'

export function useLogin() {
  const authStore = useAuthStore()
  const router = useRouter()

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => login(credentials),
    onSuccess(user) {
      authStore.setUser(user)
      router.push('/')
    },
  })
}
