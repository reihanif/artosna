<script setup>
  import { ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'

  const router = useRouter()
  const route = useRoute()

  const navigation = ref(route.path)
  const transactionsSheet = ref(false)
  const slotKey = ref(0)

  function onNavigate (value) {
    router.push(value)
  }

  function handleTransactionSubmit () {
    transactionsSheet.value = false
    slotKey.value += 1
  }
</script>

<template>
  <v-layout class="dark:text-gray-400 dark:bg-gray-950">
    <app-navbar :auth-button="false" :logo-position="'center'" :sidebar-toggle="false" />

    <v-main class="d-flex justify-center min-h-dvh">
      <div class="sm:p-6 w-full bg-gray-50 dark:bg-gray-900">
        <slot :key="slotKey" />
      </div>
    </v-main>

    <v-fab
      app
      class="mb-12"
      color="primary"
      icon="mdi-plus"
      location="bottom center"
      offset
      size="52"
      @click.stop="transactionsSheet = true"
    />

    <app-transactions-sheet v-model="transactionsSheet" @update:submit="handleTransactionSubmit" />

    <v-bottom-navigation
      v-model="navigation"
      color="primary"
      grow
      mode="shift"
      @update:model-value="onNavigate($event)"
    >
      <v-btn class="text-none" :readonly="navigation === '/mobile'" value="/mobile">
        <v-icon>mdi-history</v-icon>

        <span>Recent</span>
      </v-btn>

      <v-btn class="text-none" :readonly="navigation === '/mobile/reports'" value="/mobile/reports">
        <v-icon>mdi-chart-box-outline</v-icon>

        <span>Reports</span>
      </v-btn>

      <v-btn class="text-none" :readonly="navigation === '/mobile/budgets'" value="/mobile/budgets">
        <v-icon>mdi-cash-multiple</v-icon>

        <span>Budgets</span>
      </v-btn>

      <v-btn class="text-none" :readonly="navigation === '/mobile/manage'" value="/mobile/manage">
        <v-icon>mdi-cog-outline</v-icon>

        <span>Manage</span>
      </v-btn>
    </v-bottom-navigation>
  </v-layout>
</template>
