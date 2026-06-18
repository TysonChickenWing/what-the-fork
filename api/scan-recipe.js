import Anthropic from "@anthropic-ai/sdk";

export const config = {
  api: { bodyParser: { sizeLimit: "10mb" } },
};

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  const { imageData, mediaType } = req.body ?? {};
  if (!imageData || !mediaType) {
    return res.status(400).json({ error: "imageData and mediaType required" });
  }

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mediaType, data: imageData },
            },
            {
              type: "text",
              text: `This is a photo of a handwritten recipe. Extract all the recipe information and return it as a JSON object with exactly these fields:

{
  "title": "recipe name",
  "description": "one or two sentence description of the dish — infer from the ingredients/style if not written",
  "ingredients": "each ingredient on its own line, exactly as written",
  "steps": "numbered steps, one per line, e.g. '1. Preheat oven to 350°F\\n2. Mix flour and sugar'",
  "prepTime": "prep time if shown, like '20 min' — empty string if not mentioned",
  "cookTime": "cook time if shown, like '45 min' — empty string if not mentioned",
  "category": "exactly one of: Mains, Sides & Comfort, Desserts & Baked Goods, Drinks, Other"
}

Return ONLY the JSON object. No explanation, no markdown, no code fences.`,
            },
          ],
        },
      ],
    });

    const raw = message.content[0].text.trim();
    // Strip code fences if the model wrapped it anyway
    const cleaned = raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    const recipe = JSON.parse(cleaned);
    return res.json(recipe);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Failed to read the recipe." });
  }
}
