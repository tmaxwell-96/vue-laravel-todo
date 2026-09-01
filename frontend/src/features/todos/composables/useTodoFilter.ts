import { computed, ref } from 'vue'
import type { Todo } from '../types'

export type FilterStatus = 'all' | 'active' | 'completed'

export function useTodoFilter(todos: () => Todo[] | undefined) {
  const filter = ref<FilterStatus>('all')

  const filteredTodos = computed(() => {
    const list = todos() ?? []
    if (filter.value === 'active') return list.filter((t) => !t.is_completed)
    if (filter.value === 'completed') return list.filter((t) => t.is_completed)
    return list
  })

  return { filter, filteredTodos }
}
