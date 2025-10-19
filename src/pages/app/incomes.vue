<script setup>
  import { onMounted, reactive, ref } from 'vue'
  import { useIncomes } from '@/composables/useIncomes'
  import { useOptions } from '@/composables/useOptions'

  const options = useOptions()

  const { tables, fetchIncomes, createIncome, updateIncome, deleteIncome } = useIncomes()

  const dialog = reactive({
    show: false,
    type: 'create',
  })

  const formOptions = reactive({
    pocket: [],
    category: [],
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
      result = await createIncome(formData)
    } else if (dialog.type === 'update') {
      result = await updateIncome(formData.id, formData)
    }

    formLoad.submit = false

    if (!result.error) {
      dialog.show = false
      selectedItem.value = null
      await fetchIncomes(tables.page)
    }
  }

  async function handleDelete (item) {
    const result = await deleteIncome(item)
    if (result.success) {
      await fetchIncomes(tables.page)
    }
  }

  async function handlePageChange (page) {
    await fetchIncomes(page)
  }

  function handleClose () {
    selectedItem.value = null
  }

  onMounted(async () => {
    formOptions.pocket = await options.fetchWalletOptions()
    formOptions.category = await options.fetchCategoryOptions('income')
    await fetchIncomes()
  })
</script>

<template>
  <v-card variant="flat">
    <v-card-text class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold">Incomes</h1>

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
        <template #item.date="{ value }">
          <span class="font-semibold">
            {{ value }}
          </span>
        </template>
      </app-datatable>
    </v-card-text>

    <income-form-modal
      v-model="dialog.show"
      :category-options="formOptions.category"
      :initial-data="selectedItem"
      :loading="formLoad.submit"
      :type="dialog.type"
      :wallet-options="formOptions.pocket"
      @close="handleClose"
      @submit="handleSubmit"
    />
  </v-card>
</template>
