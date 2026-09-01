<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useLogout } from '@/features/auth/composables/useLogout'
import { useTodos } from '../composables/useTodos'
import { useTodoFilter } from '../composables/useTodoFilter'
import TodoForm from './TodoForm.vue'
import TodoItem from './TodoItem.vue'
import TodoFilter from './TodoFilter.vue'

const authStore = useAuthStore()
const { mutate: logout } = useLogout()
const { todos, isPending, addError, toggleError, removeError } = useTodos()
const { filter, filteredTodos } = useTodoFilter(() => todos.value)
</script>

<template>
  <div class="min-h-screen bg-sage-100 p-8">
    <div class="max-w-md mx-auto">
      <div class="mb-6">
        <p class="text-emerald-700 text-xs font-semibold uppercase tracking-widest mb-1">
          My Tasks
        </p>
        <div class="flex items-end justify-between">
          <h1 class="text-3xl font-bold text-slate-800">
            {{ authStore.user?.name?.split(' ')[0] }}'s Todos
          </h1>
          <button
            @click="logout()"
            class="text-sm text-slate-500 hover:text-slate-700 mb-1 transition-colors"
          >
            Log out
          </button>
        </div>
      </div>

      <div class="bg-white rounded-3xl shadow-sm p-6 space-y-5">
        <TodoForm />

        <p v-if="addError" class="text-red-400 text-xs text-center">
          Failed to add todo. Please try again.
        </p>
        <p v-if="toggleError" class="text-red-400 text-xs text-center">
          {{ toggleError }}
        </p>
        <p v-if="removeError" class="text-red-400 text-xs text-center">
          {{ removeError }}
        </p>

        <div v-if="isPending" class="text-sm text-slate-400 text-center py-6">Loading...</div>

        <template v-else>
          <TodoFilter v-model="filter" />

          <div v-if="filteredTodos.length === 0" class="text-sm text-slate-400 text-center py-6">
            Nothing here yet.
          </div>

          <div v-else class="divide-y divide-slate-100">
            <TodoItem v-for="todo in filteredTodos" :key="todo.id" :todo="todo" />
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
