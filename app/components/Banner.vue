<template>
  <div
    class="relative overflow-hidden"
    :class="[variant === 'full-width' ? 'w-full' : 'rounded-xl', aspectRatioClass]"
  >
    <img
      v-if="src"
      :src="src"
      :alt="alt"
      class="absolute inset-0 h-full w-full object-cover"
      loading="lazy"
    />

    <div class="absolute inset-0" :class="overlayClass" />

    <div
      class="relative z-10 flex h-full items-end"
      :class="[variant === 'contained' ? '' : 'container-page', 'pb-8 pt-16 md:pb-12 md:pt-24']"
    >
      <div :class="variant === 'contained' ? '' : 'container-page w-full'">
        <h2 class="text-3xl font-bold tracking-tight text-white md:text-5xl">
          {{ heading }}
        </h2>
        <p v-if="subtext" class="mt-3 max-w-xl text-base text-gray-200 md:text-lg">
          {{ subtext }}
        </p>
        <a
          v-if="cta && isExternal(cta.to)"
          :href="cta.to"
          target="_blank"
          rel="noopener noreferrer"
          class="btn-primary mt-6 inline-flex"
        >
          {{ cta.text }}
        </a>
        <NuxtLink v-else-if="cta" :to="cta.to" class="btn-primary mt-6 inline-flex">
          {{ cta.text }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface CtaConfig {
  text: string
  to: string
}

interface Props {
  src?: string
  alt?: string
  heading: string
  subtext?: string
  cta?: CtaConfig
  variant?: 'full-width' | 'contained'
  aspectRatio?: 'hero' | 'wide' | 'square' | 'auto'
  overlay?: 'bottom' | 'full'
  dark?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  src: '',
  alt: '',
  subtext: '',
  cta: undefined,
  variant: 'full-width',
  aspectRatio: 'hero',
  overlay: 'bottom',
  dark: false,
})

const aspectRatioClass = computed(() => {
  switch (props.aspectRatio) {
    case 'wide':
      return 'aspect-video'
    case 'square':
      return 'aspect-square'
    case 'hero':
      return 'aspect-[21/9]'
    case 'auto':
    default:
      return 'min-h-[300px] md:min-h-[400px]'
  }
})

const overlayClass = computed(() => {
  if (props.overlay === 'full') {
    return props.dark ? 'bg-black/60' : 'bg-black/40'
  }
  return props.dark
    ? 'bg-gradient-to-t from-black/80 via-black/30 to-transparent'
    : 'bg-gradient-to-t from-black/60 via-black/20 to-transparent'
})

function isExternal(url: string): boolean {
  return url.startsWith('http://') || url.startsWith('https://')
}
</script>
