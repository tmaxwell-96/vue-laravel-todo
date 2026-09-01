export interface Todo {
  id: number
  title: string
  is_completed: boolean
  created_at: string
}

export interface CreateTodoPayload {
  title: string
}

export interface UpdateTodoPayload {
  title?: string
  is_completed?: boolean
}
