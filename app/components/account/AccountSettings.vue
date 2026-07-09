<template>
  <div>
    <h2 class="text-lg font-semibold mb-4">Account Settings</h2>

    <div class="space-y-6 max-w-md">
      <div>
        <h3 class="text-sm font-medium mb-2">Change Password</h3>
        <form class="space-y-3" @submit.prevent="handlePasswordChange">
          <div>
            <label for="currentPassword" class="block text-xs font-medium mb-1"
              >Current Password</label
            >
            <input
              id="currentPassword"
              v-model="passwordForm.currentPassword"
              type="password"
              class="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              :class="{ 'border-red-500': passwordErrors.currentPassword }"
            />
            <p v-if="passwordErrors.currentPassword" class="text-xs text-red-500 mt-1">
              {{ passwordErrors.currentPassword }}
            </p>
          </div>

          <div>
            <label for="newPassword" class="block text-xs font-medium mb-1">New Password</label>
            <input
              id="newPassword"
              v-model="passwordForm.newPassword"
              type="password"
              class="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              :class="{ 'border-red-500': passwordErrors.newPassword }"
            />
            <p v-if="passwordErrors.newPassword" class="text-xs text-red-500 mt-1">
              {{ passwordErrors.newPassword }}
            </p>
          </div>

          <div>
            <label for="confirmPassword" class="block text-xs font-medium mb-1"
              >Confirm New Password</label
            >
            <input
              id="confirmPassword"
              v-model="passwordForm.confirmPassword"
              type="password"
              class="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              :class="{ 'border-red-500': passwordErrors.confirmPassword }"
            />
            <p v-if="passwordErrors.confirmPassword" class="text-xs text-red-500 mt-1">
              {{ passwordErrors.confirmPassword }}
            </p>
          </div>

          <button
            type="submit"
            :disabled="savingPassword"
            class="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
          >
            {{ savingPassword ? 'Updating...' : 'Update Password' }}
          </button>
        </form>
      </div>

      <hr class="border-border" />

      <div>
        <h3 class="text-sm font-medium mb-2 text-red-600">Danger Zone</h3>
        <button
          class="border border-red-500 text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-50"
          @click="handleDeleteAccount"
        >
          Delete Account
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUIStore } from '~/stores/useUIStore'
import { useUserStore } from '~/stores/useUserStore'
import { passwordSchema } from '~/schemas/account'

const userStore = useUserStore()
const uiStore = useUIStore()

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const passwordErrors = ref<Record<string, string>>({})
const savingPassword = ref(false)

async function handlePasswordChange() {
  passwordErrors.value = {}

  const parsed = passwordSchema.safeParse(passwordForm)
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors
    passwordErrors.value = fieldErrors as Record<string, string>
    return
  }

  savingPassword.value = true
  try {
    await $fetch('/api/me/password', {
      method: 'PUT',
      headers: { authorization: `Bearer ${userStore.accessToken}` },
      body: {
        currentPassword: parsed.data.currentPassword,
        newPassword: parsed.data.newPassword,
      },
    })
    uiStore.addToast({ type: 'success', message: 'Password updated successfully' })
    passwordForm.currentPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
  } catch (err) {
    const error = err as { data?: { statusMessage?: string }; message?: string }
    uiStore.addToast({
      type: 'error',
      message: error.data?.statusMessage || error.message || 'Failed to update password',
    })
  } finally {
    savingPassword.value = false
  }
}

function handleDeleteAccount() {
  uiStore.addToast({ type: 'info', message: 'Delete account functionality coming soon' })
}
</script>
