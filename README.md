# Harmonic Oscillator Simulation  

**Interactive harmonic oscillator simulation with real physical calculations and advanced visualization**  

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)  
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)  
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-38B2AC)](https://tailwindcss.com/)  
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-components-orange)](https://ui.shadcn.com/)  

---

## Table of Contents  
- [Overview](#overview)  
- [Features](#features)  
- [Technologies](#technologies)  
- [Installation](#installation)  
- [Project Structure](#project-structure)  
- [Physics Calculations](#physics-calculations)  
- [Components](#components)  
- [Usage](#usage)  
- [Screenshots](#screenshots)  
- [Development](#development)  
- [Contributing](#contributing)  
- [License](#license)  

---

## Overview  
This is a full-featured web simulation of a **harmonic oscillator**, built for educational purposes.  
It demonstrates oscillation principles through **interactive visualizations** with accurate physical calculations.  

### Key Highlights  
- 🎮 **Interactive controls** — adjust physical parameters in real time  
- 📊 **Detailed graphs** — position, velocity, acceleration, energy with annotations  
- 🔬 **Phase space** — *x(t) vs v(t)* trajectory for system analysis  
- 🌈 **Energy visualization** — oscilloscope-style energy transformations  
- 🎵 **Sound effects** — audio feedback when passing through equilibrium  
- 🔄 **Comparison mode** — analyze up to two models simultaneously  
- 🎲 **Chaos mode** — unpredictable behavior with random initial velocities  
- 🌙 **Dark mode** — modern UI with theme switching  

---

## Features  

### Physical Parameters  
- **Amplitude (A)** — maximum displacement  
- **Angular frequency (ω)** — oscillation rate  
- **Phase (φ)** — initial phase shift (0–360°)  
- **Mass (m)** — 0.5–5 kg  
- **Spring stiffness (k)** — 1–30 N/m  
- **Damping coefficient (γ)** — 0–1  

### Graph Types  
1. **Motion graphs:** *x(t), v(t), a(t)*  
2. **Energy analysis:** KE, PE, Total energy  
3. **Phase space:** position vs velocity trajectories  
4. **Spectral analysis (FFT):** frequency decomposition  

### Interactivity  
- 🎯 Hover tooltips with physics explanations  
- 📍 Graph annotations at key points  
- 🔢 Exact numeric values with high precision  
- 🎨 Energy flows in oscilloscope-style visuals  

---

## Technologies  

### Frontend  
- **Next.js 14**  
- **TypeScript**  
- **Tailwind CSS**  
- **shadcn/ui**  

### Visualization  
- **Recharts** (charts & diagrams)  
- **HTML5 Canvas** (spring-mass animation)  
- **Web Audio API** (sound effects)  

### Dev Tools  
- ESLint, Prettier  
- Lucide React (icons)  

---

## Installation  

### Prerequisites  
- Node.js ≥ 18  
- npm or yarn  
## Deploy on Vercel

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
![image](https://github.com/user-attachments/assets/43cd07a8-94af-4283-916c-ace8849f2154)
![image](https://github.com/user-attachments/assets/72ee958c-efee-4ee5-8508-db64609752f8)



```bash
# 1. Clone repository
git clone https://github.com/your-username/harmonic-oscillator-simulation.git
cd harmonic-oscillator-simulation

# 2. Install dependencies
npm install  

# 3. Initialize shadcn/ui
npx shadcn@latest init

# 4. Add UI components
npx shadcn@latest add button card slider switch tabs label scroll-area dropdown-menu badge

# 5. Start development server
npm run dev  


