"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Box, Paper, Typography, Button, TextField, MenuItem,
} from "@mui/material";
import {
  DataGrid, GridColDef, GridRenderEditCellParams, GridValueFormatter,
} from "@mui/x-data-grid";
import {
  LocalizationProvider, DatePicker,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import api from "@/utils/api";

type TransactionType = "income" | "expense";
type CategoryType = "General" | "Food" | "Transport" | "Utilities" | "Shopping" | "Salary" | "Investment" | "Other";

interface Transaction {
  id: number;
  name: string;
  category: string;
  amount: number;
  type: TransactionType;
  date: string;
}

const categories: CategoryType[] = [
  "General", "Food", "Transport", "Utilities", "Shopping", "Salary", "Investment", "Other"
];

const token = () => localStorage.getItem("token");

// ----------------------
// Editable Cells
// ----------------------

const CategoryEditInputCell = ({ id, value, field, api }: GridRenderEditCellParams) => {
  const isPreset = categories.includes(value as CategoryType);
  const [selectValue, setSelectValue] = useState(isPreset ? String(value) : "Other");
  const [customValue, setCustomValue] = useState(isPreset ? "" : String(value || ""));

  return (
    <Box sx={{ display: "flex", gap: 1 }}>
      <TextField
        select size="small"
        value={selectValue}
        onChange={(e) => {
          const selected = e.target.value;
          setSelectValue(selected);
          const newVal = selected === "Other" ? customValue : selected;
          api.setEditCellValue({ id, field, value: newVal });
        }}
        sx={{ minWidth: 120 }}
      >
        {categories.map(cat => (
          <MenuItem key={cat} value={cat}>{cat}</MenuItem>
        ))}
        <MenuItem value="Other">Other</MenuItem>
      </TextField>
      {selectValue === "Other" && (
        <TextField
          size="small"
          placeholder="Custom"
          value={customValue}
          onChange={(e) => {
            const newVal = e.target.value;
            setCustomValue(newVal);
            api.setEditCellValue({ id, field, value: newVal });
          }}
          sx={{ minWidth: 120 }}
        />
      )}
    </Box>
  );
};

const DateEditInputCell = ({ id, value, field, api }: GridRenderEditCellParams) => (
  <LocalizationProvider dateAdapter={AdapterDayjs}>
    <DatePicker
      value={value ? dayjs(value) : null}
      onChange={(date) =>
        date && api.setEditCellValue({ id, field, value: date.format("YYYY-MM-DD") })
      }
      format="YYYY-MM-DD"
      slotProps={{ textField: { size: "small" } }}
    />
  </LocalizationProvider>
);

// ----------------------
// Main Component
// ----------------------

export default function BudgetPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const t = token();
    if (!t) return;

    api.get<Transaction[]>("/transactions/", {
      headers: { Authorization: `Bearer ${t}` },
    })
      .then(res => {
        const txs = res.data.map(t => ({
          ...t,
          amount: Number(t.amount),
          date: t.date, // do not slice or format here
        }));
        console.log("Loaded transactions:", txs); // Check your dates here
        setTransactions(txs);
      })
      .catch(() => alert("Failed to load transactions"));
  }, []);

  const handleAddRow = async () => {
    const t = token();
    if (!t) return;

    try {
      const res = await api.post<Transaction>("/transactions/", {
        name: "",
        category: "General",
        amount: 0,
        type: "expense",
        date: dayjs().format("YYYY-MM-DD"),
      }, {
        headers: { Authorization: `Bearer ${t}` },
      });

      setTransactions(prev => [...prev, { ...res.data, amount: Number(res.data.amount) }]);
    } catch {
      alert("Failed to add blank transaction");
    }
  };

  const handleProcessRowUpdate = async (newRow: Transaction, oldRow: Transaction) => {
    const t = token();
    if (!t) return oldRow;

    const changed: Partial<Record<keyof Transaction, string | number>> = {};
    for (const key of Object.keys(newRow) as (keyof Transaction)[]) {
      if (newRow[key] !== oldRow[key]) {
        changed[key] = key === "date"
          ? dayjs(newRow.date).format("YYYY-MM-DD")
          : newRow[key];
      }
    }

    setTransactions(prev => prev.map(t => (t.id === newRow.id ? newRow : t)));

    try {
      await api.patch(`/transactions/${newRow.id}`, changed, {
        headers: { Authorization: `Bearer ${t}` },
      });
    } catch {
      alert("Failed to update transaction");
      return oldRow;
    }

    return newRow;
  };

  const handleDelete = async (id: number) => {
    const t = token();
    if (!t) return;

    try {
      await api.delete(`/transactions/${id}`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch {
      alert("Delete failed");
    }
  };

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      editable: true,
      align: "left",
      headerAlign: "left",
    },
    {
      field: "category",
      headerName: "Category",
      flex: 1,
      editable: true,
      align: "left",
      headerAlign: "left",
      renderEditCell: (params) => <CategoryEditInputCell {...params} />
    },
    {
      field: "amount",
      headerName: "Amount",
      flex: 1,
      editable: true,
      align: "left",
      headerAlign: "left",
    },
    {
      field: "type",
      headerName: "Type",
      flex: 1,
      editable: true,
      type: "singleSelect",
      valueOptions: ["income", "expense"],
      align: "left",
      headerAlign: "left",
    },
    {
      field: "date",
      headerName: "Date",
      flex: 1,
      editable: true,
      align: "left",
      headerAlign: "left",
      type: "date",
      renderEditCell: (params) => <DateEditInputCell {...params} />,
      valueFormatter: (params: { value: any }) => {
        if (!params.value) return "";
        const date = dayjs(params.value);
        return date.isValid() ? date.format("YYYY-MM-DD") : "";
      }
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.5,
      sortable: false,
      align: "left",
      headerAlign: "left",
      renderCell: ({ row }) => (
        <Button color="error" onClick={() => handleDelete(row.id)}>Delete</Button>
      )
    },
  ];

  return (
    <Box sx={{ py: 6, px: 3, bgcolor: "#f0f2f5", minHeight: "100vh" }}>
      <Paper sx={{ maxWidth: 1000, mx: "auto", p: 4, borderRadius: 4 }}>
        <Typography variant="h4" fontWeight="bold" textAlign="center" mb={4}>
          Budget Planner
        </Typography>

        <Button variant="contained" sx={{ mb: 3 }} onClick={handleAddRow}>
          Add Blank Row
        </Button>

        <Box sx={{ height: 500 }}>
          <DataGrid
            rows={transactions}
            columns={columns}
            processRowUpdate={handleProcessRowUpdate}
            pageSizeOptions={[5, 10, 25]}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          />
        </Box>
      </Paper>
    </Box>
  );
}
