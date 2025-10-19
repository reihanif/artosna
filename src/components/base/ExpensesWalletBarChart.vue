<script setup>
  import { ref, watch } from 'vue'
  import { useCurrencyFormatter } from '@/composables/useCurrencyFormatter'

  const props = defineProps({
    series: {
      type: Array,
      default: () => [],
    },
    categories: {
      type: Array,
      default: () => [],
    },
    mobile: {
      type: Boolean,
      default: () => false,
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
    colors: ['#3F51B5'],
    plotOptions: {
      bar: {
        borderRadius: 8,
        borderRadiusApplication: 'end',
        horizontal: true,
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      labels: {
        show: !props.mobile,
        formatter: val => `Rp ${formatCurrency(val)}`,
      },
      categories: [],
    },
    tooltip: {
      y: {
        formatter: val => `Rp ${formatCurrency(val)}`,
      },
    },
  })

  watch(() => props.categories, newCategories => {
    if (newCategories) {
      chartOptions.value = {
        ...chartOptions.value,
        xaxis: {
          ...chartOptions.value.xaxis,
          categories: newCategories,
        },
      }
    }
  })
</script>

<template>
  <div>
    <div class="pt-0 sm:p-4">
      <h2 class="text-base sm:text-xl font-bold">Expenses by Wallet</h2>
    </div>
    <apexchart
      height="350"
      :options="chartOptions"
      :series="series"
      type="bar"
    />
  </div>
</template>
