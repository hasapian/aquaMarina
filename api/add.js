import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { gains, amount } = req.body

    if (typeof gains !== 'boolean' || typeof amount !== 'number') {
      return res.status(400).json({ error: 'Invalid input' })
    }

    const { data, error } = await supabase
      .from('expenses')
      .insert([{ gains, amount }])
      .select() // returns inserted row

    if (error) return res.status(500).json({ error: error.message })
    res.status(200).json(data[0])
  } else {
    res.status(405).json({ message: 'Method Not Allowed' })
  }
}
