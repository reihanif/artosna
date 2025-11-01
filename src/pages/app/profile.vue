<script setup>
  import moment from 'moment'
  import { computed, reactive, ref, watch } from 'vue'
  import { useRules } from 'vuetify/labs/rules'
  import { useToasts } from '@/composables/useToasts'
  import { useAuthStore } from '@/stores/auth'

  const authStore = useAuthStore()
  const rules = useRules()
  const toast = useToasts()

  const showEditProfileDialog = ref(false)
  const datePicker = ref(false)

  const date = computed(() => {
    if (!profileData.dateOfBirth) return null
    return moment(profileData.dateOfBirth).format('DD MMMM YYYY')
  })

  const profileData = reactive({
    displayName: null,
    phoneNumber: null,
    dateOfBirth: null,
    bio: null,
  })

  // Initialize profile data from store
  watch(() => authStore.user, newUser => {
    if (newUser) {
      setProfileData()
    }
  }, { immediate: true })

  async function handleUpdateProfile () {
    const metadata = {
      display_name: profileData.displayName,
      phone_number: profileData.phoneNumber,
      date_of_birth: profileData.dateOfBirth,
      bio: profileData.bio,
    }

    const result = await authStore.updateUserMetadata(metadata)

    if (result) {
      toast.push('Profile updated successfully!', { color: 'success' })
      closeProfileDialog()
    }
  }

  function closeProfileDialog () {
    showEditProfileDialog.value = false
    authStore.clearError()
    setProfileData()
  }

  function setProfileData () {
    profileData.displayName = authStore.displayName || null
    profileData.phoneNumber = authStore.phoneNumber || null
    profileData.dateOfBirth = authStore.dateOfBirth ? moment(authStore.dateOfBirth).toDate() : null
    profileData.bio = authStore.bio || null
  }
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold">My Profile</h1>

    <v-card>
      <v-card-text>
        <div class="flex items-center gap-4">
          <v-avatar size="72">
            <v-img
              alt="avatar"
              :src="authStore.avatarUrl"
            />
          </v-avatar>
          <div>
            <div class="text-lg font-medium">
              {{ authStore.displayName }}
            </div>
            <p class="text-sm text-primary-500 mt-1">
              {{ authStore.user.email }}
            </p>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <v-card class="p-4">
      <v-card-title>
        <div class="flex justify-between items-center pb-4 border-b">
          <span>
            Personal Information
          </span>
          <v-btn color="primary" variant="outlined" @click="showEditProfileDialog = true">
            <template #prepend>
              <v-icon icon="mdi-account-edit-outline" />
            </template>
            Edit Profile
          </v-btn>
        </div>
      </v-card-title>
      <v-card-text>
        <div class="grid grid-cols-3 gap-4 pt-4">
          <div>
            <div class="text-xs text-gray-600 dark:text-gray-300">
              Full Name
            </div>
            <div class="font-medium mt-1">
              {{ authStore.displayName }}
            </div>
          </div>
          <div>
            <div class="text-xs text-gray-600 dark:text-gray-300">
              Phone Number
            </div>
            <div class="font-medium mt-1">
              {{ authStore.phoneNumber || '-' }}
            </div>
          </div>
          <div>
            <div class="text-xs text-gray-600 dark:text-gray-300">
              Date of Birth
            </div>
            <div class="font-medium mt-1">
              {{ authStore.dateOfBirth ? moment(authStore.dateOfBirth).format('DD MMMM YYYY') : '-' }}
            </div>
          </div>
          <div class="col-span-3">
            <div class="text-xs text-gray-600 dark:text-gray-300">
              Bio
            </div>
            <div class="font-medium mt-1">
              {{ authStore.bio || '-' }}
            </div>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <app-form-modal
      v-model="showEditProfileDialog"
      :loading="authStore.loading"
      submit-text="Save"
      @submit="handleUpdateProfile"
    >
      <template #title>
        Personal Information
      </template>
      <template #form>
        <v-text-field
          v-model="profileData.displayName"
          :disabled="authStore.loading"
          hide-details="auto"
          label="Full Name"
          :rules="[rules.required('Full name is required')]"
          variant="outlined"
        />

        <v-text-field
          v-model="profileData.phoneNumber"
          :disabled="authStore.loading"
          hide-details="auto"
          label="Phone Number"
          type="tel"
          variant="outlined"
        />

        <v-text-field
          v-model="date"
          autocomplete="off"
          :disabled="authStore.loading"
          hide-details="auto"
          label="Date of Birth"
          readonly
          variant="outlined"
          @click="datePicker = true"
        />
        <app-date-picker v-model="datePicker" v-model:selected-date="profileData.dateOfBirth" />

        <v-textarea
          v-model="profileData.bio"
          auto-grow
          counter
          :disabled="authStore.loading"
          hide-details="auto"
          hint="Tell us about yourself"
          label="Bio"
          maxlength="500"
          persistent-hint
          rows="3"
          variant="outlined"
        />
      </template>
    </app-form-modal>
  </div>
</template>
