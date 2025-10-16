# Quick Setup Guide - Video Duration Detection

## ⚡ Quick Start (5 minutes)

### Step 1: Get Google API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Click **"Enable APIs and Services"**
4. Search and enable:
   - **YouTube Data API v3** ✅
   - **Google Drive API** ✅
5. Go to **Credentials** → **Create Credentials** → **API Key**
6. Copy your API key

### Step 2: Add to Environment Variables

Add this to your `.env` file:

```bash
# Use the same API key for both (recommended)
GOOGLE_DRIVE_API_KEY=AIzaSyD-your-api-key-here
GOOGLE_YOUTUBE_API_KEY=AIzaSyD-your-api-key-here
```

### Step 3: Restart Your Server

```bash
# Stop your dev server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 4: Test It!

1. Log in as an **Editor**
2. Go to **Tracking Board** (لوحة المتابعة)
3. Paste a YouTube link in the **"روابط"** field
4. Press Enter or click outside the field
5. Watch it automatically detect the duration! 🎉

## 🎥 Supported Links

### YouTube

- ✅ `https://www.youtube.com/watch?v=VIDEO_ID`
- ✅ `https://youtu.be/VIDEO_ID`
- ✅ `https://www.youtube.com/embed/VIDEO_ID`

### Google Drive

- ✅ `https://drive.google.com/file/d/FILE_ID/view`
- ✅ Must be shared with "Anyone with the link"

## 🐛 Common Issues

### Issue: "API key not configured"

**Fix:** Make sure you added the API key to `.env` and restarted the server

### Issue: "Could not fetch video metadata"

**Fix for YouTube:** Make sure the video is public or unlisted (not private)
**Fix for Google Drive:** Share the file with "Anyone with the link can view"

### Issue: It asks me to enter manually

**This is normal if:**

- You haven't set up the API key yet
- The video is private
- You've exceeded the daily quota (10,000 requests/day)

**Solution:** Just enter the duration manually (format: `5:30` or `1:25:45`)

## 📊 How It Works

1. You paste a video link → System detects it's YouTube/Google Drive
2. Automatically calls Google API → Gets video metadata
3. Extracts duration → Shows "⏱️ 5:30" in the duration column
4. If it fails → Asks you to enter manually

## 🔒 Security Tips

1. **Restrict your API key** (optional but recommended):

   - In Google Cloud Console → Credentials → Edit your API key
   - Under "API restrictions" → Select "Restrict key"
   - Only allow: YouTube Data API v3 and Google Drive API

2. **Never commit `.env` to Git**

   - It's already in `.gitignore`, but double-check!

3. **Monitor API usage**:
   - Google Cloud Console → APIs & Services → Dashboard
   - You get 10,000 free requests per day

## ✨ Features

- ✅ **Auto-detect** from YouTube and Google Drive
- ✅ **Manual entry** as fallback
- ✅ **Edit anytime** - click the ✏️ icon
- ✅ **Multiple formats** - supports all common video links
- ✅ **Loading indicator** - shows "جاري الكشف..." while detecting

## 💡 Pro Tips

1. **Use YouTube for faster detection** - YouTube API is more reliable
2. **Make Google Drive files public** - Private files require manual entry
3. **Batch multiple videos** - Paste links one by one, each will auto-detect
4. **Edit if wrong** - Just click the ✏️ icon to correct

## 🆘 Need Help?

Check the full documentation: `VIDEO_DURATION_DETECTION.md`

Or contact the admin if you're stuck!
