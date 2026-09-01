import { describe, it, expect, vi, beforeEach } from 'vitest'
import { defineComponent } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useLogin } from './useLogin'
import { useRegister } from './useRegister'
import { useLogout } from './useLogout'
import * as api from '../api'

vi.mock('../api', () => ({
  fetchCsrfCookie: vi.fn().mockResolvedValue(undefined),
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  getUser: vi.fn(),
}))

const mockUser = { id: 1, name: 'Taylor', email: 'taylor@example.com' }

function makeRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div />' } },
      { path: '/login', component: { template: '<div />' } },
      { path: '/register', component: { template: '<div />' } },
    ],
  })
}

function withAuthSetup<T>(composableFn: () => T) {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  })
  const pinia = createPinia()
  const router = makeRouter()

  let result!: T

  mount(
    defineComponent({
      setup() {
        result = composableFn()
        return () => null
      },
    }),
    {
      global: {
        plugins: [[VueQueryPlugin, { queryClient }], pinia, router],
      },
    },
  )

  return { result, pinia, router }
}

beforeEach(() => {
  vi.clearAllMocks()
  setActivePinia(createPinia())
})

describe('useLogin', () => {
  it('calls the login API with credentials', async () => {
    vi.mocked(api.login).mockResolvedValue(mockUser)

    const { result } = withAuthSetup(() => useLogin())
    result.mutate({ email: 'taylor@example.com', password: 'password' })
    await flushPromises()

    expect(api.login).toHaveBeenCalledWith({ email: 'taylor@example.com', password: 'password' })
  })

  it('sets the user in the auth store on success', async () => {
    vi.mocked(api.login).mockResolvedValue(mockUser)

    const { result, pinia } = withAuthSetup(() => useLogin())
    const authStore = useAuthStore(pinia)

    result.mutate({ email: 'taylor@example.com', password: 'password' })
    await flushPromises()

    expect(authStore.user).toEqual(mockUser)
  })

  it('redirects to / on success', async () => {
    vi.mocked(api.login).mockResolvedValue(mockUser)

    const { result, router } = withAuthSetup(() => useLogin())
    await router.push('/login')

    result.mutate({ email: 'taylor@example.com', password: 'password' })
    await flushPromises()

    expect(router.currentRoute.value.path).toBe('/')
  })

  it('does not set user on failure', async () => {
    vi.mocked(api.login).mockRejectedValue(new Error('Unauthorized'))

    const { result, pinia } = withAuthSetup(() => useLogin())
    const authStore = useAuthStore(pinia)

    result.mutate({ email: 'wrong@example.com', password: 'bad' })
    await flushPromises()

    expect(authStore.user).toBeNull()
  })
})

describe('useRegister', () => {
  it('calls the register API with credentials', async () => {
    vi.mocked(api.register).mockResolvedValue(mockUser)

    const { result } = withAuthSetup(() => useRegister())
    result.mutate({
      name: 'Taylor',
      email: 'taylor@example.com',
      password: 'password',
      password_confirmation: 'password',
    })
    await flushPromises()

    expect(api.register).toHaveBeenCalledWith({
      name: 'Taylor',
      email: 'taylor@example.com',
      password: 'password',
      password_confirmation: 'password',
    })
  })

  it('sets the user in the auth store on success', async () => {
    vi.mocked(api.register).mockResolvedValue(mockUser)

    const { result, pinia } = withAuthSetup(() => useRegister())
    const authStore = useAuthStore(pinia)

    result.mutate({
      name: 'Taylor',
      email: 'taylor@example.com',
      password: 'password',
      password_confirmation: 'password',
    })
    await flushPromises()

    expect(authStore.user).toEqual(mockUser)
  })

  it('redirects to / on success', async () => {
    vi.mocked(api.register).mockResolvedValue(mockUser)

    const { result, router } = withAuthSetup(() => useRegister())
    await router.push('/register')

    result.mutate({
      name: 'Taylor',
      email: 'taylor@example.com',
      password: 'password',
      password_confirmation: 'password',
    })
    await flushPromises()

    expect(router.currentRoute.value.path).toBe('/')
  })
})

describe('useLogout', () => {
  it('calls the logout API', async () => {
    vi.mocked(api.logout).mockResolvedValue(undefined)

    const { result } = withAuthSetup(() => useLogout())
    result.mutate()
    await flushPromises()

    expect(api.logout).toHaveBeenCalled()
  })

  it('clears the user from the auth store on success', async () => {
    vi.mocked(api.logout).mockResolvedValue(undefined)

    const { result, pinia } = withAuthSetup(() => useLogout())
    const authStore = useAuthStore(pinia)
    authStore.setUser(mockUser)

    result.mutate()
    await flushPromises()

    expect(authStore.user).toBeNull()
  })

  it('redirects to /login on success', async () => {
    vi.mocked(api.logout).mockResolvedValue(undefined)

    const { result, router } = withAuthSetup(() => useLogout())
    await router.push('/')

    result.mutate()
    await flushPromises()

    expect(router.currentRoute.value.path).toBe('/login')
  })
})
