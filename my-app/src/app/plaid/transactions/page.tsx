"use client";

import { useEffect, useState } from "react";
import {
  Paper,
  Box,
  Typography,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import api from "@/utils/api";

type Transaction = {
  account_id: string;
  amount: number;
  category: string[];
  date: string;
  name: string;
  transaction_id: string;
  [key: string]: any;
};

type TransactionsResponse = {
  transactions: Transaction[];
  accounts: any[];
  total_transactions: number;
  [key: string]: any;
};

export default function TransactionsPage() {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [groupBy, setGroupBy] = useState<"month" | "category">("month");

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    async function fetchTransactions() {
      if (!token) {
        setError("Not authenticated. Please log in.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const { data } = await api.get<TransactionsResponse>("/plaid/transactions", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setTransactions(data.transactions || []);
      } catch (err: any) {
        setError(err.response?.data?.detail || err.message || "Failed to load transactions");
      } finally {
        setLoading(false);
      }
    }
    fetchTransactions();
  }, [token]);

  const chartData = (() => {
    if (groupBy === "month") {
      const monthly: Record<string, number> = {};
      transactions.forEach((tx) => {
        const month = tx.date.slice(0, 7);
        monthly[month] = (monthly[month] || 0) + tx.amount;
      });
      return Object.entries(monthly)
        .map(([month, amount]) => ({ name: month, amount }))
        .sort((a, b) => a.name.localeCompare(b.name));
    } else {
      const byCat: Record<string, number> = {};
      transactions.forEach((tx) => {
        const cat = tx.category?.[0] || "Other";
        byCat[cat] = (byCat[cat] || 0) + tx.amount;
      });
      return Object.entries(byCat)
        .map(([cat, amount]) => ({ name: cat, amount }))
        .sort((a, b) => b.amount - a.amount);
    }
  })();

  return (
    <Box p={4} minHeight="100vh" sx={{ bgcolor: "#e0f7fa" }}>
      <Typography variant="h4" fontWeight={700} mb={3}>
        Transactions Overview
      </Typography>
      <FormControl sx={{ mb: 3, minWidth: 200 }}>
        <InputLabel>Group By</InputLabel>
        <Select
          value={groupBy}
          label="Group By"
          onChange={(e) => setGroupBy(e.target.value as "month" | "category")}
        >
          <MenuItem value="month">Month</MenuItem>
          <MenuItem value="category">Category</MenuItem>
        </Select>
      </FormControl>
      <Paper
        elevation={4}
        sx={{
          p: 3,
          borderRadius: 3,
          minHeight: 420,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          bgcolor: "#f5f5f5",
          boxShadow: "0 2px 12px rgba(1,87,155,0.08)",
        }}
      >
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height={300}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontWeight: 600, fontSize: 14 }} />
              <YAxis tickFormatter={(v) => `$${v}`} />
              <Tooltip formatter={(v) => `$${v}`} />
              <Bar dataKey="amount" fill="#2979FF" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Paper>
    </Box>
  );
}
