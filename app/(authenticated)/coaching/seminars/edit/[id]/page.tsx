"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  TextField,
  Button,
  MenuItem,
  CircularProgress,
  Box,
  Typography,
  Stack,
} from "@mui/material";
import styled from "@emotion/styled";
import type { Community, MembershipTier } from "../../create/page";

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
  const [communities, setCommunities] = useState<Community[]>([]);
  const [tiers, setTiers] = useState<MembershipTier[]>([]);

  const [seminar, setSeminar] = useState({
    title: "",
    description: "",
    hostName: "",
    date: "",
    duration: "",
    zoomLink: "",
    image: "",
    mediaUrl: "",
    accessRules: [] as {
      accessScope: "public" | "community" | "membership";
      communityId?: string;
      tierId?: string;
      price?: string;
    }[],
  });

  // Fetch seminar info
  useEffect(() => {
    async function fetchSeminar() {
      try {
        const [seminarRes, commRes, tierRes] = await Promise.all([
          fetch(`/api/seminar/${seminarId}`),
          fetch("/api/communities/all"),
          fetch("/api/membership-tier"),
        ]);
        if (!seminarRes.ok) throw new Error("Failed to fetch seminar");

        const [data, commData, tierData] = await Promise.all([
          seminarRes.json(),
          commRes.json(),
          tierRes.json(),
        ]);

        setCommunities(commData || []);
        setTiers(tierData || []);

        const resolvedAccessRules = (data.accessRules || []).map(
          (rule: any) => {
            const matchedCommunity = commData?.find(
              (c: Community) => c.id === rule.communityId,
            );
            const matchedTier = tierData?.find(
              (t: MembershipTier) => t.id === rule.tierId
            );

            return {
              accessScope: rule.accessScope,
              communityId: matchedCommunity?.id || rule.communityId || "",
              tierId: matchedTier?.id || rule.tierId || "",
              price: rule.price?.toString() || "",
            };
          },
        );

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
          image: data.image || "",
          mediaUrl: data.mediaUrl || "",
          accessRules: resolvedAccessRules,
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

  const handleAccessRuleChange = (
    index: number,
    field: string,
    value: string,
  ) => {
    const newRules = [...seminar.accessRules];
    (newRules[index] as any)[field] = value;
    setSeminar((prev) => ({ ...prev, accessRules: newRules }));
  };
  const handleAddRule = () => {
    setSeminar((prev) => ({
      ...prev,
      accessRules: [
        ...prev.accessRules,
        { accessScope: "public", communityId: "", tierId: "", price: "" },
      ],
    }));
  };
  const handleRemoveRule = (index: number) => {
    const updated = seminar.accessRules.filter((_, i) => i !== index);
    setSeminar((prev) => ({ ...prev, accessRules: updated }));
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "image" | "mediaUrl",
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
          accessRules: seminar.accessRules.map((r) => ({
            ...r,
            price: r.price ? parseFloat(r.price) : null,
          })),
        }),
      });

      if (res.ok) {
        alert("Seminar updated successfully!");
        router.push("/coaching?tab=Seminars");
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
        {/* Access Rules */}
        <Box>
          <Typography variant="h6" fontWeight={600} mt={2}>
            Access Rules
          </Typography>
          {seminar.accessRules.map((rule, index) => (
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
                  <MenuItem value="community">Community Members</MenuItem>
                  <MenuItem value="membership">Membership Tier</MenuItem>
                </TextField>

                {rule.accessScope === "community" && (
                  <TextField
                    select
                    label="Select Community"
                    value={rule.communityId || ""}
                    onChange={(e) =>
                      handleAccessRuleChange(
                        index,
                        "communityId",
                        e.target.value,
                      )
                    }
                    fullWidth
                  >
                    {communities.length === 0 ? (
                      <MenuItem disabled>No communities found</MenuItem>
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
                      <MenuItem disabled>No membership tiers found</MenuItem>
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

                {seminar.accessRules.length > 1 && (
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleRemoveRule(index)}
                  >
                    Remove Rule
                  </Button>
                )}
              </Stack>
            </Box>
          ))}

          <Button
            variant="outlined"
            onClick={handleAddRule}
            sx={{ mt: 2, textTransform: "none" }}
          >
            + Add Another Rule
          </Button>
        </Box>

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

              <Button
                variant="outlined"
                color="error"
                sx={{ mt: 2, textTransform: "none", width: 200 }}
                onClick={() =>
                  setSeminar((prev) => ({
                    ...prev,
                    image: "",
                  }))
                }
              >
                Remove
              </Button>
            </div>
          ) : (
            <p style={{ color: "#64748b" }}>No image uploaded yet.</p>
          )}

          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileUpload(e, "image")}
            style={{ marginTop: 10 }}
            onClick={(e) => e.stopPropagation()}
          />

          {uploading && <p style={{ color: "#64748b" }}>Uploading...</p>}
        </div>

        {/* INTRO  */}
        <div>
          <label style={{ fontWeight: 600, color: "#1e293b" }}>
            Intro Media (Image/Video)
          </label>

          {seminar.mediaUrl ? (
            <div style={{ marginTop: 8 }}>
              {seminar.mediaUrl.match(/\.(mp4|mov|avi|webm)$/i) ? (
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

              <Button
                variant="outlined"
                color="error"
                sx={{ mt: 2, textTransform: "none", width: 200 }}
                onClick={() =>
                  setSeminar((prev) => ({
                    ...prev,
                    mediaUrl: "",
                  }))
                }
              >
                Remove
              </Button>
            </div>
          ) : (
            <p style={{ color: "#64748b" }}>No media uploaded yet.</p>
          )}

          <input
            type="file"
            accept="image/*,video/*"
            onChange={(e) => handleFileUpload(e, "mediaUrl")}
            onClick={(e) => e.stopPropagation()}
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
