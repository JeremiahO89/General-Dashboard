"use client";

import { Box, Typography, Paper } from "@mui/material";
import Image from "next/image";
import "keen-slider/keen-slider.min.css";
import { useKeenSlider } from "keen-slider/react";
import { useEffect, useRef } from "react";

export default function AboutPage() {
  const [sliderRef, slider] = useKeenSlider<HTMLDivElement>({
    loop: true,
    slides: { perView: 1 },
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!slider) return;
    intervalRef.current = setInterval(() => {
      slider.current?.next();
    }, 3000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [slider]);

  const carouselImages = [
    "/about/carousel_Images/drone.jpeg",
    "/about/carousel_Images/longBoard.jpeg",
    "/about/carousel_Images/mazeBot.jpeg",
  ];

  return (
    <Box
      sx={{
        background: "linear-gradient(to top, rgb(0,128,255), #e0e7ff)",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 4,
      }}
    >
      <Paper
        elevation={6}
        sx={{
          maxWidth: 1200,
          width: "100%",
          borderRadius: 4,
          backgroundColor: "#fff",
          p: 4,
        }}
      >
        <Box display="grid" gridTemplateColumns={{ xs: "1fr", md: "2fr 1fr" }} gap={4}>
          {/* Left Column */}
          <Box sx={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
            <Typography variant="h3" fontWeight="bold" mb={1}>
              Jeremiah Ondrasik
            </Typography>
            <Typography variant="body1" mb={3} sx={{ fontSize: "1.1rem", lineHeight: 1.6, }}>
              Hi, I'm a student at{" "}
              <span style={{ fontWeight: "bold", color: "#0000ff" }}>
                The Pennsylvania State University
              </span>
              , pursuing a B.S of {" "}
              <strong style={{ color: "#ff0000" }}>Computer Science</strong> and a B.S. of {" "}
              <strong style={{ color: "#ff0000" }}>Electrical Engineering</strong>.
            </Typography>

            <Box
              ref={sliderRef}
              className="keen-slider"
              sx={{
                width: "100%",
                maxWidth: 600,
                height: 300,
                borderRadius: 2,
                overflow: "hidden",
                position: "relative",
              }}
            >
              {carouselImages.map((src, i) => (
                <Box
                  key={i}
                  className="keen-slider__slide"
                  sx={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                  }}
                >
                  <Image
                    src={src}
                    alt={`Slide ${i + 1}`}
                    fill
                    priority={i === 0}
                    style={{ objectFit: "cover", borderRadius: "10px" }}
                  />
                </Box>
              ))}
            </Box>
          </Box>

          {/* Right Column */}
          <Box display="flex" justifyContent="center" alignItems="start" sx={{ pt: { xs: 2, md: 0 } }}>
            <Image
              src="/about/headshot.jpeg"
              alt="Jeremiah Ondrasik Headshot"
              width={350}
              height={350}
              style={{
                borderRadius: "20px",
                objectFit: "cover",
                boxShadow: "0 6px 18px rgba(0, 0, 0, 0.15)",
              }}
            />
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
