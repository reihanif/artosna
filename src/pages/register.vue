<script setup>
  import { reactive, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { useRules } from 'vuetify/labs/rules'
  import { useDeviceType } from '@/composables/useDeviceType'
  import { useToasts } from '@/composables/useToasts'
  import { useAuthStore } from '@/stores/auth'

  const toast = useToasts()
  const router = useRouter()
  const authStore = useAuthStore()
  const rules = useRules()
  const { isMobile } = useDeviceType()

  const formRef = ref(null)
  const showPassword = ref(false)
  const showConfirmPassword = ref(false)

  const formData = reactive({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  async function handleRegister () {
    const { valid } = await formRef.value.validate()
    if (!valid) return
    const result = await authStore.register(formData.email, formData.password, { display_name: formData.fullName })
    if (result) {
      toast.push('Registration successful! Please check your email to confirm your account.', { color: 'success' })
      resetForm()
      setTimeout(() => {
        router.push({ name: 'login' })
      }, 3000)
    } else {
      toast.push('Registration failed.', { color: 'error' })
    }
  }

  function resetForm () {
    formData.fullName = ''
    formData.email = ''
    formData.password = ''
    formData.confirmPassword = ''
    formRef.value.reset()
  }

  function handleLogoClick () {
    router.push('/')
  }

  function handleLogin () {
    router.push('/login')
  }
</script>

<template>
  <v-row class="h-screen bg-gradient-to-bl from-primary-500 to-white dark:to-gray-950" cols="2" no-gutters>
    <v-col class="hidden xl:flex items-center justify-center">
      <div class="w-[40rem]">
        <v-img
          alt="no-data"
          aspect-ratio="1/1"
          class="mx-auto"
          :height="500"
          src="@/assets/illustrations/register.svg"
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
                <h1 class="text-xl sm:text-3xl font-semibold text-primary-700">Register</h1>
                <h6>Register to be a part of us!</h6>
              </div>
            </div>
            <v-form ref="formRef" class="space-y-12" @submit.prevent="handleRegister">
              <div class="space-y-6">
                <v-text-field
                  v-model="formData.email"
                  autocomplete="email"
                  :density="isMobile ? 'comfortable' : 'default'"
                  :disabled="authStore.loading"
                  hide-details="auto"
                  label="Email"
                  prepend-inner-icon="mdi-email-outline"
                  :rules="[rules.required('Email is required'), rules.email]"
                  type="email"
                  variant="outlined"
                />

                <v-text-field
                  v-model="formData.fullName"
                  :density="isMobile ? 'comfortable' : 'default'"
                  :disabled="authStore.loading"
                  hide-details="auto"
                  label="Full Name"
                  prepend-inner-icon="mdi-account-outline"
                  :rules="[rules.required('Full name is required')]"
                  variant="outlined"
                />

                <v-text-field
                  v-model="formData.password"
                  :append-inner-icon="showPassword ? 'mdi-eye-outline' : 'mdi-eye-off-outline'"
                  autocomplete="on"
                  :density="isMobile ? 'comfortable' : 'default'"
                  :disabled="authStore.loading"
                  hide-details="auto"
                  label="Password"
                  prepend-inner-icon="mdi-lock-outline"
                  :rules="[rules.required('Password is required'), rules.minLength]"
                  :type="showPassword ? 'text' : 'password'"
                  variant="outlined"
                  @click:append-inner="showPassword = !showPassword"
                />

                <v-text-field
                  v-model="formData.confirmPassword"
                  :append-inner-icon="showConfirmPassword ? 'mdi-eye-outline' : 'mdi-eye-off-outline'"
                  autocomplete="on"
                  :density="isMobile ? 'comfortable' : 'default'"
                  :disabled="authStore.loading"
                  hide-details="auto"
                  label="Confirm Password"
                  prepend-inner-icon="mdi-lock-check-outline"
                  :rules="[rules.required('Confirm password is required'), rules.passwordStrength(), rules.passwordMatch(formData.password)]"
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
                  Register
                </v-btn>

                <div class="flex items-center justify-center gap-1 font-semibold text-gray-400">
                  Already have an account?
                  <btn class="cursor-pointer select-none text-primary-600 hover:text-primary-200 !transition !duration-200 !ease-in" @click="handleLogin">
                    Login
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
