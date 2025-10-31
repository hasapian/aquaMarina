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

    <h2>Records</h2>
    <ul>
      <li v-for="record in records" :key="record.id">
        {{ record.gains ? 'Income' : 'Expense' }}: ${{ record.amount }} (ID: {{ record.id }})
      </li>
    </ul>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
  setup() {
    const type = ref(true)
    const amount = ref(0)
    const records = ref([])

    async function fetchRecords() {
      const res = await fetch('/api/list')
      records.value = await res.json()
    }

    async function addExpense() {
      await fetch('/api/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gains: type.value, amount: amount.value })
      })
      amount.value = 0
      fetchRecords()
    }

    onMounted(fetchRecords)

    return { type, amount, records, addExpense }
  }
}
</script>
