<template>
  <Transition name="backdrop">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-40 bg-black/50"
      :class="{ 'cursor-pointer': closeOnClick }"
      :aria-hidden="true"
      @click="onClick"
    />
  </Transition>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean
  closeOnClick?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  closeOnClick: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

function onClick() {
  if (props.closeOnClick) {
    emit('update:modelValue', false)
  }
}
</script>

<style scoped>
.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 250ms ease;
}

.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}
</style>
