"use client";
import React from 'react';
import { useParams } from 'next/navigation';

function Interview() {
  const { interviewId } = useParams(); // Get dynamic interviewId from the URL

  return (
    <div>
      <h1>Interview {interviewId}</h1>
    </div>
  );
}

export default Interview;
