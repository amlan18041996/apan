export interface DashboardStats {
  totalSales: { value: number; trend: number; label: string }
  ordersCount: { value: number; trend: number; label: string }
  totalCustomers: { value: number; trend: number; label: string }
  productsCount: { value: number; trend: number; label: string }
}

export interface RecentOrder {
  id: string
  orderNumber: string
  customerName: string
  date: string
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  total: number
}

export interface SalesDataPoint {
  period: string
  amount: number
  date: string
}

export interface TopProduct {
  rank: number
  id: string
  handle: string
  productName: string
  thumbnail: string
  unitsSold: number
  revenue: number
}

export interface LowStockProduct {
  id: string
  handle: string
  productName: string
  thumbnail: string
  stock: number
  threshold: number
}

export interface DashboardResponse {
  stats: DashboardStats
  recentOrders: RecentOrder[]
  salesData: SalesDataPoint[]
  topProducts: TopProduct[]
  lowStockProducts: LowStockProduct[]
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const salesChartData = generateSalesData(query.period as string)
  const recentOrders = generateRecentOrders()
  const topProducts = generateTopProducts()
  const lowStockProducts = generateLowStockProducts()

  return {
    stats: {
      totalSales: { value: 12450.0, trend: 12.5, label: 'Total Sales' },
      ordersCount: { value: 156, trend: -2.1, label: 'Orders' },
      totalCustomers: { value: 1234, trend: 5.3, label: 'Customers' },
      productsCount: { value: 567, trend: 8.2, label: 'Products' },
    },
    recentOrders,
    salesData: salesChartData,
    topProducts,
    lowStockProducts,
  }
})

function generateSalesData(period: string): SalesDataPoint[] {
  const now = new Date()
  const data: SalesDataPoint[] = []

  let days: number
  switch (period) {
    case 'today':
      days = 1
      break
    case 'week':
      days = 7
      break
    case 'month':
      days = 30
      break
    case 'quarter':
      days = 90
      break
    case 'year':
      days = 365
      break
    default:
      days = 7
  }

  const interval = days <= 7 ? 'day' : days <= 30 ? 'day' : days <= 90 ? 'week' : 'month'

  for (let i = days; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)

    let periodLabel: string
    let dateStr: string

    if (interval === 'day') {
      periodLabel = date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })
      dateStr = date.toISOString().split('T')[0]
    } else if (interval === 'week') {
      const weekStart = new Date(date)
      weekStart.setDate(date.getDate() - date.getDay())
      periodLabel = `W${getWeekNumber(date)}`
      dateStr = weekStart.toISOString().split('T')[0]
    } else {
      periodLabel = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      dateStr = date.toISOString().split('T')[0]
    }

    const amount = Math.round((Math.random() * 2000 + 100) * 100) / 100

    data.push({
      period: periodLabel,
      amount,
      date: dateStr,
    })
  }

  return data
}

function getWeekNumber(date: Date): number {
  const firstDay = new Date(date.getFullYear(), 0, 1)
  const pastDays = (date.getTime() - firstDay.getTime()) / 86400000
  return Math.ceil((pastDays + firstDay.getDay() + 1) / 7)
}

const statuses: RecentOrder['status'][] = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
]

function generateRecentOrders(): RecentOrder[] {
  const customers = [
    'Olivia Chen',
    'Marcus Johnson',
    'Sophia Williams',
    'Ethan Brown',
    'Isabella Martinez',
    'James Wilson',
    'Mia Anderson',
    'Alexander Taylor',
    'Charlotte Thomas',
    'Benjamin Garcia',
    'Amelia Robinson',
    'Lucas Clark',
    'Harper Lewis',
    'Henry Walker',
    'Evelyn Hall',
  ]

  const orders: RecentOrder[] = []
  const now = new Date()

  for (let i = 0; i < 10; i++) {
    const date = new Date(now)
    date.setHours(date.getHours() - i * 4 - Math.floor(Math.random() * 3))

    orders.push({
      id: `gid://shopify/Order/${1000 + i}`,
      orderNumber: `#${1023 + i}`,
      customerName: customers[i % customers.length],
      date: date.toISOString(),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      total: Math.round((Math.random() * 500 + 20) * 100) / 100,
    })
  }

  return orders
}

const demoProducts = [
  {
    id: 'gid://shopify/Product/1',
    handle: 'classic-leather-jacket',
    name: 'Classic Leather Jacket',
    thumbnail: 'https://picsum.photos/seed/jacket/64/64',
  },
  {
    id: 'gid://shopify/Product/2',
    handle: 'wireless-bluetooth-headphones',
    name: 'Wireless Bluetooth Headphones',
    thumbnail: 'https://picsum.photos/seed/headphones/64/64',
  },
  {
    id: 'gid://shopify/Product/3',
    handle: 'organic-cotton-t-shirt',
    name: 'Organic Cotton T-Shirt',
    thumbnail: 'https://picsum.photos/seed/tshirt/64/64',
  },
  {
    id: 'gid://shopify/Product/4',
    handle: 'minimalist-watch',
    name: 'Minimalist Watch',
    thumbnail: 'https://picsum.photos/seed/watch/64/64',
  },
  {
    id: 'gid://shopify/Product/5',
    handle: 'ceramic-coffee-mug',
    name: 'Ceramic Coffee Mug',
    thumbnail: 'https://picsum.photos/seed/mug/64/64',
  },
  {
    id: 'gid://shopify/Product/6',
    handle: 'yoga-mat-premium',
    name: 'Premium Yoga Mat',
    thumbnail: 'https://picsum.photos/seed/yoga/64/64',
  },
  {
    id: 'gid://shopify/Product/7',
    handle: 'denim-backpack',
    name: 'Denim Backpack',
    thumbnail: 'https://picsum.photos/seed/backpack/64/64',
  },
  {
    id: 'gid://shopify/Product/8',
    handle: 'scented-candle-set',
    name: 'Scented Candle Set',
    thumbnail: 'https://picsum.photos/seed/candle/64/64',
  },
]

function generateTopProducts(): TopProduct[] {
  return demoProducts.slice(0, 8).map((p, i) => ({
    rank: i + 1,
    id: p.id,
    handle: p.handle,
    productName: p.name,
    thumbnail: p.thumbnail,
    unitsSold: Math.floor(Math.random() * 80 + 20),
    revenue: Math.round((Math.random() * 4000 + 500) * 100) / 100,
  }))
}

function generateLowStockProducts(): LowStockProduct[] {
  const lowStock = [
    {
      id: 'gid://shopify/Product/9',
      handle: 'limited-edition-sneakers',
      name: 'Limited Edition Sneakers',
      thumbnail: 'https://picsum.photos/seed/sneakers/64/64',
      stock: 2,
    },
    {
      id: 'gid://shopify/Product/10',
      handle: 'artisan-cheese-board',
      name: 'Artisan Cheese Board',
      thumbnail: 'https://picsum.photos/seed/cheese/64/64',
      stock: 0,
    },
    {
      id: 'gid://shopify/Product/11',
      handle: 'wool-scarf',
      name: 'Wool Scarf',
      thumbnail: 'https://picsum.photos/seed/scarf/64/64',
      stock: 4,
    },
    {
      id: 'gid://shopify/Product/12',
      handle: 'bamboo-sunglasses',
      name: 'Bamboo Sunglasses',
      thumbnail: 'https://picsum.photos/seed/sunglasses/64/64',
      stock: 3,
    },
    {
      id: 'gid://shopify/Product/13',
      handle: 'leather-wallet',
      name: 'Leather Wallet',
      thumbnail: 'https://picsum.photos/seed/wallet/64/64',
      stock: 1,
    },
  ]

  return lowStock.map((p) => ({
    id: p.id,
    handle: p.handle,
    productName: p.name,
    thumbnail: p.thumbnail,
    stock: p.stock,
    threshold: 5,
  }))
}
