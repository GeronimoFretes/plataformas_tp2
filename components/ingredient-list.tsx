"use client"

import { FC } from "react"
import { Button } from "@/components/ui/button"
import { Trash, Plus, Minus } from "lucide-react"
import type { Ingredient } from "@/lib/types"

interface IngredientListProps {
  ingredients: Ingredient[]
  onUpdateQuantity: (id: string, quantity: number | null) => void
  onRemoveIngredient: (id: string) => void
}

const IngredientList: FC<IngredientListProps> = ({
  ingredients,
  onUpdateQuantity,
  onRemoveIngredient,
}) => (
  <div className="space-y-4 font-sans">
    <h2 className="text-xl font-semibold text-verde">Tus ingredientes</h2>
    <ul className="space-y-2">
      {ingredients.map((ing) => (
        <li
          key={ing.id}
          className="flex items-center justify-between bg-crema-light p-3 rounded-lg shadow"
        >
          <div className="flex items-center gap-4">
            <span className="font-medium text-verde">{ing.name}</span>
            {ing.quantity != null && (
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-verde bg-crema-light active:bg-crema active:text-verde hover:bg-crema"
                  onClick={() =>
                    onUpdateQuantity(ing.id, Math.max(1, ing.quantity! - 1))
                  }
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-6 text-center text-verde">{ing.quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-verde bg-crema-light active:bg-crema active:text-verde hover:bg-crema"
                  onClick={() => onUpdateQuantity(ing.id, ing.quantity! + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive"
            onClick={() => onRemoveIngredient(ing.id)}
          >
            <Trash className="h-5 w-5" />
          </Button>
        </li>
      ))}
    </ul>
  </div>
)

export default IngredientList
