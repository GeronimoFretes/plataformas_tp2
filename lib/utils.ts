import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isCountable(ingredient: string): boolean {
  const countableIngredients = [
    "egg",
    "apple",
    "banana",
    "orange",
    "tomato",
    "potato",
    "onion",
    "carrot",
    "lemon",
    "lime",
  ]

  return countableIngredients.some((item) => ingredient.toLowerCase().includes(item))
}
