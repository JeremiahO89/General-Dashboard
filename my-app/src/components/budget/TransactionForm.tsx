"use client";

import { Grid, TextField, MenuItem, Button } from "@mui/material";
import { categories, transactionTypes, TransactionType, NewTransaction } from "../types";

interface Props {
  newTransaction: NewTransaction;
  setNewTransaction: React.Dispatch<React.SetStateAction<NewTransaction>>;
  onAdd: () => void;
}

export default function TransactionForm({ newTransaction, setNewTransaction, onAdd }: Props) {
  return (
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
        <Button variant="contained" fullWidth onClick={onAdd}>Add</Button>
      </Grid>
    </Grid>
  );
}
