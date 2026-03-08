# Cocin.IA — Ingredient Scanner and Recipe Generator

An end-to-end ML product that turns a trained image classifier into a user-facing cooking experience.

This repository contains the **web application and inference layer** of **Cocin.IA**: a Next.js app that uses the device camera to detect ingredients, runs **client-side ONNX inference in the browser**, lets the user review selected ingredients, and generates a recipe through a **Magic Loops + LLM workflow**.

## Live App

**Try the product here:**  
https://cocinia.vercel.app/

## Companion Repository: Model Development

This repository is one half of the full project.

The ONNX model used here was created in the companion repository below, where I developed the ML pipeline from data collection and preprocessing to training, evaluation, and export:

**Model training repo:**  
https://github.com/GeronimoFretes/ingredient-classifier-training

Together, both repositories represent the full end-to-end system:

- **`ingredient-classifier-training`** → model creation and export
- **`ingredient-recipe-generator`** → product integration, browser inference, and recipe generation

---

## What this repository contains

This repo focuses on the **productization and deployment side** of the project:

- **Next.js + TypeScript** web application
- **Browser-based ONNX inference** with `onnxruntime-web`
- Packaged **`model.onnx`** artifact for frontend inference
- Ingredient label mapping via `classes.json`
- Camera-based ingredient scanning flow
- Ingredient review and quantity adjustment UI
- Server-side prompt generation
- Integration with a **Magic Loops** endpoint for recipe generation
- Deployment-ready frontend application structure

This is the layer that turns the trained model into a usable interactive product.

---

## How the product works

1. The user opens the app and activates the camera.
2. The frontend loads the ONNX model directly in the browser.
3. The app predicts the ingredient shown to the camera.
4. The user adds detected ingredients to a list and adjusts quantities where relevant.
5. The app builds a structured cooking prompt from the selected ingredients.
6. That prompt is sent to a Magic Loops workflow connected to an LLM.
7. The generated recipe is returned and displayed to the user.

This setup separates three layers cleanly:

- **computer vision inference**
- **product UX**
- **LLM-based recipe generation**

---

## Current model scope

The current classifier is a **closed-set image classification model** trained on a limited ingredient vocabulary.

At this stage, the model supports the following ingredient classes:

- sugar
- banana
- flour
- eggs
- milk
- butter

Because the model is restricted to the categories seen during training, every prediction is mapped to one of those supported classes. This means the app should be interpreted as a **constrained prototype for ingredient recognition**, not as a general-purpose food recognition system.

That limitation is intentional and important: the goal of this project is to demonstrate a full ML product pipeline, from trained vision model to deployable end-user experience.

---

## Why this project matters in my portfolio

This project is meant to show more than model training in isolation.

It demonstrates how I connect:

- **machine learning artifacts**
- **browser-side inference**
- **frontend product development**
- **LLM workflow integration**
- **deployment-oriented engineering**

into a complete user-facing application.

The companion repository shows the training pipeline.  
This repository shows the **productization** step.

Together, they form a full end-to-end ML project.

---

## Tech stack

- **Next.js**
- **React**
- **TypeScript**
- **ONNX Runtime Web**
- **Tailwind CSS**
- **Magic Loops**
- **Vercel**

---

## Repository structure

```bash
.
├── app/                # App router pages
├── components/         # UI components
├── hooks/              # Custom hooks
├── lib/                # Types, actions, shared logic
├── public/
│   ├── model.onnx      # ONNX model used for browser inference
│   └── classes.json    # Label mapping for predictions
├── styles/             # Styling
└── package.json
```

---

## Running locally

### 1. Clone the repository

```bash
git clone https://github.com/GeronimoFretes/ingredient-recipe-generator.git
cd ingredient-recipe-generator
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment variables

Create a `.env.local` file and add:

```env
MAGIC_LOOPS_URL=your_magic_loops_endpoint
```

### 4. Start the development server

```bash
pnpm dev
```

Then open:

```bash
http://localhost:3000
```

---

## Recommended reading order

If you are viewing this project as part of my portfolio, the best order is:

1. Review this repository to understand the **application and inference layer**
2. Visit the live product to see the user flow end to end
3. Open the companion repository to review the **model development pipeline**

### Links

* [Web app repo](https://github.com/GeronimoFretes/ingredient-recipe-generator)

* [Live app](https://cocinia.vercel.app/)

* [Model training repo](https://github.com/GeronimoFretes/ingredient-classifier-training)

---
