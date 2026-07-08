<template>
  <div>
    <section class="relative flex min-h-[60vh] items-center overflow-hidden bg-gray-900">
      <img
        src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80"
        alt="Our workspace and team collaborating on design"
        class="absolute inset-0 h-full w-full object-cover opacity-60"
        loading="lazy"
      />
      <div
        class="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/60 to-transparent"
      />
      <div class="container-page relative z-10">
        <h1 class="max-w-2xl text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl">
          Our Story
        </h1>
        <p class="mt-4 max-w-xl text-lg text-gray-300 md:text-xl">
          We set out to build more than just a store. APAN was founded on the belief that great
          design and ethical production should go hand in hand.
        </p>
      </div>
    </section>

    <section class="container-page py-16 md:py-24">
      <div class="grid items-center gap-12 md:grid-cols-2">
        <div>
          <h2 class="text-3xl font-bold tracking-tight text-gray-900">Why We Started</h2>
          <p class="mt-4 text-gray-600 leading-relaxed">
            It started with a simple frustration: finding products that looked good, felt great, and
            were made responsibly seemed nearly impossible. Every option required a compromise —
            between quality and ethics, between style and sustainability.
          </p>
          <p class="mt-4 text-gray-600 leading-relaxed">
            We founded APAN to close that gap. Our mission is to prove that you don't have to
            choose. Every product in our collection is carefully selected for its design,
            durability, and positive impact — on both people and the planet.
          </p>
        </div>
        <div class="overflow-hidden rounded-xl">
          <img
            src="https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&q=80"
            alt="Team working together on product design"
            class="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      </div>
    </section>

    <section class="bg-gray-50 py-16 md:py-24">
      <div class="container-page">
        <div class="grid items-center gap-12 md:grid-cols-2">
          <div class="order-last md:order-first overflow-hidden rounded-xl">
            <img
              src="https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80"
              alt="Sustainable materials and eco-friendly packaging"
              class="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
          <div class="order-first md:order-last">
            <h2 class="text-3xl font-bold tracking-tight text-gray-900">Our Approach</h2>
            <p class="mt-4 text-gray-600 leading-relaxed">
              We partner directly with makers who share our values — fair wages, safe working
              conditions, and environmentally conscious production. Every supply chain decision is
              made with transparency and accountability in mind.
            </p>
            <p class="mt-4 text-gray-600 leading-relaxed">
              From material sourcing to final packaging, we audit every step. The result is a
              collection you can feel good about owning — and an even better feeling about giving.
            </p>
          </div>
        </div>
      </div>
    </section>

    <section class="container-page py-16 md:py-24">
      <div class="mx-auto max-w-2xl text-center">
        <h2 class="text-3xl font-bold tracking-tight text-gray-900">What We Stand For</h2>
        <p class="mt-2 text-gray-600">Our values guide every decision we make.</p>
      </div>
      <div class="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="value in values"
          :key="value.title"
          class="card p-6 transition-shadow hover:shadow-soft-lg"
        >
          <div
            class="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600"
          >
            <svg
              v-if="value.icon === 'leaf'"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
              />
            </svg>
            <svg
              v-else-if="value.icon === 'heart'"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <svg
              v-else-if="value.icon === 'shield'"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            <svg
              v-else-if="value.icon === 'globe'"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <svg
              v-else-if="value.icon === 'truck'"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2-1m4 1l2-1 2 1m-8 0a2 2 0 104 0m-4 0a2 2 0 114 0m6-6h2a1 1 0 01.707.293l2.121 2.121a1 1 0 01.293.707V15a1 1 0 01-1 1h-1m-4 0a2 2 0 104 0m-4 0a2 2 0 114 0"
              />
            </svg>
            <svg
              v-else-if="value.icon === 'star'"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900">{{ value.title }}</h3>
          <p class="mt-2 text-sm text-gray-600">{{ value.description }}</p>
        </div>
      </div>
    </section>

    <section ref="statsSection" class="bg-indigo-700 py-16 md:py-20">
      <div class="container-page">
        <div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div v-for="stat in stats" :key="stat.label" class="text-center">
            <div class="text-4xl font-bold text-white md:text-5xl">
              {{ stat.prefix }}{{ animatedValue(stat) }}{{ stat.suffix }}
            </div>
            <div class="mt-2 text-sm text-indigo-200 md:text-base">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <section class="container-page py-16 md:py-24">
      <div class="mx-auto max-w-2xl text-center">
        <h2 class="text-3xl font-bold tracking-tight text-gray-900">Meet Our Team</h2>
        <p class="mt-2 text-gray-600">The people behind APAN.</p>
      </div>
      <div class="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div v-for="member in team" :key="member.name" class="text-center">
          <div
            class="mx-auto mb-4 flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-gray-200"
          >
            <img
              v-if="member.image"
              :src="member.image"
              :alt="member.name"
              class="h-full w-full object-cover"
              loading="lazy"
            />
            <svg
              v-else
              class="h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900">{{ member.name }}</h3>
          <p class="text-sm text-indigo-600">{{ member.role }}</p>
          <p class="mt-2 text-sm text-gray-600">{{ member.bio }}</p>
        </div>
      </div>
    </section>

    <section class="bg-gray-50 py-16 md:py-20">
      <div class="container-page text-center">
        <h2 class="text-3xl font-bold tracking-tight text-gray-900">Have a question?</h2>
        <p class="mt-2 text-gray-600">We'd love to hear from you. Get in touch with our team.</p>
        <NuxtLink to="/contact" class="btn-primary mt-8 inline-flex items-center gap-2">
          Contact Us
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
})

useSeoMeta({
  title: 'About Us - APAN Store',
  description:
    'Learn the story behind APAN — our mission, values, and commitment to sustainable, ethically made products.',
  ogTitle: 'About Us - APAN Store',
  ogDescription:
    'Learn the story behind APAN — our mission, values, and commitment to sustainable, ethically made products.',
  ogImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80',
})

interface Value {
  title: string
  description: string
  icon: string
}

interface Stat {
  value: number
  label: string
  prefix: string
  suffix: string
}

interface TeamMember {
  name: string
  role: string
  bio: string
  image: string | null
}

const values: Value[] = [
  {
    title: 'Sustainable Materials',
    description:
      'Every product is crafted from responsibly sourced, renewable, or recycled materials to minimize environmental impact.',
    icon: 'leaf',
  },
  {
    title: 'Ethical Production',
    description:
      'We partner with factories that guarantee fair wages, safe conditions, and humane working hours for all workers.',
    icon: 'heart',
  },
  {
    title: 'Quality That Lasts',
    description:
      'Designed for durability, not disposability. Our products are built to withstand years of use and still look great.',
    icon: 'shield',
  },
  {
    title: 'Carbon Neutral Shipping',
    description:
      'Every order is shipped carbon-neutral through verified offset programs and eco-friendly packaging.',
    icon: 'globe',
  },
  {
    title: 'Fast & Free Delivery',
    description:
      'Free standard shipping on all orders over $50, with express options available for when you need it sooner.',
    icon: 'truck',
  },
  {
    title: 'Community First',
    description:
      'We reinvest 5% of every purchase into local communities and environmental restoration projects.',
    icon: 'star',
  },
]

const stats: Stat[] = [
  { value: 10000, label: 'Happy Customers', prefix: '', suffix: '+' },
  { value: 500, label: 'Products', prefix: '', suffix: '+' },
  { value: 50, label: 'Countries Shipped', prefix: '', suffix: '+' },
  { value: 98, label: 'Satisfaction Rate', prefix: '', suffix: '%' },
]

const team: TeamMember[] = [
  {
    name: 'Alex Chen',
    role: 'Founder & CEO',
    bio: 'Former sustainable supply chain consultant with 12 years of experience in ethical fashion.',
    image: null,
  },
  {
    name: 'Sarah Mitchell',
    role: 'Head of Design',
    bio: 'Industrial designer who believes great products start with great materials and end with great experiences.',
    image: null,
  },
  {
    name: 'Marcus Johnson',
    role: 'Operations Director',
    bio: 'Logistics expert focused on building the most sustainable shipping network in the industry.',
    image: null,
  },
  {
    name: 'Priya Patel',
    role: 'Community Lead',
    bio: 'Builds relationships with customers and partners to ensure every voice shapes our journey.',
    image: null,
  },
]

const statsSection = ref<HTMLElement | null>(null)
const animatedValues = ref<Record<number, number>>({})

function animateCount(start: number, end: number, duration: number, index: number) {
  const startTime = performance.now()
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (reducedMotion) {
    animatedValues.value[index] = end
    return
  }

  function tick(currentTime: number) {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 3)
    animatedValues.value[index] = Math.round(start + (end - start) * eased)
    if (progress < 1) {
      requestAnimationFrame(tick)
    }
  }
  requestAnimationFrame(tick)
}

function animatedValue(stat: Stat) {
  if (animatedValues.value[stats.indexOf(stat)] === undefined) {
    return 0
  }
  return animatedValues.value[stats.indexOf(stat)]?.toLocaleString() ?? 0
}

onMounted(() => {
  if (!statsSection.value) return
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          stats.forEach((stat, i) => animateCount(0, stat.value, 2000, i))
          observer.disconnect()
        }
      })
    },
    { threshold: 0.3 },
  )
  observer.observe(statsSection.value)
})
</script>
