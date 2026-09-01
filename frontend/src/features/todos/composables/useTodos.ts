import { ref } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { createTodo, deleteTodo, fetchTodos, updateTodo } from '../api'
import type { CreateTodoPayload } from '../types'

const TODOS_KEY = ['todos']

const togglingIds = ref<Set<number>>(new Set())
const removingIds = ref<Set<number>>(new Set())
const toggleError = ref<string | null>(null)
const removeError = ref<string | null>(null)

export function useTodos() {
  const queryClient = useQueryClient()

  const { data: todos, isPending } = useQuery({
    queryKey: TODOS_KEY,
    queryFn: fetchTodos,
  })

  const {
    mutate: addTodo,
    isPending: isAdding,
    error: addError,
  } = useMutation({
    mutationFn: (payload: CreateTodoPayload) => createTodo(payload),
    async onSuccess() {
      await queryClient.invalidateQueries({ queryKey: TODOS_KEY })
    },
  })

  const { mutate: _toggleTodo } = useMutation({
    mutationFn: ({ id, is_completed }: { id: number; is_completed: boolean }) =>
      updateTodo(id, { is_completed }),
    async onSuccess(_data, { id }) {
      toggleError.value = null
      await queryClient.invalidateQueries({ queryKey: TODOS_KEY })
      const next = new Set(togglingIds.value)
      next.delete(id)
      togglingIds.value = next
    },
    onError(_err, { id }) {
      toggleError.value = 'Failed to update todo. Please try again.'
      const next = new Set(togglingIds.value)
      next.delete(id)
      togglingIds.value = next
    },
  })

  function toggleTodo(variables: { id: number; is_completed: boolean }) {
    toggleError.value = null
    togglingIds.value = new Set(togglingIds.value).add(variables.id)
    _toggleTodo(variables)
  }

  const { mutate: _removeTodo } = useMutation({
    mutationFn: (id: number) => deleteTodo(id),
    async onSuccess(_data, id) {
      removeError.value = null
      await queryClient.invalidateQueries({ queryKey: TODOS_KEY })
      const next = new Set(removingIds.value)
      next.delete(id)
      removingIds.value = next
    },
    onError(_err, id) {
      removeError.value = 'Failed to delete todo. Please try again.'
      const next = new Set(removingIds.value)
      next.delete(id)
      removingIds.value = next
    },
  })

  function removeTodo(id: number) {
    removeError.value = null
    removingIds.value = new Set(removingIds.value).add(id)
    _removeTodo(id)
  }

  return {
    todos,
    isPending,
    isAdding,
    addError,
    addTodo,
    toggleTodo,
    togglingIds,
    toggleError,
    removeTodo,
    removingIds,
    removeError,
  }
}
