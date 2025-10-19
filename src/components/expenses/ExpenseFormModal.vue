<script setup>
  import moment from 'moment'
  import { computed, reactive, ref, watch } from 'vue'
  import { useRules } from 'vuetify/labs/rules'
  import { useBudgets } from '@/composables/useBudgets'
  import { useCurrencyFormatter } from '@/composables/useCurrencyFormatter'
  import { useOptions } from '@/composables/useOptions'

  const props = defineProps({
    modelValue: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      default: 'create',
      validator: value => ['create', 'update'].includes(value),
    },
    loading: {
      type: Boolean,
      default: false,
    },
    loadingOptions: {
      type: Boolean,
      default: false,
    },
    budgetOptions: {
      type: Array,
      default: () => [],
    },
    walletOptions: {
      type: Array,
      default: () => [],
    },
    initialData: {
      type: Object,
      default: null,
    },
  })

  const emit = defineEmits(['update:modelValue', 'submit', 'close', 'update:date'])

  const rules = useRules()

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

  const date = computed(() => {
    if (!formData.date) return null
    return moment(formData.date).format('DD MMMM YYYY')
  })

  const dialogModel = computed({
    get: () => props.modelValue,
    set: value => emit('update:modelValue', value),
  })

  function handleSubmit () {
    emit('submit', { ...formData })
  }

  function handleClose () {
    resetForm()
    emit('close')
    emit('update:modelValue', false)
  }

  function setFormData (data) {
    if (!data) {
      resetForm()
      return
    }

    formData.id = data.id
    formData.title = data.title
    formData.amount = data.amountValue
    formData.date = data.dateValue
    formData.pocket = data.pocketId
    formData.budget = data.budgetId
    formData.notes = data.notes
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

  watch(() => props.initialData, newData => {
    setFormData(newData)
  }, { immediate: true, deep: true })

  watch(() => props.modelValue, isOpen => {
    if (!isOpen) {
      resetForm()
    }
  })

  watch(() => formData.date, async (newDate, oldDate) => {
    if (oldDate && moment(newDate).format('MMMM YYYY') !== moment(oldDate).format('MMMM YYYY')) {
      formData.budget = null
    }
    emit('update:date', newDate)
  })

  useCurrencyFormatter(formData, 'amount')

  defineExpose({
    resetForm,
    setFormData,
    formData,
  })

  /**
   * HANDLING BUDGET CREATE
   */
  const options = useOptions()
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
    budgetFormOptions.wallet = await options.fetchWalletOptions()
    budgetFormOptions.category = await options.fetchCategoryOptions('expense')
    budgetDialog.show = true
  }

  async function handleSubmitBudget (budgetFormData) {
    budgetFormLoad.submit = true
    const result = await createBudget(budgetFormData)
    budgetFormLoad.submit = false

    if (!result.error) {
      budgetDialog.show = false
      emit('update:date', formData.date)
    }
  }
</script>

<template>
  <div>
    <app-form-modal
      v-model="dialogModel"
      :loading="loading"
      prepend-icon="mdi-cash-multiple"
      :submit-text="type === 'update' ? 'Save' : type"
      @close="handleClose"
      @submit="handleSubmit"
    >
      <template #title>
        <span class="capitalize">
          {{ type === 'update' ? 'Edit' : type }} Expense
        </span>
      </template>
      <template #form>
        <v-text-field
          v-model="date"
          autocomplete="off"
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
          hide-details="auto"
          label="Title"
          :rules="[rules.required('Expense title is required')]"
          variant="outlined"
        />
        <v-autocomplete
          v-model="formData.budget"
          :disabled="loadingOptions"
          hide-details="auto"
          :items="budgetOptions"
          label="Budget"
          :loading="loadingOptions"
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
              @click="handleCreateBudget"
            />
          </template>
        </v-autocomplete>
        <v-autocomplete
          v-model="formData.pocket"
          :disabled="loadingOptions"
          hide-details="auto"
          :items="walletOptions"
          label="Wallet"
          :loading="loadingOptions"
          :rules="[rules.required('Expense wallet is required')]"
          variant="outlined"
        />
        <v-text-field
          v-model="formData.amount"
          autocomplete="off"
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
          hide-details="auto"
          label="Notes"
          rows="2"
          variant="outlined"
        />
      </template>
    </app-form-modal>

    <budget-form-modal
      v-model="budgetDialog.show"
      :category-options="budgetFormOptions.category"
      :loading="budgetFormLoad.submit"
      :type="budgetDialog.type"
      :wallet-options="budgetFormOptions.wallet"
      @submit="handleSubmitBudget"
    />
  </div>
</template>
