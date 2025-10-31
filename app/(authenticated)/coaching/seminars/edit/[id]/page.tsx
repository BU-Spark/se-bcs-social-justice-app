"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { TextField, Button, MenuItem, CircularProgress } from "@mui/material";
import styled from "@emotion/styled";

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 24px;
`;

const FormGrid = styled.div`
  display: grid;
  gap: 20px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 24px;
`;

export default function EditSeminarPage() {
  const router = useRouter();
  const params = useParams();
  const seminarId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [seminar, setSeminar] = useState({
    title: "",
    description: "",
    hostName: "",
    date: "",
    duration: "",
    zoomLink: "",
    accessType: "public",
    image: "",
    mediaUrl: "",
  });

  // Fetch seminar info
  useEffect(() => {
    async function fetchSeminar() {
      try {
        const res = await fetch(`/api/seminar/${seminarId}`);
        if (!res.ok) throw new Error("Failed to fetch seminar");
        const data = await res.json();

        // convert date to ISO string
        const dateStr = data.date
          ? new Date(data.date).toISOString().slice(0, 16)
          : "";

        setSeminar({
          title: data.title || "",
          description: data.description || "",
          hostName: data.hostName || "",
          date: dateStr,
          duration: data.duration?.toString() || "",
          zoomLink: data.zoomLink || "",
          accessType: data.accessType || "public",
          image: data.image || "",
          mediaUrl: data.mediaUrl || "",
        });
      } catch (err) {
        console.error(err);
        alert("Failed to load seminar data.");
      } finally {
        setLoading(false);
      }
    }
    fetchSeminar();
  }, [seminarId]);

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setSeminar((prev) => ({ ...prev, [name]: value }));
  };

  // Save changes
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/seminar/${seminarId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...seminar,
          duration: Number(seminar.duration),
        }),
      });

      if (res.ok) {
        alert("Seminar updated successfully!");
        router.push("/coaching");
      } else {
        const err = await res.json();
        alert(err.error || "Failed to update seminar.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save seminar.");
    } finally {
      setSaving(false);
    }
  };


  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "image" | "mediaUrl"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        alert("Upload failed");
        setUploading(false);
        return;
      }

      const data = await res.json();
      const fileUrl = data.url;

      setSeminar((prev) => ({ ...prev, [field]: fileUrl }));
      alert(" File uploaded successfully!");
    } catch (err) {
      console.error(err);
      alert("File upload failed.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container>
      <Title>Edit Seminar</Title>
      <FormGrid>
        <TextField
          label="Title"
          name="title"
          value={seminar.title}
          onChange={handleChange}
          fullWidth
          required
        />
        <TextField
          label="Host Name"
          name="hostName"
          value={seminar.hostName}
          onChange={handleChange}
          fullWidth
          required
        />
        <TextField
          label="Description"
          name="description"
          value={seminar.description}
          onChange={handleChange}
          multiline
          minRows={3}
          fullWidth
        />
        <TextField
          label="Date"
          name="date"
          type="datetime-local"
          value={seminar.date}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          label="Duration (mins)"
          name="duration"
          value={seminar.duration}
          onChange={handleChange}
          fullWidth
          type="number"
        />
        <TextField
          label="Zoom Link"
          name="zoomLink"
          value={seminar.zoomLink}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          select
          label="Access Type"
          name="accessType"
          value={seminar.accessType}
          onChange={handleChange}
          fullWidth
        >
          <MenuItem value="public">Public</MenuItem>
          <MenuItem value="private">Private</MenuItem>
        </TextField>
        <div>
          <label style={{ fontWeight: 600, color: "#1e293b" }}>
            Cover Image
          </label>
          {seminar.image ? (
            <div style={{ marginTop: 8 }}>
              <img
                src={seminar.image}
                alt="Cover"
                style={{
                  width: "100%",
                  maxWidth: 400,
                  borderRadius: 8,
                  border: "1px solid #ddd",
                }}
              />
            </div>
          ) : (
            <p style={{ color: "#64748b" }}>No image uploaded yet.</p>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileUpload(e, "image")}
            style={{ marginTop: 10 }}
          />
          {uploading && <p style={{ color: "#64748b" }}>Uploading...</p>}
        </div>

        <div>
          <label style={{ fontWeight: 600, color: "#1e293b" }}>
            Intro Media (Image/Video)
          </label>
          {seminar.mediaUrl ? (
            <div style={{ marginTop: 8 }}>
              {seminar.mediaUrl.endsWith(".mp4") ||
              seminar.mediaUrl.includes("video") ? (
                <video
                  src={seminar.mediaUrl}
                  controls
                  style={{
                    width: "100%",
                    maxWidth: 400,
                    borderRadius: 8,
                    border: "1px solid #ddd",
                  }}
                />
              ) : (
                <img
                  src={seminar.mediaUrl}
                  alt="Intro Media"
                  style={{
                    width: "100%",
                    maxWidth: 400,
                    borderRadius: 8,
                    border: "1px solid #ddd",
                  }}
                />
              )}
            </div>
          ) : (
            <p style={{ color: "#64748b" }}>No media uploaded yet.</p>
          )}
          <input
            type="file"
            accept="image/*,video/*"
            onChange={(e) => handleFileUpload(e, "mediaUrl")}
            style={{ marginTop: 10 }}
          />
          {uploading && <p style={{ color: "#64748b" }}>Uploading...</p>}
        </div>
      </FormGrid>

      <ActionButtons>
        <Button
          variant="outlined"
          color="inherit"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </ActionButtons>
    </Container>
  );
}
