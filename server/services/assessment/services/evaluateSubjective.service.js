import Groq from "groq-sdk";

export const evaluateSubjective = async (questions, answers) => {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const questionsPayload = questions.map((q, i) => ({
        question: q.question,
        expected_answer: q.expectedAnswer,
        key_points: q.keyPoints,
        student_answer: answers[i]?.answer || "",
        marks: q.marks
    }));

    const completion = await groq.chat.completions.create({
        model: "openai/gpt-oss-120b",
        temperature: 0.2,
        messages: [
            {
                role: "system",
                content: "You are a strict evaluator. Grade answers based only on expected answer and key points. Be consistent. Return JSON only."
            },
            {
                role: "user",
                content: `
Evaluate the following answers.

Rules:
- Assign marks out of given marks
- Give partial marks if partially correct
- Deduct for missing key points
- Do not exceed max marks
- Return ONLY JSON

Format:
[
{
marksAwarded: number,
feedback: string
}
]

Data:
${JSON.stringify(questionsPayload)}
`
            }
        ]
    });

    const aiText = completion.choices[0].message.content;
    return JSON.parse(aiText);
};