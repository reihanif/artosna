<script setup>
  import { computed, reactive, watch } from 'vue'
  import { useRules } from 'vuetify/labs/rules'
  import { useCurrencyFormatter } from '@/composables/useCurrencyFormatter'

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
    initialData: {
      type: Object,
      default: null,
    },
  })

  const emit = defineEmits(['update:modelValue', 'submit', 'close'])

  const rules = useRules()

  const formData = reactive({
    id: null,
    name: null,
    initialBalance: null,
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

  function resetForm () {
    formData.id = null
    formData.name = null
    formData.initialBalance = null
  }

  function setFormData (data) {
    if (!data) {
      resetForm()
      return
    }

    formData.id = data.id
    formData.name = data.name
    formData.initialBalance = data.initial_balance || data.initialBalance
  }

  watch(() => props.initialData, newData => {
    setFormData(newData)
  }, { immediate: true, deep: true })

  watch(() => props.modelValue, isOpen => {
    if (!isOpen) {
      resetForm()
    }
  })

  useCurrencyFormatter(formData, 'initialBalance')

  defineExpose({
    resetForm,
    setFormData,
    formData,
  })
</script>

<template>
  <app-form-modal
    v-model="dialogModel"
    :loading="loading"
    prepend-icon="mdi-wallet-outline"
    :submit-text="type"
    @close="handleClose"
    @submit="handleSubmit"
  >
    <template #title>
      <span class="capitalize">
        {{ type }} Wallet
      </span>
    </template>
    <template #form>
      <v-text-field
        v-model="formData.name"
        autocomplete="off"
        hide-details="auto"
        label="Name"
        :rules="[rules.required('Wallet name is required')]"
        variant="outlined"
      />
      <v-text-field
        v-model="formData.initialBalance"
        autocomplete="off"
        hide-details="auto"
        inputmode="numeric"
        label="Initial Balance"
        variant="outlined"
      >
        <template v-if="formData.initialBalance" #prepend-inner>
          Rp
        </template>
      </v-text-field>
    </template>
  </app-form-modal>
</template>
