"use client";

import { useState } from "react";

interface VoiceRecorderProps {
  onVoiceRecorded: (hasRecording: boolean, voiceUrl?: string) => void;
  className?: string;
}

export default function VoiceRecorder({
  onVoiceRecorded,
  className = "",
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [recordedAudio, setRecordedAudio] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const startRecording = async (): Promise<void> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: "audio/webm" });
        const audioUrl = URL.createObjectURL(audioBlob);

        // Store the audio URL for playback
        setRecordedAudio(audioUrl);
        
        // Upload the audio file
        setIsUploading(true);
        try {
          const formData = new FormData();
          formData.append("audio", audioBlob, "voice_recording.webm");
          
          const response = await fetch("/api/voice-upload", {
            method: "POST",
            body: formData,
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log("Voice upload successful:", data);
            onVoiceRecorded(true, data.url);
          } else {
            const errorText = await response.text();
            console.error("Failed to upload voice recording:", response.status, errorText);
            onVoiceRecorded(true); // Still indicate recording exists, but without upload
          }
        } catch (error) {
          console.error("Error uploading voice recording:", error);
          onVoiceRecorded(true); // Still indicate recording exists, but without upload
        } finally {
          setIsUploading(false);
        }

        // Clean up
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start(1000); // Collect data every second
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
      alert("خطأ في بدء التسجيل. تأكد من السماح بالوصول للميكروفون.");
    }
  };

  const stopRecording = (): void => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };

  const playRecording = (): void => {
    if (recordedAudio) {
      const audio = new Audio(recordedAudio);
      audio.onplay = () => setIsPlaying(true);
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => setIsPlaying(false);
      audio.play().catch((error) => {
        console.error("Error playing audio:", error);
        setIsPlaying(false);
      });
    }
  };

  const deleteRecording = (): void => {
    if (recordedAudio) {
      URL.revokeObjectURL(recordedAudio);
      setRecordedAudio(null);
      setIsPlaying(false);
      onVoiceRecorded(false);
    }
  };

  return (
    <div
      className={`p-3 bg-[#1a1a1a] rounded-xl border border-[#333336] ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {!recordedAudio ? (
            // Recording Button
            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                isRecording
                  ? "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25"
                  : "bg-[#EAD06C] hover:bg-[#C48829] text-black shadow-lg shadow-yellow-500/25"
              }`}
            >
              {isRecording ? (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1zM12 7a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  إيقاف التسجيل
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                      clipRule="evenodd"
                    />
                  </svg>
                  تسجيل صوتي
                </>
              )}
            </button>
          ) : (
            // Playback Controls
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={playRecording}
                disabled={isPlaying}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                    clipRule="evenodd"
                  />
                </svg>
                {isPlaying ? "جاري التشغيل..." : "تشغيل التسجيل"}
              </button>

              <button
                type="button"
                onClick={deleteRecording}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"
                    clipRule="evenodd"
                  />
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414 1.414L10.586 10l-1.707 1.707a1 1 0 101.414 1.414L12 11.414l1.707 1.707a1 1 0 001.414-1.414L13.414 10l1.707-1.707z"
                    clipRule="evenodd"
                  />
                </svg>
                حذف
              </button>
            </div>
          )}

          {isRecording && (
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
              <span className="font-medium">جاري التسجيل...</span>
            </div>
          )}
        </div>

        <div className="text-xs text-gray-400">
          {isUploading ? "جاري الرفع..." : recordedAudio ? "تسجيل صوتي جاهز" : "اضغط للتسجيل الصوتي"}
        </div>
      </div>
    </div>
  );
}
