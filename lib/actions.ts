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
  // Armar la lista de ingredientes, e.g. "2 huevo, 3 banana, azúcar"
  const lista = ingredients
    .map((ing) => (ing.quantity ? `${ing.quantity} ${ing.name}` : ing.name))
    .join(", ")

  return `Sos un chef profesional con amplia experiencia en cocina casera y creativa. 
Usarás únicamente estos ingredientes: ${lista}.

Instrucciones:
1. Titulá la receta con un nombre claro y descriptivo (sin adjetivos decorativos).
2. Enlistar la sección "Ingredientes" con cantidades exactas, agregando sólo condimentos básicos si fueran necesarios.
3. En la sección "Instrucciones", ofrecer pasos numerados, concisos y ordenados para preparar el plato de forma eficiente.
4. Mantener el tono técnico y directo, sin florituras.
5. Responder en español rioplatense, en texto plano (sin tablas ni formato Markdown).

¡Manos a la obra!`
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
