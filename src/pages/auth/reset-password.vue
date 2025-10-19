<template>
  <v-row class="h-screen bg-gradient-to-bl from-primary-500 to-white dark:to-gray-950" cols="2" no-gutters>
    <v-col class="hidden xl:flex items-center justify-center">
      <div class="w-[40rem]">
        <v-img
          alt="no-data"
          aspect-ratio="1/1"
          class="mx-auto"
          :height="500"
          src="@/assets/illustrations/reset-password.svg"
        />
      </div>
    </v-col>
    <v-col class="flex items-center justify-center">
      <v-card class="shadow-xl h-100 lg:h-auto rounded-none lg:rounded-3xl" :loading="authStore.loading">
        <v-card-text class="p-6 sm:p-10 lg:p-16 flex items-center justify-center lg:block h-100 lg:h-auto w-screen lg:w-[36rem]">
          <div class="w-full mx-auto max-w-[32rem] space-y-12">
            <div class="space-y-6">
              <app-logo class="cursor-pointer" :size="isMobile ? 'small' : 'default'" @click="handleLogoClick" />
              <div class="space-y-2">
                <h1 class="text-xl sm:text-3xl font-semibold text-primary-700">Reset Password</h1>
                <h6>Please enter your new password.</h6>
              </div>
            </div>
            <v-form ref="formRef" class="space-y-12 max-w-[32rem]" @submit.prevent="handleUpdatePassword">
              <div class="space-y-6">

                <v-text-field
                  v-model="formData.newPassword"
                  :append-inner-icon="showNewPassword ? 'mdi-eye-outline' : 'mdi-eye-off-outline'"
                  :density="isMobile ? 'comfortable' : 'default'"
                  :disabled="authStore.loading"
                  hide-details="auto"
                  label="New Password"
                  prepend-inner-icon="mdi-lock-outline"
                  :rules="[rules.required, rules.minLength]"
                  :type="showNewPassword ? 'text' : 'password'"
                  variant="outlined"
                  @click:append-inner="showNewPassword = !showNewPassword"
                />

                <v-text-field
                  v-model="formData.confirmPassword"
                  :append-inner-icon="showConfirmPassword ? 'mdi-eye-outline' : 'mdi-eye-off-outline'"
                  :disabled="authStore.loading"
                  hide-details="auto"
                  label="Confirm New Password"
                  prepend-inner-icon="mdi-lock-check-outline"
                  :rules="[rules.required, rules.passwordMatch]"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  variant="outlined"
                  @click:append-inner="showConfirmPassword = !showConfirmPassword"
                />
              </div>

              <div class="space-y-4">
                <v-btn
                  block
                  color="primary"
                  :loading="authStore.loading"
                  size="large"
                  type="submit"
                  variant="flat"
                >
                  Update Password
                </v-btn>
              </div>
            </v-form>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup>
  import { reactive, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { useDeviceType } from '@/composables/useDeviceType'
  import { useToasts } from '@/composables/useToasts'
  import { useAuthStore } from '@/stores/auth'

  const router = useRouter()
  const authStore = useAuthStore()
  const toast = useToasts()
  const { isMobile } = useDeviceType()

  const formRef = ref(null)
  const showNewPassword = ref(false)
  const showConfirmPassword = ref(false)

  const formData = reactive({
    newPassword: '',
    confirmPassword: '',
  })

  const rules = {
    required: value => !!value || 'This field is required',
    minLength: value => value.length >= 6 || 'Password must be at least 6 characters',
    passwordMatch: value => value === formData.newPassword || 'Passwords do not match',
  }

  async function handleUpdatePassword () {
    const { valid } = await formRef.value.validate()

    if (!valid) return

    const result = await authStore.updatePassword(formData.newPassword)

    if (authStore.error) toast.push(authStore.error, { color: 'error' })

    if (result) {
      toast.push('Password updated successfully! You can now log in with your new password.', { color: 'success' })

      setTimeout(async () => {
        await authStore.logout()
        router.push('/login')
      }, 2000)
    }
  }

  function handleLogoClick () {
    router.push('/')
  }
</script>
