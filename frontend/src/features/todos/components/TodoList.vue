<script setup lang="ts">
import { useLogout } from '@/features/auth/composables/useLogout'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const { mutate: logout } = useLogout()
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="max-w-lg mx-auto">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-2xl font-bold text-gray-900">My Todos</h1>
        <div class="flex items-center gap-4">
          <span class="text-sm text-gray-600">{{ authStore.user?.name }}</span>
          <button
            @click="logout()"
            class="text-sm text-gray-500 hover:text-gray-700"
          >
            Log out
          </button>
        </div>
      </div>
      <p class="text-gray-500">Todos coming soon.</p>
    </div>
  </div>
</template>
