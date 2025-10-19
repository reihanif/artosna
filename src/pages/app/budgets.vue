<script setup>
  import { onMounted, reactive, ref } from 'vue'
  import { useBudgets } from '@/composables/useBudgets'
  import { useOptions } from '@/composables/useOptions'

  const options = useOptions()
  const { tables, fetchBudgets, createBudget, updateBudget, deleteBudget } = useBudgets()

  const dialog = reactive({
    show: false,
    type: 'create',
  })

  const formOptions = reactive({
    category: [],
    wallet: [],
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
      result = await createBudget(formData)
    } else if (dialog.type === 'update') {
      result = await updateBudget(formData.id, formData)
    }

    formLoad.submit = false

    if (!result.error) {
      dialog.show = false
      selectedItem.value = null
      await fetchBudgets(tables.page)
    }
  }

  async function handleDelete (item) {
    const result = await deleteBudget(item)
    if (result.success) {
      await fetchBudgets(tables.page)
    }
  }

  function handleClose () {
    selectedItem.value = null
  }

  async function handlePageChange (page) {
    await fetchBudgets(page)
  }

  onMounted(async () => {
    formOptions.wallet = await options.fetchWalletOptions()
    formOptions.category = await options.fetchCategoryOptions('expense')
    await fetchBudgets()
  })
</script>

<template>
  <v-card variant="flat">
    <v-card-text class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold">Budgets</h1>

        <v-btn color="primary" variant="flat" @click="handleCreate">
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
        <template #item.period="{ value }">
          <span class="font-semibold capitalize">
            {{ value }}
          </span>
        </template>
      </app-datatable>
    </v-card-text>

    <budget-form-modal
      v-model="dialog.show"
      :category-options="formOptions.category"
      :initial-data="selectedItem"
      :loading="formLoad.submit"
      :type="dialog.type"
      :wallet-options="formOptions.wallet"
      @close="handleClose"
      @submit="handleSubmit"
    />
  </v-card>
</template>
