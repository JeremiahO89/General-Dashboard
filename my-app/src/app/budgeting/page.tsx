"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import api from "@/utils/api"; // adjust path if needed

type Expense = {
  id: number;
  name: string;
  amount: number;
};

export default function BudgetPage() {
  const [income, setIncome] = useState<number | "">("");
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchExpenses(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchExpenses = async (token: string) => {
    setError(null);
    setLoading(true);
    try {
      const res = await api.get<Expense[]>("/expenses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExpenses(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || "Failed to fetch expenses");
    } finally {
      setLoading(false);
    }
  };

  const saveExpenses = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("No auth token, please login.");
      return;
    }

    setError(null);

    try {
      for (const expense of expenses) {
        if (!expense.name.trim() || expense.amount < 0) {
          alert("Please enter a valid name and non-negative amount for each expense.");
          return;
        }

        await api.post(
          "/expenses",
          { name: expense.name, amount: expense.amount },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      alert("Expenses saved!");
      fetchExpenses(token);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || "Failed to save expenses");
      alert(err.message || "Failed to save expenses");
    }
  };

  const updateExpense = (id: number, field: keyof Expense, value: string) => {
    setExpenses((prev) =>
      prev.map((exp) =>
        exp.id === id
          ? {
              ...exp,
              [field]: field === "amount" ? Number(value) : value,
            }
          : exp
      )
    );
  };

  const addExpense = () => {
    setExpenses((prev) => [...prev, { id: Date.now(), name: "", amount: 0 }]);
  };

  const removeExpense = (id: number) => {
    setExpenses((prev) => prev.filter((exp) => exp.id !== id));
  };

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const remaining = typeof income === "number" ? income - totalExpenses : 0;

  if (loading) return <Typography>Loading...</Typography>;

  return (
    <Box
      sx={{
        background: "linear-gradient(to top, rgb(0,128,255), #e0e7ff)",
        minHeight: "100vh",
        py: 4,
        px: 2,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Paper
        elevation={6}
        sx={{
          maxWidth: 900,
          width: "100%",
          borderRadius: 4,
          backgroundColor: "#fff",
          p: { xs: 3, md: 5 },
        }}
      >
        <Typography variant="h4" fontWeight="bold" mb={4} textAlign="center">
          Budget Planner
        </Typography>

        {error && (
          <Typography color="error" mb={2} textAlign="center">
            {error}
          </Typography>
        )}

        <Box mb={4} maxWidth={400} mx="auto">
          <TextField
            label="Total Income"
            type="number"
            fullWidth
            value={income}
            onChange={(e) => {
              const val = e.target.value;
              setIncome(val === "" ? "" : Math.max(0, Number(val)));
            }}
            inputProps={{ min: 0 }}
          />
        </Box>

        <Box mb={3}>
          <Typography variant="h6" fontWeight="bold" mb={2}>
            Expenses
          </Typography>

          {expenses.map(({ id, name, amount }) => (
            <Box key={id} display="flex" gap={2} alignItems="center" mb={2}>
              <TextField
                label="Expense Name"
                value={name}
                onChange={(e) => updateExpense(id, "name", e.target.value)}
                sx={{ flex: "2 1 200px" }}
              />
              <TextField
                label="Amount"
                type="number"
                value={amount}
                onChange={(e) => updateExpense(id, "amount", e.target.value)}
                inputProps={{ min: 0 }}
                sx={{ flex: "1 1 120px" }}
              />
              {expenses.length > 1 && (
                <IconButton color="error" onClick={() => removeExpense(id)}>
                  <DeleteIcon />
                </IconButton>
              )}
            </Box>
          ))}

          <Button variant="outlined" onClick={addExpense} sx={{ mt: 1 }}>
            + Add Expense
          </Button>
        </Box>

        <Button
          variant="contained"
          color="primary"
          onClick={saveExpenses}
          sx={{ mt: 2, mb: 4 }}
        >
          Save Expenses
        </Button>

        <Box
          display="flex"
          justifyContent="space-between"
          maxWidth={400}
          mx="auto"
          mt={4}
          p={3}
          borderRadius={2}
          bgcolor="#f0f4ff"
        >
          <Typography variant="subtitle1" fontWeight="medium">
            Total Expenses:
          </Typography>
          <Typography variant="subtitle1" fontWeight="bold">
            ${totalExpenses.toFixed(2)}
          </Typography>

          <Typography variant="subtitle1" fontWeight="medium">
            Remaining Budget:
          </Typography>
          <Typography
            variant="subtitle1"
            fontWeight="bold"
            color={remaining < 0 ? "error.main" : "success.main"}
          >
            ${remaining.toFixed(2)}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}
