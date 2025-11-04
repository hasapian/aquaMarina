<template>
  <div class="container">
    <h1>Expense Tracker</h1>

    <!-- Add new record form -->
    <form @submit.prevent="addExpense" class="form">
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

    <!-- Error -->
    <div v-if="error" class="error">
      Error: {{ error }}
    </div>

    <!-- Totals -->
    <div class="totals">
      <h2>Totals</h2>
      <p>Total Income: {{ totals.totalIncome.toFixed(2) }}€</p>
      <p>Total Expenses: {{ totals.totalExpenses.toFixed(2) }}€</p>
      <p>
        Net: {{ (totals.totalIncome - totals.totalExpenses).toFixed(2) }}€
        — <strong :style="{ color: totals.totalIncome >= totals.totalExpenses ? 'green' : 'red' }">
          {{ totals.totalIncome >= totals.totalExpenses ? 'You win!' : 'You lose!' }}
        </strong>
      </p>
    </div>

    <!-- Monthly records -->
    <h2>Records (Last 2 Months)</h2>
    <div class="months-container">
      <div v-for="(recordsList, month) in monthlyRecords" :key="month" class="month-column">
        <h3>{{ month }}</h3>
        <ul>
          <li v-for="record in recordsList" :key="record.id">
            {{ record.gains ? 'Income' : 'Expense' }}: {{ record.amount.toFixed(2) }}€ ({{ new Date(record.created_at).toLocaleDateString() }})
          </li>
        </ul>
        <div class="monthly-sum">
          <p>
            Income: {{ totals.monthlySums[month].income.toFixed(2) }}€, 
            Expenses: {{ totals.monthlySums[month].expenses.toFixed(2) }}€, 
            Net: <span :style="{ color: totals.monthlySums[month].income >= totals.monthlySums[month].expenses ? 'green' : 'red' }">
              {{ (totals.monthlySums[month].income - totals.monthlySums[month].expenses).toFixed(2) }}€
            </span>
          </p>
        </div>
      </div>
    </div>

    <!-- Combined net -->
    <div class="combined-net">
      <strong>Combined Net (Last 2 Months): </strong>
      <span :style="{ color: combinedNet >= 0 ? 'green' : 'red' }">
        {{ combinedNet.toFixed(2) }}€ — {{ combinedNet >= 0 ? 'You win!' : 'You lose!' }}
      </span>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import './styles.css'

export default {
  setup() {
    const type = ref(true)
    const amount = ref(0)
    const totals = ref({
      totalIncome: 0,
      totalExpenses: 0,
      monthlySums: {}
    })
    const monthlyRecords = ref({})
    const error = ref('')

    async function fetchRecords() {
      try {
        const res = await fetch('/api/list')
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
        const data = await res.json()
        totals.value = data.totals
        monthlyRecords.value = data.monthlyRecords
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

    const combinedNet = computed(() => {
      return Object.values(totals.value.monthlySums).reduce((sum, month) => {
        return sum + (month.income - month.expenses)
      }, 0)
    })

    return { type, amount, totals, monthlyRecords, error, addExpense, combinedNet }
  }
}
</script>
