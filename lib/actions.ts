"use server"

import type { Ingredient } from "@/lib/types"

/* ------------------------------------------------------------------ */
/*  Magic Loops configuration                                        */
/* ------------------------------------------------------------------ */

const LOOP_URL = process.env.MAGIC_LOOPS_URL
if (!LOOP_URL) {
  throw new Error("Missing MAGIC_LOOPS_URL environment variable")
}
// const AUTH_HEADER = { Authorization: `Bearer ${process.env.MAGIC_LOOPS_SECRET}` }

/* ------------------------------------------------------------------ */
/*  Prompt builder                                                   */
/* ------------------------------------------------------------------ */

function buildPrompt(ingredients: Ingredient[]): string {
  // Build a comma-separated list of ingredients with quantities if available
  const list = ingredients
    .map((ing) => (ing.quantity ? `${ing.quantity} ${ing.name}` : ing.name))
    .join(", ")

  return `You are a professional chef with extensive experience in home cooking and creative cooking. You must use only these ingredients: ${list}.

Instructions:
1. Give the recipe a clear, descriptive title without decorative adjectives.
2. Add an "Ingredients" section with exact quantities, adding only basic seasonings if truly necessary.
3. Add an "Instructions" section with concise, numbered, well-ordered steps to prepare the dish efficiently.
4. Keep the tone technical and direct, with no fluff.
5. Respond in plain English and plain text only. Do not use tables or Markdown.

Begin now.`
}


/* ------------------------------------------------------------------ */
/*  Main action: generateRecipe                                      */
/* ------------------------------------------------------------------ */

export async function generateRecipe(
  ingredients: Ingredient[]
): Promise<string> {
  try {
    const prompt = buildPrompt(ingredients)

    const res = await fetch(LOOP_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // ...AUTH_HEADER,
      },
      body: JSON.stringify({ input: prompt }),
      cache: "no-store",
    })

    if (!res.ok) {
      throw new Error(`Magic Loops error: ${res.status} ${res.statusText}`)
    }

    const data = await res.json()

    const raw =
      data.output ?? data.result ?? data.text ?? JSON.stringify(data)

    let recipe: string
    try {
      recipe = JSON.parse(raw) // fixes \n and outer quotes
    } catch {
      recipe = raw
    }

    return recipe
  } catch (error) {
    console.error("Error generating recipe:", error)
    throw new Error("Failed to generate recipe")
  }
}
