<template>
  <div>
    <div class="flex border-b border-border" role="tablist">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        :ref="(el) => setTabRef(el as HTMLElement, tab.value)"
        role="tab"
        :aria-selected="activeValue === tab.value"
        :aria-controls="`${uid}-panel-${tab.value}`"
        :tabindex="activeValue === tab.value ? 0 : -1"
        :disabled="tab.disabled"
        class="relative px-4 py-3 text-sm font-medium transition-all border-b-2 -mb-px"
        :class="
          activeValue === tab.value
            ? 'text-primary-600 border-primary-600'
            : 'text-text-muted border-transparent hover:border-gray-300 hover:text-text'
        "
        @click="selectTab(tab.value)"
        @keydown.left.prevent="focusAdjacentTab('prev')"
        @keydown.right.prevent="focusAdjacentTab('next')"
        @keydown.home.prevent="focusTab(0)"
        @keydown.end.prevent="focusTab(tabs.length - 1)"
      >
        {{ tab.label }}
      </button>
    </div>
    <div class="py-4">
      <Transition name="tab-fade" mode="out-in">
        <div
          v-if="activeValue"
          :key="activeValue"
          role="tabpanel"
          :aria-labelledby="`${uid}-tab-${activeValue}`"
        >
          <slot :name="activeValue" />
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Tab {
  value: string
  label: string
  disabled?: boolean
}

interface Props {
  tabs: Tab[]
  modelValue?: string
  urlHash?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  urlHash: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

let instanceCounter = 0
const uid = `tabs-${++instanceCounter}`

const activeValue = computed(() => props.modelValue || props.tabs[0]?.value || '')

const tabElements = ref<Record<string, HTMLElement>>({})

function setTabRef(el: HTMLElement | null, value: string) {
  if (el) {
    tabElements.value[value] = el
  }
}

function selectTab(value: string) {
  const tab = props.tabs.find((t) => t.value === value)
  if (tab && !tab.disabled) {
    emit('update:modelValue', value)
  }
}

function focusAdjacentTab(direction: 'prev' | 'next') {
  const currentIndex = props.tabs.findIndex((t) => t.value === activeValue.value)
  const len = props.tabs.length
  if (len === 0) return

  let nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1
  if (nextIndex < 0) nextIndex = len - 1
  if (nextIndex >= len) nextIndex = 0

  const nextTab = props.tabs[nextIndex]
  if (nextTab) {
    selectTab(nextTab.value)
    nextTick(() => {
      tabElements.value[nextTab.value]?.focus()
    })
  }
}

function focusTab(index: number) {
  const tab = props.tabs[index]
  if (tab) {
    selectTab(tab.value)
    nextTick(() => {
      tabElements.value[tab.value]?.focus()
    })
  }
}

watch(activeValue, (val) => {
  if (props.urlHash && import.meta.client && val) {
    window.location.hash = `#${val}`
  }
})

function onHashChange() {
  const hash = window.location.hash.slice(1)
  if (hash && props.tabs.some((t) => t.value === hash)) {
    emit('update:modelValue', hash)
  }
}

onMounted(() => {
  if (props.urlHash && import.meta.client) {
    if (window.location.hash) {
      const hash = window.location.hash.slice(1)
      if (props.tabs.some((t) => t.value === hash)) {
        emit('update:modelValue', hash)
      }
    }
    window.addEventListener('hashchange', onHashChange)
  }
})

onUnmounted(() => {
  if (props.urlHash && import.meta.client) {
    window.removeEventListener('hashchange', onHashChange)
  }
})
</script>

<style scoped>
.tab-fade-enter-active,
.tab-fade-leave-active {
  transition: all 0.2s ease-out;
}
.tab-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.tab-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
