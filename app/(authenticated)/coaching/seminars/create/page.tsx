"use client";

import { useState } from "react";
import {
  TextField,
  Button,
  Stack,
  Typography,
  Box,
  Alert,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import dayjs, { Dayjs } from "dayjs";
import { useRouter } from "next/navigation";

export default function CreateSeminarPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    description: "",
    hostName: "",
    date: "",
    duration: "",
    accessType: "public",
    image: "",
    mediaUrl: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDateChange = (newValue: Dayjs | null) => {
    setForm({ ...form, date: newValue ? newValue.toISOString() : "" });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.url) {
        setForm((prev) => ({ ...prev, image: data.url }));
      } else {
        alert("Image upload failed.");
      }
    } catch (err) {
      console.error("Image upload error:", err);
      alert("Image upload failed.");
    }
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.url) {
        setForm((prev) => ({ ...prev, mediaUrl: data.url }));
      } else {
        alert("Media upload failed.");
      }
    } catch (err) {
      console.error("Media upload error:", err);
      alert("Media upload failed.");
    }
  };

  const handleSubmit = async () => {
    if (
      !form.title.trim() ||
      !form.hostName.trim() ||
      !form.date ||
      !form.duration
    ) {
      setError("All required fields must be filled before submitting.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/seminar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        const seminar = await res.json();
        alert(
          `✅ Seminar created successfully!\nZoom Link:\n${seminar.zoomLink ?? "Unavailable"}`
        );

        router.push("/coaching?tab=Seminars");
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Failed to create seminar. Please try again.");
      }
    } catch (err) {
      console.error("Create seminar error:", err);
      setError(
        "Error creating seminar. Please check your input and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Stack spacing={3} maxWidth={600} mx="auto" mt={6}>
        <Typography variant="h5" fontWeight={600}>
          Create a New Seminar
        </Typography>

        {error && <Alert severity="error">{error}</Alert>}

        {/* Basic Info */}
        <TextField
          label="Title"
          name="title"
          value={form.title}
          onChange={handleChange}
          required
        />
        <TextField
          label="Description"
          name="description"
          value={form.description}
          onChange={handleChange}
          multiline
          rows={3}
        />
        <TextField
          label="Host Name"
          name="hostName"
          value={form.hostName}
          onChange={handleChange}
          required
        />

        {/* Date & Duration */}
        <DateTimePicker
          label="Date & Time"
          value={form.date ? dayjs(form.date) : null}
          onChange={handleDateChange}
          slotProps={{ textField: { fullWidth: true, required: true } }}
        />

        <TextField
          label="Duration (minutes)"
          name="duration"
          type="number"
          value={form.duration}
          onChange={handleChange}
          required
        />

        {/* Seminar Cover */}
        <Box>
          <Typography variant="subtitle1" fontWeight={500}>
            Seminar Cover Image
          </Typography>
          <input type="file" accept="image/*" onChange={handleImageUpload} />
          {form.image && (
            <Box mt={2}>
              <img
                src={form.image}
                alt="Seminar Cover Preview"
                width="100%"
                style={{ borderRadius: 8 }}
              />
            </Box>
          )}
        </Box>

        {/* Optional Media */}
        <Box>
          <Typography variant="subtitle1" fontWeight={500}>
            Seminar Introduction Media (Image or Video)
          </Typography>
          <input
            type="file"
            accept="image/*,video/*"
            onChange={handleMediaUpload}
          />
          {form.mediaUrl && (
            <Box mt={2}>
              {/\.(mp4|mov|avi|webm)$/i.test(form.mediaUrl) ? (
                <video src={form.mediaUrl} controls width="100%" />
              ) : (
                <img src={form.mediaUrl} alt="Seminar Preview" width="100%" />
              )}
            </Box>
          )}
        </Box>

        {/* Submit */}
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          sx={{
            backgroundColor: "#6366f1",
            textTransform: "none",
            "&:hover": { backgroundColor: "#4f46e5" },
          }}
        >
          {loading ? "Submitting..." : "Submit Seminar"}
        </Button>
      </Stack>
    </LocalizationProvider>
  );
}
