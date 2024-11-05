"use client"; // Ensure this is a Client Component

import { useState, useEffect } from "react";
import { db } from "@/utils/db"; // Ensure this path is correct
import { MockInterview } from "@/utils/schema";
import { eq } from "drizzle-orm";
import QuestionSection from "./_components/QuestionSection";
import RecordAnswerSection from "./_components/RecordAnswerSection";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function StartInterview({ params }) {
  const { interviewId } = params; // Destructure the interviewId from URL params
  const [interviewData, setInterviewData] = useState(null); // State to hold interview data
  const [mockInterviewQuestions, setMockInterviewQuestions] = useState([]); // State for mock interview questions
  const [error, setError] = useState(null); // State for error handling
  const [loading, setLoading] = useState(true); // State for loading status
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  useEffect(() => {
    GetInterviewDetails();
  }, []); // Fetch interview details on component mount

  const GetInterviewDetails = async () => {
    try {
      const result = await db
        .select()
        .from(MockInterview)
        .where(eq(MockInterview.mockId, interviewId)); // Fetch interview details by mockId

      console.log("Interview Details:", result);

      if (result.length > 0) {
        const interview = result[0];

        // Parse jsonMockResp field into JSON
        if (interview.jsonMockResp) {
          const jsonMockResp = JSON.parse(interview.jsonMockResp); // Parse questions JSON
          setMockInterviewQuestions(jsonMockResp); // Update state with parsed questions
        } else {
          console.warn("No questions found in jsonMockResp.");
          setMockInterviewQuestions([]); // Set empty array if no questions found
        }

        setInterviewData(interview); // Set other interview details
      } else {
        setError("No interview found with the provided ID.");
      }
    } catch (error) {
      console.error("Error fetching interview details:", error);
      setError("An error occurred while fetching the interview details.");
    } finally {
      setLoading(false); // Set loading to false once fetching is done
    }
  };

  // Display loading message while fetching data
  if (loading) {
    return <div>Loading interview data...</div>;
  }

  // Display error message if there's an error
  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
        {/* Question Section */}
        <QuestionSection
          mockInterviewQuestions={mockInterviewQuestions}
          activeQuestionIndex={activeQuestionIndex}
        />

        {/* Webcam Section */}
        <RecordAnswerSection 
          mockInterviewQuestions={mockInterviewQuestions}
          activeQuestionIndex={activeQuestionIndex}
          interviewData={interviewData}
        />
      </div>
      <div className="flex justify-end gap-5">
    {activeQuestionIndex>0&& <Button onClick={()=>setActiveQuestionIndex(activeQuestionIndex-1)}>Previous Question</Button>}
    {activeQuestionIndex!=mockInterviewQuestions?.length-1&&<Button onClick={()=>setActiveQuestionIndex(activeQuestionIndex+1)}>Next Question</Button>}
    {activeQuestionIndex==mockInterviewQuestions?.length-1&& <Link href={'/dashboard/interview/'+interviewData?.mockId+"/feedback"}><Button>End Interview</Button></Link>}
  </div>
    </div>
    
  );
  
}

export default StartInterview;
