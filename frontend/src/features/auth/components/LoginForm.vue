<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import { useLogin } from '../composables/useLogin'

const schema = toTypedSchema(
  z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(1, 'Password is required'),
  }),
)

const { defineField, handleSubmit, errors } = useForm({ validationSchema: schema })

const [email, emailAttrs] = defineField('email')
const [password, passwordAttrs] = defineField('password')

const { mutate: login, isPending, error } = useLogin()

const onSubmit = handleSubmit((values) => login(values))
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="w-full max-w-md bg-white rounded-lg shadow p-8">
      <h1 class="text-2xl font-bold text-gray-900 mb-6">Log in</h1>

      <form @submit="onSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            v-model="email"
            v-bind="emailAttrs"
            type="email"
            class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p v-if="errors.email" class="text-red-500 text-xs mt-1">{{ errors.email }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            v-model="password"
            v-bind="passwordAttrs"
            type="password"
            class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p v-if="errors.password" class="text-red-500 text-xs mt-1">{{ errors.password }}</p>
        </div>

        <p v-if="error" class="text-red-500 text-sm">Invalid email or password.</p>

        <button
          type="submit"
          :disabled="isPending"
          class="w-full bg-blue-600 text-white rounded px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {{ isPending ? 'Logging in...' : 'Log in' }}
        </button>
      </form>

      <p class="text-sm text-gray-600 mt-4">
        Don't have an account?
        <RouterLink to="/register" class="text-blue-600 hover:underline">Register</RouterLink>
      </p>
    </div>
  </div>
</template>
