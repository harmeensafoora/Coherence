
import { GoogleGenAI, Type } from "@google/genai";
import { ReasoningState } from "../types";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || '' });

const reasoningSchema = {
  type: Type.OBJECT,
  properties: {
    intent: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Current high-level purpose or direction explicitly stated or clearly implied."
    },
    constraints: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Limitations or boundaries mentioned by the user. Treat dates/deadlines as constraints."
    },
    anchors: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "User-declared invariants that must not be violated."
    },
    driftDetected: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING, enum: ['contradiction', 'shift', 'divergence', 'forgotten_constraint', 'anchor_violation'] },
          message: { type: Type.STRING },
          context: { type: Type.STRING },
          violatedAnchor: { type: Type.STRING, description: "The exact string of the anchor from the PREVIOUS STATE that was violated." }
        },
        required: ['type', 'message', 'context']
      }
    },
    changeSummary: {
      type: Type.STRING,
      description: "A one-sentence summary of what meaningfully changed in the reasoning compared to the previous state."
    },
    filename: {
      type: Type.STRING,
      description: "A short, descriptive, lowercase filename for this update, e.g., 'onboarding-fix.txt'."
    }
  },
  required: ['intent', 'constraints', 'anchors', 'driftDetected', 'changeSummary', 'filename']
};

export const analyzeThinking = async (
  currentContent: string,
  previousState?: ReasoningState
): Promise<ReasoningState & { changeSummary: string; filename: string }> => {
  const model = 'gemini-2.0-flash-lite';

  const systemInstruction = `
    You are 'Coherence', a stateful reasoning layer.
    Your mission is to track how reasoning evolves across immutable file commits.

    STRICT CONSTRAINTS:
    1. DO NOT assume, hallucinate, or proactively suggest intents, assumptions, or constraints.
    2. ONLY extract state elements if the user explicitly mentions them or they are the direct, undeniable subject of the update.
    3. If the user text is vague, do not add new elements to the state.
    4. Focus on structural coherence and drift detection against the declared ANCHORS only — not against previous conclusions or specific details from prior commits.
    5. Drift ONLY occurs when the current text violates a declared Anchor. Do NOT flag drift for changing your mind about specific tactics, companies, or details — those are normal reasoning evolution, not drift.

    RESOLUTION RULE (critical):
    If the current text explicitly reaffirms anchors, reverses a previous drift, or states a return to the original intent — set driftDetected to an EMPTY ARRAY. A resolution commit must CLEAR drift, not create new drift. Words like "reaffirming", "scratch that", "going back to", "staying on the original path", "all anchors intact" are strong signals of resolution.

    If an Anchor is violated, you MUST set the 'violatedAnchor' field to the exact string of the anchor that was contradicted.
    The message for drift should clearly state: "Violates anchor: [Anchor text]".
  `;

  const prompt = `
    TEXT: "${currentContent}"
    ANCHORS TO PROTECT: ${previousState?.anchors?.length ? JSON.stringify(previousState.anchors) : "None declared yet"}
    Analyze the text and return the updated reasoning state based ONLY on the provided text.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: reasoningSchema,
      }
    });

    const text = response.text;
    if (!text) throw new Error("Null response");
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Coherence analysis failed:", error);
    throw error;
  }
};
