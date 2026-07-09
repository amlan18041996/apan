<template>
  <div>
    <section class="border-b border-border bg-gray-50 py-6 md:py-8">
      <div class="container-page">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 class="text-2xl font-bold text-text md:text-3xl">Dashboard</h1>
            <p class="mt-1 text-sm text-text-muted">{{ dateRangeDisplay }}</p>
          </div>
          <div class="flex items-center gap-3">
            <div class="flex items-center gap-2">
              <button
                v-for="p in datePresets"
                :key="p.value"
                type="button"
                class="rounded-lg px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                :class="
                  selectedPreset === p.value
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-text-muted hover:bg-gray-100 hover:text-text'
                "
                @click="selectPreset(p.value)"
              >
                {{ p.label }}
              </button>
            </div>
            <button
              type="button"
              class="btn-secondary inline-flex items-center gap-1.5 px-3 py-1.5 text-sm"
              :disabled="refreshing"
              @click="refreshData"
            >
              <svg
                class="h-4 w-4"
                :class="{ 'animate-spin': refreshing }"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh
            </button>
            <label class="flex items-center gap-2 text-sm text-text-muted">
              <input
                v-model="autoRefresh"
                type="checkbox"
                class="h-4 w-4 rounded border-border text-primary-600 focus:ring-primary-500"
              />
              Auto-refresh
            </label>
          </div>
        </div>
      </div>
    </section>

    <section v-if="error" class="container-page py-6">
      <div class="rounded-xl border border-red-200 bg-red-50 p-4">
        <div class="flex items-center gap-3">
          <svg
            class="h-5 w-5 shrink-0 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <div class="flex-1">
            <p class="text-sm font-medium text-red-800">Failed to load dashboard data</p>
            <p class="mt-0.5 text-sm text-red-600">{{ error }}</p>
          </div>
          <button
            type="button"
            class="rounded-lg bg-red-100 px-3 py-1.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-200"
            @click="refreshData"
          >
            Retry
          </button>
        </div>
      </div>
    </section>

    <section class="container-page py-6">
      <div v-if="loading" class="space-y-6">
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div v-for="n in 4" :key="n" class="card animate-pulse p-5">
            <div class="mb-3 h-4 w-20 rounded bg-gray-200" />
            <div class="mb-2 h-8 w-28 rounded bg-gray-200" />
            <div class="h-4 w-16 rounded bg-gray-200" />
          </div>
        </div>
        <div class="grid gap-6 lg:grid-cols-2">
          <div class="card animate-pulse p-6">
            <div class="mb-4 h-5 w-32 rounded bg-gray-200" />
            <div class="h-52 rounded bg-gray-100" />
          </div>
          <div class="card animate-pulse p-6">
            <div class="mb-4 h-5 w-32 rounded bg-gray-200" />
            <div class="space-y-3">
              <div v-for="n in 5" :key="n" class="flex gap-3">
                <div class="h-8 w-full rounded bg-gray-100" />
              </div>
            </div>
          </div>
        </div>
        <div class="grid gap-6 lg:grid-cols-2">
          <div class="card animate-pulse p-6">
            <div class="mb-4 h-5 w-32 rounded bg-gray-200" />
            <div class="space-y-3">
              <div v-for="n in 5" :key="n" class="flex gap-3">
                <div class="h-10 w-full rounded bg-gray-100" />
              </div>
            </div>
          </div>
          <div class="card animate-pulse p-6">
            <div class="mb-4 h-5 w-32 rounded bg-gray-200" />
            <div class="space-y-3">
              <div v-for="n in 3" :key="n" class="flex gap-3">
                <div class="h-10 w-full rounded bg-gray-100" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="space-y-6">
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <NuxtLink
            to="/admin/orders"
            class="card group cursor-pointer p-5 transition-shadow hover:shadow-soft-lg"
          >
            <div class="flex items-start justify-between">
              <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <svg
                  class="h-5 w-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <span
                v-if="dashboardData.stats.totalSales.trend !== 0"
                class="inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium"
                :class="
                  dashboardData.stats.totalSales.trend > 0
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                "
              >
                <svg
                  v-if="dashboardData.stats.totalSales.trend > 0"
                  class="h-3 w-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                  />
                </svg>
                <svg
                  v-else
                  class="h-3 w-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
                {{ Math.abs(dashboardData.stats.totalSales.trend).toFixed(1) }}%
              </span>
            </div>
            <p class="mt-4 text-sm text-text-muted group-hover:text-primary-600">Total Sales</p>
            <p class="mt-1 text-2xl font-bold text-text">
              ${{ formatCurrency(dashboardData.stats.totalSales.value) }}
            </p>
          </NuxtLink>
          <NuxtLink
            to="/admin/orders"
            class="card group cursor-pointer p-5 transition-shadow hover:shadow-soft-lg"
          >
            <div class="flex items-start justify-between">
              <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <svg
                  class="h-5 w-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              </div>
              <span
                v-if="dashboardData.stats.ordersCount.trend !== 0"
                class="inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium"
                :class="
                  dashboardData.stats.ordersCount.trend > 0
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                "
              >
                <svg
                  v-if="dashboardData.stats.ordersCount.trend > 0"
                  class="h-3 w-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                  />
                </svg>
                <svg
                  v-else
                  class="h-3 w-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
                {{ Math.abs(dashboardData.stats.ordersCount.trend).toFixed(1) }}%
              </span>
            </div>
            <p class="mt-4 text-sm text-text-muted group-hover:text-primary-600">Orders</p>
            <p class="mt-1 text-2xl font-bold text-text">
              {{ formatNumber(dashboardData.stats.ordersCount.value) }}
            </p>
          </NuxtLink>
          <NuxtLink
            to="/admin/customers"
            class="card group cursor-pointer p-5 transition-shadow hover:shadow-soft-lg"
          >
            <div class="flex items-start justify-between">
              <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                <svg
                  class="h-5 w-5 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                  />
                </svg>
              </div>
              <span
                v-if="dashboardData.stats.totalCustomers.trend !== 0"
                class="inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium"
                :class="
                  dashboardData.stats.totalCustomers.trend > 0
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                "
              >
                <svg
                  v-if="dashboardData.stats.totalCustomers.trend > 0"
                  class="h-3 w-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                  />
                </svg>
                <svg
                  v-else
                  class="h-3 w-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
                {{ Math.abs(dashboardData.stats.totalCustomers.trend).toFixed(1) }}%
              </span>
            </div>
            <p class="mt-4 text-sm text-text-muted group-hover:text-primary-600">Customers</p>
            <p class="mt-1 text-2xl font-bold text-text">
              {{ formatNumber(dashboardData.stats.totalCustomers.value) }}
            </p>
          </NuxtLink>
          <NuxtLink
            to="/admin/products"
            class="card group cursor-pointer p-5 transition-shadow hover:shadow-soft-lg"
          >
            <div class="flex items-start justify-between">
              <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                <svg
                  class="h-5 w-5 text-amber-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <span
                v-if="dashboardData.stats.productsCount.trend !== 0"
                class="inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium"
                :class="
                  dashboardData.stats.productsCount.trend > 0
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                "
              >
                <svg
                  v-if="dashboardData.stats.productsCount.trend > 0"
                  class="h-3 w-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                  />
                </svg>
                <svg
                  v-else
                  class="h-3 w-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
                {{ Math.abs(dashboardData.stats.productsCount.trend).toFixed(1) }}%
              </span>
            </div>
            <p class="mt-4 text-sm text-text-muted group-hover:text-primary-600">Products</p>
            <p class="mt-1 text-2xl font-bold text-text">
              {{ formatNumber(dashboardData.stats.productsCount.value) }}
            </p>
          </NuxtLink>
        </div>

        <div class="grid gap-6 lg:grid-cols-2">
          <div class="card p-4 md:p-6">
            <div class="mb-4 flex items-center justify-between">
              <h2 class="text-lg font-semibold text-text">Sales</h2>
              <div class="flex gap-1">
                <button
                  v-for="opt in chartPeriods"
                  :key="opt.value"
                  type="button"
                  class="rounded-md px-2.5 py-1 text-xs font-medium transition-colors"
                  :class="
                    chartPeriod === opt.value
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-text-muted hover:bg-gray-100 hover:text-text'
                  "
                  @click="chartPeriod = opt.value"
                >
                  {{ opt.label }}
                </button>
              </div>
            </div>
            <div
              v-if="salesData.length === 0"
              class="flex flex-col items-center justify-center py-12 text-center"
            >
              <svg
                class="h-10 w-10 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <p class="mt-3 text-sm font-medium text-text-muted">No sales data for this period</p>
            </div>
            <div v-else class="relative">
              <svg
                :viewBox="`0 0 ${chartWidth} ${chartHeight}`"
                class="w-full"
                style="max-height: 220px"
                preserveAspectRatio="xMidYMid meet"
              >
                <line
                  v-for="(label, i) in yAxisLabels"
                  :key="'grid-' + i"
                  :x1="paddingLeft"
                  :y1="label.y"
                  :x2="chartWidth - paddingRight"
                  :y2="label.y"
                  stroke="currentColor"
                  class="text-gray-200"
                  stroke-width="1"
                  stroke-dasharray="4"
                />
                <text
                  v-for="(label, i) in yAxisLabels"
                  :key="'ylabel-' + i"
                  :x="paddingLeft - 8"
                  :y="label.y + 4"
                  text-anchor="end"
                  class="fill-gray-400"
                  font-size="11"
                >
                  {{ label.text }}
                </text>
                <rect
                  v-for="(point, i) in salesData"
                  :key="'bar-' + i"
                  :x="getBarX(i)"
                  :y="getBarY(point.amount)"
                  :width="barWidth"
                  :height="getBarHeight(point.amount)"
                  rx="3"
                  class="fill-primary-500/80 hover:fill-primary-500 transition-colors cursor-pointer"
                >
                  <title>{{ formatDate(point.date) }}: ${{ formatCurrency(point.amount) }}</title>
                </rect>
                <text
                  v-for="(point, i) in visibleXLabels"
                  :key="'xlabel-' + i"
                  :x="getBarX(point.index) + barWidth / 2"
                  :y="chartHeight - 6"
                  text-anchor="middle"
                  class="fill-gray-400"
                  font-size="10"
                >
                  {{ point.label }}
                </text>
              </svg>
            </div>
          </div>

          <div class="card p-4 md:p-6">
            <div class="mb-4 flex items-center justify-between">
              <h2 class="text-lg font-semibold text-text">Recent Orders</h2>
              <NuxtLink
                to="/admin/orders"
                class="text-sm font-medium text-primary-600 hover:text-primary-500"
              >
                View All &rarr;
              </NuxtLink>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-left text-sm">
                <thead>
                  <tr class="border-b border-border text-text-muted">
                    <th class="pb-2 font-medium">Order</th>
                    <th class="pb-2 font-medium">Customer</th>
                    <th class="hidden pb-2 font-medium sm:table-cell">Date</th>
                    <th class="pb-2 font-medium">Status</th>
                    <th class="pb-2 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="order in dashboardData.recentOrders"
                    :key="order.id"
                    class="border-b border-border/50 transition-colors hover:bg-gray-50"
                  >
                    <td class="py-2.5 pr-2">
                      <NuxtLink
                        :to="`/admin/orders/${order.id.split('/').pop()}`"
                        class="font-medium text-primary-600 hover:text-primary-500"
                      >
                        {{ order.orderNumber }}
                      </NuxtLink>
                    </td>
                    <td class="py-2.5 pr-2 text-text">{{ order.customerName }}</td>
                    <td class="hidden py-2.5 pr-2 text-text-muted sm:table-cell">
                      {{ formatDate(order.date) }}
                    </td>
                    <td class="py-2.5 pr-2">
                      <span
                        class="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium"
                        :class="statusClass(order.status)"
                      >
                        {{ order.status.charAt(0).toUpperCase() + order.status.slice(1) }}
                      </span>
                    </td>
                    <td class="py-2.5 text-right font-medium text-text">
                      ${{ formatCurrency(order.total) }}
                    </td>
                  </tr>
                </tbody>
              </table>
              <p
                v-if="dashboardData.recentOrders.length === 0"
                class="py-8 text-center text-sm text-text-muted"
              >
                No orders yet
              </p>
            </div>
          </div>
        </div>

        <div class="grid gap-6 lg:grid-cols-2">
          <div class="card p-4 md:p-6">
            <h2 class="mb-4 text-lg font-semibold text-text">Top Products</h2>
            <div class="divide-y divide-border/50">
              <div
                v-for="product in dashboardData.topProducts"
                :key="product.id"
                class="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
              >
                <span
                  class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                  :class="
                    product.rank <= 3
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-gray-100 text-text-muted'
                  "
                >
                  {{ product.rank }}
                </span>
                <NuxtLink
                  :to="`/products/${product.handle}`"
                  class="h-8 w-8 shrink-0 overflow-hidden rounded-lg bg-gray-100"
                >
                  <img
                    :src="product.thumbnail"
                    :alt="product.productName"
                    class="h-full w-full object-cover"
                    loading="lazy"
                  />
                </NuxtLink>
                <div class="min-w-0 flex-1">
                  <NuxtLink
                    :to="`/admin/products/${product.id.split('/').pop()}`"
                    class="text-sm font-medium text-text hover:text-primary-600"
                  >
                    {{ product.productName }}
                  </NuxtLink>
                </div>
                <div class="text-right">
                  <p class="text-sm font-medium text-text">{{ product.unitsSold }} sold</p>
                  <p class="text-xs text-text-muted">${{ formatCurrency(product.revenue) }}</p>
                </div>
              </div>
            </div>
            <p
              v-if="dashboardData.topProducts.length === 0"
              class="py-8 text-center text-sm text-text-muted"
            >
              No product sales data for this period
            </p>
          </div>

          <div class="card p-4 md:p-6">
            <button
              type="button"
              class="flex w-full items-center justify-between"
              @click="lowStockOpen = !lowStockOpen"
            >
              <h2 class="text-lg font-semibold text-text">Low Stock Alerts</h2>
              <svg
                class="h-5 w-5 text-text-muted transition-transform"
                :class="{ 'rotate-180': lowStockOpen }"
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
            <div v-if="lowStockOpen" class="mt-4">
              <div v-if="dashboardData.lowStockProducts.length > 0">
                <div class="divide-y divide-border/50">
                  <div
                    v-for="product in dashboardData.lowStockProducts"
                    :key="product.id"
                    class="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <NuxtLink
                      :to="`/products/${product.handle}`"
                      class="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-gray-100"
                    >
                      <img
                        :src="product.thumbnail"
                        :alt="product.productName"
                        class="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </NuxtLink>
                    <div class="min-w-0 flex-1">
                      <NuxtLink
                        :to="`/admin/products/${product.id.split('/').pop()}`"
                        class="text-sm font-medium text-text hover:text-primary-600"
                      >
                        {{ product.productName }}
                      </NuxtLink>
                    </div>
                    <div class="flex items-center gap-3">
                      <span
                        class="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium"
                        :class="stockClass(product.stock)"
                      >
                        <span
                          class="h-1.5 w-1.5 rounded-full"
                          :class="product.stock === 0 ? 'bg-red-500' : 'bg-orange-400'"
                        />
                        {{ product.stock }} left
                      </span>
                      <button
                        type="button"
                        class="rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-text-muted transition-colors hover:border-primary-300 hover:text-primary-600"
                        @click="restockProduct(product)"
                      >
                        Restock
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="flex items-center gap-2 py-8 text-center">
                <svg
                  class="mx-auto h-8 w-8 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p class="text-sm text-green-700">All products are well-stocked</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { DashboardResponse } from '~/server/api/admin/dashboard.get'

definePageMeta({
  layout: 'default',
})

useSeoMeta({
  title: 'Dashboard - APAN Store Admin',
  description: 'Admin dashboard for APAN Store performance overview.',
  robots: 'noindex',
})

const toast = useToast()

const CHART_HEIGHT = 220
const PADDING_LEFT = 48
const PADDING_RIGHT = 16
const PADDING_TOP = 16
const PADDING_BOTTOM = 32

const chartWidth = 600
const chartHeight = CHART_HEIGHT

const datePresets = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'quarter', label: 'This Quarter' },
  { value: 'year', label: 'This Year' },
  { value: 'all', label: 'All Time' },
]

const selectedPreset = ref('week')
const autoRefresh = ref(false)
const lowStockOpen = ref(true)
const chartPeriod = ref('week')
const refreshing = ref(false)
let refreshTimer: ReturnType<typeof setInterval> | null = null

function getDateRange() {
  const now = new Date()
  const end = new Date(now)
  let start: Date

  switch (selectedPreset.value) {
    case 'today':
      start = new Date(now)
      start.setHours(0, 0, 0, 0)
      break
    case 'week':
      start = new Date(now)
      start.setDate(now.getDate() - now.getDay())
      start.setHours(0, 0, 0, 0)
      break
    case 'month':
      start = new Date(now.getFullYear(), now.getMonth(), 1)
      break
    case 'quarter': {
      const q = Math.floor(now.getMonth() / 3)
      start = new Date(now.getFullYear(), q * 3, 1)
      break
    }
    case 'year':
      start = new Date(now.getFullYear(), 0, 1)
      break
    case 'all':
      start = new Date(2020, 0, 1)
      break
    default:
      start = new Date(now)
      start.setDate(now.getDate() - 7)
  }

  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  }
}

const dateRangeDisplay = computed(() => {
  const range = getDateRange()
  if (selectedPreset.value === 'today') {
    return formatDate(range.startDate)
  }
  return `${formatDate(range.startDate)} - ${formatDate(range.endDate)}`
})

const apiParams = computed(() => {
  const range = getDateRange()
  return { ...range, period: chartPeriod.value }
})

const {
  data: dashboardData,
  error,
  status,
  refresh,
} = useAsyncData<DashboardResponse>(
  'admin-dashboard',
  () => $fetch('/api/admin/dashboard', { params: apiParams.value }),
  {
    default: () => ({
      stats: {
        totalSales: { value: 0, trend: 0, label: '' },
        ordersCount: { value: 0, trend: 0, label: '' },
        totalCustomers: { value: 0, trend: 0, label: '' },
        productsCount: { value: 0, trend: 0, label: '' },
      },
      recentOrders: [],
      salesData: [],
      topProducts: [],
      lowStockProducts: [],
    }),
    watch: [apiParams],
  },
)

const loading = computed(() => status.value === 'pending')

async function refreshData() {
  refreshing.value = true
  await refresh()
  refreshing.value = false
}

function selectPreset(value: string) {
  selectedPreset.value = value
}

watch(autoRefresh, (val) => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
  if (val) {
    refreshTimer = setInterval(() => refresh(), 30000)
  }
})

onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
})

const salesData = computed(() => dashboardData.value.salesData)

const chartPeriods = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'quarter', label: 'Quarter' },
  { value: 'year', label: 'Year' },
]

const maxSaleValue = computed(() => {
  if (salesData.value.length === 0) return 100
  return Math.max(...salesData.value.map((d) => d.amount)) * 1.15
})

const yAxisLabels = computed(() => {
  const max = maxSaleValue.value
  const steps = 4
  const labels = []
  for (let i = 0; i <= steps; i++) {
    const val = (max / steps) * i
    const y =
      chartHeight - PADDING_BOTTOM - (val / max) * (chartHeight - PADDING_TOP - PADDING_BOTTOM)
    labels.push({
      text: val >= 1000 ? `$${(val / 1000).toFixed(1)}k` : `$${Math.round(val)}`,
      y,
      value: val,
    })
  }
  return labels
})

const chartAreaWidth = computed(() => chartWidth - PADDING_LEFT - PADDING_RIGHT)
const barWidth = computed(() => {
  const count = salesData.value.length
  if (count === 0) return 0
  const totalGap = (count - 1) * 4
  const available = chartAreaWidth.value - totalGap
  return Math.max(4, Math.min(32, available / count))
})

function getBarX(index: number): number {
  return PADDING_LEFT + index * (barWidth.value + 4)
}

function getBarY(value: number): number {
  const max = maxSaleValue.value
  const barHeight = (value / max) * (chartHeight - PADDING_TOP - PADDING_BOTTOM)
  return chartHeight - PADDING_BOTTOM - barHeight
}

function getBarHeight(value: number): number {
  const max = maxSaleValue.value
  return Math.max(2, (value / max) * (chartHeight - PADDING_TOP - PADDING_BOTTOM))
}

const visibleXLabels = computed(() => {
  const data = salesData.value
  if (data.length === 0) return []
  const count = data.length
  let step = 1
  if (count > 7) step = Math.ceil(count / 7)
  const labels: { index: number; label: string }[] = []
  for (let i = 0; i < count; i += step) {
    labels.push({ index: i, label: data[i].period.split(',')[0] })
  }
  if (labels.length === 0 || labels[labels.length - 1]?.index !== count - 1) {
    labels.push({ index: count - 1, label: data[count - 1].period.split(',')[0] })
  }
  return labels
})

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return n.toLocaleString('en-US')
}

function formatCurrency(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function statusClass(status: string): string {
  const classes: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    processing: 'bg-indigo-100 text-indigo-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-gray-100 text-gray-600',
  }
  return classes[status] || 'bg-gray-100 text-gray-600'
}

function stockClass(stock: number): string {
  return stock === 0
    ? 'bg-red-50 text-red-700 ring-1 ring-red-200'
    : 'bg-orange-50 text-orange-700 ring-1 ring-orange-200'
}

function restockProduct(product: { productName: string }) {
  toast.success(`Restock initiated for ${product.productName}`)
}
</script>
