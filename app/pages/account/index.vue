<template>
  <div class="max-w-4xl mx-auto px-4 py-8">
    <h1 class="text-2xl font-semibold mb-6">My Account</h1>

    <Tabs :tabs="tabOptions" :model-value="activeTab" @update:model-value="onTabChange">
      <template #profile>
        <AccountProfile />
      </template>
      <template #orders>
        <AccountOrders />
      </template>
      <template #addresses>
        <AccountAddresses />
      </template>
      <template #settings>
        <AccountSettings />
      </template>
    </Tabs>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

const route = useRoute()
const router = useRouter()

const tabOptions = [
  { value: 'profile', label: 'Profile' },
  { value: 'orders', label: 'Orders' },
  { value: 'addresses', label: 'Addresses' },
  { value: 'settings', label: 'Settings' },
]

function getTabFromQuery(): string {
  const tab = route.query.tab as string | undefined
  if (tab && tabOptions.some((t) => t.value === tab)) {
    return tab
  }
  return route.hash?.slice(1) || 'profile'
}

const activeTab = ref(getTabFromQuery())

watch(
  () => route.query.tab,
  (newTab) => {
    if (newTab && tabOptions.some((t) => t.value === newTab)) {
      activeTab.value = newTab as string
    }
  },
)

function onTabChange(value: string) {
  activeTab.value = value
  router.replace({ query: { tab: value } })
}
</script>
