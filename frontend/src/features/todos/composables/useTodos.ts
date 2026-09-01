import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { createTodo, deleteTodo, fetchTodos, updateTodo } from '../api'
import type { CreateTodoPayload } from '../types'

const TODOS_KEY = ['todos']

export function useTodos() {
  const queryClient = useQueryClient()

  const { data: todos, isPending } = useQuery({
    queryKey: TODOS_KEY,
    queryFn: fetchTodos,
  })

  const { mutate: addTodo, isPending: isAdding } = useMutation({
    mutationFn: (payload: CreateTodoPayload) => createTodo(payload),
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: TODOS_KEY })
    },
  })

  const { mutate: toggleTodo } = useMutation({
    mutationFn: ({ id, is_completed }: { id: number; is_completed: boolean }) =>
      updateTodo(id, { is_completed }),
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: TODOS_KEY })
    },
  })

  const { mutate: removeTodo } = useMutation({
    mutationFn: (id: number) => deleteTodo(id),
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: TODOS_KEY })
    },
  })

  return { todos, isPending, isAdding, addTodo, toggleTodo, removeTodo }
}
