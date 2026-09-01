<script setup lang="ts">
import { computed } from 'vue'
import type { Todo } from '../types'
import { useTodos } from '../composables/useTodos'
import SpinnerIcon from '@/components/SpinnerIcon.vue'

const props = defineProps<{ todo: Todo }>()

const { toggleTodo, togglingIds, removeTodo, removingIds } = useTodos()

const isThisToggling = computed(() => togglingIds.value.has(props.todo.id))
const isThisRemoving = computed(() => removingIds.value.has(props.todo.id))
</script>

<template>
  <div class="flex items-center gap-3 py-3.5 group">
    <button
      type="button"
      :disabled="isThisToggling || isThisRemoving"
      @click="toggleTodo({ id: props.todo.id, is_completed: !props.todo.is_completed })"
      class="flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors"
      :class="
        isThisToggling
          ? 'bg-emerald-100 border-emerald-300'
          : props.todo.is_completed
            ? 'bg-emerald-500 border-emerald-500'
            : 'border-slate-300 hover:border-emerald-400'
      "
    >
      <SpinnerIcon v-if="isThisToggling" class="w-3 h-3 text-emerald-500" />
      <svg
        v-else-if="props.todo.is_completed"
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
      :class="props.todo.is_completed ? 'line-through text-slate-400' : 'text-slate-700'"
    >
      {{ props.todo.title }}
    </span>

    <button
      :disabled="isThisRemoving || isThisToggling"
      @click="removeTodo(props.todo.id)"
      class="transition-colors opacity-0 group-hover:opacity-100 w-4 h-4 flex items-center justify-center"
    >
      <SpinnerIcon v-if="isThisRemoving" class="w-3 h-3 text-red-400" />
      <span v-else class="text-slate-300 hover:text-red-400 text-xs">✕</span>
    </button>
  </div>
</template>
