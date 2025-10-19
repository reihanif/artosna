<script setup>
  import { onMounted } from 'vue'
  import { useTransactions } from '@/composables/useTransactions'

  const { tables, fetchTransactions } = useTransactions()

  async function handlePageChange (page) {
    await fetchTransactions(page)
  }

  function setTypeBadgeColor (value) {
    let color
    switch (value) {
      case 'expense': {
        color = 'red'
        break
      }
      case 'income': {
        color = 'green'
        break
      }
      case 'transfer': {
        color = 'primary'
        break
      }
    }
    return color
  }

  function setTypeBadgeIcon (value) {
    let icon
    switch (value) {
      case 'expense': {
        icon = 'mdi-export'
        break
      }
      case 'income': {
        icon = 'mdi-import'
        break
      }
      case 'transfer': {
        icon = 'mdi-swap-horizontal'
        break
      }
    }
    return icon
  }

  onMounted(async () => {
    fetchTransactions()
  })
</script>

<template>
  <app-datatable
    :headers="tables.headers"
    :items="tables.items"
    :items-per-page="tables.itemsPerPage"
    :loading="tables.loading"
    :page="tables.page"
    :total-page="tables.totalPage"
    @update:page="handlePageChange"
  >
    <template #item.date="{ value }">
      <span class="font-semibold capitalize">
        {{ value }}
      </span>
    </template>
    <template #item.type="{ value }">
      <v-chip
        class="capitalize"
        :color="setTypeBadgeColor(value)"
        density="compact"
      >
        <v-icon :icon="setTypeBadgeIcon(value)" />
        <span class="ps-2">
          {{ value }}
        </span>
      </v-chip>
    </template>
  </app-datatable>
</template>
