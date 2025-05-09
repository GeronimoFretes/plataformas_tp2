"use client"

import { useState } from "react"
import Link from "next/link"
import { Camera, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/components/ui/use-toast"

import CameraScanner from "@/components/camera-scanner"
import IngredientList from "@/components/ingredient-list"
import RecipeCard from "@/components/recipe-card"

import type { Ingredient } from "@/lib/types"
import { generateRecipe } from "@/lib/actions"

export default function Home() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [recipe, setRecipe] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const { toast } = useToast()

  /* ---------------- handlers ---------------- */
  const handleAddIngredient = (
    label: string,
    index: number,
    quantity?: number
  ) => {
    const name = label.toLowerCase()
    if (ingredients.some((i) => i.name.toLowerCase() === name)) {
      toast({
        title: "Ingrediente duplicado",
        description: `${label} ya fue agregado.`,
        variant: "destructive",
      })
      return
    }
    const isCountable = ["huevo", "banana"].includes(name)
    setIngredients([
      ...ingredients,
      { 
        id: Date.now().toString(), 
        name: label, 
        index,
        quantity: isCountable ? 1 : null, 
      },
    ])
    toast({ title: "Ingrediente añadido", description: label })
  }

  const handleUpdateQuantity = (id: string, quantity: number | null) =>
    setIngredients(
      ingredients.map((ing) => (ing.id === id ? { ...ing, quantity } : ing))
    )

  const handleRemoveIngredient = (id: string) =>
    setIngredients(ingredients.filter((ing) => ing.id !== id))

  const handleGenerateRecipe = async () => {
    if (ingredients.length === 0) {
      toast({
        title: "Sin ingredientes",
        description: "Agregá al menos un ingrediente primero.",
        variant: "destructive",
      })
      return
    }
    setIsGenerating(true)
    try {
      const res = await generateRecipe(ingredients)
      setRecipe(res)
      setIsCameraActive(false)
    } catch {
      toast({
        title: "Error",
        description: "No se pudo generar la receta. Intentá de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleReset = () => {
    setRecipe(null)
    setIngredients([])
  }

  /* ---------------- UI ---------------- */
  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8 bg-crema">
      {/* ---------- HEADER ---------- */}
      <header className="w-full max-w-3xl sticky top-0 z-10 bg-crema/80 backdrop-blur-sm py-4">
        <Link href="/" className="flex items-center gap-3 group">
          <img
            src="/favicon.png"
            alt="Logo Cocin.IA"
            className="h-12 w-12 rounded-full object-cover transition-transform group-hover:scale-105"
          />
          <h1 className="text-3xl font-bold text-verde">Cocin.IA</h1>

        </Link>
      </header>
      <p className="text-sm text-verde/70 mt-1">
        Identificá ingredientes con tu cámara y recibí recetas al instante
      </p>

      {/* ---------- MAIN CONTENT ---------- */}
      <div className="w-full max-w-3xl mt-6 space-y-8">
        {/* Cámara activa */}
        {isCameraActive && (
          <CameraScanner
            onAddIngredient={handleAddIngredient}
            onClose={() => setIsCameraActive(false)}
          />
        )}

        {/* Lista de ingredientes */}
        {ingredients.length > 0 && (
          <IngredientList
            ingredients={ingredients}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveIngredient={handleRemoveIngredient}
          />
        )}

        {/* Botón generar receta */}
        {!recipe && ingredients.length > 0 && (
          <div className="flex justify-center mt-6">
            <Button
              onClick={handleGenerateRecipe}
              disabled={isGenerating}
              className="w-full max-w-xs bg-naranja text-white hover:bg-[#e0a27a]"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Generando…
                </>
              ) : (
                "Obtener receta"
              )}
            </Button>
          </div>
        )}

        {/* Receta generada */}
        {recipe && (
          <>
            <RecipeCard recipe={recipe} />
            <div className="flex justify-center mt-6">
              <Button
                onClick={handleReset}
                variant="outline"
                className="w-full max-w-xs bg-naranja text-crema-light"
              >
                Probar con otros ingredientes
              </Button>
            </div>
          </>
        )}

        {/* Placeholder cuando no hay cámara ni ingredientes */}
        {!isCameraActive && !recipe && ingredients.length === 0 && (
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg space-y-4">
            <Camera className="h-12 w-12 text-verde/60" />
            {/* <p className="text-center text-verde/70">
              Activá la cámara para detectar ingredientes
            </p> */}
            <Button
              onClick={() => setIsCameraActive(true)}
              className="bg-naranja text-crema hover:bg-[#e0a27a]"
            >
              Activar cámara
            </Button>
          </div>
        )}
      </div>
      <Toaster />
    </main>
  )
}
