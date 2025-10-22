<script setup>
  import moment from 'moment'
  import { computed, onMounted, reactive, ref, watch } from 'vue'
  import { useBudgets } from '@/composables/useBudgets'
  import { useCurrencyFormatter } from '@/composables/useCurrencyFormatter'
  import { useOptions } from '@/composables/useOptions'

  const options = useOptions()
  const { formatCurrency } = useCurrencyFormatter()
  const {
    tables,
    fetchBudgetsWithTransactionsByMonthNoPagination,
    fetchTotalBudgetsByMonth,
    fetchRealizationBudgetsByMonth,
    createBudget,
    updateBudget,
    deleteBudget,
  } = useBudgets()

  const monthPicker = ref(false)
  const monthValue = ref(new Date())
  const monthDisplay = computed(() => {
    if (!monthValue.value) return null
    return moment(monthValue.value).format('MMMM YYYY')
  })

  const overview = reactive({
    total: 'Rp 0',
    realization: 'Rp 0',
    remain: 'Rp 0',
    isOverbudget: false,
  })

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
    selectedItem.value = {
      id: null,
      name: null,
      date: monthValue.value,
      category: null,
      wallet: null,
      allocation: null,
      notes: null,
    }
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
      await fetchBudgetsWithTransactionsByMonthNoPagination(monthValue.value)
    }
  }

  async function handleDelete (item) {
    const result = await deleteBudget(item)
    if (result.success) {
      await fetchBudgetsWithTransactionsByMonthNoPagination(monthValue.value)
    }
  }

  function handleClose () {
    selectedItem.value = null
  }

  async function setOverview (month) {
    const totalBudgetsValue = await fetchTotalBudgetsByMonth(month)
    overview.total = `Rp ${formatCurrency(totalBudgetsValue)}`

    const realizationBudgetsValue = await fetchRealizationBudgetsByMonth(month)
    overview.realization = `Rp ${formatCurrency(realizationBudgetsValue)}`

    const remainBudgetsValue = totalBudgetsValue - realizationBudgetsValue
    overview.remain = `${remainBudgetsValue < 0 ? '- ' : ''}Rp ${formatCurrency(remainBudgetsValue)}`

    overview.isOverbudget = remainBudgetsValue < 0
  }

  async function setMounted () {
    await setOverview(monthValue.value)
    await fetchBudgetsWithTransactionsByMonthNoPagination(monthValue.value)
    formOptions.wallet = await options.fetchWalletOptions()
    formOptions.category = await options.fetchCategoryOptions('expense')
  }

  async function handlePullRefresh ({ done }) {
    await setMounted()
    done('ok')
  }

  onMounted(async () => {
    setMounted()
  })

  watch(() => monthValue.value, async newMonth => {
    if (newMonth) {
      await setOverview(newMonth)
      await fetchBudgetsWithTransactionsByMonthNoPagination(newMonth)
    }
  }, { immediate: true })
</script>

<template>
  <v-pull-to-refresh
    class="min-h-full"
    :pull-down-threshold="48"
    @load="handlePullRefresh"
  >
    <template #pullDownPanel>
      <div class="flex justify-center items-center py-2">
        <v-progress-circular color="primary" indeterminate />
      </div>
    </template>
    <div class="space-y-6 mb-6">
      <v-card class="space-y-4 px-4 pb-4">
        <div class="min-w-64">
          <v-text-field
            v-model="monthDisplay"
            autocomplete="off"
            density="compact"
            hide-details="auto"
            prepend-inner-icon="mdi-calendar-range"
            readonly
            variant="outlined"
            @click="monthPicker = true"
          />
          <app-month-picker v-model="monthPicker" v-model:selected-date="monthValue" />
        </div>
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
          Add Budget
        </v-btn>
        <div class="grid grid-cols-3">
          <div class="flex justify-between">
            Total
            <span>:</span>
          </div>
          <div class="col-span-2 text-end font-semibold text-primary-600 dark:text-primary-500">
            {{ overview.total }}
          </div>
          <div class="flex justify-between">
            Realization
            <span>:</span>
          </div>
          <div class="col-span-2 text-end font-semibold text-primary-600 dark:text-primary-500">
            {{ overview.realization }}
          </div>
          <div class="flex justify-between">
            Remain
            <span>:</span>
          </div>
          <div
            class="col-span-2 text-end font-semibold"
            :class="{
              'text-primary-600 dark:text-primary-500': !overview.isOverbudget,
              'text-red-600 dark:text-red-500': overview.isOverbudget,
            }"
          >
            {{ overview.remain }}
          </div>
        </div>
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
            <p class="text-lg font-medium">No Budgets</p>
            <p class="px-8 mb-6 text-sm text-gray-600 dark:text-gray-500">You have not created any budgets for {{ monthDisplay }}</p>
            <v-btn
              color="primary"
              prepend-icon="mdi-plus"
              size="default"
              type="submit"
              variant="flat"
              @click="handleCreate"
            >
              Add Budget
            </v-btn>
          </div>
        </template>
        <template v-else>
          <v-card v-for="(item, index) in tables.items" :key="index" class="rounded-none mb-1 px-2">
            <report-data-item
              :item="item"
              @delete="handleDelete(item)"
              @edit="handleEdit(item)"
            />
          </v-card>
        </template>
      </div>
    </div>

    <budget-form-sheet
      v-model="dialog.show"
      :category-options="formOptions.category"
      :initial-data="selectedItem"
      :loading="formLoad.submit"
      :type="dialog.type"
      :wallet-options="formOptions.wallet"
      @close="handleClose"
      @submit="handleSubmit"
    />
  </v-pull-to-refresh>
</template>
