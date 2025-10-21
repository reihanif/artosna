<script setup>
  import moment from 'moment'
  import { computed, onMounted, reactive, ref, watch } from 'vue'
  import { useRules } from 'vuetify/labs/rules'
  import { useBudgets } from '@/composables/useBudgets'
  import { useCurrencyFormatter } from '@/composables/useCurrencyFormatter'
  import { useExpenses } from '@/composables/useExpenses'
  import { useOptions } from '@/composables/useOptions'

  const emit = defineEmits('update:submit')

  const options = useOptions()
  const rules = useRules()

  const { createExpense } = useExpenses()

  const formRef = ref(null)

  const datePicker = ref(false)
  const formData = reactive({
    id: null,
    title: null,
    amount: null,
    date: null,
    pocket: null,
    budget: null,
    notes: null,
  })

  const formOptions = reactive({
    budget: [],
    pocket: [],
  })

  const formLoad = reactive({
    submit: false,
  })

  const date = computed(() => {
    if (!formData.date) return null
    return moment(formData.date).format('DD MMMM YYYY')
  })

  async function handleSubmit () {
    const { valid } = await formRef.value.validate()
    if (!valid) return

    formLoad.submit = true

    const result = await createExpense(formData)

    formLoad.submit = false

    if (!result.error) {
      emit('update:submit')
      resetForm()
    }
  }

  function resetForm () {
    formData.id = null
    formData.title = null
    formData.amount = null
    formData.date = null
    formData.pocket = null
    formData.budget = null
    formData.notes = null
  }

  watch(() => formData.date, async (newDate, oldDate) => {
    if (oldDate && moment(newDate).format('MMMM YYYY') !== moment(oldDate).format('MMMM YYYY')) {
      formData.budget = null
    }
    formOptions.budget = await options.fetchBudgetOptions(newDate)
  })

  useCurrencyFormatter(formData, 'amount')

  onMounted(async () => {
    formOptions.pocket = await options.fetchWalletOptions()
  })

  /**
   * HANDLING BUDGET CREATE
   */
  const { createBudget } = useBudgets()

  const budgetDialog = reactive({
    show: false,
    type: 'create',
  })

  const budgetFormOptions = reactive({
    category: [],
    wallet: [],
  })

  const budgetFormLoad = reactive({
    submit: false,
  })

  async function handleCreateBudget () {
    budgetDialog.show = true
    budgetFormOptions.wallet = await options.fetchWalletOptions()
    budgetFormOptions.category = await options.fetchCategoryOptions('expense')
  }

  async function handleSubmitBudget (budgetFormData) {
    budgetFormLoad.submit = true
    const result = await createBudget(budgetFormData)
    budgetFormLoad.submit = false

    if (!result.error) {
      budgetDialog.show = false
      formOptions.budget = await options.fetchBudgetOptions(formData.date)
    }
  }
</script>

<template>
  <div>
    <v-form ref="formRef" class="space-y-4 sm:space-y-6" @submit.prevent="handleSubmit">
      <v-text-field
        v-model="date"
        autocomplete="off"
        density="comfortable"
        hide-details="auto"
        label="Date"
        readonly
        :rules="[rules.required('Expense date is required')]"
        variant="outlined"
        @click="datePicker = true"
      />
      <app-date-picker v-model="datePicker" v-model:selected-date="formData.date" />
      <v-text-field
        v-model="formData.title"
        autocomplete="off"
        density="comfortable"
        hide-details="auto"
        label="Title"
        :rules="[rules.required('Expense title is required')]"
        variant="outlined"
      />
      <app-select-sheet
        v-model="formData.budget"
        density="comfortable"
        :disabled="options.isLoading.value"
        hide-details="auto"
        :items="formOptions.budget"
        label="Budget"
        :loading="options.isLoading.value"
        :no-data-text="date ? `You haven't create a budget for ${moment(formData.date).format('MMMM YYYY')}` : 'Please select date before you select expense budget'"
        :rules="[rules.required('Expense budget is required')]"
        variant="outlined"
      >
        <template #append>
          <v-btn
            color="primary"
            icon="mdi-plus"
            size="small"
            title="Create Budget"
            variant="tonal"
            @click.stop="handleCreateBudget"
          />
        </template>
      </app-select-sheet>
      <app-select-sheet
        v-model="formData.pocket"
        density="comfortable"
        :disabled="options.isLoading.value"
        hide-details="auto"
        :items="formOptions.pocket"
        label="Wallet"
        :loading="options.isLoading.value"
        :rules="[rules.required('Expense wallet is required')]"
        variant="outlined"
      />
      <v-text-field
        v-model="formData.amount"
        autocomplete="off"
        density="comfortable"
        hide-details="auto"
        inputmode="numeric"
        label="Amount"
        :rules="[rules.required('Expense amount is required')]"
        variant="outlined"
      >
        <template v-if="formData.amount" #prepend-inner>
          Rp
        </template>
      </v-text-field>
      <v-textarea
        v-model="formData.notes"
        auto-grow
        autocomplete="off"
        density="comfortable"
        hide-details="auto"
        label="Notes"
        rows="2"
        variant="outlined"
      />
      <div class="pt-4">
        <v-btn
          block
          class="capitalize"
          color="primary"
          :loading="formLoad.submit"
          size="large"
          text="Submit"
          type="submit"
          variant="flat"
        />
      </div>
    </v-form>

    <budget-form-sheet
      v-model="budgetDialog.show"
      :category-options="budgetFormOptions.category"
      :loading="budgetFormLoad.submit"
      :type="budgetDialog.type"
      :wallet-options="budgetFormOptions.wallet"
      @submit="handleSubmitBudget"
      @update:category-options="budgetFormOptions.category = $event"
    />
  </div>
</template>
