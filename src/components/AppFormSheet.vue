<script setup>
  import { ref } from 'vue'

  const props = defineProps({
    modelValue: Boolean,
    prependIcon: String,
    submitText: {
      type: String,
      default: 'Submit',
    },
    loading: Boolean,
  })
  const emit = defineEmits(['update:modelValue', 'submit', 'close'])

  const formRef = ref(null)

  async function handleSubmit () {
    const { valid } = await formRef.value.validate()
    if (!valid) return
    emit('submit')
  }

  function handleClose () {
    emit('update:modelValue', false)
    emit('close')
  }
</script>

<template>
  <v-bottom-sheet :model-value="props.modelValue" @update:model-value="$emit('update:modelValue', value)">
    <v-card :prepend-icon="props.prependIcon" :rounded="false">
      <template #title>
        <div class="flex justify-between items-center">
          <slot name="title" />
          <v-btn
            color="primary"
            :disabled="loading"
            icon="mdi-close"
            size="small"
            variant="text"
            @click="handleClose"
          />
        </div>
      </template>
      <v-card-text class="px-6 py-4">
        <v-form ref="formRef" class="space-y-4 sm:space-y-6" @submit.prevent="handleSubmit">
          <slot name="form" />
          <v-row>
            <v-col>
              <v-btn
                block
                class="capitalize"
                color="primary"
                :loading="loading"
                size="large"
                :text="props.submitText"
                type="submit"
                variant="flat"
              />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>
  </v-bottom-sheet>
</template>
