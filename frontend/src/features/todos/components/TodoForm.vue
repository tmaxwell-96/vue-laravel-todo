<script setup lang="ts">
import { ref } from 'vue'
import { useTodos } from '../composables/useTodos'

const { addTodo, isAdding } = useTodos()
const title = ref('')

function onSubmit() {
  const trimmed = title.value.trim()
  if (!trimmed) return
  addTodo({ title: trimmed }, { onSuccess: () => (title.value = '') })
}
</script>

<template>
  <form @submit.prevent="onSubmit" class="flex gap-2">
    <input
      v-model="title"
      type="text"
      placeholder="Add a new task..."
      :disabled="isAdding"
      class="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent disabled:opacity-50 transition"
    />
    <button
      type="submit"
      :disabled="isAdding || !title.trim()"
      class="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-5 py-2.5 text-sm font-semibold disabled:opacity-40 transition-colors"
    >
      Add
    </button>
  </form>
</template>
