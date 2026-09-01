<script setup lang="ts">
import type { FilterStatus } from '../composables/useTodoFilter'

const props = defineProps<{ modelValue: FilterStatus }>()
const emit = defineEmits<{ 'update:modelValue': [value: FilterStatus] }>()

const filters: { label: string; value: FilterStatus }[] = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' },
]
</script>

<template>
  <div class="flex gap-1 bg-slate-100 rounded-xl p-1">
    <button
      v-for="f in filters"
      :key="f.value"
      @click="emit('update:modelValue', f.value)"
      class="flex-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors"
      :class="
        props.modelValue === f.value
          ? 'bg-white text-emerald-700 shadow-sm'
          : 'text-slate-500 hover:text-slate-700'
      "
    >
      {{ f.label }}
    </button>
  </div>
</template>
