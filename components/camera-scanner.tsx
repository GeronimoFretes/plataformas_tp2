"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { RotateCw, X, Plus, RefreshCw } from "lucide-react"
import { initModel, classify } from "@/lib/onnx-helpers"

interface CameraScannerProps {
  onAddIngredient: (label: string, index: number, quantity?: number) => void
  onClose: () => void
}

const countableLabels = ["huevo", "banana"]
const isCountable = (l: string) => countableLabels.includes(l.toLowerCase())

const INFER_SIZE = 224
const OFF =
  typeof window !== "undefined"
    ? (() => {
        const c = document.createElement("canvas")
        c.width = INFER_SIZE
        c.height = INFER_SIZE
        return c
      })()
    : null

export default function CameraScanner({
  onAddIngredient,
  onClose,
}: CameraScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [prediction, setPrediction] = useState<{ label: string; confidence: number; index: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isModelReady, setIsModelReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isFrontCamera, setIsFrontCamera] = useState(false)
  const { toast } = useToast()
  const currentStreamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number | null>(null)

  const stopStream = (s: MediaStream | null) => s?.getTracks().forEach(t => t.stop())

  useEffect(() => {
    let cancelled = false
    const initCamera = async () => {
      try {
        setIsLoading(true)
        setError(null)
        if (!navigator.mediaDevices?.getUserMedia) throw new Error("Cámara no soportada")
        stopStream(currentStreamRef.current)
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: isFrontCamera ? "user" : { ideal: "environment" },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            frameRate: { ideal: 30, max: 30 },
          },
          audio: false,
        })
        if (cancelled) { stopStream(stream); return }
        currentStreamRef.current = stream
        const vid = videoRef.current
        if (vid) {
          vid.srcObject = stream
          vid.onloadedmetadata = () => vid.play().catch(() => {})
        }
        setIsLoading(false)
      } catch (e) {
        console.error(e)
        setError("No se pudo acceder a la cámara")
        setIsLoading(false)
        toast({ title: "Error de cámara", description: "Revisá permisos y HTTPS.", variant: "destructive" })
      }
    }
    initCamera()
    return () => { cancelled = true; stopStream(currentStreamRef.current) }
  }, [isFrontCamera, toast])

  useEffect(() => {
    if (isLoading || error) return
    let stop = false
    const start = async () => {
      try {
        await initModel()
        setIsModelReady(true)
        const ctx = OFF?.getContext("2d")
        const loop = async () => {
          if (stop || !ctx || !OFF || !videoRef.current) return
          ctx.drawImage(videoRef.current, 0, 0, INFER_SIZE, INFER_SIZE)
          try {
            const res = await classify(OFF)
            if (res) setPrediction(res)
          } catch (e) {
            console.error("Inference error", e)
          }
          rafRef.current = requestAnimationFrame(loop)
        }
        loop()
      } catch (e) {
        console.error("Model error", e)
        setError("No se pudo cargar el modelo")
        toast({ title: "Error de modelo", description: "Chequeá la consola.", variant: "destructive" })
      }
    }
    start()
    return () => { stop = true; if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [isLoading, error, toast])

  const handleAdd = () => {
    if (!prediction) return
    const qty = isCountable(prediction.label) ? 1 : undefined
    onAddIngredient(prediction.label, prediction.index, qty)
  }

  return (
    <Card className="w-full overflow-hidden bg-crema-light font-sans">
      <div className="relative">
        <video ref={videoRef} className="w-full aspect-[6/5] object-cover rounded-t-lg" playsInline muted />
        <div className="absolute top-2 right-2 flex gap-2">
          <Button
            variant="secondary"
            size="icon"
            className="bg-white/80 text-verde rounded-full"
            onClick={() => setIsFrontCamera(prev => !prev)}
          >
            <RotateCw className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="bg-white/80 text-verde rounded-full"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <CardContent className="p-4">
        {isLoading ? (
          <div className="flex flex-col items-center py-4 text-verde">
            <RefreshCw className="h-8 w-8 animate-spin mb-2" />
            <p>Iniciando cámara…</p>
          </div>
        ) : error ? (
          <div className="text-center text-red-600 py-4">{error}</div>
        ) : (
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <p className="font-medium text-verde">
                  {prediction ? prediction.label : "Analizando…"}
                </p>
                <p className="text-sm text-verde">
                  {prediction ? `${(prediction.confidence * 100).toFixed(1)}%` : ""}
                </p>
              </div>

              {/* Custom progress bar: grey track + green fill */}
              <div className="w-full h-2 bg-crema-light rounded-lg overflow-hidden">
                <div
                  className="h-full bg-verde rounded-lg"
                  style={{ width: `${prediction ? prediction.confidence * 100 : 0}%` }}
                />
              </div>
            </div>

            {prediction && (
              <Button className="w-full bg-naranja  hover:bg-naranja hover:text-crema-light" onClick={handleAdd}>
                Agregar {prediction.label}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
