import { describe, it, expect, vi, beforeEach } from 'vitest'
import { defineComponent } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { useTodos } from './useTodos'
import * as api from '../api'

vi.mock('../api', () => ({
  fetchTodos: vi.fn().mockResolvedValue([]),
  createTodo: vi.fn(),
  updateTodo: vi.fn(),
  deleteTodo: vi.fn(),
}))

function withQueryClient(composableFn: () => ReturnType<typeof useTodos>) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  let result!: ReturnType<typeof useTodos>

  mount(
    defineComponent({
      setup() {
        result = composableFn()
        return () => null
      },
    }),
    {
      global: {
        plugins: [[VueQueryPlugin, { queryClient }]],
      },
    },
  )

  return { result, queryClient }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useTodos — addTodo', () => {
  it('calls createTodo with the payload', async () => {
    vi.mocked(api.createTodo).mockResolvedValue({
      id: 1,
      title: 'Buy milk',
      is_completed: false,
      created_at: '',
    })

    const { result } = withQueryClient(() => useTodos())

    result.addTodo({ title: 'Buy milk' })
    await flushPromises()

    expect(api.createTodo).toHaveBeenCalledWith({ title: 'Buy milk' })
  })

  it('invalidates the todos query on success', async () => {
    vi.mocked(api.createTodo).mockResolvedValue({
      id: 1,
      title: 'Buy milk',
      is_completed: false,
      created_at: '',
    })

    const { result, queryClient } = withQueryClient(() => useTodos())
    const spy = vi.spyOn(queryClient, 'invalidateQueries')

    result.addTodo({ title: 'Buy milk' })
    await flushPromises()

    expect(spy).toHaveBeenCalledWith({ queryKey: ['todos'] })
  })
})

describe('useTodos — toggleTodo', () => {
  it('calls updateTodo with id and is_completed', async () => {
    vi.mocked(api.updateTodo).mockResolvedValue({
      id: 1,
      title: 'Buy milk',
      is_completed: true,
      created_at: '',
    })

    const { result } = withQueryClient(() => useTodos())

    result.toggleTodo({ id: 1, is_completed: true })
    await flushPromises()

    expect(api.updateTodo).toHaveBeenCalledWith(1, { is_completed: true })
  })

  it('invalidates the todos query on success', async () => {
    vi.mocked(api.updateTodo).mockResolvedValue({
      id: 1,
      title: 'Buy milk',
      is_completed: true,
      created_at: '',
    })

    const { result, queryClient } = withQueryClient(() => useTodos())
    const spy = vi.spyOn(queryClient, 'invalidateQueries')

    result.toggleTodo({ id: 1, is_completed: true })
    await flushPromises()

    expect(spy).toHaveBeenCalledWith({ queryKey: ['todos'] })
  })
})

describe('useTodos — removeTodo', () => {
  it('calls deleteTodo with the id', async () => {
    vi.mocked(api.deleteTodo).mockResolvedValue(undefined)

    const { result } = withQueryClient(() => useTodos())

    result.removeTodo(3)
    await flushPromises()

    expect(api.deleteTodo).toHaveBeenCalledWith(3)
  })

  it('invalidates the todos query on success', async () => {
    vi.mocked(api.deleteTodo).mockResolvedValue(undefined)

    const { result, queryClient } = withQueryClient(() => useTodos())
    const spy = vi.spyOn(queryClient, 'invalidateQueries')

    result.removeTodo(3)
    await flushPromises()

    expect(spy).toHaveBeenCalledWith({ queryKey: ['todos'] })
  })
})
