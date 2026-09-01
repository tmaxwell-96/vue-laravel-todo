import { useMutation } from '@tanstack/vue-query'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { register } from '../api'
import type { RegisterCredentials } from '../types'

export function useRegister() {
  const authStore = useAuthStore()
  const router = useRouter()

  return useMutation({
    mutationFn: (credentials: RegisterCredentials) => register(credentials),
    onSuccess(user) {
      authStore.setUser(user)
      router.push('/')
    },
  })
}
