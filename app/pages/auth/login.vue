<template>
  <div class="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
    <div class="w-full max-w-md">
      <div class="card p-8">
        <div class="mb-8 text-center">
          <h1 class="text-2xl font-bold text-text">Welcome back</h1>
          <p class="mt-2 text-sm text-text-muted">Sign in to your account to continue.</p>
        </div>

        <form class="space-y-5" @submit.prevent="handleLogin">
          <div>
            <label for="email" class="mb-1.5 block text-sm font-medium text-text">Email</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              class="input-field"
              :class="{ 'border-red-500 focus:border-red-500 focus:ring-red-500': errors.email }"
              placeholder="you@example.com"
              @input="clearFieldError('email')"
            />
            <p v-if="errors.email" class="mt-1 text-xs text-red-500">{{ errors.email[0] }}</p>
          </div>

          <div>
            <label for="password" class="mb-1.5 block text-sm font-medium text-text"
              >Password</label
            >
            <input
              id="password"
              v-model="form.password"
              type="password"
              class="input-field"
              :class="{ 'border-red-500 focus:border-red-500 focus:ring-red-500': errors.password }"
              placeholder="Enter your password"
              @input="clearFieldError('password')"
            />
            <p v-if="errors.password" class="mt-1 text-xs text-red-500">{{ errors.password[0] }}</p>
          </div>

          <div class="flex items-center justify-between">
            <label class="flex items-center gap-2">
              <input
                type="checkbox"
                class="h-4 w-4 rounded border-border text-primary-600 focus:ring-primary-500"
              />
              <span class="text-sm text-text-muted">Remember me</span>
            </label>
            <NuxtLink
              to="/auth/forgot-password"
              class="text-sm font-medium text-primary-600 hover:text-primary-700"
              >Forgot password?</NuxtLink
            >
          </div>

          <button type="submit" class="btn-primary w-full" :disabled="user.loading">
            <svg
              v-if="user.loading"
              class="mr-2 h-4 w-4 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            {{ user.loading ? 'Signing in...' : 'Sign in' }}
          </button>

          <div v-if="apiError" class="rounded-lg bg-red-50 p-3 text-center text-sm text-red-600">
            {{ apiError }}
          </div>
        </form>

        <p class="mt-8 text-center text-sm text-text-muted">
          Don't have an account?
          <NuxtLink to="/auth/register" class="font-medium text-primary-600 hover:text-primary-700"
            >Create one</NuxtLink
          >
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { loginSchema, type LoginInput } from '~/schemas/auth'
import { useFormValidation } from '~/composables/useFormValidation'
import { useUserStore } from '~/stores/useUserStore'

definePageMeta({
  layout: 'default',
})

const user = useUserStore()
const router = useRouter()

const { errors, validate, clearFieldError } = useFormValidation(loginSchema)

const form = reactive<LoginInput>({
  email: '',
  password: '',
})

const apiError = ref('')

async function handleLogin() {
  apiError.value = ''
  const result = validate(form)
  if (!result.success) return

  try {
    await user.login(form.email, form.password)
    await router.push('/')
  } catch (err: any) {
    apiError.value = err.message
  }
}
</script>
