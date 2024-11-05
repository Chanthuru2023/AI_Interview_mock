"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { chatSession } from "@/utils/GeminiAIModal";
import { LoaderCircle } from "lucide-react";
import { db } from "@/utils/db";
import { MockInterview } from "@/utils/schema";
import { v4 as uuidv4 } from "uuid";
import { useUser } from "@clerk/nextjs";
import moment from "moment/moment";
import { useRouter } from "next/navigation";

export default function AddNewInterview() {
  const [openDialog, setOpenDialog] = useState(false);
  const [jobPosition, setJobPosition] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [jobExperience, setJobExperience] = useState("");
  const [loading, setLoading] = useState(false);
  const [jsonResponse, setJsonResponse] = useState(null); // Ensure it's initialized to null
  const { user } = useUser();
  const router = useRouter();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const InputPrompt = `Job position: ${jobPosition} Job Description: ${jobDesc} Job Experience: ${jobExperience}. Based on the job position, job description, and job experience, generate ${process.env.NEXT_PUBLIC_INTERVIEW_QUESTION_COUNT} interview questions with answers in JSON format.`;

    try {
      // Send the prompt to the AI
      const result = await chatSession.sendMessage(InputPrompt);
      const rawResponse = await result.response.text();
      const MockJsonResp = (result.response.text()).replace("```json", "").replace("```", "");

      /*console.log("AI Input Prompt:", InputPrompt);
      console.log("AI Raw Response:", rawResponse);*/
      console.log(JSON.parse(MockJsonResp));

      // Try to parse the AI response as JSON
      try {
        const parsedResponse = JSON.parse(MockJsonResp);
        setJsonResponse(parsedResponse);
      } catch (error) {
        console.error("Error parsing JSON:", error);
        setJsonResponse(null);
      }
    } catch (error) {
      console.error("Error generating questions:", error);
    } finally {
      // Ensure that jsonResponse is valid and not empty
      if (jsonResponse && Array.isArray(jsonResponse) && jsonResponse.length > 0) {
        // Insert into the DB if the response is valid
        try {
          const resp = await db
            .insert(MockInterview)
            .values({
              mockId: uuidv4(),
              jsonMockResp: JSON.stringify(jsonResponse), // Save JSON as a string
              jobPosition: jobPosition,
              jobDesc: jobDesc,
              jobExperience: jobExperience,
              createdBy: user?.primaryEmailAddress?.emailAddress || "unknown",
              createdAt: moment().format("DD-MM-YYYY"),
            })
            .returning({ mockId: MockInterview.mockId });

          console.log("Inserted ID:", resp);
          if(resp)
        {
            setOpenDialog(false);
            router.push('/dashboard/interview/'+resp[0]?.mockId)
        }
        } catch (dbError) {
          console.error("Error inserting into DB:", dbError);
        }
      } else {
        console.log("No valid response to insert into DB.");
      }
      setLoading(false);
    }
  };

  return (
    <div>
      <div
        className="p-10 border rounded-lg bg-secondary hover:scale-105 hover:shadow-md cursor-pointer transition-all"
        onClick={() => setOpenDialog(true)}
      >
        <h2 className="font text-lg text-center">+ Add New Interview</h2>
      </div>
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">New Interview Preparation</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            <form onSubmit={onSubmit}>
              <div>
                <h2 className="text-lg font-medium mb-4">
                  Please provide the following details to help us tailor your mock interview experience.
                </h2>
                <div className="mt-7 my-3">
                  <label className="block font-medium mb-2">Job Title</label>
                  <Input
                    placeholder="e.g., Data Engineer, Software Developer"
                    required
                    onChange={(event) => setJobPosition(event.target.value)}
                  />
                </div>
                <div className="my-3">
                  <label className="block font-medium mb-2">Job Description / Responsibilities</label>
                  <Textarea
                    placeholder="Outline key responsibilities and technologies used"
                    required
                    onChange={(event) => setJobDesc(event.target.value)}
                  />
                </div>
                <div className="my-3">
                  <label className="block font-medium mb-2">Years of Experience in Related Fields</label>
                  <Input
                    placeholder="e.g., 5"
                    type="number"
                    max="30"
                    onChange={(event) => setJobExperience(event.target.value)}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <Button type="button" variant="ghost" onClick={() => setOpenDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <LoaderCircle className="animate-spin" /> Generating from AI...
                    </>
                  ) : (
                    "Start Interview"
                  )}
                </Button>
              </div>
            </form>
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </div>
  );
}
