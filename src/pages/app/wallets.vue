<script setup>
  import { onMounted, reactive, ref } from 'vue'
  import { useWallets } from '@/composables/useWallets'

  const { tables, fetchWallets, createWallet, updateWallet, deleteWallet } = useWallets()

  const dialog = reactive({
    show: false,
    type: 'create',
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
      result = await createWallet(formData)
    } else if (dialog.type === 'update') {
      result = await updateWallet(formData.id, formData)
    }

    formLoad.submit = false

    if (!result.error) {
      dialog.show = false
      selectedItem.value = null
      await fetchWallets(tables.page)
    }
  }

  async function handleDelete (item) {
    const result = await deleteWallet(item)
    if (result.success) {
      await fetchWallets(tables.page)
    }
  }

  async function handlePageChange (page) {
    await fetchWallets(page)
  }

  function handleClose () {
    selectedItem.value = null
  }

  onMounted(async () => {
    await fetchWallets()
  })
</script>

<template>
  <v-card variant="flat">
    <v-card-text class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold">Wallets</h1>

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
        <template #item.name="{ value }">
          <span class="font-semibold">
            {{ value }}
          </span>
        </template>
      </app-datatable>
    </v-card-text>

    <wallet-form-modal
      v-model="dialog.show"
      :initial-data="selectedItem"
      :loading="formLoad.submit"
      :type="dialog.type"
      @close="handleClose"
      @submit="handleSubmit"
    />
  </v-card>
</template>
