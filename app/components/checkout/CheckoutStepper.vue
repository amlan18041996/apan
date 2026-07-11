<script setup lang="ts">
import type { CheckoutStepKey, StepStatus } from '~/types/checkout'

interface StepItem {
  key: CheckoutStepKey
  label: string
  index: number
  status: StepStatus
}

defineProps<{
  steps: StepItem[]
}>()

const emit = defineEmits<{
  stepClick: [stepKey: CheckoutStepKey]
}>()

function handleStepClick(step: StepItem) {
  if (step.status === 'complete' || step.status === 'current') {
    emit('stepClick', step.key)
  }
}

function isClickable(step: StepItem): boolean {
  return step.status === 'complete' || step.status === 'current'
}
</script>

<template>
  <nav aria-label="Checkout progress" class="w-full">
    <ol class="flex items-center">
      <li
        v-for="(step, idx) in steps"
        :key="step.key"
        class="flex items-center"
        :class="idx < steps.length - 1 ? 'flex-1' : ''"
      >
        <button
          type="button"
          :disabled="!isClickable(step)"
          :aria-current="step.status === 'current' ? 'step' : undefined"
          class="group flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded-lg"
          :class="isClickable(step) ? 'cursor-pointer' : 'cursor-default'"
          @click="handleStepClick(step)"
        >
          <span
            class="step-circle flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-all duration-300"
            :class="{
              'bg-primary-600 text-white shadow-md': step.status === 'current',
              'bg-primary-600 text-white': step.status === 'complete',
              'bg-gray-200 text-gray-500': step.status === 'incomplete',
              'bg-red-100 text-red-600 ring-2 ring-red-400': step.status === 'error',
            }"
          >
            <Transition name="step-icon" mode="out-in">
              <svg
                v-if="step.status === 'complete'"
                key="check"
                class="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="2.5"
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              <span v-else key="number">{{ step.index + 1 }}</span>
            </Transition>
          </span>

          <span
            class="step-label hidden text-sm font-medium sm:block transition-colors duration-300"
            :class="{
              'text-primary-600': step.status === 'current',
              'text-primary-600': step.status === 'complete',
              'text-gray-500': step.status === 'incomplete',
              'text-red-600': step.status === 'error',
            }"
          >
            {{ step.label }}
          </span>
        </button>

        <div
          v-if="idx < steps.length - 1"
          class="step-connector mx-3 hidden h-0.5 flex-1 transition-colors duration-500 sm:block"
          :class="{
            'bg-primary-600': step.status === 'complete',
            'bg-gray-200': step.status !== 'complete',
          }"
        />
      </li>
    </ol>
  </nav>
</template>

<style scoped>
.step-icon-enter-active,
.step-icon-leave-active {
  transition: all 0.2s ease-out;
}

.step-icon-enter-from {
  opacity: 0;
  transform: scale(0.5) rotate(-90deg);
}

.step-icon-leave-to {
  opacity: 0;
  transform: scale(0.5) rotate(90deg);
}

.step-connector {
  transition: background-color 0.5s ease;
}
</style>
