import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

export default async function handler(req, res) {
  try {
    // Fetch all records
    const { data: records, error } = await supabase
      .from('expenses')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) return res.status(500).json({ error: error.message })

    const now = new Date()
    const thisMonth = now.getMonth()
    const thisYear = now.getFullYear()
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonth = lastMonthDate.getMonth()
    const lastMonthYear = lastMonthDate.getFullYear()

    // Initialize sums
    let totalIncome = 0
    let totalExpenses = 0
    let monthlySums = {
      [lastMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' })]: { income: 0, expenses: 0 },
      [now.toLocaleString('default', { month: 'long', year: 'numeric' })]: { income: 0, expenses: 0 }
    }

    records.forEach(r => {
      const amount = parseFloat(r.amount)
      const date = new Date(r.created_at)

      // Totals
      if (r.gains) totalIncome += amount
      else totalExpenses += amount

      // Monthly sums
      const monthKey = date.toLocaleString('default', { month: 'long', year: 'numeric' })
      if (monthKey in monthlySums) {
        if (r.gains) monthlySums[monthKey].income += amount
        else monthlySums[monthKey].expenses += amount
      }
    })

    res.status(200).json({
      records,
      totals: {
        totalIncome,
        totalExpenses,
        monthlySums
      }
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
