<script setup lang="ts">
import type { Todo } from '../types'
import { useTodos } from '../composables/useTodos'

const props = defineProps<{ todo: Todo }>()

const { toggleTodo, removeTodo } = useTodos()
</script>

<template>
  <div class="flex items-center gap-3 py-3.5 group">
    <button
      type="button"
      @click="toggleTodo({ id: props.todo.id, is_completed: !props.todo.is_completed })"
      class="flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors"
      :class="
        props.todo.is_completed
          ? 'bg-emerald-500 border-emerald-500'
          : 'border-slate-300 hover:border-emerald-400'
      "
    >
      <svg
        v-if="props.todo.is_completed"
        class="w-3 h-3 text-white"
        viewBox="0 0 12 12"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <polyline points="2,6 5,9 10,3" />
      </svg>
    </button>

    <span
      class="flex-1 text-sm transition-colors"
      :class="
        props.todo.is_completed ? 'line-through text-slate-400' : 'text-slate-700'
      "
    >
      {{ props.todo.title }}
    </span>

    <button
      @click="removeTodo(props.todo.id)"
      class="text-slate-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 text-xs"
    >
      ✕
    </button>
  </div>
</template>
