"use client";

import { useState } from "react";
import { Box, Paper, Tabs, Tab, Avatar, Typography } from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";

import LoginForm from "@/components/login/LoginForm";
import RegisterForm from "@/components/login/RegisterForm";
import UserInfoDisplay from "@/components/login/UserInfoDisplay";
import { useAuth } from "@/contexts/AuthContext";


export default function LoginPage() {
  const { user, login, register, logout } = useAuth();
  const [tab, setTab] = useState(0);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [localError, setLocalError] = useState<string | null>(null); // Local error state

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
    setUsername("");
    setPassword("");
    setFirstName("");
    setLastName("");
    setLocalError(null);  // Clear error when switching tabs
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null); // Clear previous error before login
    try {
      await login(username, password);
    } catch (err: any) {
      setLocalError(err.response?.data?.detail || err.message || "Login failed");
    }
    setPassword("");
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null); // Clear previous error before register
    try {
      const success = await register({ username, password, first_name: firstName, last_name: lastName });
      if (success) {
        setTab(0);
        setFirstName("");
        setLastName("");
        setUsername("");
        setPassword("");
      }
    } catch (err: any) {
      setLocalError(err.response?.data?.detail || err.message || "Registration failed");
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      sx={{
        background: "linear-gradient(to top,rgb(0, 128, 255), #e0e7ff)",
        p: 2,
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 5,
          width: 380,
          borderRadius: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          backgroundColor: "#fff",
        }}
      >
        <Avatar sx={{ bgcolor: "primary.main", mb: 2 }}>
          {user ? <LockOpenOutlinedIcon /> : <LockOutlinedIcon />}
        </Avatar>
        <Typography variant="h5" mb={1} fontWeight={600}>
          {user ? `Welcome!` : tab === 0 ? "Login" : "Register"}
        </Typography>

        {user ? (
          <UserInfoDisplay user={user} onLogout={logout} />
        ) : (
          <>
            <Tabs value={tab} onChange={handleTabChange} centered sx={{ width: "100%", mb: 2 }}>
              <Tab label="Login" />
              <Tab label="Register" />
            </Tabs>

            {tab === 0 ? (
              <LoginForm
                username={username}
                password={password}
                setUsername={setUsername}
                setPassword={setPassword}
                onSubmit={handleLogin}
                error={localError}  // pass local error
              />
            ) : (
              <RegisterForm
                firstName={firstName}
                lastName={lastName}
                username={username}
                password={password}
                setFirstName={setFirstName}
                setLastName={setLastName}
                setUsername={setUsername}
                setPassword={setPassword}
                onSubmit={handleRegister}
                error={localError}  // pass local error
              />
            )}
          </>
        )}
      </Paper>
    </Box>
  );
}
