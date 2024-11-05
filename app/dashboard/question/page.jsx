"use client";
import React from 'react';

function Question() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-10">
      {/* Title Section */}
      <h1 className="text-3xl font-bold mb-6 text-indigo-600">Frequently Asked Questions</h1>

      {/* Question List Section */}
      <div className="w-full max-w-4xl space-y-4">
        {/* Example Question */}
        <div className="p-5 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold text-gray-800">What is an AI Mock Interview?</h2>
          <p className="text-gray-600 mt-2">
            An AI Mock Interview is a simulated interview session powered by artificial intelligence. It provides real-time feedback and suggestions to help you improve your interview skills.
          </p>
        </div>

        {/* Another Example Question */}
        <div className="p-5 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold text-gray-800">How do I start an AI Mock Interview?</h2>
          <p className="text-gray-600 mt-2">
            You can start an AI Mock Interview by navigating to the "Dashboard" and clicking on the "Start Interview" button. Make sure your webcam and microphone are enabled.
          </p>
        </div>

        {/* Add more questions as needed */}
      </div>
    </div>
  );
}

export default Question;
