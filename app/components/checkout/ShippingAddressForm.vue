<script setup lang="ts">
import type { Address } from '~/types/checkout'
import {
  addressSchema,
  SUPPORTED_COUNTRIES,
  US_STATES,
  CANADIAN_PROVINCES,
  getZipPattern,
  validateZipForCountry,
} from '~/schemas/checkout'

interface Props {
  isAuthenticated?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isAuthenticated: false,
})

const emit = defineEmits<{
  submit: [address: Address]
  back: []
}>()

const { state, setShippingAddress, setBillingAddress, setSameAsBilling } = useCheckout()

const shippingForm = reactive<Address>({
  firstName: state.value.shippingAddress.firstName || '',
  lastName: state.value.shippingAddress.lastName || '',
  address1: state.value.shippingAddress.address1 || '',
  address2: state.value.shippingAddress.address2 || '',
  city: state.value.shippingAddress.city || '',
  state: state.value.shippingAddress.state || '',
  zip: state.value.shippingAddress.zip || '',
  country: state.value.shippingAddress.country || 'US',
  phone: state.value.shippingAddress.phone || '',
})

const billingForm = reactive<Address>({
  firstName: state.value.billingAddress.firstName || '',
  lastName: state.value.billingAddress.lastName || '',
  address1: state.value.billingAddress.address1 || '',
  address2: state.value.billingAddress.address2 || '',
  city: state.value.billingAddress.city || '',
  state: state.value.billingAddress.state || '',
  zip: state.value.billingAddress.zip || '',
  country: state.value.billingAddress.country || 'US',
  phone: state.value.billingAddress.phone || '',
})

const sameAsBilling = ref(state.value.sameAsBilling)
const errors = ref<Record<string, string>>({})
const billingErrors = ref<Record<string, string>>({})
const touched = ref<Record<string, boolean>>({})
const billingTouched = ref<Record<string, boolean>>({})
const isSubmitting = ref(false)

function clearError(errorsRef: Ref<Record<string, string>>, field: string) {
  errorsRef.value = Object.fromEntries(
    Object.entries(errorsRef.value).filter(([key]) => key !== field),
  )
}

const selectedCountry = computed(() =>
  SUPPORTED_COUNTRIES.find((c) => c.code === shippingForm.country),
)

const billingSelectedCountry = computed(() =>
  SUPPORTED_COUNTRIES.find((c) => c.code === billingForm.country),
)

const showStates = computed(() => selectedCountry.value?.hasStates ?? false)
const billingShowStates = computed(() => billingSelectedCountry.value?.hasStates ?? false)

const stateOptions = computed(() => {
  if (shippingForm.country === 'US') return US_STATES.map((s) => ({ value: s, label: s }))
  if (shippingForm.country === 'CA') return CANADIAN_PROVINCES.map((s) => ({ value: s, label: s }))
  return []
})

const billingStateOptions = computed(() => {
  if (billingForm.country === 'US') return US_STATES.map((s) => ({ value: s, label: s }))
  if (billingForm.country === 'CA') return CANADIAN_PROVINCES.map((s) => ({ value: s, label: s }))
  return []
})

const zipHint = computed(() => {
  const entry = getZipPattern(shippingForm.country)
  return entry ? `e.g. ${entry.example}` : ''
})

const billingZipHint = computed(() => {
  const entry = getZipPattern(billingForm.country)
  return entry ? `e.g. ${entry.example}` : ''
})

function validateField(field: keyof Address) {
  const result = addressSchema.shape[field === 'zip' ? 'zipCode' : field].safeParse(
    shippingForm[field],
  )
  if (field === 'zip' && shippingForm.country) {
    if (!result.success) {
      errors.value[field] = result.error.issues[0]?.message || 'Invalid ZIP code'
    } else if (!validateZipForCountry(shippingForm.zip, shippingForm.country)) {
      const entry = getZipPattern(shippingForm.country)
      errors.value[field] = entry
        ? `ZIP code must match format: ${entry.example}`
        : 'Invalid ZIP code'
    } else {
      clearError(errors, field)
    }
    return
  }
  if (!result.success) {
    errors.value[field] = result.error.issues[0]?.message || 'Invalid value'
  } else {
    clearError(errors, field)
  }
}

function validateBillingField(field: keyof Address) {
  const result = addressSchema.shape[field === 'zip' ? 'zipCode' : field].safeParse(
    billingForm[field],
  )
  if (field === 'zip' && billingForm.country) {
    if (!result.success) {
      billingErrors.value[field] = result.error.issues[0]?.message || 'Invalid ZIP code'
    } else if (!validateZipForCountry(billingForm.zip, billingForm.country)) {
      const entry = getZipPattern(billingForm.country)
      billingErrors.value[field] = entry
        ? `ZIP code must match format: ${entry.example}`
        : 'Invalid ZIP code'
    } else {
      clearError(billingErrors, field)
    }
    return
  }
  if (!result.success) {
    billingErrors.value[field] = result.error.issues[0]?.message || 'Invalid value'
  } else {
    clearError(billingErrors, field)
  }
}

function handleBlur(field: keyof Address) {
  touched.value[field] = true
  validateField(field)
}

function handleBillingBlur(field: keyof Address) {
  billingTouched.value[field] = true
  validateBillingField(field)
}

function onCountryChange() {
  shippingForm.state = ''
  if (sameAsBilling.value) {
    billingForm.country = shippingForm.country
    billingForm.state = ''
  }
  if (touched.value.zip) validateField('zip')
}

function onBillingCountryChange() {
  billingForm.state = ''
  if (billingTouched.value.zip) validateBillingField('zip')
}

function onSameAsBillingChange() {
  sameAsBilling.value = !sameAsBilling.value
  setSameAsBilling(sameAsBilling.value)
  if (sameAsBilling.value) {
    Object.assign(billingForm, { ...shippingForm })
    billingErrors.value = {}
    billingTouched.value = {}
  }
}

function validateAll(): boolean {
  const allFields: (keyof Address)[] = [
    'firstName',
    'lastName',
    'address1',
    'city',
    'state',
    'zip',
    'country',
  ]
  let valid = true
  const newErrors: Record<string, string> = {}

  for (const field of allFields) {
    touched.value[field] = true
    const result = addressSchema.shape[field === 'zip' ? 'zipCode' : field].safeParse(
      shippingForm[field],
    )
    if (!result.success) {
      newErrors[field] = result.error.issues[0]?.message || 'Invalid value'
      valid = false
    } else if (field === 'zip' && shippingForm.country) {
      if (!validateZipForCountry(shippingForm.zip, shippingForm.country)) {
        const entry = getZipPattern(shippingForm.country)
        newErrors[field] = entry
          ? `ZIP code must match format: ${entry.example}`
          : 'Invalid ZIP code'
        valid = false
      }
    }
  }

  if (shippingForm.phone) {
    const phoneResult = addressSchema.shape.phone.safeParse(shippingForm.phone)
    if (!phoneResult.success) {
      newErrors.phone = phoneResult.error.issues[0]?.message || 'Invalid phone number'
      valid = false
    }
  }

  errors.value = newErrors

  if (!sameAsBilling.value) {
    const newBillingErrors: Record<string, string> = {}
    for (const field of allFields) {
      billingTouched.value[field] = true
      const result = addressSchema.shape[field === 'zip' ? 'zipCode' : field].safeParse(
        billingForm[field],
      )
      if (!result.success) {
        newBillingErrors[field] = result.error.issues[0]?.message || 'Invalid value'
        valid = false
      } else if (field === 'zip' && billingForm.country) {
        if (!validateZipForCountry(billingForm.zip, billingForm.country)) {
          const entry = getZipPattern(billingForm.country)
          newBillingErrors[field] = entry
            ? `ZIP code must match format: ${entry.example}`
            : 'Invalid ZIP code'
          valid = false
        }
      }
    }
    billingErrors.value = newBillingErrors
  }

  return valid
}

function handleSubmit() {
  if (!validateAll()) return

  isSubmitting.value = true

  setShippingAddress({ ...shippingForm })

  if (!sameAsBilling.value) {
    setBillingAddress({ ...billingForm })
  } else {
    setBillingAddress({ ...shippingForm })
  }

  emit('submit', { ...shippingForm })
  isSubmitting.value = false
}

function handleBack() {
  emit('back')
}
</script>

<template>
  <form class="space-y-6" @submit.prevent="handleSubmit">
    <div>
      <h2 class="text-lg font-semibold text-gray-900">Shipping Address</h2>
      <p class="mt-1 text-sm text-gray-500">Enter where your order should be delivered.</p>
    </div>

    <div class="space-y-4">
      <div>
        <label for="shipping-email" class="block text-sm font-medium text-gray-700">
          Email <span class="text-red-500">*</span>
        </label>
        <input
          id="shipping-email"
          type="email"
          :value="state.email"
          required
          class="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          placeholder="you@example.com"
          @input="setEmail(($event.target as HTMLInputElement).value)"
        />
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label for="shipping-first-name" class="block text-sm font-medium text-gray-700">
            First Name <span class="text-red-500">*</span>
          </label>
          <input
            id="shipping-first-name"
            v-model="shippingForm.firstName"
            type="text"
            required
            class="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            :class="{ 'border-red-500': touched.firstName && errors.firstName }"
            placeholder="John"
            @blur="handleBlur('firstName')"
          />
          <p v-if="touched.firstName && errors.firstName" class="mt-1 text-xs text-red-500">
            {{ errors.firstName }}
          </p>
        </div>
        <div>
          <label for="shipping-last-name" class="block text-sm font-medium text-gray-700">
            Last Name <span class="text-red-500">*</span>
          </label>
          <input
            id="shipping-last-name"
            v-model="shippingForm.lastName"
            type="text"
            required
            class="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            :class="{ 'border-red-500': touched.lastName && errors.lastName }"
            placeholder="Doe"
            @blur="handleBlur('lastName')"
          />
          <p v-if="touched.lastName && errors.lastName" class="mt-1 text-xs text-red-500">
            {{ errors.lastName }}
          </p>
        </div>
      </div>

      <div>
        <label for="shipping-address1" class="block text-sm font-medium text-gray-700">
          Address Line 1 <span class="text-red-500">*</span>
        </label>
        <input
          id="shipping-address1"
          v-model="shippingForm.address1"
          type="text"
          required
          class="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          :class="{ 'border-red-500': touched.address1 && errors.address1 }"
          placeholder="123 Main Street"
          @blur="handleBlur('address1')"
        />
        <p v-if="touched.address1 && errors.address1" class="mt-1 text-xs text-red-500">
          {{ errors.address1 }}
        </p>
      </div>

      <div>
        <label for="shipping-address2" class="block text-sm font-medium text-gray-700">
          Address Line 2
        </label>
        <input
          id="shipping-address2"
          v-model="shippingForm.address2"
          type="text"
          class="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          placeholder="Apartment, suite, unit, etc. (optional)"
        />
      </div>

      <div>
        <label for="shipping-country" class="block text-sm font-medium text-gray-700">
          Country <span class="text-red-500">*</span>
        </label>
        <select
          id="shipping-country"
          v-model="shippingForm.country"
          required
          class="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          @change="onCountryChange"
        >
          <option v-for="c in SUPPORTED_COUNTRIES" :key="c.code" :value="c.code">
            {{ c.name }}
          </option>
        </select>
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div v-if="showStates">
          <label for="shipping-state" class="block text-sm font-medium text-gray-700">
            State / Province <span class="text-red-500">*</span>
          </label>
          <select
            id="shipping-state"
            v-model="shippingForm.state"
            required
            class="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            :class="{ 'border-red-500': touched.state && errors.state }"
            @blur="handleBlur('state')"
          >
            <option value="" disabled>Select state</option>
            <option v-for="s in stateOptions" :key="s.value" :value="s.value">
              {{ s.label }}
            </option>
          </select>
          <p v-if="touched.state && errors.state" class="mt-1 text-xs text-red-500">
            {{ errors.state }}
          </p>
        </div>
        <div v-else>
          <label for="shipping-state-input" class="block text-sm font-medium text-gray-700">
            State / Province
          </label>
          <input
            id="shipping-state-input"
            v-model="shippingForm.state"
            type="text"
            class="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            placeholder="State or province"
          />
        </div>

        <div>
          <label for="shipping-city" class="block text-sm font-medium text-gray-700">
            City <span class="text-red-500">*</span>
          </label>
          <input
            id="shipping-city"
            v-model="shippingForm.city"
            type="text"
            required
            class="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            :class="{ 'border-red-500': touched.city && errors.city }"
            placeholder="New York"
            @blur="handleBlur('city')"
          />
          <p v-if="touched.city && errors.city" class="mt-1 text-xs text-red-500">
            {{ errors.city }}
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label for="shipping-zip" class="block text-sm font-medium text-gray-700">
            ZIP / Postal Code <span class="text-red-500">*</span>
          </label>
          <input
            id="shipping-zip"
            v-model="shippingForm.zip"
            type="text"
            required
            class="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            :class="{ 'border-red-500': touched.zip && errors.zip }"
            :placeholder="zipHint || 'ZIP / Postal code'"
            @blur="handleBlur('zip')"
          />
          <p v-if="touched.zip && errors.zip" class="mt-1 text-xs text-red-500">
            {{ errors.zip }}
          </p>
        </div>
        <div>
          <label for="shipping-phone" class="block text-sm font-medium text-gray-700">
            Phone Number
          </label>
          <input
            id="shipping-phone"
            v-model="shippingForm.phone"
            type="tel"
            class="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            :class="{ 'border-red-500': touched.phone && errors.phone }"
            placeholder="+1 (555) 123-4567"
            @blur="handleBlur('phone')"
          />
          <p v-if="touched.phone && errors.phone" class="mt-1 text-xs text-red-500">
            {{ errors.phone }}
          </p>
        </div>
      </div>
    </div>

    <div class="border-t border-gray-200 pt-4">
      <label class="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          :checked="sameAsBilling"
          class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          @change="onSameAsBillingChange"
        />
        <span class="text-sm text-gray-700">Use shipping address for billing</span>
      </label>
    </div>

    <Transition name="billing-slide">
      <div v-if="!sameAsBilling" class="space-y-4 border-t border-gray-200 pt-4">
        <h3 class="text-base font-semibold text-gray-900">Billing Address</h3>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label for="billing-first-name" class="block text-sm font-medium text-gray-700">
              First Name <span class="text-red-500">*</span>
            </label>
            <input
              id="billing-first-name"
              v-model="billingForm.firstName"
              type="text"
              required
              class="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              :class="{ 'border-red-500': billingTouched.firstName && billingErrors.firstName }"
              @blur="handleBillingBlur('firstName')"
            />
            <p
              v-if="billingTouched.firstName && billingErrors.firstName"
              class="mt-1 text-xs text-red-500"
            >
              {{ billingErrors.firstName }}
            </p>
          </div>
          <div>
            <label for="billing-last-name" class="block text-sm font-medium text-gray-700">
              Last Name <span class="text-red-500">*</span>
            </label>
            <input
              id="billing-last-name"
              v-model="billingForm.lastName"
              type="text"
              required
              class="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              :class="{ 'border-red-500': billingTouched.lastName && billingErrors.lastName }"
              @blur="handleBillingBlur('lastName')"
            />
            <p
              v-if="billingTouched.lastName && billingErrors.lastName"
              class="mt-1 text-xs text-red-500"
            >
              {{ billingErrors.lastName }}
            </p>
          </div>
        </div>

        <div>
          <label for="billing-address1" class="block text-sm font-medium text-gray-700">
            Address Line 1 <span class="text-red-500">*</span>
          </label>
          <input
            id="billing-address1"
            v-model="billingForm.address1"
            type="text"
            required
            class="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            :class="{ 'border-red-500': billingTouched.address1 && billingErrors.address1 }"
            @blur="handleBillingBlur('address1')"
          />
          <p
            v-if="billingTouched.address1 && billingErrors.address1"
            class="mt-1 text-xs text-red-500"
          >
            {{ billingErrors.address1 }}
          </p>
        </div>

        <div>
          <label for="billing-address2" class="block text-sm font-medium text-gray-700">
            Address Line 2
          </label>
          <input
            id="billing-address2"
            v-model="billingForm.address2"
            type="text"
            class="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            placeholder="Apartment, suite, unit, etc. (optional)"
          />
        </div>

        <div>
          <label for="billing-country" class="block text-sm font-medium text-gray-700">
            Country <span class="text-red-500">*</span>
          </label>
          <select
            id="billing-country"
            v-model="billingForm.country"
            required
            class="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            @change="onBillingCountryChange"
          >
            <option v-for="c in SUPPORTED_COUNTRIES" :key="c.code" :value="c.code">
              {{ c.name }}
            </option>
          </select>
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div v-if="billingShowStates">
            <label for="billing-state" class="block text-sm font-medium text-gray-700">
              State / Province <span class="text-red-500">*</span>
            </label>
            <select
              id="billing-state"
              v-model="billingForm.state"
              required
              class="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              :class="{ 'border-red-500': billingTouched.state && billingErrors.state }"
              @blur="handleBillingBlur('state')"
            >
              <option value="" disabled>Select state</option>
              <option v-for="s in billingStateOptions" :key="s.value" :value="s.value">
                {{ s.label }}
              </option>
            </select>
            <p v-if="billingTouched.state && billingErrors.state" class="mt-1 text-xs text-red-500">
              {{ billingErrors.state }}
            </p>
          </div>
          <div v-else>
            <label for="billing-state-input" class="block text-sm font-medium text-gray-700">
              State / Province
            </label>
            <input
              id="billing-state-input"
              v-model="billingForm.state"
              type="text"
              class="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              placeholder="State or province"
            />
          </div>

          <div>
            <label for="billing-city" class="block text-sm font-medium text-gray-700">
              City <span class="text-red-500">*</span>
            </label>
            <input
              id="billing-city"
              v-model="billingForm.city"
              type="text"
              required
              class="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              :class="{ 'border-red-500': billingTouched.city && billingErrors.city }"
              @blur="handleBillingBlur('city')"
            />
            <p v-if="billingTouched.city && billingErrors.city" class="mt-1 text-xs text-red-500">
              {{ billingErrors.city }}
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label for="billing-zip" class="block text-sm font-medium text-gray-700">
              ZIP / Postal Code <span class="text-red-500">*</span>
            </label>
            <input
              id="billing-zip"
              v-model="billingForm.zip"
              type="text"
              required
              class="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              :class="{ 'border-red-500': billingTouched.zip && billingErrors.zip }"
              :placeholder="billingZipHint || 'ZIP / Postal code'"
              @blur="handleBillingBlur('zip')"
            />
            <p v-if="billingTouched.zip && billingErrors.zip" class="mt-1 text-xs text-red-500">
              {{ billingErrors.zip }}
            </p>
          </div>
          <div>
            <label for="billing-phone" class="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              id="billing-phone"
              v-model="billingForm.phone"
              type="tel"
              class="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              :class="{ 'border-red-500': billingTouched.phone && billingErrors.phone }"
              placeholder="+1 (555) 123-4567"
              @blur="handleBillingBlur('phone')"
            />
            <p v-if="billingTouched.phone && billingErrors.phone" class="mt-1 text-xs text-red-500">
              {{ billingErrors.phone }}
            </p>
          </div>
        </div>
      </div>
    </Transition>

    <div v-if="props.isAuthenticated" class="border-t border-gray-200 pt-4">
      <label class="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
        <span class="text-sm text-gray-700">Save this address to my account</span>
      </label>
    </div>

    <div class="flex items-center justify-between border-t border-gray-200 pt-4">
      <button
        type="button"
        class="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        @click="handleBack"
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
        Back
      </button>
      <button
        type="submit"
        class="inline-flex items-center justify-center rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="isSubmitting"
      >
        Continue to Shipping Method
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
  </form>
</template>

<style scoped>
.billing-slide-enter-active,
.billing-slide-leave-active {
  transition: all 0.3s ease-out;
  overflow: hidden;
}

.billing-slide-enter-from {
  opacity: 0;
  max-height: 0;
  transform: translateY(-8px);
}

.billing-slide-enter-to {
  opacity: 1;
  max-height: 2000px;
  transform: translateY(0);
}

.billing-slide-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-8px);
}
</style>
