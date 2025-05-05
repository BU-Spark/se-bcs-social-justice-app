import axios, { AxiosError } from "axios";

// Zoom API configuration
const ZOOM_API_BASE_URL = "https://api.zoom.us/v2";

/**
 * Generate a Zoom JWT token for authentication
 * Requires environment variables: ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET
 * @param retryCount Number of retries attempted so far
 */
export async function getZoomToken(retryCount = 0): Promise<string> {
  const maxRetries = 2;

  try {
    const accountId = process.env.ZOOM_ACCOUNT_ID;
    const clientId = process.env.ZOOM_CLIENT_ID;
    const clientSecret = process.env.ZOOM_CLIENT_SECRET;

    if (!accountId || !clientId || !clientSecret) {
      throw new Error("Zoom API credentials not configured");
    }

    // Create auth string for basic auth
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    // Try the server-to-server OAuth approach
    try {
      const response = await axios.post(
        "https://zoom.us/oauth/token",
        "grant_type=account_credentials&account_id=" + accountId,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${auth}`,
          },
        }
      );

      return response.data.access_token;
    } catch (oauthError) {
      // If server-to-server OAuth fails, try JWT approach as backup
      console.log("OAuth approach failed, trying JWT approach...");

      // JWT approach
      // Note: This is a fallback and requires a different credential type in Zoom
      if (process.env.ZOOM_API_KEY && process.env.ZOOM_API_SECRET) {
        console.log("Using JWT approach as fallback");
        // Implement JWT approach if needed
      }

      // If we don't have JWT credentials, re-throw the original error
      throw oauthError;
    }
  } catch (error: unknown) {
    console.error("Error generating Zoom token:", error);

    // Log more detailed error info if available
    if (error instanceof AxiosError && error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);

      // If we haven't exceeded max retries and got certain errors, retry
      if (
        retryCount < maxRetries &&
        (error.response.status === 401 || error.response.status === 429)
      ) {
        console.log(
          `Retrying Zoom token generation (${retryCount + 1}/${maxRetries})...`
        );
        // Exponential backoff
        const delay = 1000 * Math.pow(2, retryCount);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return getZoomToken(retryCount + 1);
      }
    }

    throw new Error("Failed to generate Zoom token");
  }
}

// Define recurrence data interface
interface ZoomRecurrenceData {
  weekly_days?: number[];
  monthly_day?: number;
  end_times?: number;
  end_date_time?: string;
  [key: string]: unknown;
}

// Define the Zoom meeting details interface
interface ZoomMeetingDetails {
  topic: string;
  type: number;
  start_time: string;
  duration: number;
  timezone?: string;
  agenda?: string;
  settings?: {
    host_video?: boolean;
    participant_video?: boolean;
    join_before_host?: boolean;
    mute_upon_entry?: boolean;
    waiting_room?: boolean;
    auto_recording?: "none" | "local" | "cloud";
  };
  recurrence?: {
    type: number;
    repeat_interval?: number;
    weekly_days?: string;
    monthly_day?: number;
    end_times?: number;
    end_date_time?: string;
  };
}

/**
 * Create a Zoom meeting
 * @param {ZoomMeetingDetails} meetingDetails - Meeting details
 * @returns {Promise<Object>} - Meeting information
 */
export async function createZoomMeeting(meetingDetails: ZoomMeetingDetails) {
  try {
    const token = await getZoomToken();

    const response = await axios.post(
      `${ZOOM_API_BASE_URL}/users/me/meetings`,
      meetingDetails,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error creating Zoom meeting:", error);
    throw new Error("Failed to create Zoom meeting");
  }
}

/**
 * Format recurrence data for Zoom API
 * @param pattern - Recurrence pattern (daily, weekly, biweekly, monthly)
 * @param recurrenceData - Additional recurrence data
 */
export function formatRecurrenceData(
  pattern: string,
  recurrenceData: ZoomRecurrenceData
) {
  // Default to recurring with fixed time (type 3)
  const zoomRecurrence: {
    type: number;
    repeat_interval?: number;
    weekly_days?: string;
    monthly_day?: number;
    end_times?: number;
    end_date_time?: string;
  } = {
    type:
      pattern === "daily"
        ? 1
        : pattern === "weekly" || pattern === "biweekly"
          ? 2
          : 3,
  };

  // Set repeat interval
  if (pattern === "biweekly") {
    zoomRecurrence.repeat_interval = 2;
  } else {
    zoomRecurrence.repeat_interval = 1;
  }

  // Handle weekly days
  if (
    (pattern === "weekly" || pattern === "biweekly") &&
    recurrenceData.weekly_days
  ) {
    zoomRecurrence.weekly_days = recurrenceData.weekly_days.join(",");
  }

  // Handle monthly day
  if (pattern === "monthly" && recurrenceData.monthly_day) {
    zoomRecurrence.monthly_day = recurrenceData.monthly_day;
  }

  // Handle end conditions
  if (recurrenceData.end_times) {
    zoomRecurrence.end_times = recurrenceData.end_times;
  } else if (recurrenceData.end_date_time) {
    zoomRecurrence.end_date_time = recurrenceData.end_date_time;
  }

  return zoomRecurrence;
}
