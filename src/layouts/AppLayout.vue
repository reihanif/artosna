<script setup>
  import { reactive, ref } from 'vue'
  import { useDeviceType } from '@/composables/useDeviceType'

  const { isTablet } = useDeviceType()

  const sidebar = ref(!isTablet.value)
  const sidebarItems = reactive([
    {
      category: 'Home',
      children: [
        {
          title: 'Dashboard',
          icon: 'mdi-view-dashboard-outline',
          route: '/app',
        },
      ],
    },
    {
      category: 'Transactions',
      children: [
        {
          title: 'Expenses',
          icon: 'mdi-invoice-export-outline',
          route: '/app/expenses',
        },
        {
          title: 'Incomes',
          icon: 'mdi-invoice-import-outline',
          route: '/app/incomes',
        },
        {
          title: 'Transfers',
          icon: 'mdi-transfer',
          route: '/app/transfers',
        },
      ],
    },
    {
      category: 'Manage',
      children: [
        {
          title: 'Budgets',
          icon: 'mdi-cash-multiple',
          route: '/app/budgets',
        },
        {
          title: 'Categories',
          icon: 'mdi-format-list-group',
          route: '/app/categories',
        },
        {
          title: 'Wallets',
          icon: 'mdi-wallet-outline',
          route: '/app/wallets',
        },
      ],
    },
  ])
</script>

<template>
  <v-layout class="dark:text-gray-400 dark:bg-gray-950">
    <app-navbar @click:navicon="sidebar = !sidebar" />

    <app-sidebar v-model="sidebar" :items="sidebarItems" />

    <v-main class="d-flex justify-center min-h-dvh">
      <div class="sm:p-6 w-full bg-gray-50 dark:bg-gray-900" :class="{ 'rounded-tl-2xl': sidebar }">
        <slot />
      </div>
    </v-main>
  </v-layout>
</template>
