import { ref } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { createTodo, deleteTodo, fetchTodos, reorderTodos, updateTodo } from '../api'
import type { CreateTodoPayload, Todo } from '../types'

const TODOS_KEY = ['todos']

const togglingIds = ref<Set<number>>(new Set())
const removingIds = ref<Set<number>>(new Set())
const editingIds = ref<Set<number>>(new Set())
const toggleError = ref<string | null>(null)
const removeError = ref<string | null>(null)
const editError = ref<string | null>(null)

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

  const { mutate: _editTodo } = useMutation({
    mutationFn: ({ id, title }: { id: number; title: string }) => updateTodo(id, { title }),
    async onMutate({ id, title }) {
      await queryClient.cancelQueries({ queryKey: TODOS_KEY })
      const previous = queryClient.getQueryData<Todo[]>(TODOS_KEY)
      queryClient.setQueryData<Todo[]>(TODOS_KEY, (old) =>
        old?.map((t) => (t.id === id ? { ...t, title } : t)) ?? [],
      )
      return { previous }
    },
    async onSuccess(_data, { id }) {
      editError.value = null
      await queryClient.invalidateQueries({ queryKey: TODOS_KEY })
      const next = new Set(editingIds.value)
      next.delete(id)
      editingIds.value = next
    },
    onError(_err, { id }, context) {
      editError.value = 'Failed to save todo. Please try again.'
      if (context?.previous) {
        queryClient.setQueryData(TODOS_KEY, context.previous)
      }
      const next = new Set(editingIds.value)
      next.delete(id)
      editingIds.value = next
    },
  })

  function editTodo(id: number, title: string) {
    editError.value = null
    editingIds.value = new Set(editingIds.value).add(id)
    _editTodo({ id, title })
  }

  const { mutate: _reorderTodos } = useMutation({
    mutationFn: (items: { id: number; order: number }[]) => reorderTodos(items),
    async onMutate(items) {
      await queryClient.cancelQueries({ queryKey: TODOS_KEY })
      const previous = queryClient.getQueryData<Todo[]>(TODOS_KEY)
      const orderMap = new Map(items.map((item) => [item.id, item.order]))
      queryClient.setQueryData<Todo[]>(TODOS_KEY, (old) =>
        old
          ?.map((t) => (orderMap.has(t.id) ? { ...t, order: orderMap.get(t.id)! } : t))
          .sort((a, b) => a.order - b.order) ?? [],
      )
      return { previous }
    },
    async onSuccess() {
      await queryClient.invalidateQueries({ queryKey: TODOS_KEY })
    },
    onError(_err, _items, context) {
      if (context?.previous) {
        queryClient.setQueryData(TODOS_KEY, context.previous)
      }
    },
  })

  function reorderTodosFn(items: { id: number; order: number }[]) {
    _reorderTodos(items)
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
    editTodo,
    editingIds,
    editError,
    reorderTodos: reorderTodosFn,
  }
}
