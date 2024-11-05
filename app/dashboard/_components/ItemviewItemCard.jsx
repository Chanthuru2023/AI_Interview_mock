"use client"; // Ensure this component is client-side

import React from 'react';

function InterviewItemCard({ interview }) {
    const onStart = () => {
        // Use window.location.href to navigate to the interview page
        window.location.href = `/dashboard/interview/${interview?.mockId}`;
    };

    const onSeeFeedback = () => {
        // Corrected URL construction for the feedback page
        window.location.href = `/dashboard/interview/${interview?.mockId}/feedback`;
    };

    return (
        <div className='border shadow-sm rounded-lg p-3'>
            <h2 className='font-bold text-primary'>{interview?.jobPosition}</h2>
            <p className='text-gray-600'>Years of Experience: {interview?.jobExperience}</p>
            <p className='text-gray-600'>Created Date: {new Date(interview?.createdAt).toLocaleDateString()}</p>
            <div className='mt-4'>
                <button className='bg-blue-500 text-white py-2 px-4 rounded-md' onClick={onStart}>
                    Start Interview Again
                </button>
                
                <button className='bg-green-500 text-white py-2 px-4 rounded-md ml-2' onClick={onSeeFeedback}>
                    See Feedback
                </button>
            </div>
        </div>
    );
}

export default InterviewItemCard;