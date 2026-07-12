<script setup lang="ts">
import { informationSchema } from '~/schemas/checkout'

interface Props {
  subtotal: number
}

defineProps<Props>()

const emit = defineEmits<{
  submit: []
  back: []
}>()

const { state, setEmail } = useCheckout()

const email = ref(state.value.email || '')
const emailTouched = ref(false)
const emailError = ref('')

function validateEmail() {
  emailTouched.value = true
  const result = informationSchema.safeParse({ email: email.value })
  if (!result.success) {
    emailError.value = result.error.errors[0]?.message || 'Please enter a valid email'
  } else {
    emailError.value = ''
  }
}

function handleSubmit() {
  validateEmail()
  if (emailError.value) return
  setEmail(email.value)
  emit('submit')
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-lg font-semibold text-gray-900">Contact Information</h2>
      <p class="mt-1 text-sm text-gray-500">Enter your email to continue checkout.</p>
    </div>

    <div>
      <label for="email" class="block text-sm font-medium text-gray-700">
        Email Address <span class="text-red-500">*</span>
      </label>
      <input
        id="email"
        v-model="email"
        type="email"
        autocomplete="email"
        placeholder="you@example.com"
        class="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': emailError }"
        @blur="validateEmail"
        @keyup.enter="handleSubmit"
      />
      <p v-if="emailError" class="mt-1 text-xs text-red-500">{{ emailError }}</p>
    </div>

    <div class="flex items-center justify-between border-t border-gray-200 pt-4">
      <NuxtLink
        to="/cart"
        class="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
      >
        <svg
          class="mr-2 h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="2"
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
        </svg>
        Back to Cart
      </NuxtLink>
      <button
        type="button"
        class="inline-flex items-center justify-center rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        @click="handleSubmit"
      >
        Continue to Shipping
        <svg
          class="ml-2 h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="2"
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>
      </button>
    </div>
  </div>
</template>
