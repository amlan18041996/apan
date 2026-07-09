import { useUIStore } from '~/stores/useUIStore'

interface ToastOptions {
  duration?: number
}

export function useToast() {
  const store = useUIStore()

  function success(message: string, options?: ToastOptions) {
    store.addToast({ type: 'success', message, duration: options?.duration })
  }

  function error(message: string, options?: ToastOptions) {
    store.addToast({ type: 'error', message, duration: options?.duration })
  }

  function warning(message: string, options?: ToastOptions) {
    store.addToast({ type: 'warning', message, duration: options?.duration })
  }

  function info(message: string, options?: ToastOptions) {
    store.addToast({ type: 'info', message, duration: options?.duration })
  }

  function dismiss(id: string) {
    store.removeToast(id)
  }

  return { success, error, warning, info, dismiss }
}
