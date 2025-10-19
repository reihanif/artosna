<script setup>
  import { onMounted, reactive, ref } from 'vue'
  import { useExpenses } from '@/composables/useExpenses'
  import { useOptions } from '@/composables/useOptions'

  const options = useOptions()

  const { tables, fetchExpenses, createExpense, updateExpense, deleteExpense } = useExpenses()

  const dialog = reactive({
    show: false,
    type: 'create',
  })

  const formOptions = reactive({
    budget: [],
    pocket: [],
  })

  const formLoad = reactive({
    submit: false,
  })

  const selectedItem = ref(null)

  function handleCreate () {
    selectedItem.value = null
    dialog.type = 'create'
    dialog.show = true
  }

  function handleEdit (item) {
    selectedItem.value = item
    dialog.type = 'update'
    dialog.show = true
  }

  async function handleSubmit (formData) {
    formLoad.submit = true

    let result
    if (dialog.type === 'create') {
      result = await createExpense(formData)
    } else if (dialog.type === 'update') {
      result = await updateExpense(formData.id, formData)
    }

    formLoad.submit = false

    if (!result.error) {
      dialog.show = false
      selectedItem.value = null
      await fetchExpenses(tables.page)
    }
  }

  async function handleDelete (item) {
    const result = await deleteExpense(item)
    if (result.success) {
      await fetchExpenses(tables.page)
    }
  }

  function handleClose () {
    selectedItem.value = null
  }

  async function handlePageChange (page) {
    await fetchExpenses(page)
  }

  async function handleDateChange (date) {
    if (!date) return
    formOptions.budget = await options.fetchBudgetOptions(date)
  }

  onMounted(async () => {
    formOptions.pocket = await options.fetchWalletOptions()
    fetchExpenses()
  })
</script>

<template>
  <v-card variant="flat">
    <v-card-text class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold">Expenses</h1>

        <v-btn color="primary" variant="flat" @click="handleCreate()">
          <template #prepend>
            <v-icon icon="mdi-plus" />
          </template>
          Create
        </v-btn>
      </div>

      <app-datatable
        :headers="tables.headers"
        :items="tables.items"
        :items-per-page="tables.itemsPerPage"
        :loading="tables.loading"
        :page="tables.page"
        :total-page="tables.totalPage"
        @delete="handleDelete"
        @edit="handleEdit"
        @update:page="handlePageChange"
      >
        <template #item.date="{ value }">
          <span class="font-semibold">
            {{ value }}
          </span>
        </template>
      </app-datatable>
    </v-card-text>

    <expense-form-modal
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
  </v-card>
</template>
