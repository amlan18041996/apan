<template>
  <div>
    <section class="border-b border-border bg-gray-50 py-12 md:py-16">
      <div class="container-page">
        <h1 class="text-3xl font-bold tracking-tight text-text md:text-4xl">
          Frequently Asked Questions
        </h1>
        <p class="mt-3 max-w-2xl text-text-muted">
          Find answers to common questions about ordering, shipping, returns, and more.
        </p>

        <!-- Search -->
        <div class="relative mt-8 max-w-xl">
          <svg
            class="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search FAQs..."
            class="input-field pl-10"
          />
          <button
            v-if="searchQuery"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted transition-colors hover:text-text"
            aria-label="Clear search"
            @click="clearSearch"
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
    </section>

    <section class="container-page py-8 md:py-12">
      <!-- Category Tabs -->
      <div class="overflow-x-auto -mx-4 px-4 pb-2 scrollbar-hide">
        <nav class="flex gap-1 min-w-max" role="tablist">
          <button
            v-for="tab in tabs"
            :key="tab"
            role="tab"
            :aria-selected="activeTab === tab"
            class="whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            :class="
              activeTab === tab
                ? 'bg-primary-600 text-white'
                : 'text-text-muted hover:bg-gray-100 hover:text-text'
            "
            @click="setActiveTab(tab)"
          >
            {{ tab }}
          </button>
        </nav>
      </div>

      <!-- FAQ Items -->
      <div class="mt-8">
        <div v-if="filteredFaqs.length === 0" class="py-16 text-center">
          <svg
            class="mx-auto h-12 w-12 text-text-muted"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M12 18h.01"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"
            />
          </svg>
          <h3 class="mt-4 text-lg font-semibold text-text">No results found</h3>
          <p class="mt-2 text-sm text-text-muted">
            Try a different search term or browse all categories.
          </p>
          <button class="btn-primary mt-4" @click="resetFilters">Browse All FAQs</button>
        </div>

        <Accordion v-for="category in displayedCategories" :key="category" class="mb-6">
          <h2
            v-if="displayedCategories.length > 1"
            class="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted"
          >
            {{ category }}
          </h2>
          <AccordionItem v-for="faq in categoryFaqs(category)" :key="faq.id" :value="faq.id">
            <template #header>
              <span class="text-sm font-medium text-text">
                <span
                  v-for="(part, i) in highlight(faq.question)"
                  :key="i"
                  :class="{ 'bg-yellow-200 text-gray-900': part.highlight }"
                  >{{ part.text }}</span
                >
              </span>
            </template>
            <div class="prose prose-sm max-w-none text-text-muted">
              <span
                v-for="(part, i) in highlight(faq.answer)"
                :key="i"
                :class="{ 'bg-yellow-200': part.highlight }"
                >{{ part.text }}</span
              >
            </div>
          </AccordionItem>
        </Accordion>
      </div>
    </section>

    <!-- Contact Section -->
    <section class="border-t border-border bg-gray-50 py-16">
      <div class="container-page text-center">
        <h2 class="text-2xl font-bold tracking-tight text-text">Still have questions?</h2>
        <p class="mt-3 text-text-muted">
          We typically respond within 24 hours. Reach out and we'll help you out.
        </p>
        <NuxtLink to="/contact" class="btn-primary mt-6 inline-flex"> Contact Support </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
})

useSeoMeta({
  title: 'FAQ - APAN Store',
  description:
    'Find answers to frequently asked questions about orders, shipping, returns, payments, accounts, and product information at APAN Store.',
  ogTitle: 'FAQ - APAN Store',
  ogDescription:
    'Find answers to frequently asked questions about orders, shipping, returns, payments, accounts, and product information at APAN Store.',
})

interface FaqItem {
  id: string
  category: string
  question: string
  answer: string
}

const faqs: FaqItem[] = [
  // Orders
  {
    id: 'order-1',
    category: 'Orders',
    question: 'How do I place an order?',
    answer:
      'Simply browse our collections, add items to your cart, and proceed to checkout. You can pay as a guest or create an account for faster future checkouts.',
  },
  {
    id: 'order-2',
    category: 'Orders',
    question: 'Can I modify or cancel my order after placing it?',
    answer:
      'Orders can be modified or cancelled within 1 hour of placement. Please contact our support team immediately with your order number to request changes.',
  },
  {
    id: 'order-3',
    category: 'Orders',
    question: 'Will I receive a confirmation email?',
    answer:
      'Yes, a confirmation email with your order details and tracking information will be sent to the email address provided during checkout.',
  },
  {
    id: 'order-4',
    category: 'Orders',
    question: 'Do you offer gift wrapping?',
    answer:
      'Yes, we offer premium gift wrapping for an additional charge. You can select this option during checkout.',
  },

  // Shipping & Delivery
  {
    id: 'ship-1',
    category: 'Shipping & Delivery',
    question: 'What shipping options do you offer?',
    answer:
      'We offer Standard (5-7 business days), Express (2-3 business days), and Next Day delivery options for most regions.',
  },
  {
    id: 'ship-2',
    category: 'Shipping & Delivery',
    question: 'How much does shipping cost?',
    answer:
      'Standard shipping is free on orders over $50. Express shipping starts at $12.99 and Next Day at $24.99. Rates vary by location.',
  },
  {
    id: 'ship-3',
    category: 'Shipping & Delivery',
    question: 'Do you ship internationally?',
    answer:
      'Yes, we ship to over 40 countries worldwide. International delivery typically takes 7-14 business days and may incur customs duties.',
  },
  {
    id: 'ship-4',
    category: 'Shipping & Delivery',
    question: 'How can I track my order?',
    answer:
      'Once shipped, you will receive a tracking link via email. You can also check your order status in your account dashboard.',
  },

  // Returns & Exchanges
  {
    id: 'ret-1',
    category: 'Returns & Exchanges',
    question: 'What is your return policy?',
    answer:
      'We accept returns within 30 days of delivery for unworn, unwashed items with original tags. Refunds are processed within 5-7 business days of receipt.',
  },
  {
    id: 'ret-2',
    category: 'Returns & Exchanges',
    question: 'How do I start a return?',
    answer:
      'Visit your account orders page, select the item you wish to return, and follow the prompts. You can also contact support to initiate a return.',
  },
  {
    id: 'ret-3',
    category: 'Returns & Exchanges',
    question: 'Do you offer free returns?',
    answer:
      'We offer free returns on full-priced items. A return shipping label fee of $5.99 is deducted from refunds for discounted items.',
  },
  {
    id: 'ret-4',
    category: 'Returns & Exchanges',
    question: 'Can I exchange an item for a different size?',
    answer:
      'Yes, exchanges are free. We will ship the replacement size as soon as the returned item is scanned by the carrier.',
  },

  // Payments & Pricing
  {
    id: 'pay-1',
    category: 'Payments & Pricing',
    question: 'What payment methods do you accept?',
    answer:
      'We accept Visa, Mastercard, American Express, PayPal, Apple Pay, and Google Pay. All payments are processed securely.',
  },
  {
    id: 'pay-2',
    category: 'Payments & Pricing',
    question: 'Is your checkout secure?',
    answer:
      'Absolutely. We use industry-standard SSL encryption to protect your personal and payment information.',
  },
  {
    id: 'pay-3',
    category: 'Payments & Pricing',
    question: 'Do you offer price matching?',
    answer:
      'We offer price matching on identical items from authorized retailers. Contact support with a link to the lower price within 7 days of purchase.',
  },
  {
    id: 'pay-4',
    category: 'Payments & Pricing',
    question: 'Are there any additional fees?',
    answer:
      'No hidden fees. The price you see at checkout is the final price. International orders may be subject to local customs duties.',
  },
  {
    id: 'pay-5',
    category: 'Payments & Pricing',
    question: 'Do you offer student or military discounts?',
    answer:
      'Yes, we offer a 10% discount for students and military personnel. Verify your status through our partner verification service.',
  },

  // Account & Registration
  {
    id: 'acct-1',
    category: 'Account & Registration',
    question: 'How do I create an account?',
    answer:
      'Click the "Sign Up" button at the top of the page, enter your email and create a password. You can also register using Google or Apple.',
  },
  {
    id: 'acct-2',
    category: 'Account & Registration',
    question: 'I forgot my password. How do I reset it?',
    answer:
      'Click "Forgot Password" on the login page and enter your email. You will receive a password reset link within a few minutes.',
  },
  {
    id: 'acct-3',
    category: 'Account & Registration',
    question: 'How do I update my account information?',
    answer:
      'Log in and go to your account settings. You can update your name, email, shipping addresses, and payment methods from there.',
  },
  {
    id: 'acct-4',
    category: 'Account & Registration',
    question: 'Can I delete my account?',
    answer:
      'Yes, you can delete your account from your account settings. This action is irreversible and will remove all your data.',
  },

  // Product Information
  {
    id: 'prod-1',
    category: 'Product Information',
    question: 'How do I find the right size?',
    answer:
      'Each product page has a detailed size guide with measurements. Refer to the size chart and customer reviews for fit recommendations.',
  },
  {
    id: 'prod-2',
    category: 'Product Information',
    question: 'Are your products sustainably sourced?',
    answer:
      'We are committed to sustainability. Over 70% of our products use eco-friendly materials. Look for the "Sustainable" badge on product pages.',
  },
  {
    id: 'prod-3',
    category: 'Product Information',
    question: 'How should I care for my items?',
    answer:
      'Care instructions are included with every product and listed on the product page. Follow the recommended washing and storage guidelines.',
  },
  {
    id: 'prod-4',
    category: 'Product Information',
    question: 'Can I see product reviews?',
    answer:
      'Yes, customer reviews and ratings are available on each product page. You can filter reviews by rating, size, and verified purchases.',
  },
]

const categories = [...new Set(faqs.map((f) => f.category))]
const tabs = ['All', ...categories]

const searchQuery = ref('')
const debouncedQuery = ref('')
const activeTab = ref('All')

function setActiveTab(tab: string) {
  activeTab.value = tab
}

function clearSearch() {
  searchQuery.value = ''
}

function resetFilters() {
  activeTab.value = 'All'
  searchQuery.value = ''
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null
watch(searchQuery, (val) => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    debouncedQuery.value = val
  }, 300)
})

const filteredFaqs = computed(() => {
  let items = faqs
  if (activeTab.value !== 'All') {
    items = items.filter((f) => f.category === activeTab.value)
  }
  const q = debouncedQuery.value.trim().toLowerCase()
  if (q) {
    items = items.filter(
      (f) => f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q),
    )
  }
  return items
})

const displayedCategories = computed(() => {
  const cats = [...new Set(filteredFaqs.value.map((f) => f.category))]
  return activeTab.value === 'All' ? cats : [activeTab.value]
})

function categoryFaqs(category: string) {
  return filteredFaqs.value.filter((f) => f.category === category)
}

function highlight(text: string) {
  const q = debouncedQuery.value.trim().toLowerCase()
  if (!q) return [{ text, highlight: false }]
  const parts: { text: string; highlight: boolean }[] = []
  const lower = text.toLowerCase()
  let lastIndex = 0
  let idx = lower.indexOf(q)
  while (idx !== -1) {
    if (idx > lastIndex) {
      parts.push({ text: text.slice(lastIndex, idx), highlight: false })
    }
    parts.push({ text: text.slice(idx, idx + q.length), highlight: true })
    lastIndex = idx + q.length
    idx = lower.indexOf(q, lastIndex)
  }
  if (lastIndex < text.length) {
    parts.push({ text: text.slice(lastIndex), highlight: false })
  }
  return parts
}

const schemaData = computed(() => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: filteredFaqs.value.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
}))

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify(schemaData.value, null, 2),
    },
  ],
})
</script>
