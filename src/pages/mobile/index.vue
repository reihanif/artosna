<script setup>
  import { onMounted, reactive, ref } from 'vue'
  import { useExpenses } from '@/composables/useExpenses'
  import { useIncomes } from '@/composables/useIncomes'
  import { useOptions } from '@/composables/useOptions'
  import { useTransactions } from '@/composables/useTransactions'
  import { useTransfers } from '@/composables/useTransfers'

  const options = useOptions()

  const { infiniteScroll, loadMoreTransactions, loadInitialTransactions } = useTransactions()
  const { createExpense, updateExpense, deleteExpense } = useExpenses()
  const { createIncome, updateIncome, deleteIncome } = useIncomes()
  const { createTransfer, updateTransfer, deleteTransfer } = useTransfers()

  const dialog = reactive({
    show: false,
    type: 'create',
    transaction: 'expense',
  })

  const formOptions = reactive({
    budget: [],
    pocket: [],
  })

  const formLoad = reactive({
    submit: false,
  })

  const selectedItem = ref(null)

  async function handleEdit (item) {
    selectedItem.value = item
    dialog.transaction = item.type
    if (item.type === 'expense') {
      formOptions.budget = await options.fetchBudgetOptions(item.dateValue)
    }
    dialog.type = 'update'
    dialog.show = true
  }

  async function handleSubmit (formData) {
    formLoad.submit = true

    let result

    switch (dialog.transaction) {
      case 'expense': {
        if (dialog.type === 'create') {
          result = await createExpense(formData)
        } else if (dialog.type === 'update') {
          result = await updateExpense(formData.id, formData)
        }
        break
      }
      case 'income': {
        if (dialog.type === 'create') {
          result = await createIncome(formData)
        } else if (dialog.type === 'update') {
          result = await updateIncome(formData.id, formData)
        }
        break
      }
      case 'transfer': {
        if (dialog.type === 'create') {
          result = await createTransfer(formData)
        } else if (dialog.type === 'update') {
          result = await updateTransfer(formData.id, formData)
        }
        break
      }
    }

    formLoad.submit = false

    if (!result.error) {
      dialog.show = false
      selectedItem.value = null
      await loadInitialTransactions()
    }
  }

  async function handleDelete (item) {
    let result

    switch (dialog.transaction) {
      case 'expense': {
        result = await deleteExpense(item)
        break
      }
      case 'income': {
        result = await deleteIncome(item)
        break
      }
      case 'transfer': {
        result = await deleteTransfer(item)
        break
      }
    }
    if (result.success) {
      dialog.show = false
      selectedItem.value = null
      await loadInitialTransactions()
    }
  }

  function handleClose () {
    selectedItem.value = null
  }

  async function handleDateChange (date) {
    if (!date) return
    formOptions.budget = await options.fetchBudgetOptions(date)
  }

  onMounted(async () => {
    formOptions.pocket = await options.fetchWalletOptions()
    formOptions.category = await options.fetchCategoryOptions('income')
    await loadInitialTransactions()
  })
</script>

<template>
  <div>
    <v-pull-to-refresh
      class="min-h-dvh"
      :pull-down-threshold="48"
      @load="loadInitialTransactions"
    >
      <template #pullDownPanel>
        <div class="flex justify-center items-center py-2">
          <v-progress-circular color="primary" indeterminate />
        </div>
      </template>
      <v-infinite-scroll
        color="primary"
        empty-text=""
        :items="infiniteScroll.items"
        mode="intersect"
        @load="loadMoreTransactions"
      >
        <template v-if="!infiniteScroll.loading && infiniteScroll.items.length === 0">
          <div class="text-center">
            <div class="flex justify-center">
              <v-img
                alt="no-data"
                aspect-ratio="1/1"
                class="mx-auto"
                :height="200"
                src="@/assets/illustrations/no-data.svg"
              />
            </div>
            <p class="text-lg font-medium">No Transactions</p>
            <p class="px-8 mb-6 text-sm text-gray-600 dark:text-gray-500">You have not created any transactions</p>
          </div>
        </template>
        <template v-for="(item, index) in infiniteScroll.items" :key="index">
          <v-card class="rounded-none px-2 mb-1">
            <recent-data-item :item="item" @delete="handleDelete(item)" @edit="handleEdit(item)" />
          </v-card>
        </template>
      </v-infinite-scroll>
    </v-pull-to-refresh>

    <expense-form-sheet
      v-if="dialog.transaction === 'expense'"
      v-model="dialog.show"
      :budget-options="formOptions.budget"
      :initial-data="selectedItem"
      :loading="formLoad.submit"
      :loading-options="options.isLoading.value"
      :type="dialog.type"
      :wallet-options="formOptions.pocket"
      @close="handleClose"
      @submit="handleSubmit"
      @update:date="handleDateChange"
    />

    <income-form-sheet
      v-if="dialog.transaction === 'income'"
      v-model="dialog.show"
      :category-options="formOptions.category"
      :initial-data="selectedItem"
      :loading="formLoad.submit"
      :type="dialog.type"
      :wallet-options="formOptions.pocket"
      @close="handleClose"
      @submit="handleSubmit"
    />

    <transfer-form-sheet
      v-if="dialog.transaction === 'transfer'"
      v-model="dialog.show"
      :initial-data="selectedItem"
      :is-loading-wallets="options.isLoading.value"
      :loading="formLoad.submit"
      :type="dialog.type"
      :wallet-options="formOptions.pocket"
      @close="handleClose"
      @submit="handleSubmit"
    />
  </div>
</template>
