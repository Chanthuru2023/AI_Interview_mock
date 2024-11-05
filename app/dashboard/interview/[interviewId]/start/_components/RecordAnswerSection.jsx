"use client"; // Ensure this is a Client Component

import React, { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import useSpeechToText from "react-hook-speech-to-text";
import { Mic } from "lucide-react";
import { toast } from "sonner";
import { chatSession } from "@/utils/GeminiAIModal";
import { UserAnswer } from "@/utils/schema";
import moment from "moment";
import { db } from "@/utils/db";
import { useUser } from "@clerk/nextjs";
import axios from "axios";

function RecordAnswerSection({ mockInterviewQuestions, activeQuestionIndex, interviewData }) {
  const webcamRef = useRef(null);
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");
  const [emotionHistory, setEmotionHistory] = useState([]); // Store emotions with timestamps
  const [gazeStatus, setGazeStatus] = useState("Initializing...");
  const [interviewStatus, setInterviewStatus] = useState("Initializing...");
  const [numFaces, setNumFaces] = useState(0);
  const [isWebcamAvailable, setIsWebcamAvailable] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const { isRecording, results, startSpeechToText, stopSpeechToText, setResults } = useSpeechToText({
    continuous: true,
    useLegacyResults: false,
    audioConstraints: {
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
      },
    },
  });

  // Check webcam availability
  useEffect(() => {
    const checkWebcamAvailability = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        setIsWebcamAvailable(true);
        if (webcamRef.current) {
          webcamRef.current.video.srcObject = stream;
          webcamRef.current.video.muted = true;
        }
      } catch (error) {
        console.error("Webcam not available:", error);
        setIsWebcamAvailable(false);
      }
    };
    checkWebcamAvailability();
  }, []);

  const captureFrame = async () => {
    if (webcamRef.current && webcamRef.current.video.readyState === 4 && !isProcessing) {
      setIsProcessing(true);

      const canvas = document.createElement("canvas");
      canvas.width = 640;
      canvas.height = 480;
      const context = canvas.getContext("2d");
      context.drawImage(webcamRef.current.video, 0, 0, canvas.width, canvas.height);

      const imageData = canvas.toDataURL("image/jpeg", 0.7);
      const blob = await (await fetch(imageData)).blob();

      try {
        const response = await axios.post("https://ai-interview-mock-1.onrender.com/analyze", blob, {
        headers: { "Content-Type": "application/octet-stream" },
         });
        
        const { gaze_status, interview_status, num_faces, emotion } = response.data;
        setGazeStatus(gaze_status);
        setInterviewStatus(interview_status);
        setNumFaces(num_faces);

        // Append each new emotion with a timestamp to the history
        const timestampedEmotion = `${emotion}-${moment().format("HH:mm:ss")}`;
        setEmotionHistory((prev) => [...prev, timestampedEmotion]);

        // Display appropriate toast messages based on gaze and face detection
        if (gaze_status === "Looking left" || gaze_status === "Looking right" || gaze_status === "No face detected") {
          toast("Please ensure you're looking at the screen during the interview for optimal results.");
        }

        if (num_faces > 1) {
          toast("Please conduct the interview alone to ensure accurate feedback.");
        }

      } catch (error) {
        console.error("Error:", error);
        toast.error("Failed to analyze frame.");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  // Capture frames continuously every 2 seconds
  useEffect(() => {
    const interval = setInterval(captureFrame, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (results.length > 0) {
      const newTranscript = results.map((result) => result.transcript).join(" ");
      setUserAnswer((prevAns) => prevAns + " " + newTranscript);
    }
  }, [results]);

  const calculateDominantEmotionAndConfidence = () => {
    const emotionCounts = emotionHistory.reduce((acc, emotion) => {
      const emotionType = emotion.split("-")[0]; // Extract emotion name without timestamp
      acc[emotionType] = (acc[emotionType] || 0) + 1;
      return acc;
    }, {});

    const dominantEmotion = Object.keys(emotionCounts).reduce((a, b) =>
      emotionCounts[a] > emotionCounts[b] ? a : b
    );

    const confidencePercentage = ((emotionCounts[dominantEmotion] / emotionHistory.length) * 100).toFixed(2);
    return { dominantEmotion, confidencePercentage };
  };

  const StartStopRecording = async () => {
    if (isRecording) {
      stopSpeechToText();

      // Add a delay to allow final transcription updates to complete before checking length
      setTimeout(detectAndSaveData, 500);
    } else {
      setUserAnswer("");
      setResults([]);
      startSpeechToText();
    }
  };

  const detectAndSaveData = async () => {
    const trimmedAnswer = userAnswer.trim();

    if (trimmedAnswer.length < 10) {
        toast.warning("Answer too short, please try to give a more complete response.");
    }

    const { dominantEmotion, confidencePercentage } = calculateDominantEmotionAndConfidence();

    const feedbackPrompt = `
      Please review the following answer for both content quality and grammar.
      Question: ${mockInterviewQuestions[activeQuestionIndex]?.question}
      User Answer: ${trimmedAnswer}
      The dominant emotion throughout the interview was ${dominantEmotion} with a confidence level of ${confidencePercentage}%.
      Respond in JSON with 'rating out of 5', 'grammar_corrections', 'content_feedback', 'suggestions'.
    `;

    try {
        const result = await chatSession.sendMessage(feedbackPrompt);
        const feedbackData = result.response.candidates[0]?.content?.parts[0]?.text;
        const jsonMatch = feedbackData.match(/```json\n([\s\S]*?)\n```/);

        if (jsonMatch) {
            const parsedFeedback = JSON.parse(jsonMatch[1].trim());

            // Use a default value for rating if it's undefined
            const rating = parsedFeedback.rating ? parsedFeedback.rating.toString() : "0";

            try {
                // Attempt to insert into the database
                const resp = await db.insert(UserAnswer).values({
                    mockIdRef: interviewData?.mockId,
                    question: mockInterviewQuestions[activeQuestionIndex]?.question,
                    correctAnswer: mockInterviewQuestions[activeQuestionIndex]?.answer,
                    userAnswer: trimmedAnswer,
                    feedback: `${parsedFeedback.content_feedback}. Suggestions: ${parsedFeedback.suggestions}`,
                    grammarCorrections: parsedFeedback.grammar_corrections,
                    rating: rating,
                    emotions: emotionHistory.join(", "), // Store all emotions with timestamps
                    confidencePercentage: confidencePercentage, // Store confidence percentage
                    userEmail: user?.primaryEmailAddress?.emailAddress,
                    createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
                });

                if (resp) {
                    toast.success("User Answer recorded successfully.");
                    setUserAnswer("");
                    setResults([]);
                    setEmotionHistory([]); // Clear emotion history after saving
                } else {
                    console.error("Error: Database response indicated failure.");
                    toast.error("Failed to save to the database.");
                }
            } catch (dbError) {
                console.error("Database Insertion Error:", dbError);
                toast.error("Database insertion failed. Check console for details.");
            }
        } else {
            console.error("JSON format not found in feedback message.");
        }
    } catch (error) {
        console.error("Error in detectAndSaveData:", error);
    }
};


  return (
    <div className="flex items-center justify-center flex-col">
      <div className="flex flex-col my-20 justify-center items-center rounded-lg p-5 bg-white">
        {isWebcamAvailable ? (
          <Webcam ref={webcamRef} className="w-full h-auto border rounded-lg" mirrored audio={false} />
        ) : (
          <Image src={"/webcam.png"} width={200} height={200} alt="Webcam Icon" />
        )}
      </div>      

      <Button disabled={loading} variant="outline" onClick={StartStopRecording}>
        {isRecording ? (
          <span className="flex items-center">
            <Mic className="mr-2" />
            <span className="text-red-600">Stop Recording</span>
          </span>
        ) : (
          "Record Answer"
        )}
      </Button>

      <div className="text-black text-lg mb-4">
        <strong>Gaze Status:</strong> {gazeStatus}
      </div>
      <div className="text-black text-lg mb-4">
        <strong>Interview Status:</strong> {interviewStatus}
      </div>
      <div className="text-black text-lg mb-4">
        <strong>Number of Faces Detected:</strong> {numFaces}
      </div>
    </div>
  );
}

export default RecordAnswerSection;
