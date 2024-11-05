"use client"; // Ensure this component is client-side

import { db } from '@/utils/db';
import { MockInterview } from '@/utils/schema';
import { useUser } from '@clerk/nextjs';
import { eq, desc } from 'drizzle-orm';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

function InterviewList() {
  const { user } = useUser();
  const [interviewList, setInterviewList] = useState([]);
  const [error, setError] = useState(null); // State for handling errors
  const [expandedJob, setExpandedJob] = useState(null); // State for expanded job position

  useEffect(() => {
    if (user) {
      GetInterviewList();
    }
  }, [user]);

  const GetInterviewList = async () => {
    try {
      const filteredResult = await db.select()
        .from(MockInterview)
        .where(eq(MockInterview.createdBy, user?.primaryEmailAddress?.emailAddress)) // Access email string
        .orderBy(desc(MockInterview.id));

      setInterviewList(filteredResult);
    } catch (error) {
      console.error('Error fetching interview list:', error);
      setError('Failed to fetch interview list.');
    }
  };

  // Normalize job position by converting it to lowercase
  const normalizePosition = (position) => {
    return position.toLowerCase();
  };

  // Group interviews by normalized job position
  const groupedInterviews = interviewList.reduce((acc, interview) => {
    const normalizedPosition = normalizePosition(interview.jobPosition);
    if (!acc[normalizedPosition]) {
      acc[normalizedPosition] = [];
    }
    acc[normalizedPosition].push(interview);
    return acc;
  }, {});

  // Toggle the expansion of a job position section
  const toggleJobPosition = (position) => {
    setExpandedJob(expandedJob === position ? null : position); // Expand or collapse the section
  };

  return (
    <div>
      <h2 className='font-bold bg-gradient-to-r from-gray-700 to-gray-900 text-white text-2xl p-4 rounded-lg shadow-md'>
        Previous Mock Interviews
      </h2>

      {error && <p className='text-red-500'>{error}</p>} {/* Show error message if there is one */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"> {/* Set up grid layout */}
        {Object.keys(groupedInterviews).map((position) => (
          <div key={position} className="p-4 border rounded-lg shadow-sm transition-all duration-300 hover:shadow-md bg-white">
            <div
              className="font-bold text-lg cursor-pointer bg-gradient-to-r from-blue-500 to-gray-500 hover:from-blue-700 hover:to-gray-700 text-white py-2 px-4 rounded-md shadow-md transition-all duration-300"
              onClick={() => toggleJobPosition(position)}
            >
              {position.charAt(0).toUpperCase() + position.slice(1)} ({groupedInterviews[position].length})
            </div>

            {/* Expanded section for job position */}
            {expandedJob === position && (
              <div className="mt-2 space-y-2">
                {groupedInterviews[position].map((interview) => (
                  <div key={interview.mockId} className="border-t pt-2">
                    <p><strong>Years of Experience:</strong> {interview.jobExperience}</p>
                    <p><strong>Created Date:</strong> {interview.createdAt}</p>
                    <div className="flex justify-between mt-2">
                      <Link href={`/dashboard/interview/${interview.mockId}/start`} className="bg-blue-700 text-white py-1 px-3 rounded hover:bg-blue-700 transition duration-300 text-sm">
                        Start Interview Again
                      </Link>
                      <Link href={`/dashboard/interview/${interview.mockId}/feedback`} className="bg-green-700 text-white py-1 px-3 rounded hover:bg-green-700 transition duration-300 text-sm">
                        See Feedback
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default InterviewList;
