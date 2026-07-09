<template>
  <Teleport to="body">
    <div :class="containerClasses">
      <TransitionGroup name="toast" tag="div" class="flex flex-col gap-3">
        <div
          v-for="toast in ui.toasts"
          :key="toast.id"
          :class="toastClasses(toast.type)"
          role="alert"
          @click="ui.removeToast(toast.id)"
        >
          <div class="flex items-start gap-3">
            <span class="mt-0.5 flex-shrink-0">
              <svg
                v-if="toast.type === 'success'"
                class="h-5 w-5 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <svg
                v-else-if="toast.type === 'error'"
                class="h-5 w-5 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <svg
                v-else-if="toast.type === 'warning'"
                class="h-5 w-5 text-yellow-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <svg
                v-else
                class="h-5 w-5 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </span>
            <p class="flex-1 text-sm font-medium text-gray-900 dark:text-gray-100">
              {{ toast.message }}
            </p>
            <button
              class="flex-shrink-0 rounded-lg p-0.5 text-gray-400 transition-colors hover:bg-black/5 hover:text-gray-600 dark:hover:bg-white/10 dark:hover:text-gray-300"
              @click.stop="ui.removeToast(toast.id)"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useUIStore } from '~/stores/useUIStore'

const props = withDefaults(
  defineProps<{
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  }>(),
  { position: 'top-right' },
)

const ui = useUIStore()

const containerClasses = computed(() => {
  const base = 'fixed z-50 flex flex-col gap-3 pointer-events-none'
  const positions: Record<string, string> = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
  }
  return `${base} ${positions[props.position]}`
})

function toastClasses(type: string) {
  const base =
    'pointer-events-auto w-80 rounded-xl border-l-4 p-4 shadow-soft-lg cursor-pointer transition-shadow hover:shadow-soft'
  const types: Record<string, string> = {
    success: 'border-green-500 bg-green-50 dark:bg-green-950/50',
    error: 'border-red-500 bg-red-50 dark:bg-red-950/50',
    warning: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/50',
    info: 'border-blue-500 bg-blue-50 dark:bg-blue-950/50',
  }
  return `${base} ${types[type] || types.info}`
}
</script>

<style scoped>
.toast-enter-active {
  transition: all 0.3s ease-out;
}
.toast-leave-active {
  transition: all 0.2s ease-in;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(30px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
.toast-move {
  transition: transform 0.3s ease;
}
</style>
