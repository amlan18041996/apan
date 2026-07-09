<template>
  <div>
    <h2 class="text-lg font-semibold mb-4">Saved Addresses</h2>

    <div v-if="loading" class="text-sm text-text-muted">Loading addresses...</div>

    <div v-else-if="error" class="text-sm text-red-500">{{ error }}</div>

    <div v-else>
      <div v-if="addresses.length === 0" class="text-sm text-text-muted mb-4">
        No addresses saved yet.
      </div>

      <div v-else class="space-y-3 mb-6">
        <div
          v-for="address in addresses"
          :key="address.id"
          class="border border-border rounded-lg p-4"
        >
          <div class="flex justify-between items-start">
            <div>
              <p class="text-sm font-medium">
                {{ address.firstName }} {{ address.lastName }}
                <span
                  v-if="address.isDefault"
                  class="ml-2 text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded"
                  >Default</span
                >
              </p>
              <p class="text-sm text-text-muted">{{ address.address1 }}</p>
              <p v-if="address.address2" class="text-sm text-text-muted">{{ address.address2 }}</p>
              <p class="text-sm text-text-muted">
                {{ address.city }}, {{ address.province }} {{ address.zip }}
              </p>
              <p class="text-sm text-text-muted">{{ address.country }}</p>
              <p v-if="address.phone" class="text-sm text-text-muted">{{ address.phone }}</p>
            </div>
            <div class="flex gap-2">
              <button
                class="text-xs text-primary-600 hover:underline"
                @click="editAddress(address)"
              >
                Edit
              </button>
              <button
                class="text-xs text-red-500 hover:underline"
                @click="deleteAddress(address.id)"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      <button
        v-if="!showForm"
        class="text-sm text-primary-600 hover:underline"
        @click="openAddForm"
      >
        + Add New Address
      </button>

      <form
        v-if="showForm"
        class="space-y-3 max-w-md border border-border rounded-lg p-4"
        @submit.prevent="handleSubmit"
      >
        <h3 class="text-sm font-semibold">{{ editingId ? 'Edit Address' : 'New Address' }}</h3>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-medium mb-1">First Name</label>
            <input
              v-model="form.firstName"
              type="text"
              class="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              :class="{ 'border-red-500': errors.firstName }"
            />
            <p v-if="errors.firstName" class="text-xs text-red-500 mt-1">{{ errors.firstName }}</p>
          </div>
          <div>
            <label class="block text-xs font-medium mb-1">Last Name</label>
            <input
              v-model="form.lastName"
              type="text"
              class="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              :class="{ 'border-red-500': errors.lastName }"
            />
            <p v-if="errors.lastName" class="text-xs text-red-500 mt-1">{{ errors.lastName }}</p>
          </div>
        </div>

        <div>
          <label class="block text-xs font-medium mb-1">Address Line 1</label>
          <input
            v-model="form.address1"
            type="text"
            class="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            :class="{ 'border-red-500': errors.address1 }"
          />
          <p v-if="errors.address1" class="text-xs text-red-500 mt-1">{{ errors.address1 }}</p>
        </div>

        <div>
          <label class="block text-xs font-medium mb-1">Address Line 2 (optional)</label>
          <input
            v-model="form.address2"
            type="text"
            class="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-medium mb-1">City</label>
            <input
              v-model="form.city"
              type="text"
              class="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              :class="{ 'border-red-500': errors.city }"
            />
            <p v-if="errors.city" class="text-xs text-red-500 mt-1">{{ errors.city }}</p>
          </div>
          <div>
            <label class="block text-xs font-medium mb-1">Province/State</label>
            <input
              v-model="form.province"
              type="text"
              class="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              :class="{ 'border-red-500': errors.province }"
            />
            <p v-if="errors.province" class="text-xs text-red-500 mt-1">{{ errors.province }}</p>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-medium mb-1">ZIP/Postal Code</label>
            <input
              v-model="form.zip"
              type="text"
              class="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              :class="{ 'border-red-500': errors.zip }"
            />
            <p v-if="errors.zip" class="text-xs text-red-500 mt-1">{{ errors.zip }}</p>
          </div>
          <div>
            <label class="block text-xs font-medium mb-1">Country</label>
            <input
              v-model="form.country"
              type="text"
              class="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              :class="{ 'border-red-500': errors.country }"
            />
            <p v-if="errors.country" class="text-xs text-red-500 mt-1">{{ errors.country }}</p>
          </div>
        </div>

        <div>
          <label class="block text-xs font-medium mb-1">Phone (optional)</label>
          <input
            v-model="form.phone"
            type="tel"
            class="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <label class="flex items-center gap-2 text-sm">
          <input v-model="form.setDefault" type="checkbox" />
          Set as default address
        </label>

        <div class="flex gap-2">
          <button
            type="submit"
            :disabled="saving"
            class="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
          >
            {{ saving ? 'Saving...' : 'Save' }}
          </button>
          <button type="button" class="text-sm text-text-muted hover:underline" @click="cancelForm">
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUIStore } from '~/stores/useUIStore'
import { useUserStore } from '~/stores/useUserStore'
import { addressSchema, type AddressInput } from '~/schemas/account'

const userStore = useUserStore()
const uiStore = useUIStore()

interface Address {
  id: string
  firstName: string
  lastName: string
  address1: string
  address2: string | null
  city: string
  province: string
  zip: string
  country: string
  phone: string | null
  isDefault: boolean
}

const addresses = ref<Address[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const showForm = ref(false)
const editingId = ref<string | null>(null)
const saving = ref(false)

const form = reactive<AddressInput>({
  firstName: '',
  lastName: '',
  address1: '',
  address2: '',
  city: '',
  province: '',
  zip: '',
  country: '',
  phone: '',
  setDefault: false,
})

const errors = ref<Record<string, string>>({})

onMounted(fetchAddresses)

async function fetchAddresses() {
  loading.value = true
  try {
    const data = await $fetch<{ addresses: Address[] }>('/api/me/addresses', {
      headers: { authorization: `Bearer ${userStore.accessToken}` },
    })
    addresses.value = data.addresses
  } catch (err) {
    const e = err as { data?: { statusMessage?: string }; message?: string }
    error.value = e.data?.statusMessage || e.message || 'Failed to load addresses'
  } finally {
    loading.value = false
  }
}

function openAddForm() {
  editingId.value = null
  form.firstName = ''
  form.lastName = ''
  form.address1 = ''
  form.address2 = ''
  form.city = ''
  form.province = ''
  form.zip = ''
  form.country = ''
  form.phone = ''
  form.setDefault = false
  errors.value = {}
  showForm.value = true
}

function editAddress(address: Address) {
  editingId.value = address.id
  form.firstName = address.firstName
  form.lastName = address.lastName
  form.address1 = address.address1
  form.address2 = address.address2 || ''
  form.city = address.city
  form.province = address.province
  form.zip = address.zip
  form.country = address.country
  form.phone = address.phone || ''
  form.setDefault = address.isDefault
  errors.value = {}
  showForm.value = true
}

function cancelForm() {
  showForm.value = false
  editingId.value = null
}

async function handleSubmit() {
  errors.value = {}

  const parsed = addressSchema.safeParse(form)
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors
    errors.value = fieldErrors as Record<string, string>
    return
  }

  saving.value = true
  try {
    if (editingId.value) {
      const data = await $fetch<{ address: Address }>(`/api/me/addresses/${editingId.value}`, {
        method: 'PUT',
        headers: { authorization: `Bearer ${userStore.accessToken}` },
        body: parsed.data,
      })
      const idx = addresses.value.findIndex((a) => a.id === editingId.value)
      if (idx !== -1) addresses.value[idx] = data.address
    } else {
      const data = await $fetch<{ address: Address }>('/api/me/addresses', {
        method: 'POST',
        headers: { authorization: `Bearer ${userStore.accessToken}` },
        body: parsed.data,
      })
      addresses.value.push(data.address)
    }

    if (parsed.data.setDefault) {
      addresses.value.forEach((a) => {
        a.isDefault = a.id === (editingId.value || '')
      })
    }

    uiStore.addToast({
      type: 'success',
      message: editingId.value ? 'Address updated' : 'Address added',
    })
    showForm.value = false
    editingId.value = null
  } catch (err) {
    const e = err as { data?: { statusMessage?: string }; message?: string }
    uiStore.addToast({
      type: 'error',
      message: e.data?.statusMessage || e.message || 'Failed to save address',
    })
  } finally {
    saving.value = false
  }
}

async function deleteAddress(id: string) {
  try {
    await $fetch(`/api/me/addresses/${id}`, {
      method: 'DELETE',
      headers: { authorization: `Bearer ${userStore.accessToken}` },
    })
    addresses.value = addresses.value.filter((a) => a.id !== id)
    uiStore.addToast({ type: 'success', message: 'Address deleted' })
  } catch (err) {
    const e = err as { data?: { statusMessage?: string }; message?: string }
    uiStore.addToast({
      type: 'error',
      message: e.data?.statusMessage || e.message || 'Failed to delete address',
    })
  }
}
</script>
