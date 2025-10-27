"use client";

import { useState } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Box,
  Typography,
} from "@mui/material";
import { Seminar } from "../(authenticated)/coaching/seminars/[id]/page";

interface SeminarReserveProps {
  open: boolean;
  onClose: () => void;
  seminar: Seminar;
  userEmail: string;
  onReservationSuccess?: () => void;
}

interface ReservationFormData {
  name: string;
  email: string;
  comments: string;
}

export default function SeminarReserve({
  open,
  onClose,
  seminar,
  userEmail,
  onReservationSuccess,
}: SeminarReserveProps) {
  const [formData, setFormData] = useState<ReservationFormData>({
    name: "",
    email: "",
    comments: "",
  });
  const [formErrors, setFormErrors] = useState<Partial<ReservationFormData>>({});
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleClose = () => {
    setFormData({ name: "", email: "", comments: "" });
    setFormErrors({});
    setShowSuccess(false);
    setErrorMessage("");
    onClose();
  };

  const handleInputChange =
    (field: keyof ReservationFormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      setFormErrors((prev) => ({ ...prev, [field]: "" }));
      setErrorMessage("");
    };

  const validateEmailFormat = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const validateForm = () => {
    const errors: Partial<ReservationFormData> = {};

    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!validateEmailFormat(formData.email)) {
      errors.email = "Please enter a valid email address";
    } else if (
      formData.email.trim().toLowerCase() !== userEmail.toLowerCase()
    ) {
      errors.email = "Please use your logged-in email address";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitReservation = async () => {
    if (!validateForm()) return;
    setSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/create-reservation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seminarId: seminar.id,
          user: {
            name: formData.name,
            email: formData.email,
            comments: formData.comments,
          },
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to create reservation");

      setShowSuccess(true);
      onReservationSuccess?.();
      setTimeout(handleClose, 3000);
    } catch (error) {
      console.error("Reservation error:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to complete reservation. Please try again later."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      slotProps={{
        paper: {
          sx: {
            borderRadius: 4,
            p: 4,
            maxWidth: 600,
            width: "90%",
            boxShadow: 6,
            backgroundColor: "#fff",
          },
        },
      }}
    >
      <DialogTitle
        sx={{ textAlign: "center", fontWeight: 700, fontSize: "1.6rem" }}
      >
        Enter Details
      </DialogTitle>

      <DialogContent>
        {showSuccess ? (
          <Alert severity="success" sx={{ mt: 2 }}>
            Reservation confirmed! A confirmation email was sent to{" "}
            {formData.email}.
          </Alert>
        ) : (
          <>
            {errorMessage && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errorMessage}
              </Alert>
            )}

            <Box display="flex" flexDirection="column" gap={3}>
              <Field
                label="Name"
                required
                value={formData.name}
                error={formErrors.name}
                onChange={handleInputChange("name")}
                placeholder="Enter your name"
              />
              <Field
                label="Email"
                required
                value={formData.email}
                error={formErrors.email}
                onChange={handleInputChange("email")}
                placeholder={"Enter your email"}
              />
              <Field
                label="Additional Comments?"
                value={formData.comments}
                onChange={handleInputChange("comments")}
                placeholder="Enter text"
                multiline
              />

              <Typography
                variant="body2"
                sx={{ fontStyle: "italic", color: "text.secondary" }}
              >
                * You will receive an email with the meeting link after confirmation.
              </Typography>
            </Box>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ justifyContent: "center" }}>
        {!showSuccess ? (
          <>
            <Button onClick={handleClose} disabled={submitting}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitReservation}
              variant="contained"
              disabled={submitting}
              sx={{
                backgroundColor: "#000",
                borderRadius: 20,
                px: 4,
                py: 1.2,
                fontWeight: 600,
                textTransform: "none",
                "&:hover": { backgroundColor: "#111" },
              }}
            >
              {submitting ? "Submitting..." : "Confirm"}
            </Button>
          </>
        ) : (
          <Button
            variant="contained"
            sx={{
              backgroundColor: "#22c55e",
              color: "#fff",
              borderRadius: 20,
              px: 4,
              py: 1.2,
              fontWeight: 600,
              textTransform: "none",
              "&:hover": { backgroundColor: "#16a34a" },
            }}
            onClick={handleClose}
          >
            Done
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

/** Helper component for form fields */
function Field({
  label,
  required = false,
  value,
  error,
  placeholder,
  onChange,
  multiline = false,
}: {
  label: string;
  required?: boolean;
  value: string;
  error?: string;
  placeholder?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  multiline?: boolean;
}) {
  return (
    <Box>
      <Typography fontWeight={600}>
        {label} {required && <span style={{ color: "#ef4444" }}>*</span>}
      </Typography>
      <TextField
        fullWidth
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        error={!!error}
        helperText={error}
        multiline={multiline}
        rows={multiline ? 3 : 1}
        sx={{ mt: 1, "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
      />
    </Box>
  );
}
