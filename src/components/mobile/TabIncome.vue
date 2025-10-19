<script setup>
  import moment from 'moment'
  import { computed, onMounted, reactive, ref } from 'vue'
  import { useRules } from 'vuetify/labs/rules'
  import { useCategories } from '@/composables/useCategories'
  import { useCurrencyFormatter } from '@/composables/useCurrencyFormatter'
  import { useIncomes } from '@/composables/useIncomes'
  import { useOptions } from '@/composables/useOptions'

  const emit = defineEmits('update:submit')

  const options = useOptions()
  const rules = useRules()
  const { createIncome } = useIncomes()

  const formRef = ref(null)

  const datePicker = ref(false)
  const formData = reactive({
    id: null,
    title: null,
    category: null,
    amount: null,
    date: null,
    pocket: null,
    notes: null,
  })

  const formOptions = reactive({
    pocket: [],
    category: [],
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

    const result = await createIncome(formData)

    formLoad.submit = false

    if (!result.error) {
      emit('update:submit')
      resetForm()
    }
  }

  function resetForm () {
    formData.id = null
    formData.title = null
    formData.category = null
    formData.amount = null
    formData.date = null
    formData.pocket = null
    formData.notes = null
  }

  useCurrencyFormatter(formData, 'amount')

  onMounted(async () => {
    formOptions.pocket = await options.fetchWalletOptions()
    formOptions.category = await options.fetchCategoryOptions('income')
  })

  /**
   * HANDLING CATEGORY CREATE
   */
  const { createCategory } = useCategories()

  const categoryDialog = reactive({
    show: false,
    type: 'create',
  })

  const categoryFormOptions = reactive({
    type: [],
  })

  const categoryFormLoad = reactive({
    submit: false,
  })

  function handleCreateCategory () {
    categoryDialog.show = true
    categoryFormOptions.type = options.getTransactionOptions()
  }

  async function handleSubmitCategory (categoryFormData) {
    categoryFormLoad.submit = true
    const result = await createCategory(categoryFormData)
    categoryFormLoad.submit = false

    if (!result.error) {
      categoryDialog.show = false
      formOptions.category = await options.fetchCategoryOptions('income')
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
        :rules="[rules.required('Income date is required')]"
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
        :rules="[rules.required('Income title is required')]"
        variant="outlined"
      />

      <app-select-sheet
        v-model="formData.category"
        density="comfortable"
        hide-details="auto"
        :items="formOptions.category"
        label="Category"
        :rules="[rules.required('Income category is required')]"
        variant="outlined"
      >
        <template #append>
          <v-btn
            color="primary"
            icon="mdi-plus"
            size="small"
            variant="tonal"
            @click.stop="handleCreateCategory"
          />
        </template>
      </app-select-sheet>

      <app-select-sheet
        v-model="formData.pocket"
        density="comfortable"
        hide-details="auto"
        :items="formOptions.pocket"
        label="Wallet"
        :rules="[rules.required('Income wallet is required')]"
        variant="outlined"
      />

      <v-text-field
        v-model="formData.amount"
        autocomplete="off"
        density="comfortable"
        hide-details="auto"
        inputmode="numeric"
        label="Amount"
        :rules="[rules.required('Income amount is required')]"
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

    <category-form-sheet
      v-model="categoryDialog.show"
      category-type="income"
      :loading="categoryFormLoad.submit"
      :type="categoryDialog.type"
      :type-options="categoryFormOptions.type"
      @submit="handleSubmitCategory"
    />
  </div>
</template>
