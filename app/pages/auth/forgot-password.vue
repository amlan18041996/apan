<template>
  <div class="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
    <div class="w-full max-w-md">
      <div class="card p-8">
        <div class="mb-8 text-center">
          <h1 class="text-2xl font-bold text-text">Reset your password</h1>
          <p class="mt-2 text-sm text-text-muted">Enter your email and we'll send you a reset link.</p>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-5">
          <div>
            <label for="email" class="mb-1.5 block text-sm font-medium text-text">Email</label>
            <input id="email" v-model="email" type="email" class="input-field" :class="{ 'border-red-500 focus:border-red-500 focus:ring-red-500': errors.email }" placeholder="you@example.com" @input="clearFieldError('email')" />
            <p v-if="errors.email" class="mt-1 text-xs text-red-500">{{ errors.email[0] }}</p>
          </div>

          <button type="submit" class="btn-primary w-full">Send reset link</button>

          <div v-if="submitted" class="rounded-lg bg-green-50 p-3 text-center text-sm text-green-700">If an account with that email exists, we've sent a reset link.</div>
          <div v-if="apiError" class="rounded-lg bg-red-50 p-3 text-center text-sm text-red-600">{{ apiError }}</div>
        </form>

        <p class="mt-8 text-center text-sm text-text-muted">
          Remember your password?
          <NuxtLink to="/auth/login" class="font-medium text-primary-600 hover:text-primary-700">Sign in</NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { forgotPasswordSchema } from '~/schemas/auth'
import { useFormValidation } from '~/composables/useFormValidation'

definePageMeta({
  layout: 'default'
})

const { errors, validate, clearFieldError } = useFormValidation(forgotPasswordSchema)

const email = ref('')
const apiError = ref('')
const submitted = ref(false)

async function handleSubmit() {
  apiError.value = ''
  submitted.value = false
  const result = validate({ email: email.value })
  if (!result.success) return

  try {
    await $fetch('/api/auth/forgot-password', {
      method: 'POST',
      body: { email: email.value }
    })
    submitted.value = true
  } catch (err: any) {
    apiError.value = err.data?.statusMessage || err.message || 'Something went wrong'
  }
}
</script>