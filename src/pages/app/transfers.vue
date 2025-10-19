<script setup>
  import { onMounted, reactive, ref } from 'vue'
  import { useOptions } from '@/composables/useOptions'
  import { useTransfers } from '@/composables/useTransfers'

  const options = useOptions()

  const { tables, fetchTransfers, createTransfer, updateTransfer, deleteTransfer } = useTransfers()

  const dialog = reactive({
    show: false,
    type: 'create',
  })

  const formOptions = reactive({
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
      result = await createTransfer(formData)
    } else if (dialog.type === 'update') {
      result = await updateTransfer(formData.id, formData)
    }

    formLoad.submit = false

    if (!result.error) {
      dialog.show = false
      selectedItem.value = null
      await fetchTransfers(tables.page)
    }
  }

  async function handleDelete (item) {
    const result = await deleteTransfer(item)
    if (result.success) {
      await fetchTransfers(tables.page)
    }
  }

  async function handlePageChange (page) {
    await fetchTransfers(page)
  }

  function handleClose () {
    selectedItem.value = null
  }

  onMounted(async () => {
    formOptions.pocket = await options.fetchWalletOptions()
    await fetchTransfers()
  })
</script>

<template>
  <v-card variant="flat">
    <v-card-text class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold">Transfers</h1>

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

    <transfer-form-modal
      v-model="dialog.show"
      :initial-data="selectedItem"
      :is-loading-wallets="options.isLoading.value"
      :loading="formLoad.submit"
      :type="dialog.type"
      :wallet-options="formOptions.pocket"
      @close="handleClose"
      @submit="handleSubmit"
    />
  </v-card>
</template>
