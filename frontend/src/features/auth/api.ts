import apiClient from '@/lib/apiClient'
import type { LoginCredentials, RegisterCredentials, User } from './types'

export async function fetchCsrfCookie(): Promise<void> {
  await apiClient.get('/sanctum/csrf-cookie')
}

export async function register(credentials: RegisterCredentials): Promise<User> {
  await fetchCsrfCookie()
  const response = await apiClient.post<User>('/api/register', credentials)
  return response.data
}

export async function login(credentials: LoginCredentials): Promise<User> {
  await fetchCsrfCookie()
  const response = await apiClient.post<User>('/api/login', credentials)
  return response.data
}

export async function logout(): Promise<void> {
  await apiClient.post('/api/logout')
}

export async function getUser(): Promise<User> {
  const response = await apiClient.get<User>('/api/user')
  return response.data
}
