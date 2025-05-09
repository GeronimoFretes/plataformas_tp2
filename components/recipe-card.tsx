"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChefHat, Copy, Share } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface RecipeCardProps {
  recipe: string
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  const { toast } = useToast()

  const parseRecipe = (text: string) => {
    const lines = text
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)

    const first = lines[0] ?? ""
    const withoutLabel = first.replace(
      /^(?:título|titulo)[:\-]?\s*/i,
      ""
    )
    const title = withoutLabel.replace(/^"(.*)"$/, "$1")

    const ingStart = lines.findIndex((l) =>
      /ingredientes[:]?$/i.test(l)
    )
    const instrStart = lines.findIndex((l) =>
      /(instrucciones|pasos|preparación|steps|directions)[:]?$/i.test(l)
    )

    const ingredients =
      ingStart !== -1
        ? lines
            .slice(ingStart + 1, instrStart !== -1 ? instrStart : undefined)
            .map((l) =>
              l.replace(/^[-*]\s*/, "").replace(/^\d+\.\s*/, "").trim()
            )
        : []

    const instructions =
      instrStart !== -1
        ? lines
            .slice(instrStart + 1)
            .map((l) =>
              l.replace(/^[-*]\s*/, "").replace(/^\d+\.\s*/, "").trim()
            )
        : []

    return { title, ingredients, instructions }
  }

  const { title, ingredients, instructions } = parseRecipe(recipe)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(recipe)
      toast({
        title: "Copiado",
        description: "La receta fue copiada al portapapeles.",
      })
    } catch {
      toast({
        title: "Error",
        description: "No se pudo copiar.",
        variant: "destructive",
      })
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: "Receta de Cocin.IA",
          text: recipe,
        })
        .catch(() => {
          toast({
            title: "Cancelado",
            description: "No se compartió.",
          })
        })
    } else {
      const url = `https://wa.me/?text=${encodeURIComponent(recipe)}`
      window.open(url, "_blank")
    }
  }

  return (
    <Card className="w-full max-w-xl mx-auto bg-crema-light">
      <CardHeader className="pb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          {/* <ChefHat className="h-5 w-5 text-primary" /> */}
          <CardTitle className="text-xl sm:text-2xl text-verde font-bold">
            {title}
          </CardTitle>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleCopy}
            size="sm"
            variant="outline"
            className="gap-1 text-sm text-crema-light bg-naranja"
          >
            <Copy className="h-4 w-4" /> Copiar
          </Button>
          <Button
            onClick={handleShare}
            size="sm"
            variant="outline"
            className="gap-1 text-sm text-crema-light bg-naranja"
          >
            <Share className="h-4 w-4" /> Compartir
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 text-sm sm:text-base max-h-[60vh] overflow-y-auto pr-2">
        {ingredients.length > 0 && (
          <section>
            <h3 className="font-semibold mb-2 text-verde">Ingredientes</h3>
            <ul className="list-disc pl-5 space-y-1 text-verde">
              {ingredients.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </section>
        )}

        {instructions.length > 0 && (
          <section>
            <h3 className="font-semibold mb-2 text-verde">Instrucciones</h3>
            <ol className="list-decimal pl-5 space-y-2 text-verde">
              {instructions.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </section>
        )}

        {title === "Tu Receta" &&
          ingredients.length === 0 &&
          instructions.length === 0 && (
            <pre className="whitespace-pre-wrap text-muted-foreground text-sm">
              {recipe}
            </pre>
          )}
      </CardContent>
    </Card>
  )
}
