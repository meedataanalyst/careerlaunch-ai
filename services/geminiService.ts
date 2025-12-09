import { GoogleGenAI, Type, Schema } from "@google/genai";
import { UserInput, OptimizationResult, JobSearchResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    revisedResume: {
      type: Type.STRING,
      description: "The full content of the revised resume in Markdown format. Follow the formatting instructions strictly.",
    },
    matchScore: {
      type: Type.INTEGER,
      description: "A deterministic score (0-100) calculated strictly based on the percentage of hard skills and experience requirements matched. Do not estimate randomly.",
    },
    keyImprovements: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A list of specific changes made to the resume to better align with the job.",
    },
    missingKeywords: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Keywords found in the job description that were missing or weak in the original resume.",
    },
    summary: {
      type: Type.STRING,
      description: "A brief executive summary of why these changes improve the candidate's chances.",
    },
  },
  required: ["revisedResume", "matchScore", "keyImprovements", "missingKeywords", "summary"],
};

// Helper to extract text from a URL using Google Search Grounding
async function extractTextFromUrl(url: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Navigate to this URL: ${url} and find the job posting. Provide a comprehensive summary of the Job Title, Company, Responsibilities, Requirements, and Qualifications listed on the page. If the page is not accessible, search for the job posting details based on the URL keywords.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });
    
    const text = response.text;
    if (!text || text.length < 50 || text.includes("Could not retrieve")) {
        // Return a flag or short text that indicates failure
        return "";
    }
    return text;
  } catch (e) {
    console.error("Failed to extract text from URL:", e);
    return "";
  }
}

export const optimizeResume = async (input: UserInput): Promise<OptimizationResult> => {
  try {
    // Step 0: Resolve Job Description (Text vs Link)
    let jobDescriptionText = input.jobDescription;
    
    if (input.jobDescriptionType === 'link' && input.jobDescriptionLink) {
        const extracted = await extractTextFromUrl(input.jobDescriptionLink);
        if (!extracted) {
             throw new Error("Unable to read the job description from the provided link. The link might be expired, private, or blocking access. Please copy and paste the job text manually.");
        }
        jobDescriptionText = extracted;
    }

    const parts: any[] = [];

    // Instruction Part
    parts.push({
      text: `
      You are an expert Career Coach and Resume Writer.
      
      **TASK:**
      Rewrite the candidate's resume to match the Target Job Description.
      
      **CRITICAL FORMATTING RULES (Markdown):**
      1.  **NAME**: Must be the Title (H1). It must be **BOLD** and **UPPERCASE**.
      2.  **SECTIONS**: Use the following headers (H2): **SUMMARY**, **SKILLS**, **EXPERIENCE**, **EDUCATION**. 
      3.  **HEADER STYLE**: All H2 headers must be **BOLD** and **UPPERCASE**.
      4.  **SPACING**: Add a blank line after every header and between every list item.
      5.  **CONTENT**: 
          - **SUMMARY**: Write a strong professional summary targeting the job.
          - **SKILLS**: List hard and soft skills relevant to the job.
          - **EXPERIENCE**: Rewrite bullet points to include keywords from the job description. Use action verbs and quantify results.
          - **EDUCATION**: List degrees and certifications clearly.
      
      **Example Format:**
      # **JOHN DOE**
      
      ## **SUMMARY**
      Experienced software engineer...
      
      ## **SKILLS**
      - JavaScript
      - React
      
      ## **EXPERIENCE**
      ...

      **Desired Tone:** ${input.tone}
      `
    });

    // Resume Part (File or Text)
    if (input.resumeFile) {
      parts.push({ text: "Candidate Resume Document:" });
      parts.push({
        inlineData: {
          mimeType: input.resumeFile.mimeType,
          data: input.resumeFile.data
        }
      });
    } else {
      parts.push({
        text: `Candidate Resume Text:\n${input.resumeText}`
      });
    }

    // Job Description Part
    parts.push({
      text: `Target Job Description:\n${jobDescriptionText}`
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts: parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0, // Zero temperature for deterministic results
        seed: 1, // Fixed seed to ensure identical inputs produce identical outputs
      },
    });

    if (!response.text) {
      throw new Error("No response generated from AI.");
    }

    const result = JSON.parse(response.text) as OptimizationResult;
    return result;

  } catch (error) {
    console.error("Error optimizing resume:", error);
    throw error;
  }
};

export const findMatchingJobs = async (optimizedResumeText: string, location: string): Promise<JobSearchResponse> => {
  try {
    const parts: any[] = [];
    
    let locationInstruction = "";
    if (location && location.trim().length > 0) {
        locationInstruction = `
        **CRITICAL LOCATION RULES (MUST FOLLOW):**
        1.  **User Target Location:** "${location}".
        2.  **GEOGRAPHIC BOUNDARY:** 
            - You MUST restrict search results to the **Same Country** as the location provided. 
            - DO NOT show jobs from other countries.
        3.  **PROXIMITY PRIORITY (Closer is Better):**
            - **Priority 1:** Jobs in the exact city "${location}".
            - **Priority 2:** Jobs in the surrounding region/state.
            - **Priority 3:** Remote jobs within the same country.
        4.  **Spam Protection:** ONLY include listings from reputable platforms (LinkedIn, Indeed, Glassdoor, Wellfound, Official Company Sites, Y Combinator). 
           - VERIFY the job is currently active.
           - FILTER OUT vague "confidential" listings, "easy apply" spam, or suspected scams.
        `;
    } else {
        locationInstruction = `
        **CRITICAL LOCATION RULES:**
        The user did not specify a location.
        1.  **INFER LOCATION:** Analyze the resume to find the candidate's current City and Country.
        2.  **SCOPE:** Restrict all search results to that inferred **COUNTRY**.
        3.  **PROXIMITY:** Prioritize jobs closer to their inferred city.
        `;
    }

    parts.push({
      text: `
      You are an expert Tech Recruiter.
      
      **TASK:**
      Search for currently ACTIVE, GENUINE job listings that match the candidate's profile based on the optimized resume.
      
      ${locationInstruction}
      
      **SEARCH STRATEGY:**
      - Use the Google Search tool.
      - **Explicitly use the location "${location}" in your search queries.**
      
      **OUTPUT LOGIC:**
      - Goal: Find exactly 5 high-quality matches.
      - **If you find fewer than 5 matching SAFE jobs in the CORRECT LOCATION:**
        - List ONLY the valid ones found.
        - START your response with this exact phrase (bold): "**We found only [number] active jobs in [Location] that match your criteria.**" followed by a brief advice on broadening the search.
      - **If you find 5 matches:**
        - Start with "**Here are the top 5 active job listings matching your profile in [Location]:**"

      **JOB LISTING FORMAT (Markdown):**
      For each job, use this layout:
      
      ### **[Job Title]**
      **Company:** [Company Name]
      **Location:** [City, Country]
      **Match Reason:** [1 sentence explaining why]
      
      ---
      `
    });

    parts.push({
      text: `Optimized Resume Context:\n${optimizedResumeText}`
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts: parts },
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0, // Lower temperature for search as well
      },
    });

    if (!response.text) {
      throw new Error("No response generated from AI.");
    }

    return {
      text: response.text,
      groundingChunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };

  } catch (error) {
    console.error("Error finding jobs:", error);
    throw error;
  }
};