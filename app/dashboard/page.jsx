import React from 'react';
import { ClerkProvider, UserButton } from "@clerk/nextjs";
import AddNewInterview from './_components/AddNewInterview';
import InterviewList from './_components/InterviewList';

function Dashboard() {
  return (
    <div className='p-10 bg-white min-h-screen'>
      {/* Header Section */}
      <h2 className='font-bold bg-purple-600 text-white text-3xl p-4 rounded-lg shadow-md'>
        Dashboard
      </h2>

      {/* Subtitle Section with Left Alignment */}
      <div className='bg-purple-500 text-white p-4 mt-4 rounded-lg shadow-sm'>
        <h2 className='font-medium text-xl text-left'>
          Create and Start your AI Mock Interview
        </h2>
      </div>

      {/* Add New Interview Section */}
      <div className='grid grid-cols-1 md:grid-cols-3 my-8'>
        <div className="bg-purple-500 text-purple-500 py-4 px-6 rounded-lg shadow-lg hover:bg-purple-600 transition-all duration-300 cursor-pointer text-center">
          <AddNewInterview />
        </div>
      </div>

      {/* Interview List Section */}
      <div className='bg-white p-6 rounded-lg shadow-md'>
        <InterviewList />
      </div>
    </div>
  );
}

export default Dashboard;
