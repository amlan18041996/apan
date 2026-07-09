<template>
  <div
    class="accordion divide-y divide-border overflow-hidden rounded-xl border border-border bg-white shadow-sm"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue?: (string | number)[]
  multiple?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  multiple: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: (string | number)[]]
  open: [value: string | number]
  close: [value: string | number]
}>()

const openValues = ref<(string | number)[]>([...props.modelValue])

watch(
  () => props.modelValue,
  (val) => {
    openValues.value = [...(val || [])]
  },
)

watch(
  () => props.multiple,
  (multiple) => {
    if (!multiple && openValues.value.length > 1) {
      const [first] = openValues.value
      openValues.value = [first]
      emit('update:modelValue', [first])
    }
  },
)

function toggle(value: string | number) {
  let next: (string | number)[]

  if (openValues.value.includes(value)) {
    next = openValues.value.filter((v) => v !== value)
    emit('close', value)
  } else {
    if (props.multiple) {
      next = [...openValues.value, value]
    } else {
      if (openValues.value.length > 0) {
        emit('close', openValues.value[0])
      }
      next = [value]
    }
    emit('open', value)
  }

  openValues.value = next
  emit('update:modelValue', next)
}

function isOpen(value: string | number): boolean {
  return openValues.value.includes(value)
}

provide('accordion', { toggle, isOpen })
</script>
