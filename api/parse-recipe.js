// Vercel serverless function — fetches a recipe URL and extracts structured data

function parseDuration(iso) {
  if (!iso) return "";
  const h = iso.match(/(\d+)H/);
  const m = iso.match(/(\d+)M/);
  const hours = h ? parseInt(h[1]) : 0;
  const mins = m ? parseInt(m[1]) : 0;
  if (hours && mins) return `${hours} hr ${mins} min`;
  if (hours) return `${hours} hr`;
  if (mins) return `${mins} min`;
  return "";
}

function extractInstructions(instructions) {
  if (!instructions) return "";
  if (typeof instructions === "string") return instructions;
  if (Array.isArray(instructions)) {
    return instructions.map((step, i) => {
      const text = typeof step === "string" ? step : (step.text || step.name || "");
      return `${i + 1}. ${text.trim()}`;
    }).filter(Boolean).join("\n");
  }
  return "";
}

function extractIngredients(ingredients) {
  if (!ingredients) return "";
  if (Array.isArray(ingredients)) return ingredients.join("\n");
  return String(ingredients);
}

function guessCategory(cats) {
  if (!cats) return "Other";
  const raw = Array.isArray(cats) ? cats.join(" ") : String(cats);
  const lower = raw.toLowerCase();
  if (/dessert|cake|cookie|pie|bread|bak/.test(lower)) return "Desserts & Baked Goods";
  if (/drink|beverage|cocktail|smoothie|juice/.test(lower)) return "Drinks";
  if (/side|salad|soup|appetizer|snack|comfort/.test(lower)) return "Sides & Comfort";
  if (/main|dinner|lunch|entree|chicken|beef|pork|fish|pasta/.test(lower)) return "Mains";
  return "Other";
}

function findRecipeSchema(data) {
  if (!data) return null;
  if (Array.isArray(data)) {
    for (const item of data) {
      const found = findRecipeSchema(item);
      if (found) return found;
    }
  }
  if (typeof data === "object") {
    if (data["@type"] === "Recipe" || (Array.isArray(data["@type"]) && data["@type"].includes("Recipe"))) {
      return data;
    }
    if (data["@graph"]) return findRecipeSchema(data["@graph"]);
  }
  return null;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { url } = req.query;
  if (!url) return res.status(400).json({ error: "url parameter required" });

  let targetUrl;
  try {
    targetUrl = new URL(url);
  } catch {
    return res.status(400).json({ error: "Invalid URL" });
  }

  try {
    const response = await fetch(targetUrl.toString(), {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; WhatTheFork/1.0)",
        "Accept": "text/html",
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      return res.status(502).json({ error: `Could not fetch that page (status ${response.status})` });
    }

    const html = await response.text();

    // Extract all JSON-LD blocks
    const ldMatches = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
    let recipe = null;

    for (const match of ldMatches) {
      try {
        const json = JSON.parse(match[1]);
        recipe = findRecipeSchema(json);
        if (recipe) break;
      } catch { /* malformed JSON-LD, skip */ }
    }

    if (!recipe) {
      // Fallback: try to get page title at minimum
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      return res.status(422).json({
        error: "No recipe data found on that page. Try a site like AllRecipes, Food Network, or NYT Cooking.",
        pageTitle: titleMatch ? titleMatch[1].trim() : null,
      });
    }

    return res.json({
      title: recipe.name || "",
      description: typeof recipe.description === "string"
        ? recipe.description.replace(/<[^>]+>/g, "").trim()
        : "",
      ingredients: extractIngredients(recipe.recipeIngredient),
      steps: extractInstructions(recipe.recipeInstructions),
      prepTime: parseDuration(recipe.prepTime),
      cookTime: parseDuration(recipe.cookTime || recipe.totalTime),
      category: guessCategory(recipe.recipeCategory),
      sourceUrl: targetUrl.toString(),
    });

  } catch (err) {
    if (err.name === "TimeoutError") {
      return res.status(504).json({ error: "That page took too long to load." });
    }
    return res.status(500).json({ error: err.message });
  }
}
