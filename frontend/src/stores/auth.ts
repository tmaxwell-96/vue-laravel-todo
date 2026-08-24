import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { User } from '@/features/auth/types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)

  function setUser(newUser: User | null) {
    user.value = newUser
  }

  return { user, setUser }
})
