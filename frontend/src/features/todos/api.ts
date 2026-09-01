import apiClient from '@/lib/apiClient'
import type { CreateTodoPayload, Todo, UpdateTodoPayload } from './types'

export async function fetchTodos(): Promise<Todo[]> {
  const response = await apiClient.get<Todo[]>('/api/todos')
  return response.data
}

export async function createTodo(payload: CreateTodoPayload): Promise<Todo> {
  const response = await apiClient.post<Todo>('/api/todos', payload)
  return response.data
}

export async function updateTodo(id: number, payload: UpdateTodoPayload): Promise<Todo> {
  const response = await apiClient.patch<Todo>(`/api/todos/${id}`, payload)
  return response.data
}

export async function deleteTodo(id: number): Promise<void> {
  await apiClient.delete(`/api/todos/${id}`)
}
