"use client";
import React from 'react';
import { LightBulbIcon, StarIcon } from '@heroicons/react/24/solid'; // Correct import for Heroicons
import { ClipboardCheck, TrendingUp } from 'lucide-react'; // Correct import for Lucide icons

function How() {
  return (
    <div className="p-10 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold mb-6 text-indigo-600">How it Works</h1>
      <p className="text-lg text-gray-700">
        Our AI Mock Interview platform helps you practice for your upcoming job interviews by simulating real interview scenarios.
      </p>
      <ul className="list-disc ml-5 mt-4 text-gray-700">
        <li>Start by creating a new mock interview with relevant job information.</li>
        <li>Answer interview questions based on the selected job profile.</li>
        <li>Receive feedback on your performance, including ratings and suggestions.</li>
        <li>Track your progress over multiple interview attempts.</li>
      </ul>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="flex flex-col items-center">
          <LightBulbIcon className="w-12 h-12 text-yellow-500 mb-2" />
          <p className="font-semibold">Practical Scenarios</p>
        </div>
        <div className="flex flex-col items-center">
          <ClipboardCheck className="w-12 h-12 text-green-500 mb-2" />
          <p className="font-semibold">Detailed Feedback</p>
        </div>
        <div className="flex flex-col items-center">
          <StarIcon className="w-12 h-12 text-blue-500 mb-2" />
          <p className="font-semibold">Personalized Ratings</p>
        </div>
        <div className="flex flex-col items-center">
          <TrendingUp className="w-12 h-12 text-purple-500 mb-2" />
          <p className="font-semibold">Track Progress</p>
        </div>
      </div>
    </div>
  );
}

export default How;
