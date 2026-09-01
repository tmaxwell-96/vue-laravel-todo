<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import type { Todo } from '../types'
import { useTodos } from '../composables/useTodos'
import SpinnerIcon from '@/components/SpinnerIcon.vue'

const props = defineProps<{ todo: Todo; draggable?: boolean }>()

const { toggleTodo, togglingIds, removeTodo, removingIds, editTodo, editingIds } = useTodos()

const isThisToggling = computed(() => togglingIds.value.has(props.todo.id))
const isThisRemoving = computed(() => removingIds.value.has(props.todo.id))
const isThisEditing = computed(() => editingIds.value.has(props.todo.id))

const isEditMode = ref(false)
const editValue = ref('')
const inputRef = ref<HTMLInputElement | null>(null)

function enterEditMode() {
  if (props.todo.is_completed || isThisToggling.value || isThisRemoving.value) return
  editValue.value = props.todo.title
  isEditMode.value = true
  nextTick(() => inputRef.value?.focus())
}

function commitEdit() {
  const trimmed = editValue.value.trim()
  if (!trimmed || trimmed === props.todo.title) {
    cancelEdit()
    return
  }
  editTodo(props.todo.id, trimmed)
  isEditMode.value = false
}

function cancelEdit() {
  isEditMode.value = false
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') commitEdit()
  if (e.key === 'Escape') cancelEdit()
}
</script>

<template>
  <div class="flex items-center gap-3 py-3.5 group">
    <span
      v-if="props.draggable"
      class="drag-handle flex-shrink-0 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing text-slate-300 transition-opacity"
    >
      <svg class="w-3 h-4" viewBox="0 0 8 14" fill="currentColor">
        <circle cx="2" cy="2" r="1.2" /><circle cx="6" cy="2" r="1.2" />
        <circle cx="2" cy="7" r="1.2" /><circle cx="6" cy="7" r="1.2" />
        <circle cx="2" cy="12" r="1.2" /><circle cx="6" cy="12" r="1.2" />
      </svg>
    </span>

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

    <input
      v-if="isEditMode"
      ref="inputRef"
      v-model="editValue"
      :disabled="isThisEditing"
      @blur="commitEdit"
      @keydown="onKeydown"
      class="flex-1 text-sm text-slate-700 bg-transparent border-b border-emerald-400 outline-none pb-0.5"
    />

    <span
      v-else
      @click="enterEditMode"
      class="flex-1 text-sm transition-colors"
      :class="[
        props.todo.is_completed ? 'line-through text-slate-400' : 'text-slate-700 cursor-text',
        isThisEditing ? 'opacity-50' : '',
      ]"
    >
      {{ props.todo.title }}
      <SpinnerIcon v-if="isThisEditing" class="inline w-3 h-3 text-emerald-400 ml-1" />
    </span>

    <button
      :disabled="isThisRemoving || isThisToggling || isEditMode"
      @click="removeTodo(props.todo.id)"
      class="transition-colors opacity-0 group-hover:opacity-100 w-4 h-4 flex items-center justify-center"
    >
      <SpinnerIcon v-if="isThisRemoving" class="w-3 h-3 text-red-400" />
      <span v-else class="text-slate-300 hover:text-red-400 text-xs">✕</span>
    </button>
  </div>
</template>
