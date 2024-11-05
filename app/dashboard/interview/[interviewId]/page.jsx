"use client";
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation'; // Correct import from next/navigation
import { MockInterview } from '@/utils/schema';
import { db } from '@/utils/db'; // Ensure this is correctly imported from your utils
import { eq } from 'drizzle-orm'; // Or wherever you're getting the 'eq' from
import Webcam from 'react-webcam';
import { WebcamIcon, LightbulbIcon } from 'lucide-react'; // Add LightbulbIcon
import { Button } from '@/components/ui/button';
import Link from 'next/link'; // Correct Link import

function InterviewPage() {
  const { interviewId } = useParams(); // Get dynamic interviewId from the URL
  const [interviewDetails, setInterviewDetails] = useState(null); // Store the interview details
  const [webCamEnabled, setWebCamEnabled] = useState(false); // Webcam state
  const [cameraWarning, setCameraWarning] = useState(false); // Warning state

  // Function to fetch interview details
  const GetInterviewDetails = async () => {
    try {
      const result = await db
        .select()
        .from(MockInterview)
        .where(eq(MockInterview.mockId, interviewId)); // Use the interviewId from URL

      console.log("Interview Details:", result);
      setInterviewDetails(result[0]); // Update the state with the first result (assuming there's only one match)
    } catch (error) {
      console.error("Error fetching interview details:", error);
    }
  };

  // Fetch interview details when the component mounts
  useEffect(() => {
    if (interviewId) {
      GetInterviewDetails();
    }
  }, [interviewId]); // Run effect when interviewId changes

  // Function to toggle the webcam state
  const handleWebcamToggle = () => {
    setWebCamEnabled(!webCamEnabled);
    setCameraWarning(false); // Clear the warning if they enable the camera
  };

  // Function to handle the Start Interview button click
  const handleStartInterview = () => {
    if (!webCamEnabled) {
      setCameraWarning(true); // Show a warning if the camera is not enabled
    }
  };

  return (
    <div className='my-10 flex justify-center items-start space-x-10'>
      {/* Left Section: Job Details */}
      <div className='w-1/2 flex flex-col p-5 border border-gray-300 rounded-lg shadow-md bg-white'>
        <h2 className='text-xl font-semibold mb-6 text-gray-800'>Job Information</h2>
        
        {interviewDetails && (
          <div className='flex flex-col'>
            <h2 className='text-lg font-semibold mb-3 text-gray-800'>
              <strong>Job Position: </strong>{interviewDetails.jobPosition || 'N/A'}
            </h2>
            <h2 className='text-lg font-semibold mb-3 text-gray-700'>
              <strong>Job Description: </strong>{interviewDetails.jobDesc || 'N/A'}
            </h2>
            <h2 className='text-lg font-semibold mb-3 text-gray-700'>
              <strong>Years of Experience: </strong>{interviewDetails.jobExperience || 'N/A'}
            </h2>

            {/* Message with Lightbulb Icon */}
            <div className='mt-4 flex items-start p-4 bg-yellow-100 border border-yellow-300 rounded-md'>
              <LightbulbIcon className='w-10 h-10 text-yellow-600 mr-3' />
              <p className='text-gray-800'>
                <strong>To begin the AI-powered mock interview, please enable both your webcam and microphone.</strong> 
                You will be asked five questions, and a comprehensive report will be provided upon completion.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Right Section: Webcam and Controls */}
      <div className='w-1/2 flex flex-col items-center'>
        {webCamEnabled ? (
          <Webcam
            audio
            onUserMedia={() => console.log("Webcam enabled")} // Log when webcam is enabled
            onUserMediaError={() => {
              console.error("Error enabling webcam/mic");
              setWebCamEnabled(false);
            }}
            mirrored={true}
            style={{
              height: 250,
              width: 350,
              borderRadius: '10px',
              border: '2px solid #ccc'
            }}
          />
        ) : (
          <>
            <WebcamIcon className='h-72 w-full p-20 bg-secondary rounded-lg border' />
            <p className='text-center text-gray-600 mt-4'>
              Webcam is disabled. Enable to start your interview.
            </p>
          </>
        )}

        {/* Warning Message for Camera Not Enabled */}
        {cameraWarning && (
          <p className="text-red-500 mt-2">Please enable your webcam to start the interview.</p>
        )}

        <Button onClick={handleWebcamToggle} className="mt-6">
          {webCamEnabled ? "Disable Webcam and Mic" : "Enable Webcam and Mic"}
        </Button>

        <Button
          onClick={handleStartInterview}
          className="mt-6"
          disabled={!webCamEnabled} // Disable the button if the webcam is not enabled
        >
          <Link href={webCamEnabled ? `/dashboard/interview/${interviewId}/start` : "#"}>
            Start Interview
          </Link>
        </Button>
      </div>
    </div>
  );
}

export default InterviewPage;
