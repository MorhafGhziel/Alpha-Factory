import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../lib/auth";

// Helper function to extract Google Drive file ID and resource key from various URL formats
function extractGoogleDriveFileId(
  url: string
): { fileId: string; resourceKey?: string } | null {
  // Format 1: https://drive.google.com/file/d/FILE_ID/view
  let match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (match) {
    const fileId = match[1];
    // Check for resource key
    const resourceKeyMatch = url.match(/[?&]resourcekey=([a-zA-Z0-9_-]+)/);
    return {
      fileId,
      resourceKey: resourceKeyMatch ? resourceKeyMatch[1] : undefined,
    };
  }

  // Format 2: https://drive.google.com/open?id=FILE_ID
  match = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match) {
    return { fileId: match[1] };
  }

  // Format 3: Direct file ID
  if (/^[a-zA-Z0-9_-]{25,}$/.test(url)) {
    return { fileId: url };
  }

  return null;
}

// Helper function to extract YouTube video ID from various URL formats
function extractYouTubeVideoId(url: string): string | null {
  // Format 1: https://www.youtube.com/watch?v=VIDEO_ID
  let match = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (match) return match[1];

  // Format 2: https://youtu.be/VIDEO_ID
  match = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (match) return match[1];

  // Format 3: https://www.youtube.com/embed/VIDEO_ID
  match = url.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
  if (match) return match[1];

  // Format 4: https://www.youtube.com/v/VIDEO_ID
  match = url.match(/\/v\/([a-zA-Z0-9_-]{11})/);
  if (match) return match[1];

  return null;
}

// Helper function to format duration from milliseconds to readable format
function formatDuration(durationMillis: number): string {
  const totalSeconds = Math.floor(durationMillis / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  } else {
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }
}

// POST - Get video duration from URL
export async function POST(req: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Check if it's a YouTube URL first
    const youtubeVideoId = extractYouTubeVideoId(url);

    if (youtubeVideoId) {
      // For YouTube videos, use YouTube Data API
      try {
        const apiKey =
          process.env.GOOGLE_YOUTUBE_API_KEY ||
          process.env.GOOGLE_DRIVE_API_KEY;

        if (!apiKey) {
          return NextResponse.json(
            {
              error: "YouTube API key not configured",
              message:
                "Please add GOOGLE_YOUTUBE_API_KEY or GOOGLE_DRIVE_API_KEY to environment variables",
              requiresManualEntry: true,
            },
            { status: 400 }
          );
        }

        const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet&id=${youtubeVideoId}&key=${apiKey}`;

        const response = await fetch(apiUrl);

        if (!response.ok) {
          console.error("YouTube API error:", await response.text());
          return NextResponse.json(
            {
              error: "Could not fetch video metadata from YouTube",
              message:
                "The video may be private or the link is invalid. Please enter the duration manually.",
              requiresManualEntry: true,
            },
            { status: 400 }
          );
        }

        const data = await response.json();

        if (data.items && data.items.length > 0) {
          const duration = data.items[0].contentDetails.duration;

          // Parse ISO 8601 duration format (e.g., "PT4M13S" or "PT1H2M10S")
          const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);

          if (match) {
            const hours = parseInt(match[1] || "0");
            const minutes = parseInt(match[2] || "0");
            const seconds = parseInt(match[3] || "0");

            const totalSeconds = hours * 3600 + minutes * 60 + seconds;
            const durationMillis = totalSeconds * 1000;
            const formattedDuration = formatDuration(durationMillis);

            return NextResponse.json({
              duration: formattedDuration,
              durationSeconds: totalSeconds,
              fileName: data.items[0].snippet?.title || "YouTube Video",
              mimeType: "video/youtube",
            });
          }
        }

        return NextResponse.json(
          {
            error: "Video metadata not available",
            message: "Could not extract video duration. Please enter manually.",
            requiresManualEntry: true,
          },
          { status: 400 }
        );
      } catch (error) {
        console.error("Error fetching YouTube metadata:", error);
        return NextResponse.json(
          {
            error: "Failed to fetch video metadata",
            message:
              "Could not connect to YouTube API. Please enter the duration manually.",
            requiresManualEntry: true,
          },
          { status: 500 }
        );
      }
    }

    // Check if it's a Google Drive URL
    const driveInfo = extractGoogleDriveFileId(url);

    if (driveInfo) {
      // For Google Drive, we need to use their API
      // This requires a Google API key or OAuth token

      // Try to get public metadata if the file is publicly accessible
      try {
        const apiKey = process.env.GOOGLE_DRIVE_API_KEY;

        if (!apiKey) {
          return NextResponse.json(
            {
              error: "Google Drive API key not configured",
              message:
                "Please add GOOGLE_DRIVE_API_KEY to environment variables",
              requiresManualEntry: true,
            },
            { status: 400 }
          );
        }

        const fields = "mimeType,name,videoMediaMetadata";
        let apiUrl = `https://www.googleapis.com/drive/v3/files/${
          driveInfo.fileId
        }?fields=${encodeURIComponent(fields)}&key=${apiKey}`;

        // Add resource key if present (for newer Google Drive files)
        if (driveInfo.resourceKey) {
          apiUrl += `&supportsAllDrives=true`;
        }

        let response = await fetch(apiUrl);

        // If first attempt fails and we have a resource key, try alternative approaches
        if (!response.ok && driveInfo.resourceKey) {
          console.log(
            "First attempt failed, trying alternative approach with resource key..."
          );

          // Try with different API parameters for files with resource keys
          const alternativeUrl = `https://www.googleapis.com/drive/v3/files/${
            driveInfo.fileId
          }?fields=${encodeURIComponent(
            fields
          )}&key=${apiKey}&supportsAllDrives=true&includeItemsFromAllDrives=true`;

          response = await fetch(alternativeUrl);
        }

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Google Drive API error:", response.status, errorText);

          // Handle different types of errors with more helpful messages
          if (response.status === 404) {
            return NextResponse.json(
              {
                error: "Google Drive file not accessible",
                message:
                  "The file cannot be accessed by the API. This usually means:\n\n1. The file is private (not shared with 'Anyone with the link')\n2. The file has been deleted or moved\n3. The sharing link has expired\n\nPlease check the file's sharing settings and make sure it's set to 'Anyone with the link can view', or enter the duration manually.",
                requiresManualEntry: true,
              },
              { status: 400 }
            );
          } else if (response.status === 403) {
            return NextResponse.json(
              {
                error: "Google Drive access denied",
                message:
                  "Access to this file is restricted. This usually means:\n\n1. The file is private or has limited sharing\n2. Your organization has restrictions on API access\n3. The file requires additional permissions\n\nPlease share the file with 'Anyone with the link can view' and try again, or enter the duration manually.",
                requiresManualEntry: true,
              },
              { status: 400 }
            );
          } else {
            return NextResponse.json(
              {
                error: "Could not fetch video metadata from Google Drive",
                message: `API returned error ${response.status}. The file may be private, have restricted access, or require special permissions. Please enter the duration manually.`,
                requiresManualEntry: true,
              },
              { status: 400 }
            );
          }
        }

        const data = await response.json();

        if (data.videoMediaMetadata && data.videoMediaMetadata.durationMillis) {
          const durationMillis = parseInt(
            data.videoMediaMetadata.durationMillis
          );
          const formattedDuration = formatDuration(durationMillis);

          return NextResponse.json({
            duration: formattedDuration,
            durationSeconds: Math.floor(durationMillis / 1000),
            fileName: data.name,
            mimeType: data.mimeType,
          });
        } else {
          return NextResponse.json(
            {
              error: "Video metadata not available",
              message:
                "Could not extract video duration. Please enter manually.",
              requiresManualEntry: true,
            },
            { status: 400 }
          );
        }
      } catch (error) {
        console.error("Error fetching Google Drive metadata:", error);
        return NextResponse.json(
          {
            error: "Failed to fetch video metadata",
            message:
              "Could not connect to Google Drive API. Please enter the duration manually.",
            requiresManualEntry: true,
          },
          { status: 500 }
        );
      }
    } else {
      // For direct video URLs, we can't fetch duration server-side without downloading
      // the video, so we'll return an error asking for manual entry
      return NextResponse.json(
        {
          error: "Direct video URL detection not supported",
          message:
            "For direct video URLs, please enter the duration manually or use the browser-based detection.",
          requiresManualEntry: true,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error in video-duration API:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message:
          "An unexpected error occurred. Please enter the duration manually.",
        requiresManualEntry: true,
      },
      { status: 500 }
    );
  }
}
