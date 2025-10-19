<script setup>
  import moment from 'moment'
  import { onMounted, ref } from 'vue'
  import { useCurrencyFormatter } from '@/composables/useCurrencyFormatter'
  import { useExpenses } from '@/composables/useExpenses'

  const props = defineProps({
    mobile: {
      type: Boolean,
      default: () => false,
    },
  })

  const { fetchExpensesByDate } = useExpenses()

  const { formatCurrency } = useCurrencyFormatter()

  const series = ref([
    {
      name: 'Expense',
      data: [],
    },
  ])

  const chartOptions = ref({
    chart: {
      toolbar: {
        show: false,
      },
      id: 'area-datetime',
      type: 'area',
      height: 350,
      zoom: false,
    },
    colors: ['#3F51B5'],
    annotations: {},
    dataLabels: {
      enabled: false,
    },
    markers: {
      size: 0,
      style: 'hollow',
    },
    yaxis: {
      labels: {
        show: !props.mobile,
        formatter: val => `Rp ${formatCurrency(val)}`,
      },
    },
    xaxis: {
      type: 'datetime',
      min: moment().local().startOf('month').valueOf(),
      tickAmount: 6,
    },
    tooltip: {
      theme: 'light',
      x: {
        format: 'dd MMM yyyy',
      },
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.9,
        stops: [0, 100],
      },
    },
  })

  const chart = ref(null)
  const selection = ref('mtd')

  function updateData (timeline) {
    selection.value = timeline
    const chartRef = chart.value?.chart

    if (!chartRef) return

    switch (timeline) {
      case 'one_month': {
        chartRef.zoomX(
          moment().subtract(1, 'month').startOf('day').toDate().getTime(),
          moment().startOf('day').toDate().getTime(),
        )
        break
      }
      case 'six_months': {
        chartRef.zoomX(
          moment().subtract(6, 'month').startOf('day').toDate().getTime(),
          moment().startOf('day').toDate().getTime(),
        )
        break
      }
      case 'one_year': {
        chartRef.zoomX(
          moment().subtract(1, 'year').startOf('day').toDate().getTime(),
          moment().startOf('day').toDate().getTime(),
        )
        break
      }
      case 'ytd': {
        chartRef.zoomX(
          moment().startOf('year').toDate().getTime(),
          moment().toDate().getTime(),
        )
        break
      }
      case 'mtd': {
        chartRef.zoomX(
          moment().startOf('month').toDate().getTime(),
          moment().toDate().getTime(),
        )
        break
      }
    }
  }

  async function setSeries () {
    const start = moment().subtract(1, 'year').startOf('day')
    const end = moment().add(1, 'day').startOf('day')

    const data = await fetchExpensesByDate()

    const dailyTotals = {}
    for (const item of data) {
      const day = moment(item.date).local().startOf('day')
      const localTimestamp = day.valueOf() + day.utcOffset() * 60 * 1000
      dailyTotals[localTimestamp] = (dailyTotals[localTimestamp] || 0) + item.amount
    }

    const result = []
    const current = start.clone()
    while (current.isSameOrBefore(end, 'day')) {
      const ts = current.utc().startOf('day').valueOf()
      result.push([ts, dailyTotals[ts] || 0])
      current.add(1, 'day')
    }

    series.value = [{
      name: 'Expense',
      data: result,
    }]
  }

  onMounted(() => {
    setSeries()
  })
</script>

<template>
  <div>
    <div class="space-y-2 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
      <div class="sm:px-4">
        <h2 class="text-base sm:text-xl font-bold">Expenses</h2>
      </div>
      <v-btn-toggle
        v-model="selection"
        color="primary"
        :density="props.mobile ? 'compact' : 'default'"
        divided
        mandatory
        variant="outlined"
      >
        <v-btn :size="props.mobile ? 'x-small' : 'default'" value="one_month" @click="updateData('one_month')">
          1M
        </v-btn>

        <v-btn :size="props.mobile ? 'x-small' : 'default'" value="six_months" @click="updateData('six_months')">
          6M
        </v-btn>

        <v-btn :size="props.mobile ? 'x-small' : 'default'" value="one_year" @click="updateData('one_year')">
          1Y
        </v-btn>

        <v-btn :size="props.mobile ? 'x-small' : 'default'" value="mtd" @click="updateData('mtd')">
          MTD
        </v-btn>

        <v-btn :size="props.mobile ? 'x-small' : 'default'" value="ytd" @click="updateData('ytd')">
          YTD
        </v-btn>
      </v-btn-toggle>
    </div>
    <apexchart
      ref="chart"
      height="350"
      :options="chartOptions"
      :series="series"
      type="area"
    />
  </div>
</template>
