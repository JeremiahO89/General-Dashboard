"use client";

import { useState } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";

type LoginFormProps = {
  username: string;
  password: string;
  setUsername: (v: string) => void;
  setPassword: (v: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  error: string | null;
};

export default function LoginForm({
  username,
  password,
  setUsername,
  setPassword,
  onSubmit,
  error,
}: LoginFormProps) {
  return (
    <Box component="form" onSubmit={onSubmit} width="100%">
      <TextField
        label="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        fullWidth
        margin="normal"
        autoComplete="username"
        required
      />
      <TextField
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        fullWidth
        margin="normal"
        autoComplete="current-password"
        required
      />
      {typeof error === "string" && (
        <Typography color="error" mt={1}>
          {error}
        </Typography>
      )}
      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        sx={{ mt: 3, py: 1.5 }}
      >
        Login
      </Button>
    </Box>
  );
}
