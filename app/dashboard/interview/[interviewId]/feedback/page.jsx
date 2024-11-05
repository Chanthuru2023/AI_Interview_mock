"use client";
import { db } from "@/utils/db";
import { UserAnswer } from "@/utils/schema";
import React, { useState, useEffect } from "react";
import { eq, desc } from "drizzle-orm";
import { useRouter } from "next/navigation";
import { Tooltip } from "@mui/material";
import { styled } from "@mui/system";

const CustomTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))({
  [`& .MuiTooltip-tooltip`]: {
    fontSize: "0.9rem",
    maxWidth: "250px",
    whiteSpace: "normal",
  },
});

function Feedback({ params }) {
  const [feedbackData, setFeedbackData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [overallRating, setOverallRating] = useState(0);
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const router = useRouter();

  useEffect(() => {
    GetFeedback();
  }, []);

  const GetFeedback = async () => {
    try {
      const result = await db
        .select()
        .from(UserAnswer)
        .where(eq(UserAnswer.mockIdRef, params.interviewId))
        .orderBy(desc(UserAnswer.createdAt));

      if (result.length === 0) {
        throw new Error("No feedback available for this interview.");
      }

      const latestFeedback = aggregateFeedback(result);
      setFeedbackData(latestFeedback);

      // Calculate overall rating based on latest feedback entries
      const totalRating = latestFeedback.reduce((acc, curr) => {
        const rating = curr.rating.split("/")[0];
        return acc + parseInt(rating);
      }, 0);
      const averageRating = totalRating / latestFeedback.length;
      setOverallRating(averageRating.toFixed(1));
    } catch (error) {
      console.error("Error fetching feedback:", error);
      setError("Failed to load feedback data.");
    } finally {
      setLoading(false);
    }
  };

  const aggregateFeedback = (feedback) => {
    const uniqueQuestions = {};

    feedback.forEach((item) => {
      const question = item.question;

      // Store only the latest entry for each question
      if (!uniqueQuestions[question]) {
        uniqueQuestions[question] = item;
      }
    });

    return Object.values(uniqueQuestions);
  };

  const toggleQuestion = (index) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const getRatingColor = (rating) => {
    const value = parseInt(rating.split("/")[0]);
    const maxRating = 5;
    const percentage = (value / maxRating) * 100;

    if (percentage <= 40) return "bg-red-200";
    if (percentage <= 80) return "bg-yellow-200";
    return "bg-green-200";
  };

  const getOverallRatingColor = (rating) => {
    const value = parseFloat(rating);
    const percentage = (value / 5) * 100;

    if (percentage <= 40) return "text-red-600";
    if (percentage <= 80) return "text-yellow-600";
    return "text-green-600";
  };

  if (loading) {
    return <div className="text-center text-lg font-semibold">Loading feedback...</div>;
  }

  if (error) {
    return <div className="text-center text-lg font-semibold text-red-600">{error}</div>;
  }

  return (
    <div className="max-w-full mx-auto p-5 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-green-600 text-center">Congratulations!</h2>
      <h2 className="font-bold text-2xl text-center mt-2">Here is your interview feedback</h2>
      <h2 className={`text-lg my-3 ${getOverallRatingColor(overallRating)} text-center`}>
        Your overall interview rating: <strong>{overallRating}/5</strong>
      </h2>
      <h2 className="text-sm text-gray-500 text-center mb-4">
        Below are the interview questions, your answers, and feedback for improvement.
      </h2>

      {feedbackData && feedbackData.length > 0 ? (
        <div>
          {feedbackData.map((answer, index) => (
            <div
              key={index}
              className="my-4 border border-gray-300 rounded-md shadow-md transition-all duration-300 hover:shadow-xl p-4"
            >
              <h3
                className="font-bold text-lg cursor-pointer hover:text-blue-600"
                onClick={() => toggleQuestion(index)}
              >
                Question {index + 1} {expandedQuestions[index] ? "▼" : "►"}
              </h3>
              <div className="border-b border-gray-200 mb-2 pb-2">
                <strong className="text-gray-800">Question:</strong> {answer.question}
              </div>
              {expandedQuestions[index] && (
                <div className="mt-2 space-y-2">
                  <CustomTooltip title="This is your answer to the question." arrow>
                    <div className="border rounded-md p-2 bg-blue-100">
                      <strong>Your Answer:</strong> {answer.userAnswer || "No answer provided"}
                    </div>
                  </CustomTooltip>
                  <CustomTooltip title="Feedback for improvement based on your answer." arrow>
                    <div className="border rounded-md p-2 bg-yellow-100">
                      <strong>Feedback:</strong> {answer.feedback}
                    </div>
                  </CustomTooltip>
                  <CustomTooltip title="Correct answer or model answer for reference." arrow>
                    <div className="border rounded-md p-2 bg-green-100">
                      <strong>Correct Answer:</strong> {answer.correctAnswer || "N/A"}
                    </div>
                  </CustomTooltip>
                  <CustomTooltip title="Suggestions for grammar improvements." arrow>
                    <div className="border rounded-md p-2 bg-gray-100">
                      <strong>Grammar Corrections:</strong> {answer.grammarCorrections || "No corrections provided"}
                    </div>
                  </CustomTooltip>
                  <CustomTooltip title="The score for this answer out of 5." arrow>
                    <div className={`border rounded-md p-2 ${getRatingColor(answer.rating)}`}>
                      <strong>Rating:</strong> {answer.rating || "N/A"}/5
                    </div>
                  </CustomTooltip>
                  <CustomTooltip title="Confidence level of the answer based on emotional analysis." arrow>
                    <div className="border rounded-md p-2 bg-purple-100">
                      <strong>Confidence Percentage:</strong> {answer.confidencePercentage || "N/A"}%
                    </div>
                  </CustomTooltip>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-lg font-semibold">No feedback available.</p>
      )}

      <button
        className="mt-4 bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition duration-300"
        onClick={() => router.replace("/dashboard")}
      >
        Go Home
      </button>
    </div>
  );
}

export default Feedback;
