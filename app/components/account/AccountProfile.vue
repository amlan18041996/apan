<template>
  <div>
    <h2 class="text-lg font-semibold mb-4">Profile Information</h2>

    <form class="space-y-4 max-w-md" @submit.prevent="handleSubmit">
      <div>
        <label for="firstName" class="block text-sm font-medium mb-1">First Name</label>
        <input
          id="firstName"
          v-model="form.firstName"
          type="text"
          class="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          :class="{ 'border-red-500': errors.firstName }"
        />
        <p v-if="errors.firstName" class="text-xs text-red-500 mt-1">{{ errors.firstName }}</p>
      </div>

      <div>
        <label for="lastName" class="block text-sm font-medium mb-1">Last Name</label>
        <input
          id="lastName"
          v-model="form.lastName"
          type="text"
          class="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          :class="{ 'border-red-500': errors.lastName }"
        />
        <p v-if="errors.lastName" class="text-xs text-red-500 mt-1">{{ errors.lastName }}</p>
      </div>

      <div>
        <label for="email" class="block text-sm font-medium mb-1">Email</label>
        <input
          id="email"
          v-model="form.email"
          type="email"
          class="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          :class="{ 'border-red-500': errors.email }"
        />
        <p v-if="errors.email" class="text-xs text-red-500 mt-1">{{ errors.email }}</p>
      </div>

      <div>
        <label for="phone" class="block text-sm font-medium mb-1">Phone (optional)</label>
        <input
          id="phone"
          v-model="form.phone"
          type="tel"
          class="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <button
        type="submit"
        :disabled="saving"
        class="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
      >
        {{ saving ? 'Saving...' : 'Save Changes' }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { useUIStore } from '~/stores/useUIStore'
import { useUserStore } from '~/stores/useUserStore'
import { profileSchema, type ProfileInput } from '~/schemas/account'

const userStore = useUserStore()
const uiStore = useUIStore()

const form = reactive<ProfileInput>({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
})

const errors = ref<Record<string, string>>({})
const saving = ref(false)

watchEffect(() => {
  if (userStore.user) {
    form.firstName = userStore.user.firstName || ''
    form.lastName = userStore.user.lastName || ''
    form.email = userStore.user.email || ''
    form.phone = userStore.user.phone || ''
  }
})

async function handleSubmit() {
  errors.value = {}

  const parsed = profileSchema.safeParse(form)
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors
    errors.value = fieldErrors as Record<string, string>
    return
  }

  saving.value = true
  try {
    const data = await $fetch<{
      user: { id: string; email: string; firstName: string; lastName: string; phone: string | null }
    }>('/api/me/profile', {
      method: 'PUT',
      headers: { authorization: `Bearer ${userStore.accessToken}` },
      body: parsed.data,
    })
    userStore.user = data.user
    uiStore.addToast({ type: 'success', message: 'Profile updated successfully' })
  } catch (err) {
    const error = err as { data?: { statusMessage?: string }; message?: string }
    uiStore.addToast({
      type: 'error',
      message: error.data?.statusMessage || error.message || 'Failed to update profile',
    })
  } finally {
    saving.value = false
  }
}
</script>
