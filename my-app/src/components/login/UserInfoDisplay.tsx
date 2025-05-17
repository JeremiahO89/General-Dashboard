"use client";

import { Box, Button, Typography, Avatar } from "@mui/material";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";

type UserInfo = {
  first_name: string;
  last_name: string;
  username: string;
};

type UserInfoDisplayProps = {
  user: UserInfo;
  onLogout: () => void;
};

export default function UserInfoDisplay({ user, onLogout }: UserInfoDisplayProps) {
  return (
    <Box textAlign="center" width="100%">
      <Typography variant="h6" mb={1}>
        {user.first_name} {user.last_name}
      </Typography>
      <Typography mb={2} color="text.secondary">
        @{user.username}
      </Typography>
      <Button
        variant="contained"
        color="secondary"
        fullWidth
        onClick={onLogout}
        sx={{ mt: 1 }}
      >
        Logout
      </Button>
    </Box>
  );
}
