<script setup>
  import { ref, watch } from 'vue'
  import { useCurrencyFormatter } from '@/composables/useCurrencyFormatter'

  const props = defineProps({
    series: {
      type: Array,
      default: () => [],
    },
    labels: {
      type: Array,
      default: () => [],
    },
  })

  const { formatCurrency } = useCurrencyFormatter()

  const chartOptions = ref({
    chart: {
      type: 'donut',
    },
    colors: ['#9FA8DA', '#7986CB', '#5C6BC0', '#3F51B5', '#3949AB', '#303F9F', '#283593', '#1A237E'],
    labels: [],
    yaxis: {
      labels: {
        formatter: value => `Rp ${formatCurrency(value)}`,
      },
    },
    legend: {
      show: true,
      showForSingleSeries: false,
      showForNullSeries: true,
      showForZeroSeries: true,
      position: 'bottom',
      horizontalAlign: 'center',
      formatter: undefined,
      inverseOrder: false,
      width: undefined,
      height: undefined,
      tooltipHoverFormatter: undefined,
      customLegendItems: [],
      clusterGroupedSeries: true,
      clusterGroupedSeriesOrientation: 'vertical',
      offsetX: 0,
      offsetY: 0,
      labels: {
        colors: undefined,
        useSeriesColors: false,
      },
      markers: {
        size: 7,
        shape: undefined,
        strokeWidth: 1,
        fillColors: undefined,
        customHTML: undefined,
        onClick: undefined,
        offsetX: 0,
        offsetY: 0,
      },
      itemMargin: {
        horizontal: 8,
        vertical: 4,
      },
      onItemClick: {
        toggleDataSeries: false,
      },
      onItemHover: {
        highlightDataSeries: true,
      },
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 200,
          },
          legend: {
            position: 'bottom',
          },
        },
      },
    ],
  })

  watch(() => props.labels, newLabels => {
    if (newLabels) {
      chartOptions.value = {
        ...chartOptions.value,
        labels: newLabels,
      }
    }
  })
</script>

<template>
  <div>
    <div class="pt-0 p-4">
      <h2 class="text-xl font-bold">Expenses Summary</h2>
    </div>
    <apexchart
      height="350"
      :options="chartOptions"
      :series="series"
      type="donut"
    />
  </div>
</template>
