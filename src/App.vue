<template>
  <div>
    <h1>Expense Tracker</h1>

    <form @submit.prevent="addExpense">
      <label>
        Type:
        <select v-model="type">
          <option :value="true">Income</option>
          <option :value="false">Expense</option>
        </select>
      </label>
      <label>
        Amount:
        <input type="number" v-model.number="amount" step="0.01" required>
      </label>
      <button type="submit">Add</button>
    </form>

    <div v-if="error" style="color:red; margin-top:10px;">
      Error: {{ error }}
    </div>

    <h2>Records</h2>
    <ul>
      <li v-for="record in records" :key="record.id">
        {{ record.gains ? 'Income' : 'Expense' }}: €{{ record.amount }} (ID: {{ record.id }})
      </li>
    </ul>
    <!-- <h2>Monthly Sums (Last 2 Months)</h2>
    <div v-for="(sum, month) in totals.monthlySums" :key="month">
      <strong>{{ month }}:</strong> Income: ${{ sum.income }}, Expenses: ${{ sum.expenses }}
    </div> -->
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
  setup() {
    const type = ref(true)
    const amount = ref(0)
    const records = ref([])
    const error = ref('')

    async function fetchRecords() {
      try {
        const res = await fetch('/api/list')
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
        records.value = await res.json()
        error.value = ''
      } catch (err) {
        console.error('Error fetching records:', err)
        error.value = err.message
      }
    }

    async function addExpense() {
      try {
        const res = await fetch('/api/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gains: type.value, amount: amount.value })
        })
        if (!res.ok) {
          const errData = await res.json()
          throw new Error(errData.error || `HTTP ${res.status}: ${res.statusText}`)
        }
        await res.json()
        amount.value = 0
        error.value = ''
        fetchRecords()
      } catch (err) {
        console.error('Error adding expense:', err)
        error.value = err.message
      }
    }

    onMounted(fetchRecords)

    return { type, amount, records, addExpense, error }
  }
}
</script>
