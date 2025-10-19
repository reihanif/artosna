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
  <v-dialog max-width="600" :model-value="props.modelValue" persistent>
    <v-card :prepend-icon="props.prependIcon" rounded="lg">
      <template #title>
        <slot name="title" />
      </template>
      <v-card-text class="px-6 py-4">
        <v-form ref="formRef" class="space-y-6" @submit.prevent="handleSubmit">
          <slot name="form" />
          <v-row>
            <v-col>
              <v-btn
                block
                color="primary"
                :disabled="loading"
                text="Cancel"
                variant="outlined"
                @click="handleClose"
              />
            </v-col>
            <v-col>
              <v-btn
                block
                class="capitalize"
                color="primary"
                :loading="loading"
                :text="props.submitText"
                type="submit"
                variant="flat"
              />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
