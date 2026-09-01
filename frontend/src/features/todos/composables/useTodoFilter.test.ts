import { ref } from 'vue'
import { describe, it, expect } from 'vitest'
import { useTodoFilter } from './useTodoFilter'
import type { Todo } from '../types'

const makeTodo = (id: number, title: string, is_completed: boolean): Todo => ({
  id,
  title,
  is_completed,
  created_at: '2024-01-01T00:00:00.000000Z',
})

const active = makeTodo(1, 'Buy milk', false)
const completed = makeTodo(2, 'Walk dog', true)
const active2 = makeTodo(3, 'Read book', false)

describe('useTodoFilter', () => {
  it('returns all todos when filter is "all"', () => {
    const todos = ref([active, completed, active2])
    const { filteredTodos } = useTodoFilter(() => todos.value)

    expect(filteredTodos.value).toHaveLength(3)
  })

  it('returns only incomplete todos when filter is "active"', () => {
    const todos = ref([active, completed, active2])
    const { filter, filteredTodos } = useTodoFilter(() => todos.value)

    filter.value = 'active'

    expect(filteredTodos.value).toHaveLength(2)
    expect(filteredTodos.value.every((t) => !t.is_completed)).toBe(true)
  })

  it('returns only completed todos when filter is "completed"', () => {
    const todos = ref([active, completed, active2])
    const { filter, filteredTodos } = useTodoFilter(() => todos.value)

    filter.value = 'completed'

    expect(filteredTodos.value).toHaveLength(1)
    expect(filteredTodos.value[0]!.id).toBe(2)
  })

  it('returns an empty array when todos is undefined', () => {
    const { filteredTodos } = useTodoFilter(() => undefined)

    expect(filteredTodos.value).toEqual([])
  })

  it('reacts when the todos list changes', () => {
    const todos = ref<Todo[]>([active])
    const { filteredTodos } = useTodoFilter(() => todos.value)

    expect(filteredTodos.value).toHaveLength(1)

    todos.value = [active, completed]

    expect(filteredTodos.value).toHaveLength(2)
  })

  it('reacts when the filter changes', () => {
    const todos = ref([active, completed])
    const { filter, filteredTodos } = useTodoFilter(() => todos.value)

    expect(filteredTodos.value).toHaveLength(2)

    filter.value = 'active'
    expect(filteredTodos.value).toHaveLength(1)

    filter.value = 'completed'
    expect(filteredTodos.value).toHaveLength(1)

    filter.value = 'all'
    expect(filteredTodos.value).toHaveLength(2)
  })
})
