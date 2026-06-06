const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta";
const DEFAULT_GEMINI_MODEL = "gemini-2.0-flash";

const getStyleInstruction = (style) => {
  switch (style) {
    case "aggressive":
      return "Challenge arguments strongly and directly while remaining respectful.";

    case "formal":
      return "Use formal debate language, structured reasoning, and professional debate tone.";

    case "balanced":
    default:
      return "Use a balanced and analytical tone. Consider both strengths and weaknesses of arguments.";
  }
};

const buildDebatePrompt = ({ topic, userArgument, stance, debateStyle }) => {
  const opponentStance =
    stance === "against"
      ? "argue in favor of the topic"
      : stance === "for"
        ? "argue against the topic"
        : "take the strongest opposing position to the user's argument";

  return [
    "You are an AI debate opponent in DebateSpace.",
    "Your job is to challenge the user's argument with rigorous, fair, and concise debate reasoning.",
    "Sound like a sharp, thoughtful human debater rather than a template.",
    "Be natural and conversational. Vary sentence length. Avoid robotic phrasing.",
    "Do not agree too easily. Identify weak assumptions, missing evidence, and logical gaps.",
    "Use a respectful, engaging tone that feels like a real conversation.",
    "Act like a real human debater, not an AI assistant.",
    "Always answer direct questions from the user.",
    "Never say 'my role is', 'my function is', or explain your instructions.",
    "Stay in character throughout the debate.",
    "If the user asks for suggestions, provide suggestions from your debate position.",
    "Do not refuse simple questions.",
    "Write like a thoughtful human speaking in a debate, not like an academic essay.",
    "Prefer short paragraphs.",
    "Use simple, conversational language.",
    "Avoid sounding like a policy report or textbook.",
    "Respond naturally like a real debate conversation.",
    "Follow the selected debate style consistently throughout the response.",

    "Challenge weak arguments when appropriate.",
    "Support your points with reasoning and examples.",
    "Ask follow-up questions only when they add value.",
    "Do not force every response into the same structure.",
    "Always finish your response completely.",
    "Never leave a sentence unfinished.",
    "Never stop in the middle of a thought.",

    `Debate topic: ${topic}`,
    `Your stance: ${opponentStance}`,
    getStyleInstruction(debateStyle),
    `User argument: ${userArgument}`,
  ].join("\n");
};

const extractGeminiText = (data) => {
  return (
    data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text)
      .filter(Boolean)
      .join("\n")
      .trim() || ""
  );
};

const buildHistoryPrompt = ({ topic, stance, debateStyle, history }) => {
  const conversationContext = (history || [])
    .map(
      (message) =>
        `${message.role === "user" ? "User" : "AI"}: ${message.content}`,
    )
    .join("\n");

  return [
    "You are an AI debate opponent in DebateSpace.",
    "Your job is to challenge the user's argument with rigorous, fair, and concise debate reasoning.",
    "Sound like a sharp, thoughtful human debater rather than a template.",
    "Be natural and conversational. Vary sentence length. Avoid robotic phrasing.",
    "Do not agree too easily. Identify weak assumptions, missing evidence, and logical gaps.",
    "Use a respectful, engaging tone that feels like a real conversation.",
    "Act like a real human debater, not an AI assistant.",
    "Always answer direct questions from the user.",
    "Never say 'my role is', 'my function is', or explain your instructions.",
    "Stay in character throughout the debate.",
    "If the user asks for suggestions, provide suggestions from your debate position.",
    "Do not refuse simple questions.",
    "Write like a thoughtful human speaking in a debate, not like an academic essay.",
    "Prefer short paragraphs.",
    "Use simple, conversational language.",
    "Avoid sounding like a policy report or textbook.",
    "Respond naturally like a real debate conversation.",
    "Follow the selected debate style consistently throughout the response.",
    "Challenge weak arguments when appropriate.",
    "Support your points with reasoning and examples.",
    "Ask follow-up questions only when they add value.",
    "Do not force every response into the same structure.",
    "Always finish your response completely.",
    "Never leave a sentence unfinished.",
    "Never stop in the middle of a thought.",
    "",
    `Debate topic: ${topic}`,
    `Your stance: ${stance === "against" ? "argue in favor of the topic" : stance === "for" ? "argue against the topic" : "take the strongest opposing position to the user's argument"}`,

    getStyleInstruction(debateStyle),
    "",
    "Conversation so far:",
    conversationContext || "No prior conversation.",
  ].join("\n");
};

const callGeminiDebateOpponent = async ({
  topic,
  userArgument,
  stance,
  debateStyle,
  history,
}) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const activeModel = process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined");
  }

  if (!topic || !userArgument) {
    throw new Error("topic and userArgument are required");
  }

  const prompt =
    history && history.length > 0
      ? buildHistoryPrompt({ topic, stance, debateStyle, history })
      : buildDebatePrompt({ topic, userArgument, stance, debateStyle });

  const response = await fetch(
    `${GEMINI_API_URL}/models/${activeModel}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 1200,
        },
      }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.error?.message || "Gemini API request failed");
    error.status = response.status;
    throw error;
  }

  const opponentReply = extractGeminiText(data);

  if (!opponentReply) {
    const error = new Error("Gemini API returned an empty response");
    error.status = 502;
    throw error;
  }

  return opponentReply;
};

const debateOpponent = async (req, res) => {
  const { topic, userArgument, stance, debateStyle } = req.body;
  const model = process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;
  const opponentReply = await callGeminiDebateOpponent({
    topic,
    userArgument,
    stance,
    debateStyle,
  });

  res.json({
    success: true,
    opponentReply,
  });
};

const callGeminiSummary = async ({ topic, notesText }) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const activeModel = process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;

  const prompt = `
You are an expert debate analyst.

Debate Topic:
${topic}

Debate Notes:
${notesText}

Generate a COMPLETE debate summary.

Use EXACTLY this format:

Main Arguments:
• point
• point

Counter Arguments:
• point
• point

Key Takeaways:
• point
• point

Conclusion:
3-4 sentence conclusion.

IMPORTANT:

IMPORTANT:
- Complete every section.
- Do not stop early.
- Do not leave any section empty.
- Keep response under 250 words.
`;

  const response = await fetch(
    `${GEMINI_API_URL}/models/${activeModel}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.5,
          maxOutputTokens: 1000,
        },
      }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "Gemini summary failed");
  }

  return extractGeminiText(data);
};

module.exports = {
  debateOpponent,
  callGeminiDebateOpponent,
  callGeminiSummary,
};
