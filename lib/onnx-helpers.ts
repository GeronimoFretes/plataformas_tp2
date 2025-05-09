import * as ort from "onnxruntime-web"

let session: ort.InferenceSession | null = null
let labels: string[] = []

/* Normalisation params (ImageNet) — tweak if your model uses others */
const MEAN = [0.485, 0.456, 0.406]
const STD  = [0.229, 0.224, 0.225]

/* ------------------------------------------------------------------ */
/*  Public API                                                        */
/* ------------------------------------------------------------------ */

/** Call once at startup to load model & labels */
export async function initModel() {
  if (session) return
  session = await ort.InferenceSession.create("/model.onnx", {
    executionProviders: ["wasm"],          // add "webgl" here if you like
  })
  const resp = await fetch("/classes.json")
  labels = await resp.json()
  console.log("✅ model & labels loaded", labels.length, "classes")
}

/** Run inference on a 224×224 canvas; returns null if confidence < 0.1 */
export async function classify(canvas: HTMLCanvasElement) {
  if (!session) throw new Error("Model not loaded. Call initModel() first.")

  const tensor = preprocess(canvas)
  const feeds: Record<string, ort.Tensor> = {
    [session.inputNames[0]]: tensor,
  }
  const results = await session.run(feeds)

  const logits = results[session.outputNames[0]].data as Float32Array
  const { idx: maxIdx, prob: maxProb } = argmaxSoftmax(logits)

  if (maxProb < 0.1) return null                // ignore low‑confidence noise

  return {
    label: labels[maxIdx] ?? `class_${maxIdx}`,
    confidence: maxProb,
    index: maxIdx,
  }
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function preprocess(canvas: HTMLCanvasElement): ort.Tensor {
  const { width: W, height: H } = canvas         // expect 224×224
  const ctx = canvas.getContext("2d")!
  const { data } = ctx.getImageData(0, 0, W, H)

  const float = new Float32Array(3 * W * H)      // NCHW
  let p = 0
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4
      const r = data[i]   / 255
      const g = data[i+1] / 255
      const b = data[i+2] / 255

      float[p]             = (r - MEAN[0]) / STD[0]         // R
      float[p +   W*H]     = (g - MEAN[1]) / STD[1]         // G
      float[p + 2*W*H]     = (b - MEAN[2]) / STD[2]         // B
      p++
    }
  }
  return new ort.Tensor("float32", float, [1, 3, H, W])
}

function argmaxSoftmax(arr: Float32Array) {
  let maxIdx = 0, maxVal = arr[0]
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > maxVal) { maxVal = arr[i]; maxIdx = i }
  }
  const exp = arr.map(v => Math.exp(v - maxVal))
  const sum = exp.reduce((a,b) => a + b, 0)
  return { idx: maxIdx, prob: exp[maxIdx] / sum }
}
