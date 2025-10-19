<script setup>
  import moment from 'moment'
  import { ref, watch } from 'vue'
  import { useCurrencyFormatter } from '@/composables/useCurrencyFormatter'

  const props = defineProps({
    selectedMonth: {
      type: Date,
      default: () => new Date(),
    },
    series: {
      type: Array,
      default: () => [
        {
          name: 'Expenses',
          data: [],
        },
        {
          name: 'Incomes',
          data: [],
        },
      ],
    },
  })

  const { formatCurrency } = useCurrencyFormatter()

  const chartOptions = ref({
    chart: {
      type: 'bar',
      height: 350,
      toolbar: {
        show: false,
      },
    },
    colors: ['#7986CB', '#303F9F'],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '50%',
        borderRadius: 8,
        borderRadiusApplication: 'end',
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 4,
      colors: ['transparent'],
    },
    yaxis: {
      labels: {
        formatter: val => `Rp ${formatCurrency(val)}`,
      },
    },
    xaxis: {
      categories: [moment(props.selectedMonth).format('MMM YYYY')],
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: val => `Rp ${formatCurrency(val)}`,
      },
    },
  })

  watch(() => props.selectedMonth, newMonth => {
    if (newMonth) {
      chartOptions.value = {
        ...chartOptions.value,
        xaxis: {
          ...chartOptions.value.xaxis,
          categories: [moment(newMonth).format('MMM YYYY')],
        },
      }
    }
  })
</script>

<template>
  <div>
    <div class="px-4 h-12 flex items-center">
      <h2 class="text-xl font-bold">Expenses vs Incomes</h2>
    </div>
    <apexchart
      height="350"
      :options="chartOptions"
      :series="series"
      type="bar"
    />
  </div>
</template>
