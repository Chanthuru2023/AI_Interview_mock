import { serial, text, varchar,jsonb } from "drizzle-orm/pg-core"; // Import from pg-core for PostgreSQL
import { pgTable } from "drizzle-orm/pg-core"; // Use pgTable for PostgreSQL

export const MockInterview = pgTable('mockInterview', {
    id: serial('id').primaryKey(),
    jsonMockResp: text('jsonMockResp').notNull(),
    jobPosition: varchar('jobPosition', { length: 255 }).notNull(),  
    jobDesc: varchar('jobDesc', { length: 255 }).notNull(),          
    jobExperience: varchar('jobExperience', { length: 100 }).notNull(),
    createdBy: varchar('createdBy', { length: 100 }).notNull(),      
    createdAt: varchar('createdAt', { length: 100 }),                
    mockId: varchar('mockId', { length: 100 }).notNull()             
});


export const UserAnswer = pgTable('userAnswer', {
    id: serial('id').primaryKey(),
    mockIdRef: varchar('mockId', { length: 255 }).notNull(),   // Increase length or change to text
    question: text('question').notNull(),  // Changed to text since questions can be long
    correctAnswer: text('correctAnswer').notNull(), // Changed to text
    userAnswer: text('userAns'),
    feedback: text('feedback'),
    grammarCorrections: text('grammarCorrections'),  // Added for grammar corrections
    rating: varchar('rating'),
    emotions: jsonb('emotions'),
    userEmail: varchar('userEmail', { length: 255 }),  // Increase length or change to text
    createdAt: varchar('createdAt', { length: 100 }),  // Updated length for createdAt
    confidencePercentage: varchar('confidencePercentage')
});


