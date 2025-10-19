/**
 * plugins/rules.js
 *
 * Framework documentation: https://vuetifyjs.com/en/features/rules/`
 */

// Composables
import { createRulesPlugin } from 'vuetify/labs/rules'
import vuetify from './vuetify'

export default createRulesPlugin({
  aliases: {
    passwordStrength: (message = 'Password must be at least 8 characters with uppercase, lowercase, number and special character') => {
      return value => {
        if (!value) {
          return true
        }
        const hasMinLength = value.length >= 8
        const hasUpperCase = /[A-Z]/.test(value)
        const hasLowerCase = /[a-z]/.test(value)
        const hasNumber = /[0-9]/.test(value)
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value)

        return (hasMinLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecial) || message
      }
    },

    passwordMatch: (compareValue, message = 'Passwords do not match') => {
      return value => value === compareValue || message
    },

    phone: (message = 'Invalid phone number format') => {
      return value => {
        if (!value) {
          return true
        }
        const pattern = /^[\d\s\-+()]+$/
        return pattern.test(value) || message
      }
    },

    dateOfBirth: (message = 'Date of birth must be in the past') => {
      return value => {
        if (!value) {
          return true
        }

        const date = new Date(value)
        const today = new Date()

        if (Number.isNaN(date.getTime())) {
          return 'Invalid date format'
        }

        return date < today ? true : message
      }
    },
  },
}, vuetify.locale)
