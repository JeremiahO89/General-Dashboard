"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  MenuItem,
  IconButton,
} from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import dayjs from "dayjs";
import api from "@/utils/api";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";

type TransactionType = "income" | "expense";
type CategoryType =
  | "General"
  | "Food"
  | "Transport"
  | "Utilities"
  | "Shopping"
  | "Salary"
  | "Investment"
  | "Other";

interface Transaction {
  id: number;
  name: string;
  category: string;
  amount: number;
  type: TransactionType;
  date: string;
}

const categories: CategoryType[] = [
  "General",
  "Food",
  "Transport",
  "Utilities",
  "Shopping",
  "Salary",
  "Investment",
  "Other",
];

function getToken() {
  return localStorage.getItem("token");
}

// Editable Category Cell with select and custom input (same as before)
function CategoryEditCell({ id, value, field, api }: any) {
  const isKnownCategory = categories.includes(value as CategoryType);
  const [selected, setSelected] = useState(isKnownCategory ? value : "Other");
  const [custom, setCustom] = useState(isKnownCategory ? "" : (value as string));

  function onSelectChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setSelected(val);
    api.setEditCellValue({ id, field, value: val === "Other" ? custom : val });
  }

  function onCustomChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setCustom(val);
    api.setEditCellValue({ id, field, value: val });
  }

  return (
    <Box sx={{ display: "flex", gap: 1 }}>
      <TextField select size="small" value={selected} onChange={onSelectChange} sx={{ minWidth: 120 }}>
        {categories.map((cat) => (
          <MenuItem key={cat} value={cat}>
            {cat}
          </MenuItem>
        ))}
        <MenuItem value="Other">Other</MenuItem>
      </TextField>
      {selected === "Other" && (
        <TextField
          size="small"
          placeholder="Custom category"
          value={custom}
          onChange={onCustomChange}
          sx={{ minWidth: 120 }}
        />
      )}
    </Box>
  );
}

export default function BudgetPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Track which row is editing the date
  const [dateEditId, setDateEditId] = useState<number | null>(null);
  const [dateInput, setDateInput] = useState<string>("");

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    api
      .get<Transaction[]>("/transactions/", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const data = res.data.map((t) => ({ ...t, amount: Number(t.amount) }));
        setTransactions(data);
      })
      .catch(() => alert("Failed to load transactions"));
  }, []);

  async function addBlankTransaction() {
    const token = getToken();
    if (!token) return;

    try {
      const res = await api.post<Transaction>(
        "/transactions/",
        {
          name: "",
          category: "General",
          amount: 0,
          type: "expense",
          date: dayjs().format("YYYY-MM-DD"),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTransactions((prev) => [...prev, { ...res.data, amount: Number(res.data.amount) }]);
    } catch {
      alert("Failed to add a new transaction");
    }
  }

  async function updateTransaction(newRow: Transaction, oldRow: Transaction) {
    const token = getToken();
    if (!token) return oldRow;

    const changed: Partial<Transaction> = {};
    (Object.keys(newRow) as (keyof Transaction)[]).forEach((key) => {
      if (newRow[key] !== oldRow[key]) {
        changed[key] = key === "date" ? dayjs(newRow.date).format("YYYY-MM-DD") : newRow[key];
      }
    });

    setTransactions((prev) => prev.map((t) => (t.id === newRow.id ? newRow : t)));

    try {
      await api.patch(`/transactions/${newRow.id}`, changed, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return newRow;
    } catch {
      alert("Failed to update transaction");
      return oldRow;
    }
  }

  async function deleteTransaction(id: number) {
    const token = getToken();
    if (!token) return;

    try {
      await api.delete(`/transactions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    } catch {
      alert("Failed to delete transaction");
    }
  }

  // Handle date edit button click: open the input field
  function startDateEdit(id: number, currentDate: string) {
    setDateEditId(id);
    setDateInput(currentDate);
  }

  // Save date edit: validate and update
  async function saveDateEdit(id: number) {
    if (!dateInput.match(/^\d{4}-\d{2}-\d{2}$/)) {
      alert("Date must be in YYYY-MM-DD format");
      return;
    }
    const oldRow = transactions.find((t) => t.id === id);
    if (!oldRow) return;

    const newRow = { ...oldRow, date: dateInput };
    const updated = await updateTransaction(newRow, oldRow);
    if (updated !== oldRow) setDateEditId(null);
  }

  // Cancel editing date
  function cancelDateEdit() {
    setDateEditId(null);
  }

  // Render the date cell with text and edit button or input + save/cancel buttons
  function DateCell({ row }: GridRenderCellParams) {
    const isEditing = row.id === dateEditId;

    return isEditing ? (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <TextField
          size="small"
          value={dateInput}
          onChange={(e) => setDateInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") saveDateEdit(row.id);
            if (e.key === "Escape") cancelDateEdit();
          }}
          sx={{ width: 130 }}
          helperText="Format: YYYY-MM-DD"
          error={!dateInput.match(/^\d{4}-\d{2}-\d{2}$/)}
        />
        <IconButton color="primary" onClick={() => saveDateEdit(row.id)} size="small" aria-label="save date">
          <SaveIcon />
        </IconButton>
        <IconButton color="inherit" onClick={cancelDateEdit} size="small" aria-label="cancel editing date">
          <CloseIcon />
        </IconButton>
      </Box>
    ) : (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography>{row.date}</Typography>
        <IconButton color="primary" onClick={() => startDateEdit(row.id, row.date)} size="small" aria-label="edit date">
          <EditIcon />
        </IconButton>
      </Box>
    );
  }

  const columns: GridColDef[] = [
    { field: "name", headerName: "Name", flex: 1, editable: true },
    {
      field: "category",
      headerName: "Category",
      flex: 1,
      editable: true,
      renderEditCell: (params) => <CategoryEditCell {...params} />,
    },
    { field: "amount", headerName: "Amount", flex: 1, editable: true, type: "number" },
    {
      field: "type",
      headerName: "Type",
      flex: 1,
      editable: true,
      type: "singleSelect",
      valueOptions: ["income", "expense"],
    },
    {
      field: "date",
      headerName: "Date",
      flex: 1,
      editable: false, // no inline editing from grid
      renderCell: DateCell,
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.5,
      sortable: false,
      renderCell: ({ row }) => (
        <Button color="error" size="small" onClick={() => deleteTransaction(row.id)}>
          Delete
        </Button>
      ),
    },
  ];

  return (
    <Box sx={{ padding: 4, backgroundColor: "#f9fafb", minHeight: "100vh" }}>
      <Paper sx={{ maxWidth: 900, margin: "auto", padding: 3, borderRadius: 2 }}>
        <Typography variant="h4" textAlign="center" mb={3}>
          Budget Planner
        </Typography>

        <Button variant="contained" onClick={addBlankTransaction} sx={{ mb: 2 }}>
          Add New Transaction
        </Button>

        <Box sx={{ height: 500 }}>
          <DataGrid
            rows={transactions}
            columns={columns}
            processRowUpdate={updateTransaction}
            pageSizeOptions={[5, 10]}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            experimentalFeatures={{ newEditingApi: true }}
          />
        </Box>
      </Paper>
    </Box>
  );
}
