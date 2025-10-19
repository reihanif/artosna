<script setup>
  import { onMounted, reactive, ref } from 'vue'
  import { useWallets } from '@/composables/useWallets'

  const { tables, fetchAllWallets, createWallet, updateWallet, deleteWallet } = useWallets()

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
      await fetchAllWallets()
    }
  }

  async function handleDelete (item) {
    const result = await deleteWallet(item)
    if (result.success) {
      await fetchAllWallets()
    }
  }

  function handleClose () {
    selectedItem.value = null
  }

  onMounted(async () => {
    await fetchAllWallets()
  })
</script>

<template>
  <div class="space-y-1 mb-6">
    <v-card class="px-4 pb-4">
      <v-btn
        v-if="tables.totalItems > 0"
        block
        color="primary"
        prepend-icon="mdi-plus"
        size="default"
        type="submit"
        variant="outlined"
        @click="handleCreate"
      >
        Add Wallet
      </v-btn>
    </v-card>

    <div>
      <template v-if="tables.loading">
        <div class="flex justify-center">
          <v-progress-circular color="primary" indeterminate />
        </div>
      </template>
      <template v-else-if="tables.totalItems === 0">
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
          <p class="text-lg font-medium">No Wallets</p>
          <p class="px-8 mb-6 text-sm text-gray-600 dark:text-gray-300">You have not created any wallets</p>
          <v-btn
            color="primary"
            prepend-icon="mdi-plus"
            size="default"
            type="submit"
            variant="flat"
            @click="handleCreate"
          >
            Add Wallet
          </v-btn>
        </div>
      </template>
      <template v-else>
        <v-card v-for="(item, index) in tables.items" :key="index" class="rounded-none mb-1 px-2">
          <wallet-data-item
            :item="item"
            @delete="handleDelete(item)"
            @edit="handleEdit(item)"
          />
        </v-card>
      </template>
    </div>

    <wallet-form-sheet
      v-model="dialog.show"
      :initial-data="selectedItem"
      :loading="formLoad.submit"
      :type="dialog.type"
      @close="handleClose"
      @submit="handleSubmit"
    />
  </div>
</template>
