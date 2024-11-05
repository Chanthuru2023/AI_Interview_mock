import { Volume2 } from 'lucide-react';
import React, { useEffect } from 'react';

function QuestionSection({ mockInterviewQuestions, activeQuestionIndex }) {
  useEffect(() => {
    console.log(mockInterviewQuestions); // Check if the array is received and correctly formatted
  }, [mockInterviewQuestions]);
      const textToSpeech=(text)=>{
        if('speechSynthesis'in window){
          const speech=new SpeechSynthesisUtterance(text);
          window.speechSynthesis.speak(speech)
        }
        else{
          alert('Sorry your browser does not support text to speech')
        }

      }
  return (
    mockInterviewQuestions && (
      <div className='p-5 border rounded-lg my-10'>
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5'>
          {mockInterviewQuestions.length > 0 ? (
            mockInterviewQuestions.map((questionObj, index) => (
              <div key={index} className="mb-4">
                {/* Highlight active question */}
                <h2 
                  className={`p-2 rounded-full font-bold text-center cursor-pointer ${activeQuestionIndex === index ? 'bg-blue-500 text-black' : 'bg-secondary'}`}
                >
                  Question #{index + 1}
                </h2>
              </div>
            ))
          ) : (
            <p>No questions available.</p>
          )}
        </div>

        {/* Display the current active question */}
        {mockInterviewQuestions[activeQuestionIndex] && (
          <h2 className="my-5 text-sm md:text-lg mt-4 font-semibold">
            {mockInterviewQuestions[activeQuestionIndex]?.question}
          <Volume2 className='cursor-pointer' onClick={()=>textToSpeech(mockInterviewQuestions[activeQuestionIndex]?.question)}/>
          </h2>
        )}
      </div>
    )
  );
}

export default QuestionSection;
