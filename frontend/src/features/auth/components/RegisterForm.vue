<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import { useRegister } from '../composables/useRegister'

const schema = toTypedSchema(
  z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    password_confirmation: z.string(),
  }).refine((data) => data.password === data.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  }),
)

const { defineField, handleSubmit, errors } = useForm({ validationSchema: schema })

const [name, nameAttrs] = defineField('name')
const [email, emailAttrs] = defineField('email')
const [password, passwordAttrs] = defineField('password')
const [passwordConfirmation, passwordConfirmationAttrs] = defineField('password_confirmation')

const { mutate: register, isPending, error } = useRegister()

const onSubmit = handleSubmit((values) => register(values))
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-sage-100">
    <div class="w-full max-w-md bg-white rounded-3xl shadow-sm p-8">
      <p class="text-emerald-700 text-xs font-semibold uppercase tracking-widest mb-2">Get started</p>
      <h1 class="text-2xl font-bold text-slate-800 mb-6">Create account</h1>

      <form @submit="onSubmit" class="space-y-4">
        <div>
          <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Name</label>
          <input
            v-model="name"
            v-bind="nameAttrs"
            type="text"
            class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition"
          />
          <p v-if="errors.name" class="text-red-400 text-xs mt-1">{{ errors.name }}</p>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Email</label>
          <input
            v-model="email"
            v-bind="emailAttrs"
            type="email"
            class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition"
          />
          <p v-if="errors.email" class="text-red-400 text-xs mt-1">{{ errors.email }}</p>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Password</label>
          <input
            v-model="password"
            v-bind="passwordAttrs"
            type="password"
            class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition"
          />
          <p v-if="errors.password" class="text-red-400 text-xs mt-1">{{ errors.password }}</p>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Confirm password</label>
          <input
            v-model="passwordConfirmation"
            v-bind="passwordConfirmationAttrs"
            type="password"
            class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition"
          />
          <p v-if="errors.password_confirmation" class="text-red-400 text-xs mt-1">{{ errors.password_confirmation }}</p>
        </div>

        <p v-if="error" class="text-red-400 text-sm">Something went wrong. Please try again.</p>

        <button
          type="submit"
          :disabled="isPending"
          class="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-40 transition-colors"
        >
          {{ isPending ? 'Creating account...' : 'Create account' }}
        </button>
      </form>

      <p class="text-sm text-slate-500 mt-5">
        Already have an account?
        <RouterLink to="/login" class="text-emerald-600 hover:underline font-medium">Log in</RouterLink>
      </p>
    </div>
  </div>
</template>
