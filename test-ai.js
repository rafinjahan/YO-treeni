import { generateFeedback } from './lib/ai.js';

async function test() {
  console.log("Testing generic OpenAI API Configuration...");
  const res = await generateFeedback({
    question: "Test Kysymys",
    studentAnswer: "x = 42",
    modelAnswer: "x = 42",
    maxPoints: 6,
    subject: "math"
  });
  console.log("Result:", res);
}

test();
