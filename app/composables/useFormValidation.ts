import { ref, computed, type Ref } from 'vue'
import type { ZodSchema, ZodError } from 'zod'

export interface ValidationResult<T> {
  success: boolean
  data?: T
  errors: Record<string, string[]>
}

export function useFormValidation<T extends Record<string, unknown>>(schema: ZodSchema<T>) {
  const errors = ref<Record<string, string[]>>({}) as Ref<Record<string, string[]>>
  const isSubmitting = ref(false)

  const isValid = computed(() => Object.keys(errors.value).length === 0)

  function validate(data: unknown): ValidationResult<T> {
    const result = schema.safeParse(data)
    if (result.success) {
      errors.value = {}
      return { success: true, data: result.data, errors: {} }
    }

    const formatted: Record<string, string[]> = {}
    for (const issue of result.error.issues) {
      const path = issue.path.join('.')
      if (!formatted[path]) {
        formatted[path] = []
      }
      formatted[path].push(issue.message)
    }
    errors.value = formatted
    return { success: false, errors: formatted }
  }

  function clearErrors() {
    errors.value = {}
  }

  function clearFieldError(field: string) {
    errors.value = Object.fromEntries(Object.entries(errors.value).filter(([key]) => key !== field))
  }

  function formatError(zodError: ZodError): Record<string, string[]> {
    const formatted: Record<string, string[]> = {}
    for (const issue of zodError.issues) {
      const path = issue.path.join('.')
      if (!formatted[path]) {
        formatted[path] = []
      }
      formatted[path].push(issue.message)
    }
    return formatted
  }

  return {
    errors,
    isSubmitting,
    isValid,
    validate,
    clearErrors,
    clearFieldError,
    formatError,
  }
}
