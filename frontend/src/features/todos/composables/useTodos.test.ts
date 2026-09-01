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
  reorderTodos: vi.fn(),
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

  it('adds the id to togglingIds while in flight and removes it on success', async () => {
    let resolve!: (value: any) => void
    vi.mocked(api.updateTodo).mockImplementation(
      () => new Promise((res) => { resolve = res }),
    )

    const { result } = withQueryClient(() => useTodos())

    result.toggleTodo({ id: 1, is_completed: true })

    expect(result.togglingIds.value.has(1)).toBe(true)

    await flushPromises()
    resolve({ id: 1, title: 'Buy milk', is_completed: true, created_at: '' })
    await flushPromises()

    expect(result.togglingIds.value.has(1)).toBe(false)
  })

  it('removes the id from togglingIds on error', async () => {
    vi.mocked(api.updateTodo).mockRejectedValue(new Error('Network error'))

    const { result } = withQueryClient(() => useTodos())

    result.toggleTodo({ id: 1, is_completed: true })
    await flushPromises()

    expect(result.togglingIds.value.has(1)).toBe(false)
  })

  it('sets toggleError on failure and clears it on the next attempt', async () => {
    vi.mocked(api.updateTodo).mockRejectedValueOnce(new Error('Network error'))
    vi.mocked(api.updateTodo).mockResolvedValueOnce({
      id: 1,
      title: 'Buy milk',
      is_completed: true,
      created_at: '',
    })

    const { result } = withQueryClient(() => useTodos())

    result.toggleTodo({ id: 1, is_completed: true })
    await flushPromises()
    expect(result.toggleError.value).toBe('Failed to update todo. Please try again.')

    result.toggleTodo({ id: 1, is_completed: true })
    expect(result.toggleError.value).toBeNull()
    await flushPromises()
  })

  it('tracks multiple simultaneous toggles independently', async () => {
    let resolveFirst!: (value: any) => void
    let resolveSecond!: (value: any) => void

    vi.mocked(api.updateTodo)
      .mockImplementationOnce(() => new Promise((res) => { resolveFirst = res }))
      .mockImplementationOnce(() => new Promise((res) => { resolveSecond = res }))

    const { result } = withQueryClient(() => useTodos())

    result.toggleTodo({ id: 1, is_completed: true })
    result.toggleTodo({ id: 2, is_completed: false })

    expect(result.togglingIds.value.has(1)).toBe(true)
    expect(result.togglingIds.value.has(2)).toBe(true)

    await flushPromises()
    resolveFirst({ id: 1, title: 'A', is_completed: true, created_at: '' })
    await flushPromises()

    expect(result.togglingIds.value.has(1)).toBe(false)
    expect(result.togglingIds.value.has(2)).toBe(true)

    resolveSecond({ id: 2, title: 'B', is_completed: false, created_at: '' })
    await flushPromises()

    expect(result.togglingIds.value.has(2)).toBe(false)
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

  it('adds the id to removingIds while in flight and removes it on success', async () => {
    let resolve!: (value: any) => void
    vi.mocked(api.deleteTodo).mockImplementation(
      () => new Promise((res) => { resolve = res }),
    )

    const { result } = withQueryClient(() => useTodos())

    result.removeTodo(3)

    expect(result.removingIds.value.has(3)).toBe(true)

    await flushPromises()
    resolve(undefined)
    await flushPromises()

    expect(result.removingIds.value.has(3)).toBe(false)
  })

  it('removes the id from removingIds on error', async () => {
    vi.mocked(api.deleteTodo).mockRejectedValue(new Error('Network error'))

    const { result } = withQueryClient(() => useTodos())

    result.removeTodo(3)
    await flushPromises()

    expect(result.removingIds.value.has(3)).toBe(false)
  })

  it('sets removeError on failure and clears it on the next attempt', async () => {
    vi.mocked(api.deleteTodo).mockRejectedValueOnce(new Error('Network error'))
    vi.mocked(api.deleteTodo).mockResolvedValueOnce(undefined)

    const { result } = withQueryClient(() => useTodos())

    result.removeTodo(3)
    await flushPromises()
    expect(result.removeError.value).toBe('Failed to delete todo. Please try again.')

    result.removeTodo(3)
    expect(result.removeError.value).toBeNull()
    await flushPromises()
  })
})

describe('useTodos — editTodo', () => {
  it('calls updateTodo with id and title', async () => {
    vi.mocked(api.updateTodo).mockResolvedValue({
      id: 1,
      title: 'Updated title',
      is_completed: false,
      created_at: '',
    })

    const { result } = withQueryClient(() => useTodos())

    result.editTodo(1, 'Updated title')
    await flushPromises()

    expect(api.updateTodo).toHaveBeenCalledWith(1, { title: 'Updated title' })
  })

  it('optimistically updates the cache before the request resolves', async () => {
    const existing = [{ id: 1, title: 'Old title', is_completed: false, created_at: '' }]
    vi.mocked(api.fetchTodos).mockResolvedValue(existing)

    let resolve!: (value: any) => void
    vi.mocked(api.updateTodo).mockImplementation(
      () => new Promise((res) => { resolve = res }),
    )

    const { result, queryClient } = withQueryClient(() => useTodos())
    await flushPromises()

    result.editTodo(1, 'Updated title')
    await flushPromises()

    const cached = queryClient.getQueryData<{ title: string }[]>(['todos'])
    expect(cached?.[0].title).toBe('Updated title')

    resolve({ id: 1, title: 'Updated title', is_completed: false, created_at: '' })
    await flushPromises()
  })

  it('rolls back the cache on error', async () => {
    const existing = [{ id: 1, title: 'Old title', is_completed: false, created_at: '' }]
    vi.mocked(api.fetchTodos).mockResolvedValue(existing)
    vi.mocked(api.updateTodo).mockRejectedValue(new Error('Network error'))

    const { result, queryClient } = withQueryClient(() => useTodos())
    await flushPromises()

    result.editTodo(1, 'Updated title')
    await flushPromises()

    const cached = queryClient.getQueryData<{ title: string }[]>(['todos'])
    expect(cached?.[0].title).toBe('Old title')
  })

  it('adds the id to editingIds while in flight and removes it on success', async () => {
    let resolve!: (value: any) => void
    vi.mocked(api.updateTodo).mockImplementation(
      () => new Promise((res) => { resolve = res }),
    )

    const { result } = withQueryClient(() => useTodos())

    result.editTodo(1, 'Updated title')

    expect(result.editingIds.value.has(1)).toBe(true)

    await flushPromises()
    resolve({ id: 1, title: 'Updated title', is_completed: false, created_at: '' })
    await flushPromises()

    expect(result.editingIds.value.has(1)).toBe(false)
  })

  it('removes the id from editingIds on error', async () => {
    vi.mocked(api.updateTodo).mockRejectedValue(new Error('Network error'))

    const { result } = withQueryClient(() => useTodos())

    result.editTodo(1, 'Updated title')
    await flushPromises()

    expect(result.editingIds.value.has(1)).toBe(false)
  })

  it('sets editError on failure and clears it on the next attempt', async () => {
    vi.mocked(api.updateTodo).mockRejectedValueOnce(new Error('Network error'))
    vi.mocked(api.updateTodo).mockResolvedValueOnce({
      id: 1,
      title: 'Updated title',
      is_completed: false,
      created_at: '',
    })

    const { result } = withQueryClient(() => useTodos())

    result.editTodo(1, 'Updated title')
    await flushPromises()
    expect(result.editError.value).toBe('Failed to save todo. Please try again.')

    result.editTodo(1, 'Updated title')
    expect(result.editError.value).toBeNull()
    await flushPromises()
  })

  it('invalidates the todos query on success', async () => {
    vi.mocked(api.updateTodo).mockResolvedValue({
      id: 1,
      title: 'Updated title',
      is_completed: false,
      created_at: '',
    })

    const { result, queryClient } = withQueryClient(() => useTodos())
    const spy = vi.spyOn(queryClient, 'invalidateQueries')

    result.editTodo(1, 'Updated title')
    await flushPromises()

    expect(spy).toHaveBeenCalledWith({ queryKey: ['todos'] })
  })
})

describe('useTodos — reorderTodos', () => {
  it('calls reorderTodos with the correct payload', async () => {
    vi.mocked(api.reorderTodos).mockResolvedValue(undefined)

    const { result } = withQueryClient(() => useTodos())

    result.reorderTodos([{ id: 1, order: 0 }, { id: 2, order: 1 }])
    await flushPromises()

    expect(api.reorderTodos).toHaveBeenCalledWith([{ id: 1, order: 0 }, { id: 2, order: 1 }])
  })

  it('optimistically updates the cache order before the request resolves', async () => {
    const existing = [
      { id: 1, title: 'A', is_completed: false, order: 0, created_at: '' },
      { id: 2, title: 'B', is_completed: false, order: 1, created_at: '' },
    ]
    let resolve!: (value: undefined) => void
    vi.mocked(api.reorderTodos).mockImplementation(
      () => new Promise((res) => { resolve = res }),
    )

    const { result, queryClient } = withQueryClient(() => useTodos())
    queryClient.setQueryData(['todos'], existing)

    result.reorderTodos([{ id: 1, order: 1 }, { id: 2, order: 0 }])
    await flushPromises()

    const cached = queryClient.getQueryData<{ id: number; order: number }[]>(['todos'])
    expect(cached?.[0].id).toBe(2)
    expect(cached?.[1].id).toBe(1)

    resolve(undefined)
    await flushPromises()
  })

  it('rolls back the cache on error', async () => {
    const existing = [
      { id: 1, title: 'A', is_completed: false, order: 0, created_at: '' },
      { id: 2, title: 'B', is_completed: false, order: 1, created_at: '' },
    ]
    vi.mocked(api.reorderTodos).mockRejectedValue(new Error('Network error'))

    const { result, queryClient } = withQueryClient(() => useTodos())
    queryClient.setQueryData(['todos'], existing)

    result.reorderTodos([{ id: 1, order: 1 }, { id: 2, order: 0 }])
    await flushPromises()

    const cached = queryClient.getQueryData<{ id: number; order: number }[]>(['todos'])
    expect(cached?.[0].id).toBe(1)
    expect(cached?.[1].id).toBe(2)
  })

  it('invalidates the todos query on success', async () => {
    vi.mocked(api.reorderTodos).mockResolvedValue(undefined)

    const { result, queryClient } = withQueryClient(() => useTodos())
    const spy = vi.spyOn(queryClient, 'invalidateQueries')

    result.reorderTodos([{ id: 1, order: 0 }])
    await flushPromises()

    expect(spy).toHaveBeenCalledWith({ queryKey: ['todos'] })
  })
})
