"use client";

import { Box, Button, TextField, Typography } from "@mui/material";

type RegisterFormProps = {
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  setFirstName: (v: string) => void;
  setLastName: (v: string) => void;
  setUsername: (v: string) => void;
  setPassword: (v: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  error: string | null;
};

export default function RegisterForm({
  firstName,
  lastName,
  username,
  password,
  setFirstName,
  setLastName,
  setUsername,
  setPassword,
  onSubmit,
  error,
}: RegisterFormProps) {
  return (
    <Box component="form" onSubmit={onSubmit} width="100%">
      <TextField
        label="First Name"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        fullWidth
        margin="normal"
        autoComplete="given-name"
        required
      />
      <TextField
        label="Last Name"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        fullWidth
        margin="normal"
        autoComplete="family-name"
        required
      />
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
        autoComplete="new-password"
        required
      />
      {typeof error === "string" && (
        <Typography
          color={error.startsWith("Registration successful") ? "success.main" : "error"}
          mt={1}
        >
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
        Register
      </Button>
    </Box>
  );
}
