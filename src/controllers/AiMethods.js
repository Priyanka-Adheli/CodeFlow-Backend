const { GoogleGenAI } = require("@google/genai");
const ChatData = require('../models/ChatModel');
require('dotenv').config();

const ProblemRelatedAi = async(req , res)=>{
    try{

        const {messages,title,description,testCases,startCode,constraints} = req.body;
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_KEY });
       
        async function main() {
        const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: messages,
        config: {
        systemInstruction: `
You are an expert Data Structures and Algorithms (DSA) tutor specializing in helping users solve coding problems. Your role is strictly limited to DSA-related assistance only.

## CURRENT PROBLEM CONTEXT:
[PROBLEM_TITLE]: ${title}
[PROBLEM_DESCRIPTION]: ${description}
[EXAMPLES]: ${testCases}
[startCode]: ${startCode}
[Constraints]: ${constraints}

## YOUR CAPABILITIES:
1. **Hint Provider**: Give step-by-step hints without revealing the complete solution
2. **Code Reviewer**: Debug and fix code submissions with explanations
3. **Solution Guide**: Provide optimal solutions with detailed explanations
4. **Complexity Analyzer**: Explain time and space complexity trade-offs
5. **Approach Suggester**: Recommend different algorithmic approaches (brute force, optimized, etc.)
6. **Test Case Helper**: Help create additional test cases for edge case validation

## INTERACTION GUIDELINES:

### When user asks for HINTS:
- Break down the problem into smaller sub-problems
- Ask guiding questions to help them think through the solution
- Provide algorithmic intuition without giving away the complete approach
- Suggest relevant data structures or techniques to consider

### When user submits CODE for review:
- Identify bugs and logic errors with clear explanations
- Suggest improvements for readability and efficiency
- Explain why certain approaches work or don't work
- Provide corrected code with line-by-line explanations when needed

### When user asks for OPTIMAL SOLUTION:
- Start with a brief approach explanation
- Provide clean, well-commented code
- Explain the algorithm step-by-step
- Include time and space complexity analysis
- Mention alternative approaches if applicable

### When user asks for DIFFERENT APPROACHES:
- List multiple solution strategies (if applicable)
- Compare trade-offs between approaches
- Explain when to use each approach
- Provide complexity analysis for each

## RESPONSE FORMAT:
- Use clear, concise explanations
- Format code with proper syntax highlighting
- Use examples to illustrate concepts
- Break complex explanations into digestible parts
- Always relate back to the current problem context
- Always response in the Language in which user is comfortable or given the context

## STRICT LIMITATIONS:
- ONLY discuss topics related to the current DSA problem
- DO NOT help with non-DSA topics (web development, databases, etc.)
- DO NOT provide solutions to different problems
- If asked about unrelated topics, politely redirect: "I can only help with the current DSA problem. What specific aspect of this problem would you like assistance with?"

## TEACHING PHILOSOPHY:
- Encourage understanding over memorization
- Guide users to discover solutions rather than just providing answers
- Explain the "why" behind algorithmic choices
- Help build problem-solving intuition
- Promote best coding practices

Remember: Your goal is to help users learn and understand DSA concepts through the lens of the current problem, not just to provide quick answers.
`},
maxOutputTokens:500
    });
     
    res.status(201).json({
        message:response.text
    });
    console.log(response.text);
    }

    main();
      
    }
    catch(err){
        res.status(500).json({
            message: "Internal server error"
        });
    }
}


const timeSpaceComplexityAi = async(req,res) =>{
  try{

        const {messages} = req.body;
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_KEY });
       
        async function main() {
        const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: messages,
        config: {
       systemInstruction: `
        Gemini AI System Instructions: Time & Space Complexity Tutor
🎯 Purpose
Gemini AI is designed to help users understand the time and space complexity of code in simple, beginner-friendly language. It provides clear explanations using analogies, examples, and plain terms.
How Gemini Should Respond
When Explaining Complexity:
- Use relatable analogies (e.g. shopping lines, filing cabinets).
- Break down Big-O notation with examples.
- Highlight practical implications of complexity (e.g. performance, scalability).
- Emphasize common patterns like linear, quadratic, logarithmic time, etc.
- Include code snippets and walkthroughs when helpful.
- Explain differences in best-case, worst-case, and average-case time complexities.
Beginner-Friendly Style:
- No jargon unless defined simply.
- Use short sentences and visual formatting (bullet points, headings).
- Avoid overwhelming users with multiple concepts at once.
- Offer encouragement and invite questions related to time or space efficiency.

❌ Out-of-Scope Redirection (Polite Responses)
If a user asks a question outside of time and space complexity, Gemini should respond:
“That’s a great question! My role is focused on helping you understand time and space complexity of code. If you’d like help with that, I’d be happy to dive in!”

Or:
“I’m here to help explain how efficiently code runs in terms of time and memory. For other topics, you might want to check with a broader assistant.”


💡 Example Use Case
User: “What is the time and space complexity of this for loop?” Gemini AI:
“That’s a single for loop running from 0 to n, so the time complexity is O(n), meaning it grows linearly with the input size. Space complexity is O(1) because it doesn’t use extra memory proportional to input.”

User: “Can you tell me about machine learning models?” Gemini AI:
“Interesting topic! I’m set up specifically to talk about code performance—how long it takes and how much memory it uses. Let me know if you have any questions on that!”`
      },
      maxOutputTokens:500
    });
     
    res.status(201).json({
        message:response.text
    });
    console.log(response.text);
    }

    main();
      
    }
    catch(err){
        res.status(500).json({
            message: "Internal server error"
        });
    }  
}
const topics =[
        "Array",
        "Linked Lists",
        "Stacks",
        "Queues",
        "Hash Maps",
        "Hash Sets",
        "Trees",
        "Binary Search Trees",
        "Heaps",
        "Graphs",
        "Recursion",
        "Dynamic Programming",
        "Greedy Algorithms",
        "Divide and Conquer",
        "Sorting",
        "Searching",
        "Bit Manipulation",
        "Two Pointers",
        "Sliding Window",
        "Backtracking",
        "Trie",
        "Graph Traversal (DFS/BFS)",
        "Union-Find",
        "Segment Tree",
        "Fenwick Tree",
        "Topological Sorting",
        "Kadane’s Algorithm",
        "Kruskal’s Algorithm",
        "Dijkstra’s Algorithm",
        "Floyd-Warshall Algorithm",
        "Bellman-Ford Algorithm",
        "Algorithms",
        "KMP Algorithm",
        "Rabin-Karp Algorithm",
        "Boyer-Moore Algorithm",
        "Mathematics", "Basic Operations","BFS","DFS","Data Structures","Strings","Recursion","Binary Search"];

const sendMessageToAi = async(req,res) =>{
    const userId = req.result._id;
    const {text} = req.body;

    if(!text) return res.status(400).json({error:"Please send response"});

    try{

        // get the user doc
        let userDoc = await ChatData.findOne({userId});

        if(!userDoc)
        {
            userDoc = new ChatData({userId,chatMessages:[]});
        }

        let lastChat = userDoc.chatMessages[userDoc.chatMessages.length-1];


        // if lastChat exists the continue the interview else its an new interview
        let startNewChat = false;

        if(!lastChat)
        {
            startNewChat = true;
        }
        else
        {
            const questionCount = lastChat.messages.filter((m)=> m.role === "model").length;

            if(questionCount>=3)
            {
                startNewChat  = true;
            }
        }


        // check if new Interview case then randomly select topic and start the interview
        if(startNewChat)
        {
            const randomTopic = topics[Math.floor(Math.random() * topics.length)];
            
            const newChat = {
                title: `Interview on ${randomTopic}`,
                topic:randomTopic,
                createdAt: new Date(),
                messages:[{role:"user",text}],
            };


            userDoc.chatMessages.push(newChat);

            lastChat = userDoc.chatMessages[userDoc.chatMessages.length-1];
        }
        else{
            lastChat.messages.push({role:"user",text});
        }


        // Ai chat session to send random topic and maintain context to gemini ai
        const ai = new GoogleGenAI({apiKey:process.env.GEMINI_KEY});

        const chatSession = ai.chats.create({
             model: "gemini-2.0-flash",
            config: {
                // systemInstruction: `You are an AI technical interviewer. Ask one question at a time (complusory 2 questions total apart from greeting any intro and all) on the topic: ${lastChat.topic}. Make sure each question is unique and relevant.After 2 questions 3rd response will be return in json format data as Interview ended score (an number out of scale 10 as per user response) per you think AreaOfImprovements (array) indicating Area of Improvements. Also note if user ask any irrelavent out of scope or uses offensive words return the same json format response`,
                systemInstruction:`You are an SDE technical interviewer taking interview for SDE Role. Begin with a brief greeting or introductory message. Then ask one unique and relevant technical question at a time on the specified topic: ${lastChat.topic}. You must ask a total of 2 such questions, one per turn, after the initial greeting. After the second question has been answered, your third response must return a JSON object containing:
- "InterviewEnded" : true               
- "score": A number out of 10 reflecting the user's performance based on their responses.
- "AreaOfImprovements": An array of strings highlighting key topics or skills the user could improve upon.

Important rules:
- Each question must be clearly related to the specified topic and should not be repeated.
- If the user asks anything irrelevant, out of scope, or uses offensive language, reply him politely to continue the interview`,
                maxOutputTokens: 500,
                temperature: 0.1,
            },
            history: lastChat.messages.map((m) => ({
                role: m.role,
                parts: [{ text: m.text }],
            })),
        });


        // Send messsage to ai 
        const response = await chatSession.sendMessage({message:text});
        console.log(response);
        const aiText = response.candidates[0].content.parts[0].text;
        console.log(aiText);


        lastChat.messages.push({role:"model",text:aiText});

        await userDoc.save();

        res.status(201).json({reply:aiText});
    }
    catch(err)
    {
     console.log("Interview Error:", err);
    res.status(500).json({ reply: "Interview failed. Please try again later." });
  }
}

const allInterviewChats = async(req,res) =>{
    try{

        const InterviewChats = await ChatData.findOne({userId:req.result._id});

        if(!InterviewChats)
            return res.status(200).json(InterviewChats);

        console.log(InterviewChats);
        res.status(200).send(InterviewChats.chatMessages);
    }
    catch(err)
    {
        console.log(err);
        res.status(500).json({error:err.message});
    }
}

const getChatInterviewByIndex = async(req,res) =>{
    try{
        const index = Number(req.body.index);
        console.log(index);
        const InterviewChats = await ChatData.findOne({userId:req.result._id});

        if(!InterviewChats)
            return res.status(400).json({error:"You don't have interview yet"});

        let InterviewChat = InterviewChats.chatMessages[index];

        if(!InterviewChat)
        res.status(200).json({error:"No chat found"});

        res.status(201).json({InterviewChat});
    }
    catch(err)
    {
        console.log(err);
        res.status(500).json({error:err.message});
    }
}

// GET /api/chat/history
const getChatHistory = async (req, res) => {
  const userId = req.result._id;

  try {
    const chatData = await ChatData.findOne({ userId });

    if (!chatData || chatData.chatMessages.length === 0) {
      return res.json({ messages: [] });
    }

    const lastChat = chatData.chatMessages[chatData.chatMessages.length - 1];
    const lastMessage = lastChat.messages[lastChat.messages.length - 1];

    let isInterviewEnded = false;

    if (lastMessage.role === 'model') {
      try {
        const text = lastMessage.text.trim();
        // Extract JSON from ```json block if present
        const cleaned = text.startsWith('```json') ? text.replace(/```json|```/g, '').trim() : text;
        const parsed = JSON.parse(cleaned);

        if (parsed?.InterviewEnded === true) {
          isInterviewEnded = true;
        }
      } catch (err) {
        // Not JSON, continue
      }
    }

    if (isInterviewEnded) {
      return res.json({ messages: [] });
    }

    return res.json({ messages: lastChat.messages, topic:lastChat.topic });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};


module.exports = {ProblemRelatedAi,allInterviewChats,sendMessageToAi,timeSpaceComplexityAi,getChatInterviewByIndex,getChatHistory};
