import moment from 'moment'
import { computed, reactive, ref } from 'vue'
import { useCurrencyFormatter } from '@/composables/useCurrencyFormatter'
import { useToasts } from '@/composables/useToasts'
import { supabase } from '@/utils/supabase'

export function useTransactions () {
  const toast = useToasts()
  const { formatCurrency } = useCurrencyFormatter()

  const loading = ref(false)
  const tables = reactive({
    loading: true,
    headers: [
      { title: 'Date', key: 'date', sortable: false, width: 180 },
      { title: 'Title', key: 'title', sortable: false },
      { title: 'Amount', key: 'amount', sortable: false, width: 140 },
      { title: 'Type', key: 'type', sortable: false, width: 140 },
    ],
    items: [],
    totalItems: 0,
    page: 1,
    itemsPerPage: 10,
    totalPage: 1,
  })

  // Infinite scroll specific state
  const infiniteScroll = reactive({
    items: [],
    page: 0,
    hasMore: true,
    loading: false,
    itemsPerPage: 10,
    totalItems: 0,
  })

  // Computed property to check if there are more items to load
  const hasMoreItems = computed(() => {
    return infiniteScroll.items.length < infiniteScroll.totalItems
  })

  /**
   * Maps raw transaction data to formatted structure
   * @param {Array} data - Raw transaction data from database
   * @returns {Array} Formatted transaction items
   */
  function mapTransactionData (data) {
    return data.map(item => ({
      id: item.id,
      title: item.title,
      type: item.type,
      amount: `Rp ${formatCurrency(item.amount)}`,
      amountValue: item.amount,
      date: moment(item.date).format('DD MMMM YYYY'),
      dateValue: moment(item.date).toDate(),
      pocketId: item.pocket_id.id,
      pocket: item.pocket_id.name,
      destinationPocketId: item.destination_pocket_id?.id,
      destinationPocket: item.destination_pocket_id?.name,
      budgetId: item.budgets?.id,
      budget: item.budgets?.name,
      categoryId: item.type === 'expense' ? item.budgets?.categories.id : item.categories?.id,
      category: item.type === 'expense' ? item.budgets?.categories.name : item.categories?.name,
      notes: item.notes,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }))
  }

  /**
   * Fetches transactions for standard pagination
   * @param {number} page - Page number to fetch
   */
  async function fetchTransactions (page = 1) {
    tables.loading = true
    const firstItem = ((page - 1) * tables.itemsPerPage)
    const lastItem = (firstItem + (tables.itemsPerPage - 1))

    const { data, error, count } = await supabase
      .from('transactions')
      .select(`
        id,
        title,
        type,
        amount,
        date,
        pocket_id (
          id,
          name
        ),
        destination_pocket_id (
          id,
          name
        ),
        budgets (
          id,
          name,
          categories (
            id,
            name
          )
        ),
        categories (
          id,
          name
        ),
        notes,
        created_at,
        updated_at
      `, { count: 'exact' })
      .order('date', { ascending: false })
      .range(firstItem, lastItem)

    if (error) {
      console.error(error)
      toast.push('Error fetching transactions', { color: 'error', timeout: 5000 })
      tables.items = []
      tables.totalItems = 0
      tables.totalPage = 1
    } else if (count > 0) {
      tables.items = mapTransactionData(data)
      tables.page = page
      tables.totalItems = count
      tables.totalPage = Math.ceil(count / tables.itemsPerPage)
    } else {
      tables.items = []
      tables.totalItems = 0
      tables.totalPage = 1
    }

    tables.loading = false
  }

  /**
   * Loads more transactions for infinite scroll
   * @param {Object} options - Load options with done callback
   */
  async function loadMoreTransactions ({ done }) {
    // Prevent multiple simultaneous requests
    if (infiniteScroll.loading || !infiniteScroll.hasMore) {
      if (done) {
        done('empty')
      }
      return
    }

    infiniteScroll.loading = true
    infiniteScroll.page += 1

    const firstItem = ((infiniteScroll.page - 1) * infiniteScroll.itemsPerPage)
    const lastItem = (firstItem + (infiniteScroll.itemsPerPage - 1))

    try {
      const { data, error, count } = await supabase
        .from('transactions')
        .select(`
          id,
          title,
          type,
          amount,
          date,
          pocket_id (
            id,
            name
          ),
          destination_pocket_id (
            id,
            name
          ),
          budgets (
            id,
            name,
            categories (
              id,
              name
            )
          ),
          categories (
            id,
            name
          ),
          notes,
          created_at,
          updated_at
        `, { count: 'exact' })
        .order('date', { ascending: false })
        .range(firstItem, lastItem)

      if (error) {
        console.error(error)
        toast.push('Error loading transactions', { color: 'error', timeout: 5000 })
        infiniteScroll.hasMore = false
        if (done) {
          done('error')
        }
      } else {
        // Store total items on first load
        if (infiniteScroll.page === 1) {
          infiniteScroll.totalItems = count || 0
        }

        if (data && data.length > 0) {
          const formattedData = mapTransactionData(data)
          infiniteScroll.items.push(...formattedData)

          // Check if there are more items to load
          infiniteScroll.hasMore = infiniteScroll.items.length < infiniteScroll.totalItems

          if (done) {
            done(infiniteScroll.hasMore ? 'ok' : 'empty')
          }
        } else {
          infiniteScroll.hasMore = false
          if (done) {
            done('empty')
          }
        }
      }
    } catch (error) {
      console.error('Unexpected error loading transactions:', error)
      toast.push('Unexpected error occurred', { color: 'error', timeout: 5000 })
      infiniteScroll.hasMore = false
      if (done) {
        done('error')
      }
    } finally {
      infiniteScroll.loading = false
    }
  }

  /**
   * Resets infinite scroll state and loads initial data
   */
  async function initializeInfiniteScroll () {
    infiniteScroll.items = []
    infiniteScroll.page = 0
    infiniteScroll.hasMore = true
    infiniteScroll.loading = false
    infiniteScroll.totalItems = 0
  }

  /**
   * Manually triggers loading more items (useful for initial load)
   */
  async function loadInitialTransactions () {
    await initializeInfiniteScroll()
  }

  return {
    tables,
    loading,
    infiniteScroll,
    hasMoreItems,
    fetchTransactions,
    loadMoreTransactions,
    initializeInfiniteScroll,
    loadInitialTransactions,
  }
}
