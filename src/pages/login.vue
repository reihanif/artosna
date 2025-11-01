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

  async function handleGoogleSignIn () {
    await authStore.signInWithGoogle()

    if (authStore.error) toast.push(authStore.error, { color: 'error' })
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
            <div class="space-y-8">
              <v-btn
                block
                class="border"
                :readonly="authStore.loading"
                size="large"
                variant="flat"
                @click="handleGoogleSignIn"
              >
                <template #prepend>
                  <v-icon>
                    <svg
                      preserveAspectRatio="xMidYMid"
                      version="1.1"
                      viewBox="-3 0 262 262"
                      xmlns="http://www.w3.org/2000/svg"
                      xmlns:xlink="http://www.w3.org/1999/xlink"
                    >
                      <g>
                        <path
                          d="M255.878,133.451 C255.878,122.717 255.007,114.884 253.122,106.761 L130.55,106.761 L130.55,155.209 L202.497,155.209 C201.047,167.249 193.214,185.381 175.807,197.565 L175.563,199.187 L214.318,229.21 L217.003,229.478 C241.662,206.704 255.878,173.196 255.878,133.451"
                          fill="#4285F4"
                        />
                        <path
                          d="M130.55,261.1 C165.798,261.1 195.389,249.495 217.003,229.478 L175.807,197.565 C164.783,205.253 149.987,210.62 130.55,210.62 C96.027,210.62 66.726,187.847 56.281,156.37 L54.75,156.5 L14.452,187.687 L13.925,189.152 C35.393,231.798 79.49,261.1 130.55,261.1"
                          fill="#34A853"
                        />
                        <path
                          d="M56.281,156.37 C53.525,148.247 51.93,139.543 51.93,130.55 C51.93,121.556 53.525,112.853 56.136,104.73 L56.063,103 L15.26,71.312 L13.925,71.947 C5.077,89.644 0,109.517 0,130.55 C0,151.583 5.077,171.455 13.925,189.152 L56.281,156.37"
                          fill="#FBBC05"
                        />
                        <path
                          d="M130.55,50.479 C155.064,50.479 171.6,61.068 181.029,69.917 L217.873,33.943 C195.245,12.91 165.798,0 130.55,0 C79.49,0 35.393,29.301 13.925,71.947 L56.136,104.73 C66.726,73.253 96.027,50.479 130.55,50.479"
                          fill="#EB4335"
                        />
                      </g>
                    </svg>
                  </v-icon>
                </template>
                Sign in with Google
              </v-btn>

              <div class="relative">
                <span class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white text-gray-600 text-xs font-medium p-2.5">or Sign in with Email</span>
                <v-divider :opacity="1" :thickness="1" />
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
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>
