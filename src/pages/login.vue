<script setup>
  import { reactive, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useRules } from 'vuetify/labs/rules'
  import { useDeviceType } from '@/composables/useDeviceType'
  import { useToasts } from '@/composables/useToasts'
  import { useAuthStore } from '@/stores/auth'

  const router = useRouter()
  const route = useRoute()
  const authStore = useAuthStore()
  const toast = useToasts()
  const rules = useRules()
  const { isMobile } = useDeviceType()

  const formRef = ref(null)
  const showPassword = ref(false)

  const formData = reactive({
    email: '',
    password: '',
  })

  async function handleLogin () {
    const { valid } = await formRef.value.validate()

    if (!valid) {
      return
    }

    const result = await authStore.login(formData.email, formData.password)

    if (authStore.error) toast.push(authStore.error, { color: 'error' })

    if (result) {
      toast.push(`welcome back ${authStore.user.user_metadata.display_name}`, { color: 'success' })
      const redirectPath = route.query.redirect || '/app'
      await router.push(redirectPath)
    }
  }

  function handleLogoClick () {
    router.push('/')
  }

  function handleRegister () {
    router.push('/register')
  }

  function handleForgotPassword () {
    router.push('/forgot-password')
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
          src="@/assets/illustrations/login.svg"
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
                <h1 class="text-xl sm:text-3xl font-semibold text-primary-700">Login</h1>
                <div class="flex items-center justify-start gap-1">
                  Not a member yet?
                  <span class="cursor-pointer select-none font-semibold text-primary-600 hover:text-primary-200 !transition !duration-200 !ease-in" @click="handleRegister">
                    Register
                  </span>
                </div>
              </div>
            </div>
            <v-form ref="formRef" class="space-y-12 max-w-[32rem]" @submit.prevent="handleLogin">
              <div class="space-y-6">
                <v-text-field
                  v-model="formData.email"
                  autocomplete="email"
                  :density="isMobile ? 'comfortable' : 'default'"
                  hide-details="auto"
                  label="Email"
                  prepend-inner-icon="mdi-email-outline"
                  :rules="[rules.required('Email address is required'), rules.email('Invalid email address')]"
                  type="email"
                  variant="outlined"
                />

                <v-text-field
                  v-model="formData.password"
                  :append-inner-icon="showPassword ? 'mdi-eye-outline' : 'mdi-eye-off-outline'"
                  autocomplete="on"
                  :density="isMobile ? 'comfortable' : 'default'"
                  hide-details="auto"
                  label="Password"
                  prepend-inner-icon="mdi-lock-outline"
                  :rules="[rules.required('Password is required')]"
                  :type="showPassword ? 'text' : 'password'"
                  variant="outlined"
                  @click:append-inner="showPassword = !showPassword"
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
                  Login
                </v-btn>

                <div>
                  <span class="cursor-pointer select-none font-semibold text-primary-600 hover:text-primary-200 !transition !duration-200 !ease-in" @click="handleForgotPassword">
                    Forgot the password?
                  </span>
                </div>
              </div>
            </v-form>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>
