"use client";

import { useEffect, useState } from "react";
import {
  TextField,
  Button,
  Stack,
  Typography,
  Box,
  Alert,
  MenuItem,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import dayjs, { Dayjs } from "dayjs";
import { useRouter } from "next/navigation";

export interface Community {
  id: string;
  name: string;
}

export interface MembershipTier {
  id: string;
  tierName: string;
}

export default function CreateSeminarPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    description: "",
    hostName: "",
    date: "",
    duration: "",
    image: "",
    mediaUrl: "",
    accessRules: [
      {
        accessScope: "public", // default
        communityId: "",
        tierId: "",
        price: "",
      },
    ],
  });
  const [communities, setCommunities] = useState<Community[]>([]);
  const [tiers, setTiers] = useState<MembershipTier[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // fetch communities and tiers
  useEffect(() => {
    async function fetchLists() {
      try {
        const [commRes, tierRes] = await Promise.all([
          fetch("/api/communities/all", { credentials: "include" }),
          fetch("/api/membership-tier", { credentials: "include" }),
        ]);

        const commText = await commRes.text();
        const tierText = await tierRes.text();

        const commData = JSON.parse(commText);
        const tierData = JSON.parse(tierText);

        setCommunities(commData || []);
        setTiers(tierData || []);
      } catch (err) {
        console.error("Error fetching dropdown lists:", err);
      }
    }
    fetchLists();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDateChange = (newValue: Dayjs | null) => {
    setForm({ ...form, date: newValue ? newValue.toISOString() : "" });
  };
  const handleAccessRuleChange = (
    index: number,
    field: string,
    value: string,
  ) => {
    const updatedRules = [...form.accessRules];
    (updatedRules[index] as any)[field] = value;
    setForm({ ...form, accessRules: updatedRules });
  };

  const addAccessRule = () => {
    setForm({
      ...form,
      accessRules: [
        ...form.accessRules,
        { accessScope: "public", communityId: "", tierId: "", price: "" },
      ],
    });
  };
  const removeAccessRule = (index: number) => {
    const updatedRules = [...form.accessRules];
    updatedRules.splice(index, 1);
    setForm({ ...form, accessRules: updatedRules });
  };

  const removeFile = (type: "image" | "media") => {
    setForm((prev) => ({
      ...prev,
      [type === "image" ? "image" : "mediaUrl"]: "",
    }));
  };

  const uploadToS3 = async (file: File) => {
    const folder = file.type.startsWith("video")
      ? "seminarVideo"
      : "seminarImages";

    const fileName = `${folder}/${Date.now()}-${file.name}`;

    // Get uploadUrl + publicUrl from backend
    const res = await fetch(
      `/api/upload?fileName=${encodeURIComponent(fileName)}&contentType=${file.type}`,
    );

    const { uploadUrl, publicUrl } = await res.json();

    if (!uploadUrl || !publicUrl) {
      throw new Error("Failed to get signed upload URL");
    }

    // Upload directly to S3
    await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
      },
      body: file,
    });

    return publicUrl;
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "image" | "media",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const uploadedUrl = await uploadToS3(file);
      setForm((prev) => ({
        ...prev,
        [type === "image" ? "image" : "mediaUrl"]: uploadedUrl,
      }));
    } catch (err) {
      console.error(`${type} upload failed:`, err);
      alert(`${type} upload failed.`);
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
        alert(`Seminar created successfully!`);

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

        {/* Access Rules */}
        <Box>
          <Typography variant="h6" fontWeight={600} mt={2}>
            Access Rules
          </Typography>

          {form.accessRules.map((rule, index) => (
            <Box
              key={index}
              p={2}
              mt={2}
              border="1px solid #ddd"
              borderRadius={2}
              bgcolor="#fafafa"
            >
              <Stack spacing={2}>
                <TextField
                  select
                  label="Access Scope"
                  value={rule.accessScope}
                  onChange={(e) =>
                    handleAccessRuleChange(index, "accessScope", e.target.value)
                  }
                >
                  <MenuItem value="public">Public</MenuItem>
                  <MenuItem value="community">Community Members </MenuItem>
                  <MenuItem value="membership">Membership Members</MenuItem>
                </TextField>

                {rule.accessScope === "community" && (
                  <TextField
                    key={`community-${communities.length}-${index}`}
                    select
                    label="Select Community"
                    value={rule.communityId}
                    onChange={(e) =>
                      handleAccessRuleChange(
                        index,
                        "communityId",
                        e.target.value,
                      )
                    }
                  >
                    {!communities ? (
                      <MenuItem disabled>Loading communities...</MenuItem>
                    ) : communities.length === 0 ? (
                      <MenuItem disabled>No communities available</MenuItem>
                    ) : (
                      communities.map((c) => (
                        <MenuItem key={c.id} value={c.id}>
                          {c.name}
                        </MenuItem>
                      ))
                    )}
                  </TextField>
                )}

                {rule.accessScope === "membership" && (
                  <TextField
                    select
                    label="Select Membership Tier"
                    value={rule.tierId}
                    onChange={(e) =>
                      handleAccessRuleChange(index, "tierId", e.target.value)
                    }
                  >
                    {tiers.length === 0 ? (
                      <MenuItem disabled>Loading membership tiers...</MenuItem>
                    ) : (
                      tiers.map((t) => (
                        <MenuItem key={t.id} value={t.id}>
                          {t.tierName}
                        </MenuItem>
                      ))
                    )}
                  </TextField>
                )}

                <TextField
                  label="Price (optional)"
                  type="number"
                  value={rule.price}
                  onChange={(e) =>
                    handleAccessRuleChange(index, "price", e.target.value)
                  }
                />

                {form.accessRules.length > 1 && (
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => removeAccessRule(index)}
                  >
                    Remove Rule
                  </Button>
                )}
              </Stack>
            </Box>
          ))}
          <Button
            variant="outlined"
            onClick={addAccessRule}
            sx={{ mt: 2, textTransform: "none" }}
          >
            + Add Another Rule
          </Button>
        </Box>

        {/* Seminar Cover */}
        <Box>
          <Typography variant="subtitle1" fontWeight={500}>
            Seminar Cover Image
          </Typography>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileUpload(e, "image")}
            onClick={(e) => e.stopPropagation()}
          />
          {form.image && (
            <Box mt={2}>
              <img
                src={form.image}
                alt="Seminar Cover Preview"
                width="100%"
                style={{ borderRadius: 8 }}
              />

              <Button
                variant="outlined"
                color="error"
                sx={{
                  mt: 2,
                  textTransform: "none",
                  width: "200px",
                }}
                onClick={() => removeFile("image")}
              >
                Remove Image
              </Button>
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
            onChange={(e) => handleFileUpload(e, "media")}
            onClick={(e) => e.stopPropagation()}
          />
          {form.mediaUrl && (
            <Box mt={2}>
              {/\.mp4|\.mov|\.avi|\.webm$/i.test(form.mediaUrl) ? (
                <video src={form.mediaUrl} controls width="100%" />
              ) : (
                <img src={form.mediaUrl} alt="Seminar Preview" width="100%" />
              )}

              <Button
                variant="outlined"
                color="error"
                sx={{
                  mt: 2,
                  textTransform: "none",
                  width: "200px",
                }}
                onClick={() => removeFile("media")}
              >
                Remove Media
              </Button>
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
