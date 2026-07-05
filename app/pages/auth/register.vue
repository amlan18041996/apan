<template>
  <div class="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
    <div class="w-full max-w-md">
      <div class="card p-8">
        <div class="mb-8 text-center">
          <h1 class="text-2xl font-bold text-text">Create an account</h1>
          <p class="mt-2 text-sm text-text-muted">Join us and start shopping today.</p>
        </div>

        <form @submit.prevent="handleRegister" class="space-y-5">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="firstName" class="mb-1.5 block text-sm font-medium text-text">First name</label>
              <input id="firstName" v-model="form.firstName" type="text" class="input-field" :class="{ 'border-red-500 focus:border-red-500 focus:ring-red-500': errors.firstName }" placeholder="John" @input="clearFieldError('firstName')" />
              <p v-if="errors.firstName" class="mt-1 text-xs text-red-500">{{ errors.firstName[0] }}</p>
            </div>
            <div>
              <label for="lastName" class="mb-1.5 block text-sm font-medium text-text">Last name</label>
              <input id="lastName" v-model="form.lastName" type="text" class="input-field" :class="{ 'border-red-500 focus:border-red-500 focus:ring-red-500': errors.lastName }" placeholder="Doe" @input="clearFieldError('lastName')" />
              <p v-if="errors.lastName" class="mt-1 text-xs text-red-500">{{ errors.lastName[0] }}</p>
            </div>
          </div>

          <div>
            <label for="email" class="mb-1.5 block text-sm font-medium text-text">Email</label>
            <input id="email" v-model="form.email" type="email" class="input-field" :class="{ 'border-red-500 focus:border-red-500 focus:ring-red-500': errors.email }" placeholder="you@example.com" @input="clearFieldError('email')" />
            <p v-if="errors.email" class="mt-1 text-xs text-red-500">{{ errors.email[0] }}</p>
          </div>

          <div>
            <label for="password" class="mb-1.5 block text-sm font-medium text-text">Password</label>
            <input id="password" v-model="form.password" type="password" class="input-field" :class="{ 'border-red-500 focus:border-red-500 focus:ring-red-500': errors.password }" placeholder="Create a password" @input="clearFieldError('password')" />
            <p v-if="errors.password" class="mt-1 text-xs text-red-500">{{ errors.password[0] }}</p>
          </div>

          <div>
            <label for="confirmPassword" class="mb-1.5 block text-sm font-medium text-text">Confirm password</label>
            <input id="confirmPassword" v-model="form.confirmPassword" type="password" class="input-field" :class="{ 'border-red-500 focus:border-red-500 focus:ring-red-500': errors.confirmPassword }" placeholder="Repeat your password" @input="clearFieldError('confirmPassword')" />
            <p v-if="errors.confirmPassword" class="mt-1 text-xs text-red-500">{{ errors.confirmPassword[0] }}</p>
          </div>

          <button type="submit" class="btn-primary w-full" :disabled="user.loading">
            <svg v-if="user.loading" class="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" /><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
            {{ user.loading ? 'Creating account...' : 'Create account' }}
          </button>

          <div v-if="apiError" class="rounded-lg bg-red-50 p-3 text-center text-sm text-red-600">{{ apiError }}</div>
        </form>

        <p class="mt-8 text-center text-sm text-text-muted">
          Already have an account?
          <NuxtLink to="/auth/login" class="font-medium text-primary-600 hover:text-primary-700">Sign in</NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { registerSchema, type RegisterInput } from '~/schemas/auth'
import { useFormValidation } from '~/composables/useFormValidation'
import { useUserStore } from '~/stores/useUserStore'

definePageMeta({
  layout: 'default'
})

const user = useUserStore()
const router = useRouter()

const { errors, validate, clearFieldError } = useFormValidation(registerSchema)

const form = reactive<RegisterInput>({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const apiError = ref('')

async function handleRegister() {
  apiError.value = ''
  const result = validate(form)
  if (!result.success) return

  try {
    await user.register({
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      password: form.password
    })
    await router.push('/')
  } catch (err: any) {
    apiError.value = err.message
  }
}
</script>