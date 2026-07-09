<template>
  <div>
    <section class="border-b border-border bg-gray-50 py-12 md:py-16">
      <div class="container-page">
        <h1 class="text-3xl font-bold tracking-tight text-text md:text-4xl">
          Terms &amp; Conditions
        </h1>
        <p class="mt-3 text-sm text-text-muted">
          Last updated:
          <time datetime="2025-01-15">{{ lastUpdated }}</time>
        </p>
      </div>
    </section>

    <div class="container-page py-8 lg:flex lg:gap-12 lg:py-12">
      <aside class="hidden lg:block lg:w-56 lg:shrink-0">
        <nav class="sticky space-y-0.5" style="top: 6rem" aria-label="Terms sections">
          <p class="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
            Contents
          </p>
          <a
            v-for="section in sections"
            :key="section.id"
            :href="`#${section.id}`"
            class="block rounded-md px-3 py-1.5 text-sm transition-colors"
            :class="
              activeSection === section.id
                ? 'bg-primary-50 font-medium text-primary-700'
                : 'text-text-muted hover:bg-gray-100 hover:text-text'
            "
            @click.prevent="scrollTo(section.id)"
          >
            {{ section.label }}
          </a>
        </nav>
      </aside>

      <div class="lg:hidden">
        <button
          type="button"
          class="mb-4 flex w-full items-center justify-between rounded-lg border border-border bg-white px-4 py-3 text-left text-sm font-medium text-text transition-colors hover:bg-gray-50"
          :aria-expanded="mobileTocOpen"
          aria-controls="mobile-toc-panel"
          @click="mobileTocOpen = !mobileTocOpen"
        >
          <span>Contents</span>
          <svg
            class="h-4 w-4 text-text-muted transition-transform duration-200"
            :class="{ 'rotate-180': mobileTocOpen }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        <div
          v-show="mobileTocOpen"
          id="mobile-toc-panel"
          class="mb-6 space-y-0.5 rounded-lg border border-border bg-white p-2"
        >
          <a
            v-for="section in sections"
            :key="section.id"
            :href="`#${section.id}`"
            class="block rounded-md px-3 py-2 text-sm transition-colors"
            :class="
              activeSection === section.id
                ? 'bg-primary-50 font-medium text-primary-700'
                : 'text-text-muted hover:bg-gray-100 hover:text-text'
            "
            @click.prevent="scrollTo(section.id)"
          >
            {{ section.label }}
          </a>
        </div>
      </div>

      <div class="min-w-0 flex-1">
        <div class="prose prose-gray max-w-none">
          <section id="terms-intro">
            <h2>1. Introduction</h2>
            <p>
              Welcome to APAN (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;). These
              Terms &amp; Conditions (&ldquo;Terms&rdquo;) govern your access to and use of the APAN
              website, including any subdomains, mobile applications, and related services
              (collectively, the &ldquo;Service&rdquo;).
            </p>
            <p>
              By accessing or using the Service, you agree to be bound by these Terms. If you do not
              agree to all of the terms, do not access or use the Service. We reserve the right to
              update or modify these Terms at any time without prior notice. Your continued use of
              the Service after any changes constitutes acceptance of the new Terms.
            </p>
          </section>

          <section id="terms-account">
            <h2>2. Account Registration &amp; Security</h2>
            <p>
              To access certain features of the Service, you may be required to create an account.
              You agree to provide accurate, current, and complete information during the
              registration process and to update such information to keep it accurate, current, and
              complete.
            </p>
            <p>You are solely responsible for:</p>
            <ul>
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized use of your account</li>
            </ul>
            <p>
              We reserve the right to suspend or terminate your account at any time if we believe
              you have violated these Terms or engaged in fraudulent or abusive activity.
            </p>
          </section>

          <section id="terms-products">
            <h2>3. Product Descriptions &amp; Pricing</h2>
            <p>
              We strive to ensure that product descriptions, images, and pricing are accurate and up
              to date. However, we do not warrant that product descriptions or other content on the
              Service are error-free, complete, or current.
            </p>
            <p>
              All prices are listed in the currency specified on the product page and exclude
              applicable taxes and shipping fees unless otherwise stated. We reserve the right to
              modify prices at any time without prior notice. In the event of a pricing error, we
              will notify you and give you the option to confirm the order at the corrected price or
              cancel it.
            </p>
            <p>
              Product availability is subject to change. If a product becomes unavailable after you
              place an order, we will notify you and issue a full refund.
            </p>
          </section>

          <section id="terms-payments">
            <h2>4. Payment Terms</h2>
            <p>
              We accept major credit cards (Visa, Mastercard, American Express, Discover), PayPal,
              and other payment methods as indicated at checkout. Payment is due at the time of
              purchase. Your payment information is processed securely by our third-party payment
              processors and is never stored on our servers.
            </p>
            <p>
              By providing a payment method, you represent and warrant that you are authorized to
              use the designated payment method and authorize us to charge the full order amount.
              All transactions are subject to fraud review. We reserve the right to refuse or cancel
              any order if we suspect fraudulent activity.
            </p>
          </section>

          <section id="terms-shipping">
            <h2>5. Shipping &amp; Delivery</h2>
            <p>
              We offer domestic and international shipping. Estimated delivery times are provided at
              checkout and are based on the shipping method selected. Delivery times are estimates
              only and are not guaranteed.
            </p>
            <p>
              Risk of loss and title for products purchased from us pass to you upon delivery of the
              items to the carrier. We are not responsible for delays caused by carriers, customs
              processing, or events outside our reasonable control.
            </p>
            <p>
              Shipping costs, if applicable, will be displayed at checkout before you complete your
              purchase. Any customs duties, taxes, or import fees are the responsibility of the
              buyer.
            </p>
          </section>

          <section id="terms-returns">
            <h2>6. Returns, Refunds &amp; Cancellations</h2>
            <p>
              We want you to love your purchase. If you are not completely satisfied, you may return
              most items within 30 days of delivery for a full refund or exchange, subject to the
              following conditions:
            </p>
            <ul>
              <li>
                Items must be unused, in their original packaging, and in the same condition as
                received
              </li>
              <li>Proof of purchase (order number or receipt) is required</li>
              <li>
                Return shipping costs are the responsibility of the buyer unless the item is
                defective or incorrect
              </li>
              <li>
                Final sale items, personalized products, and perishable goods are not eligible for
                return
              </li>
            </ul>
            <p>
              Once we receive and inspect your return, we will process the refund within 5&ndash;7
              business days. Refunds will be issued to the original payment method. Original
              shipping charges are non-refundable.
            </p>
            <p>
              To cancel an order, please contact us as soon as possible. Orders that have already
              been shipped cannot be cancelled and must be processed as returns.
            </p>
          </section>

          <section id="terms-intellectual-property">
            <h2>7. Intellectual Property Rights</h2>
            <p>
              All content on the Service, including text, graphics, logos, images, software, and the
              overall design and arrangement thereof (collectively, &ldquo;Content&rdquo;), is the
              property of APAN or its licensors and is protected by copyright, trademark, and other
              intellectual property laws.
            </p>
            <p>You may not:</p>
            <ul>
              <li>
                Reproduce, distribute, modify, or create derivative works of any Content without our
                prior written consent
              </li>
              <li>
                Use any trademarks, service marks, or trade dress without our prior written consent
              </li>
              <li>
                Remove, alter, or obscure any copyright or other proprietary notices on the Content
              </li>
            </ul>
            <p>
              We grant you a limited, non-exclusive, non-transferable license to access and use the
              Service for personal, non-commercial purposes in accordance with these Terms.
            </p>
          </section>

          <section id="terms-liability">
            <h2>8. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by applicable law, APAN and its affiliates, officers,
              directors, employees, and agents shall not be liable for any indirect, incidental,
              special, consequential, or punitive damages arising out of or related to your use of
              the Service, including but not limited to loss of profits, data, or goodwill.
            </p>
            <p>
              Our total liability to you for any claim arising out of or relating to these Terms or
              the Service shall not exceed the amount you have paid to us in the twelve (12) months
              preceding the event giving rise to the claim.
            </p>
            <p>
              Some jurisdictions do not allow the exclusion or limitation of certain damages, so
              some or all of the above exclusions or limitations may not apply to you.
            </p>
          </section>

          <section id="terms-privacy">
            <h2>9. Privacy &amp; Data Protection</h2>
            <p>
              Your privacy is important to us. Our
              <NuxtLink to="/privacy" class="text-primary-600 underline hover:text-primary-700">
                Privacy Policy
              </NuxtLink>
              explains how we collect, use, and protect your personal information. By using the
              Service, you consent to the collection and use of your information as described in the
              Privacy Policy.
            </p>
            <p>
              We implement reasonable technical and organizational measures to safeguard your
              personal data. However, no method of transmission or storage is completely secure, and
              we cannot guarantee absolute security.
            </p>
          </section>

          <section id="terms-governing-law">
            <h2>10. Governing Law &amp; Dispute Resolution</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the
              State of California, without regard to its conflict of law principles. Any dispute
              arising out of or relating to these Terms or the Service shall be resolved through
              binding arbitration in accordance with the rules of the American Arbitration
              Association.
            </p>
            <p>
              You agree that any cause of action arising out of or related to the Service must
              commence within one (1) year after the cause of action accrues; otherwise, such cause
              of action is permanently barred.
            </p>
          </section>

          <section id="terms-contact">
            <h2>11. Contact Information</h2>
            <p>
              If you have any questions, concerns, or requests regarding these Terms, please contact
              us:
            </p>
            <address class="not-italic">
              <p><strong>APAN Legal Department</strong></p>
              <p>123 Market Street, Suite 400</p>
              <p>San Francisco, CA 94105</p>
              <p>United States</p>
              <p class="mt-2">
                Email:
                <a
                  href="mailto:legal@apan.store"
                  class="text-primary-600 underline hover:text-primary-700"
                  >legal@apan.store</a
                >
              </p>
              <p>
                Phone:
                <a href="tel:+18005551234" class="text-primary-600 underline hover:text-primary-700"
                  >+1 (800) 555-1234</a
                >
              </p>
            </address>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSeoMeta } from '#imports'

definePageMeta({
  layout: 'default',
})

useSeoMeta({
  title: 'Terms & Conditions - APAN Store',
  description:
    'Review the Terms & Conditions for APAN Store, including account registration, payment terms, shipping policies, returns, and legal agreements.',
  ogTitle: 'Terms & Conditions - APAN Store',
  ogDescription:
    'Review the Terms & Conditions for APAN Store, including account registration, payment terms, shipping policies, returns, and legal agreements.',
})

interface TocSection {
  id: string
  label: string
}

const sections: TocSection[] = [
  { id: 'terms-intro', label: 'Introduction' },
  { id: 'terms-account', label: 'Account & Security' },
  { id: 'terms-products', label: 'Products & Pricing' },
  { id: 'terms-payments', label: 'Payment Terms' },
  { id: 'terms-shipping', label: 'Shipping & Delivery' },
  { id: 'terms-returns', label: 'Returns & Refunds' },
  { id: 'terms-intellectual-property', label: 'Intellectual Property' },
  { id: 'terms-liability', label: 'Limitation of Liability' },
  { id: 'terms-privacy', label: 'Privacy & Data' },
  { id: 'terms-governing-law', label: 'Governing Law' },
  { id: 'terms-contact', label: 'Contact' },
]

const lastUpdated = 'January 15, 2025'
const mobileTocOpen = ref(false)
const activeSection = ref(sections[0].id)

const sectionIds = sections.map((s) => s.id)

function scrollTo(id: string) {
  mobileTocOpen.value = false
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          activeSection.value = entry.target.id
        }
      }
    },
    {
      rootMargin: '-80px 0px -60% 0px',
    },
  )

  for (const id of sectionIds) {
    const el = document.getElementById(id)
    if (el) observer.observe(el)
  }

  onUnmounted(() => observer.disconnect())
})
</script>

<style scoped>
.prose h2 {
  margin-top: 2.5rem;
  margin-bottom: 1rem;
  font-size: 1.375rem;
  font-weight: 700;
  line-height: 1.3;
  color: rgb(17 24 39);
  scroll-margin-top: 6rem;
}

.prose h2:first-child {
  margin-top: 0;
}

.prose p {
  margin-bottom: 1rem;
  line-height: 1.75;
  color: rgb(75 85 99);
}

.prose ul {
  margin-bottom: 1rem;
  padding-left: 1.5rem;
  list-style: disc;
  color: rgb(75 85 99);
}

.prose li {
  margin-bottom: 0.375rem;
  line-height: 1.625;
}

.prose section {
  margin-bottom: 2.5rem;
}

.prose section:last-child {
  margin-bottom: 0;
}

.prose address {
  margin-top: 0.5rem;
  line-height: 1.75;
  color: rgb(75 85 99);
}

@media print {
  nav,
  aside,
  footer,
  header,
  .container-page > div:first-child {
    display: none !important;
  }

  .container-page {
    max-width: 100% !important;
    padding: 0 !important;
  }

  .prose h2 {
    color: black !important;
    margin-top: 1.5rem;
  }

  .prose p,
  .prose li,
  .prose address {
    color: black !important;
  }

  .prose a {
    color: black !important;
    text-decoration: underline !important;
  }

  body {
    background: white !important;
  }
}
</style>
