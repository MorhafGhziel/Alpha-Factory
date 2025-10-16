# Video Duration Detection Feature

## Overview

This feature allows the system to automatically detect and display the duration of edited videos when editors paste Google Drive links (or other video URLs) in the tracking board.

## How It Works

### 1. **Automatic Detection**

When an editor enters a video link in the "رابط العمل المنجز" (Review Links) field:

- The system automatically attempts to detect the video duration
- If successful, the duration is displayed in the "مدة الفيديو" (Video Duration) column
- The duration is shown in a readable format (e.g., "5:30" for 5 minutes 30 seconds, or "1:25:45" for 1 hour 25 minutes 45 seconds)

### 2. **Manual Detection Button**

If auto-detection doesn't work, editors can:

- Click the "كشف المدة" (Detect Duration) button
- The system will attempt to fetch the video metadata
- If it fails, a prompt will appear asking for manual entry

### 3. **Manual Entry**

Editors can manually enter or edit the video duration by:

- Clicking the edit icon (✏️) next to the displayed duration
- Entering the duration in the format: `MM:SS` or `HH:MM:SS`

## Supported Video Sources

### YouTube (Recommended)

For YouTube links, the system can extract duration metadata using the YouTube Data API v3.

**Setup Required:**

1. Create a Google Cloud Project
2. Enable the YouTube Data API v3
3. Create an API Key (restrict it to YouTube Data API only)
4. Add the API key to your environment variables:
   ```
   GOOGLE_YOUTUBE_API_KEY=your_api_key_here
   # OR use the same key for both:
   GOOGLE_DRIVE_API_KEY=your_api_key_here
   ```

**Supported URL Formats:**

- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://www.youtube.com/embed/VIDEO_ID`
- `https://www.youtube.com/v/VIDEO_ID`

**Important Notes:**

- Works with public and unlisted videos
- Private videos will require manual duration entry
- API has daily quota limits (10,000 units per day for free tier)

### Google Drive

For Google Drive links, the system can extract duration metadata using the Google Drive API.

**Setup Required:**

1. Create a Google Cloud Project (or use the same one as YouTube)
2. Enable the Google Drive API
3. Create an API Key (restrict it to Google Drive API only)
4. Add the API key to your environment variables:
   ```
   GOOGLE_DRIVE_API_KEY=your_api_key_here
   ```

**Important Notes:**

- The Google Drive file must be publicly accessible or shared with a link
- Private files will require manual duration entry
- Supported formats: MP4, AVI, MOV, WMV, and other standard video formats

### Direct Video URLs

For direct video file URLs (e.g., `https://example.com/video.mp4`):

- Client-side detection is possible but requires downloading metadata
- Server-side detection is not supported to avoid bandwidth issues
- Manual entry is recommended for direct URLs

## Database Schema

A new field has been added to the Project model:

```prisma
model Project {
  // ... other fields
  videoDuration    String?   // Stores duration in format "MM:SS" or "HH:MM:SS"
  // ... other fields
}
```

## API Endpoints

### POST `/api/video-duration`

Detects video duration from a URL.

**Request:**

```json
{
  "url": "https://drive.google.com/file/d/FILE_ID/view"
}
```

**Success Response:**

```json
{
  "duration": "5:30",
  "durationSeconds": 330,
  "fileName": "video.mp4",
  "mimeType": "video/mp4"
}
```

**Error Response (Manual Entry Required):**

```json
{
  "error": "Could not fetch video metadata",
  "message": "The file may be private or the link is invalid. Please enter the duration manually.",
  "requiresManualEntry": true
}
```

### PUT `/api/projects/[id]`

Updated to support the `videoDuration` field:

```json
{
  "videoDuration": "5:30"
}
```

## UI Components

### Editor Tracking Board

Location: `/src/app/editor/tracking-board/page.tsx`

**New Column: مدة الفيديو (Video Duration)**

- Displays detected or manually entered video duration
- Shows a loading state while detecting
- Provides edit functionality for corrections
- Shows a "Detect Duration" button if no duration is set

**States:**

1. **No Link:** Shows "-" (dash)
2. **Detecting:** Shows "جاري الكشف..." (Detecting...)
3. **Duration Set:** Shows "⏱️ 5:30" with an edit button
4. **Link but No Duration:** Shows "كشف المدة" (Detect Duration) button

## Setup Instructions

### 1. Environment Variables

Add to your `.env` file:

```bash
# YouTube API Configuration (Recommended for YouTube videos)
GOOGLE_YOUTUBE_API_KEY=your_api_key_here

# Google Drive API Configuration (For Google Drive videos)
GOOGLE_DRIVE_API_KEY=your_api_key_here

# Note: You can use the same API key for both if you enable both APIs in Google Cloud
```

### 2. Database Migration

Run the Prisma migration:

```bash
npx prisma generate
npx prisma db push
```

### 3. Enable Required APIs in Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select or create a project
3. Go to **APIs & Services** > **Library**
4. Enable **YouTube Data API v3** (for YouTube videos)
5. Enable **Google Drive API** (for Google Drive videos)
6. Go to **APIs & Services** > **Credentials**
7. Create an API Key
8. (Optional) Restrict the API key to only these APIs for security

### 4. Test the Feature

1. Log in as an editor
2. Navigate to the tracking board
3. Enter a YouTube or Google Drive video link in the "روابط" field
4. The system should automatically attempt to detect the duration
5. If detection fails, manually enter the duration when prompted

**Test URLs:**

- YouTube: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
- Google Drive: Share a video with "Anyone with the link" and paste the link

## Troubleshooting

### YouTube API Not Working

**Problem:** "YouTube API key not configured" error

**Solution:**

1. Verify `GOOGLE_YOUTUBE_API_KEY` or `GOOGLE_DRIVE_API_KEY` is set in your environment
2. Ensure the API key has YouTube Data API v3 enabled
3. Check API key restrictions (it should allow requests from your domain)
4. Verify you haven't exceeded the daily quota (10,000 units/day)

### Google Drive API Not Working

**Problem:** "Google Drive API key not configured" error

**Solution:**

1. Verify `GOOGLE_DRIVE_API_KEY` is set in your environment
2. Ensure the API key has Google Drive API enabled
3. Check API key restrictions (it should allow requests from your domain)

### Private File Access

**Problem:** "Could not fetch video metadata from Google Drive"

**Solution:**

- Make the Google Drive file publicly accessible (Anyone with the link can view)
- Or manually enter the video duration

### Invalid Duration Format

**Problem:** Duration not displaying correctly

**Solution:**

- Use format `MM:SS` for durations under 1 hour (e.g., "5:30")
- Use format `HH:MM:SS` for durations over 1 hour (e.g., "1:25:45")
- Don't include milliseconds or decimal points

## Future Enhancements

Potential improvements for future versions:

1. Support for YouTube links
2. Support for Vimeo links
3. Support for other cloud storage providers (Dropbox, OneDrive)
4. Batch duration detection for multiple videos
5. Video thumbnail preview
6. Client-side video metadata extraction for direct URLs
7. Duration validation and formatting improvements

## Technical Details

### Duration Format Conversion

The system uses the following logic:

```typescript
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
```

### Google Drive File ID Extraction

Supports multiple URL formats:

- `https://drive.google.com/file/d/FILE_ID/view`
- `https://drive.google.com/open?id=FILE_ID`
- Direct file ID strings

## Security Considerations

1. **API Key Security:** Store API keys in environment variables, never commit them to version control
2. **Rate Limiting:** Google Drive API has rate limits; consider implementing caching
3. **User Authentication:** The endpoint requires user authentication
4. **Input Validation:** URLs and durations are validated before processing

## Support

If you encounter issues with the video duration detection feature:

1. Check the browser console for error messages
2. Verify your Google Drive API key is correctly configured
3. Ensure the video file is accessible via the provided link
4. Try manual entry as a fallback option
