// composables/useOptions.js
import moment from 'moment'
import { ref } from 'vue'
import { supabase } from '@/utils/supabase'

export function useOptions () {
  const isLoading = ref(false)
  const error = ref(null)

  /**
   * Generic fetch function with query builder callback
   * @param {string} tableName - The name of the table to fetch from
   * @param {Function} queryBuilder - Callback function to build the query
   * @param {Object} transform - Transformation options
   * @param {string} transform.valueField - Field to use as option value (default: 'id')
   * @param {string} transform.titleField - Field to use as option title (default: 'name')
   * @returns {Promise<Array>} Array of formatted options
   */
  async function fetchOptions (tableName, queryBuilder, transform = {}) {
    const { valueField = 'id', titleField = 'name' } = transform

    isLoading.value = true
    error.value = null

    try {
      const baseQuery = supabase.from(tableName)
      const query = queryBuilder ? queryBuilder(baseQuery) : baseQuery.select('*')

      const { data, error: fetchError } = await query

      if (fetchError) {
        error.value = fetchError
        console.error(`Error fetching ${tableName}:`, fetchError)
        return []
      }

      return data.map(item => ({
        title: item[titleField],
        value: item[valueField],
      }))
    } catch (error) {
      error.value = error
      console.error(`Unexpected error fetching ${tableName}:`, error)
      return []
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetches category options filtered by type
   * @param {string} type - Category type (e.g., 'expense', 'income')
   * @returns {Promise<Array>} Array of category options
   */
  async function fetchCategoryOptions (type = 'expense') {
    return fetchOptions(
      'categories',
      query => query.select('id, name').eq('type', type),
    )
  }

  /**
   * Fetches wallet/pocket options
   * @returns {Promise<Array>} Array of wallet options
   */
  async function fetchWalletOptions () {
    return fetchOptions(
      'pockets',
      query => query.select('id, name'),
    )
  }

  /**
   * Fetches budget options
   * @returns {Promise<Array>} Array of wallet options
   */
  async function fetchBudgetOptions (period = null) {
    const startISO = moment(period).startOf('month').toISOString()
    const endISO = moment(period).endOf('month').toISOString()

    return fetchOptions(
      'budgets',
      query => query.select('id, name')
        .gte('period', startISO)
        .lte('period', endISO),
    )
  }

  /**
   * Set type options
   * @returns {Array} Type - type of transactions
   */
  function getTransactionOptions (withTransfer = false) {
    let types = [
      { title: 'Income', value: 'income' },
      { title: 'Expense', value: 'expense' },
      { title: 'Transfer', value: 'transfer' },
    ]
    if (!withTransfer) {
      types = types.filter(item => item.value !== 'transfer')
    }
    return types
  }

  return {
    isLoading,
    error,
    fetchOptions,
    fetchCategoryOptions,
    fetchWalletOptions,
    fetchBudgetOptions,
    getTransactionOptions,
  }
}
