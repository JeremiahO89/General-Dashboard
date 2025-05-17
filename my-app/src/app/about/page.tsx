// src/app/about/page.tsx

import { Typography, Container } from "@mui/material";

export default function AboutPage() {
  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        About Me
      </Typography>
      <Typography variant="body1">
        Welcome to the about page!
      </Typography>
    </Container>
  );
}
