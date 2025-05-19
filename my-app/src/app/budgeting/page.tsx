// app/budget/page.tsx
"use client";

import { useEffect, useState } from "react";
import {
  Box, Typography, Paper, Button, TextField,
  MenuItem, Grid, Divider
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import api from "@/utils/api";

const transactionTypes = ["income", "expense"] as const;
type TransactionType = typeof transactionTypes[number];

const categories = [
  "General", "Food", "Transport", "Utilities", "Shopping", "Salary", "Investment", "Other"
] as const;
type CategoryType = typeof categories[number];

interface Transaction {
  id: number;
  name: string;
  category: string;
  amount: number;
  type: TransactionType;
  date: string;
}

interface NewTransaction {
  name: string;
  category: string;
  amount: number;
  type: TransactionType;
  date: string;
}

export default function BudgetPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [newTransaction, setNewTransaction] = useState<NewTransaction>({
    name: "",
    category: "General",
    amount: 0,
    type: "expense",
    date: new Date().toISOString().split("T")[0],
  });
  const [filters, setFilters] = useState({
    name: "",
    category: "",
    type: "",
    from: "",
    to: ""
  });

  const fetchTransactions = async (token: string) => {
    try {
      const res = await api.get<Transaction[]>("/transactions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTransactions(res.data.map(t => ({ ...t, amount: Number(t.amount) })));
    } catch {
      alert("Failed to load transactions");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) fetchTransactions(token);
  }, []);

  const handleAddTransaction = async () => {
    const token = localStorage.getItem("token");
    if (!token || !newTransaction.name || newTransaction.amount <= 0) return;

    try {
      const res = await api.post<Transaction>(
        "/transactions",
        { ...newTransaction, amount: Number(newTransaction.amount) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTransactions(prev => [...prev, { ...res.data, amount: Number(res.data.amount) }]);
      setNewTransaction({
        name: "",
        category: "General",
        amount: 0,
        type: "expense",
        date: new Date().toISOString().split("T")[0],
      });
    } catch {
      alert("Failed to add transaction");
    }
  };

  const handleDeleteTransaction = async (id: number) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await api.delete(`/transactions/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch {
      alert("Delete failed");
    }
  };

  const filtered = transactions.filter(t => {
    const matchName = filters.name === "" || t.name.toLowerCase().includes(filters.name.toLowerCase());
    const matchCategory = filters.category === "" || t.category === filters.category;
    const matchType = filters.type === "" || t.type === filters.type;
    const matchFrom = filters.from === "" || new Date(t.date) >= new Date(filters.from);
    const matchTo = filters.to === "" || new Date(t.date) <= new Date(filters.to);
    return matchName && matchCategory && matchType && matchFrom && matchTo;
  });

  const totalIncome = filtered.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = filtered.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
  const net = totalIncome - totalExpenses;

  const columns: GridColDef[] = [
    { field: "name", headerName: "Name", flex: 1 },
    { field: "category", headerName: "Category", flex: 1 },
    { field: "amount", headerName: "Amount", type: "number", flex: 1 },
    { field: "type", headerName: "Type", flex: 1 },
    { field: "date", headerName: "Date", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      renderCell: ({ row }) => (
        <Button color="error" onClick={() => handleDeleteTransaction(row.id)}>Delete</Button>
      ),
    },
  ];

  return (
    <Box sx={{ py: 6, px: 3, bgcolor: "#f0f2f5", minHeight: "100vh" }}>
      <Paper sx={{ maxWidth: 1000, mx: "auto", p: 4, borderRadius: 4 }}>
        <Typography variant="h4" fontWeight="bold" textAlign="center" mb={4}>
          Budget Planner
        </Typography>

        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} sm={2}>
            <TextField label="Name" fullWidth value={newTransaction.name}
              onChange={(e) => setNewTransaction(p => ({ ...p, name: e.target.value }))} />
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField select label="Category" fullWidth value={newTransaction.category}
              onChange={(e) => setNewTransaction(p => ({ ...p, category: e.target.value }))}>
              {categories.map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField label="Amount" type="number" fullWidth value={newTransaction.amount}
              onChange={(e) => setNewTransaction(p => ({ ...p, amount: +e.target.value }))} />
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField select label="Type" fullWidth value={newTransaction.type}
              onChange={(e) => setNewTransaction(p => ({ ...p, type: e.target.value as TransactionType }))}>
              {transactionTypes.map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField label="Date" type="date" fullWidth value={newTransaction.date}
              onChange={(e) => setNewTransaction(p => ({ ...p, date: e.target.value }))} InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button variant="contained" fullWidth onClick={handleAddTransaction}>Add</Button>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>Filters</Typography>
        <Grid container spacing={2} mb={2}>
          <Grid item xs={12} sm={3}>
            <TextField label="Search Name" fullWidth value={filters.name}
              onChange={(e) => setFilters(f => ({ ...f, name: e.target.value }))} />
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField select label="Category" fullWidth value={filters.category}
              onChange={(e) => setFilters(f => ({ ...f, category: e.target.value }))}>
              <MenuItem value="">All</MenuItem>
              {categories.map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField select label="Type" fullWidth value={filters.type}
              onChange={(e) => setFilters(f => ({ ...f, type: e.target.value }))}>
              <MenuItem value="">All</MenuItem>
              {transactionTypes.map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={6} sm={2}>
            <TextField label="From" type="date" fullWidth value={filters.from}
              onChange={(e) => setFilters(f => ({ ...f, from: e.target.value }))} InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={6} sm={2}>
            <TextField label="To" type="date" fullWidth value={filters.to}
              onChange={(e) => setFilters(f => ({ ...f, to: e.target.value }))} InputLabelProps={{ shrink: true }} />
          </Grid>
        </Grid>

        <Box sx={{ height: 500, width: "100%", bgcolor: "#fff", borderRadius: 2 }}>
          <DataGrid
            rows={filtered}
            columns={columns}
            pageSizeOptions={[5, 10, 25]}
            initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
          />
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box display="flex" justifyContent="space-between">
          <Typography fontWeight="bold">Total Income: ${totalIncome.toFixed(2)}</Typography>
          <Typography fontWeight="bold">Total Expenses: ${totalExpenses.toFixed(2)}</Typography>
          <Typography fontWeight="bold" color={net >= 0 ? "green" : "red"}>
            Net Balance: ${net.toFixed(2)}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}
