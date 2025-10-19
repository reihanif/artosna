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

  async function setExpensesOverview (month) {
    const data = await fetchExpensesByCategory(month)
    const categories = data.map(item => item.category)
    const totals = data.map(item => item.total)

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
    await setExpensesOverview(monthValue.value)
    await setWalletBarChartSeries(monthValue.value)
    await setTotalBudgets(monthValue.value)
  })

  watch(() => monthValue.value, async newMonth => {
    await setBarChartSeries(newMonth)
    await setExpensesOverview(newMonth)
    await setWalletBarChartSeries(newMonth)
    await setTotalBudgets(newMonth)
  })
</script>

<template>
  <div class="space-y-6 mb-6">
    <v-card class="space-y-4 px-4 pb-4">
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
    </v-card>
    <overview-card
      :badge-color="setTrendBadgeColor(overview.expenses.trend)"
      :badge-icon="setTrendBadgeIcon(overview.expenses.trend)"
      :badge-text="overview.expenses.growth"
      icon="mdi-invoice-export-outline"
      icon-size="24"
      title="Expenses"
      :value="overview.expenses.value"
    />
    <overview-card
      :badge-color="setTrendBadgeColor(overview.incomes.trend)"
      :badge-icon="setTrendBadgeIcon(overview.incomes.trend)"
      :badge-text="overview.incomes.growth"
      icon="mdi-invoice-import-outline"
      icon-size="24"
      title="Incomes"
      :value="overview.incomes.value"
    />
    <overview-card
      icon="mdi-transfer-up"
      icon-size="24"
      info-icon="mdi-format-list-group"
      :info-label="overview.highestExpense.category"
      title="Highest Expense"
      :value="overview.highestExpense.value"
    />
    <overview-card
      icon="mdi-transfer-down"
      icon-size="24"
      info-icon="mdi-format-list-group"
      :info-label="overview.lowestExpense.category"
      title="Lowest Expense"
      :value="overview.lowestExpense.value"
    />
    <v-card class="overflow-visible">
      <v-card-text>
        <expenses-wallet-bar-chart :categories="walletBarChartCategories" mobile :series="walletBarChartSeries" />
      </v-card-text>
    </v-card>
    <v-card>
      <v-card-text class="h-full flex flex-col">
        <div class="mb-4">
          <h2 class="text-base font-bold">My Wallets</h2>
          <p class="text-xs">
            Total Balance :
            <span class="text-base font-bold text-primary-600 dark:text-white">
              {{ wallets.totalBalance }}
            </span>
          </p>
        </div>
        <div class="flex-grow flex items-center justify-center py-3">
          <div class="max-w-[280px]">
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
    <v-card class="overflow-visible">
      <v-card-text>
        <expenses-area-chart mobile />
      </v-card-text>
    </v-card>
  </div>
</template>
