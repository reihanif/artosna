<script setup>
  import moment from 'moment'
  import { Autoplay, EffectCards } from 'swiper/modules'
  import { Swiper, SwiperSlide } from 'swiper/vue'
  import { computed, onMounted, reactive, ref, watch } from 'vue'
  import { useBudgets } from '@/composables/useBudgets'
  import { useCurrencyFormatter } from '@/composables/useCurrencyFormatter'
  import { useExpenses } from '@/composables/useExpenses'
  import { useIncomes } from '@/composables/useIncomes'
  import { useWallets } from '@/composables/useWallets'

  const monthPicker = ref(false)
  const monthValue = ref(new Date())
  const monthDisplay = computed(() => {
    if (!monthValue.value) return null
    return moment(monthValue.value).format('MMMM YYYY')
  })

  const { fetchTotalExpensesByMonth, fetchExpensesByCategory, fetchExpensesByPocket } = useExpenses()
  const { fetchWalletsOverview } = useWallets()
  const { fetchTotalIncomesByMonth } = useIncomes()
  const { fetchTotalBudgetsByMonth } = useBudgets()
  const { formatCurrency } = useCurrencyFormatter()

  const overview = reactive({
    expenses: {
      value: 'Rp 0',
      trend: '',
      growth: '',
    },
    incomes: {
      value: 'Rp 0',
      trend: '',
      growth: '',
    },
    highestExpense: {
      value: 'Rp 0',
      category: '',
    },
    lowestExpense: {
      value: 'Rp 0',
      category: '',
    },
  })

  const barChartSeries = ref([
    {
      name: 'Expenses',
      data: [],
    },
    {
      name: 'Incomes',
      data: [],
    },
  ])

  const donutChartSeries = ref([])
  const donutChartLabels = ref([])

  const walletBarChartSeries = ref([])
  const walletBarChartCategories = ref([])

  const wallets = reactive({
    totalBalance: '0',
    items: null,
  })

  const totalBudgets = ref('0')

  async function setBarChartSeries (month) {
    const expensesData = await fetchTotalExpensesByMonth(month)
    const incomesData = await fetchTotalIncomesByMonth(month)

    const lastMonth = moment(month).subtract(1, 'month').toDate()
    const lastMonthExpensesData = await fetchTotalExpensesByMonth(lastMonth)
    const lastMonthIncomesData = await fetchTotalIncomesByMonth(lastMonth)

    const expenses = calculateGrowth(lastMonthExpensesData, expensesData)
    const incomes = calculateGrowth(lastMonthIncomesData, incomesData)

    barChartSeries.value = barChartSeries.value.map(item => {
      if (item.name === 'Expenses') return { ...item, data: [expensesData] }
      if (item.name === 'Incomes') return { ...item, data: [incomesData] }
      return item
    })

    overview.expenses.growth = expenses.growth
    overview.incomes.growth = incomes.growth
    overview.expenses.trend = expenses.trend
    overview.incomes.trend = incomes.trend
    overview.expenses.value = `Rp ${formatCurrency(expensesData)}`
    overview.incomes.value = `Rp ${formatCurrency(incomesData)}`
  }

  async function setDonutChartSeries (month) {
    const data = await fetchExpensesByCategory(month)
    const categories = data.map(item => item.category)
    const totals = data.map(item => item.total)

    donutChartLabels.value = categories
    donutChartSeries.value = totals

    const hasExpense = totals.length > 0
    const maxValue = Math.max(...totals)
    const maxIndex = totals.indexOf(maxValue)

    const minValue = Math.min(...totals)
    const minIndex = totals.indexOf(minValue)

    overview.highestExpense.value = `Rp ${hasExpense ? formatCurrency(maxValue) : 0}`
    overview.lowestExpense.value = `Rp ${hasExpense ? formatCurrency(minValue) : 0}`
    overview.highestExpense.category = hasExpense ? categories[maxIndex] : ''
    overview.lowestExpense.category = hasExpense ? categories[minIndex] : ''
  }

  async function setWalletBarChartSeries (month) {
    const data = await fetchExpensesByPocket(month)
    const categories = data.map(item => item.pocket)
    const totals = data.map(item => item.total)
    walletBarChartCategories.value = categories
    walletBarChartSeries.value = [{
      name: 'Expenses',
      data: totals,
    }]
  }

  async function setWallets () {
    const data = await fetchWalletsOverview()
    wallets.items = data
    const walletsTotalBalance = data.reduce((sum, item) => sum + item.balance, 0)
    wallets.totalBalance = `Rp ${formatCurrency(walletsTotalBalance)}`
  }

  async function setTotalBudgets (month) {
    const budgetsData = await fetchTotalBudgetsByMonth(month)
    totalBudgets.value = `Rp ${formatCurrency(budgetsData)}`
  }

  function calculateGrowth (oldValue, newValue) {
    if (oldValue === 0 && newValue === 0) {
      return { growth: '0%', trend: 'neutral' }
    }

    if (oldValue === 0) {
      return { growth: 'infinity', trend: 'uptrend' }
    }

    const growth = ((newValue - oldValue) / oldValue) * 100
    let trend = 'neutral'

    if (newValue > oldValue) {
      trend = 'uptrend'
    } else if (newValue < oldValue) {
      trend = 'downtrend'
    }

    const formattedGrowth = Number(growth.toFixed(2)).toString() + '%'

    return { growth: formattedGrowth, trend }
  }

  function setTrendBadgeColor (trend) {
    if (trend === 'neutral') return 'gray'
    return trend === 'uptrend' ? 'green' : 'red'
  }

  function setTrendBadgeIcon (trend) {
    if (trend === 'neutral') return 'mdi-trending-neutral'
    return trend === 'uptrend' ? 'mdi-trending-up' : 'mdi-trending-down'
  }

  onMounted(async () => {
    await setWallets()
    await setBarChartSeries(monthValue.value)
    await setDonutChartSeries(monthValue.value)
    await setWalletBarChartSeries(monthValue.value)
    await setTotalBudgets(monthValue.value)
  })

  watch(() => monthValue.value, async newMonth => {
    await setBarChartSeries(newMonth)
    await setDonutChartSeries(newMonth)
    await setWalletBarChartSeries(newMonth)
    await setTotalBudgets(newMonth)
  })
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold">Overview</h1>
      <div class="min-w-64">
        <v-text-field
          v-model="monthDisplay"
          autocomplete="off"
          density="compact"
          hide-details="auto"
          prepend-inner-icon="mdi-calendar-range"
          readonly
          variant="outlined"
          @click="monthPicker = true"
        />
        <app-month-picker v-model="monthPicker" v-model:selected-date="monthValue" />
      </div>
    </div>
    <div class="grid grid-cols-12 gap-4">
      <overview-card
        :badge-color="setTrendBadgeColor(overview.expenses.trend)"
        :badge-icon="setTrendBadgeIcon(overview.expenses.trend)"
        :badge-text="overview.expenses.growth"
        class="col-span-3"
        icon="mdi-invoice-export-outline"
        title="Expenses"
        :value="overview.expenses.value"
      />
      <overview-card
        :badge-color="setTrendBadgeColor(overview.incomes.trend)"
        :badge-icon="setTrendBadgeIcon(overview.incomes.trend)"
        :badge-text="overview.incomes.growth"
        class="col-span-3"
        icon="mdi-invoice-import-outline"
        title="Incomes"
        :value="overview.incomes.value"
      />
      <overview-card
        class="col-span-3"
        icon="mdi-transfer-up"
        info-icon="mdi-format-list-group"
        :info-label="overview.highestExpense.category"
        title="Highest Expense"
        :value="overview.highestExpense.value"
      />
      <overview-card
        class="col-span-3"
        icon="mdi-transfer-down"
        info-icon="mdi-format-list-group"
        :info-label="overview.lowestExpense.category"
        title="Lowest Expense"
        :value="overview.lowestExpense.value"
      />
      <v-card class="col-span-12 lg:col-span-8 overflow-visible">
        <v-card-text>
          <expenses-area-chart />
        </v-card-text>
      </v-card>
      <v-card class="col-span-6 lg:col-span-4 overflow-visible">
        <v-card-text>
          <top-spending-donut-chart :labels="donutChartLabels" :series="donutChartSeries" />
        </v-card-text>
      </v-card>
      <v-card class="col-span-6 lg:col-span-4">
        <v-card-text class="h-full flex flex-col">
          <div class="px-4 space-y-1.5 mb-4">
            <h2 class="text-xl font-bold">My Wallets</h2>
            <p>
              Total Balance :
              <span class="text-lg font-bold text-primary-600 dark:text-white">
                {{ wallets.totalBalance }}
              </span>
            </p>
          </div>
          <div class="flex-grow flex items-center justify-center">
            <div class="max-w-80">
              <swiper
                :autoplay="{
                  delay: 2500,
                  disableOnInteraction: false,
                }"
                :effect="'cards'"
                :grab-cursor="true"
                :modules="[Autoplay, EffectCards]"
              >
                <template v-for="(wallet, index) in wallets.items" :key="index">
                  <swiper-slide class="rounded-lg min-w-64">
                    <wallet-card
                      info-icon="mdi-format-list-group"
                      :title="wallet.name"
                      :value="`Rp ${formatCurrency(wallet.balance)}`"
                    />
                  </swiper-slide>
                </template>
              </swiper>
            </div>
          </div>
        </v-card-text>
      </v-card>
      <v-card class="col-span-12 lg:col-span-8 overflow-visible" elevation="0" rounded="lg">
        <v-card-text>
          <expenses-wallet-bar-chart :categories="walletBarChartCategories" :series="walletBarChartSeries" />
        </v-card-text>
      </v-card>
      <div class="col-span-12 lg:col-span-6">
        <v-card>
          <v-card-text class="px-8">
            <div class="mb-4">
              <h2 class="text-xl font-bold">Recent Activity</h2>
            </div>
            <recent-transactions-table />
          </v-card-text>
        </v-card>
      </div>
      <div class="col-span-12 lg:col-span-6">
        <v-card class="overflow-visible" elevation="0" rounded="lg">
          <v-card-text class="px-8">
            <div class="space-y-1.5 mb-8">
              <h2 class="text-xl font-bold">Budget for {{ monthDisplay }}</h2>
              <p>
                Total Budget :
                <span class="text-lg font-bold text-primary-600 dark:text-white">
                  {{ totalBudgets }}
                </span>
              </p>
            </div>
            <monthly-budgets-table :month="monthValue" />
          </v-card-text>
        </v-card>
      </div>
    </div>
  </div>
</template>
