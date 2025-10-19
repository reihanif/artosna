<script setup>
  import { reactive, watch } from 'vue'
  import { useBudgets } from '@/composables/useBudgets'

  const props = defineProps({
    month: {
      type: Date,
      default: () => new Date(),
    },
  })

  const { tables, fetchBudgetsWithTransactionsByMonth } = useBudgets()

  const headers = reactive([
    { title: 'Name', key: 'name', sortable: false },
    { title: 'Category', key: 'category', sortable: false },
    { title: 'Allocation', key: 'allocation', sortable: false },
    { title: 'Realization', key: 'realization', sortable: false },
    { title: 'Remain', key: 'remain', sortable: false },
  ])

  async function handlePageChange (page) {
    await fetchBudgetsWithTransactionsByMonth(page, props.month)
  }

  watch(() => props.month, async newMonth => {
    if (newMonth) {
      await fetchBudgetsWithTransactionsByMonth(1, newMonth)
    }
  }, { immediate: true })
</script>

<template>
  <app-datatable
    :headers="headers"
    :items="tables.items"
    :items-per-page="tables.itemsPerPage"
    :loading="tables.loading"
    :page="tables.page"
    :total-page="tables.totalPage"
    @update:page="handlePageChange"
  >
    <template #item.remain="{ value, item }">
      <span
        class="font-semibold"
        :class="{
          'text-red-500': item.isOverbudget
        }"
      >
        {{ value }}
      </span>
    </template>
  </app-datatable>
</template>
