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
                <h6>Enter your email address and we'll send you a link to reset your password.</h6>
              </div>
            </div>
            <v-form ref="formRef" class="space-y-12 max-w-[32rem]" @submit.prevent="handleResetPassword">
              <div class="space-y-6">

                <v-text-field
                  v-model="email"
                  :disabled="authStore.loading"
                  hide-details="auto"
                  label="Email"
                  prepend-inner-icon="mdi-email-outline"
                  :rules="[rules.required('Email address is required'), rules.email('Invalid email address')]"
                  type="email"
                  variant="outlined"
                />
              </div>

              <div class="space-y-4 text-center">
                <v-btn
                  block
                  color="primary"
                  :loading="authStore.loading"
                  size="large"
                  type="submit"
                  variant="flat"
                >
                  Send Reset Link
                </v-btn>

                <div>
                  <btn class="cursor-pointer select-none font-semibold text-center text-primary-600 hover:text-primary-200 !transition !duration-200 !ease-in" @click="handleBackToLogin">
                    <v-icon>mdi-arrow-left</v-icon>
                    Back to Login
                  </btn>
                </div>
              </div>
            </v-form>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { useRules } from 'vuetify/labs/rules'
  import { useDeviceType } from '@/composables/useDeviceType'
  import { useToasts } from '@/composables/useToasts'
  import { useAuthStore } from '@/stores/auth'

  const rules = useRules()
  const authStore = useAuthStore()
  const toast = useToasts()
  const router = useRouter()
  const { isMobile } = useDeviceType()

  const formRef = ref(null)
  const email = ref('')

  async function handleResetPassword () {
    const { valid } = await formRef.value.validate()

    if (!valid) {
      return
    }

    const result = await authStore.resetPassword(email.value)

    if (result) {
      toast.push('Password reset link has been sent to your email. Please check your inbox.', { color: 'success' })
    }
  }

  function handleBackToLogin () {
    router.push('/login')
  }
</script>
