# Harmonic Oscillator Simulation  

**Інтерактивна симуляція гармонічного осцилятора з реальними фізичними розрахунками та візуалізацією**  

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)  
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)  
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-38B2AC)](https://tailwindcss.com/)  
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-components-orange)](https://ui.shadcn.com/)  

---

## Зміст  
- [Огляд](#огляд)  
- [Функції](#функції)  
- [Технології](#технології)  
- [Встановлення](#встановлення)  
- [Структура проекту](#структура-проекту)  
- [Фізичні розрахунки](#фізичні-розрахунки)  
- [Компоненти](#компоненти)  
- [Використання](#використання)  
- [Скріншоти](#скріншоти)  
- [Розробка](#розробка)  
- [Внесок](#внесок)  
- [Ліцензія](#ліцензія)  

---

## Огляд  
Це повнофункціональна веб-симуляція гармонічного осцилятора, створена для освітніх цілей.  
Проєкт демонструє фізичні принципи коливань через інтерактивну візуалізацію з точними математичними розрахунками.  

### Ключові особливості  
- 🎮 **Інтерактивні елементи управління** — регулювання всіх фізичних параметрів у реальному часі  
- 📊 **Детальні графіки** — положення, швидкість, прискорення, енергія з анотаціями  
- 🔬 **Фазовий простір** — діаграма *x(t)* vs *v(t)* для аналізу стану системи  
- 🌈 **Енергетична візуалізація** — осцилоскопічне відображення трансформації енергії  
- 🎵 **Звукові ефекти** — аудіо-зворотний зв'язок при проходженні через рівновагу  
- 🔄 **Режим порівняння** — одночасний аналіз до 2 моделей  
- 🎲 **Режим хаосу** — випадкові початкові швидкості для непередбачуваної динаміки  
- 🌙 **Темна тема** — сучасний дизайн з підтримкою темної теми  

---

## Функції  

### Фізичні параметри  
- **Амплітуда (A)** — максимальне відхилення  
- **Частота (ω)** — кутова частота  
- **Фаза (φ)** — початковий фазовий зсув (0–360°)  
- **Маса (m)** — 0.5–5 кг  
- **Жорсткість пружини (k)** — 1–30 Н/м  
- **Коефіцієнт затухання (γ)** — 0–1  

### Типи графіків  
1. **Графіки руху:** *x(t), v(t), a(t)*  
2. **Енергетичний аналіз:** KE, PE, E  
3. **Фазовий простір:** траєкторія *x vs v*  
4. **Спектральний аналіз (FFT):** частотна декомпозиція  

### Інтерактивні можливості  
- 🎯 Hover-підказки з поясненням фізики  
- 📍 Анотації ключових точок  
- 🔢 Вивід точних числових значень  
- 🎨 Енергетичні потоки у стилі осцилоскопа  

---

## Технології  

### Frontend  
- **Next.js 14**  
- **TypeScript**  
- **Tailwind CSS**  
- **shadcn/ui**  

### Візуалізація  
- **Recharts** (графіки)  
- **HTML5 Canvas** (анімації)  
- **Web Audio API** (звук)  

### Dev Tools  
- ESLint, Prettier  
- Lucide React (іконки)  

---

## Встановлення  

### Передумови  
- Node.js ≥ 18  
- npm або yarn  

```bash
# 1. Клонування репозиторію
git clone https://github.com/your-username/harmonic-oscillator-simulation.git
cd harmonic-oscillator-simulation

# 2. Встановлення залежностей
npm install   # або yarn install

# 3. Ініціалізація shadcn/ui
npx shadcn@latest init

# 4. Додавання компонентів
npx shadcn@latest add button card slider switch tabs label scroll-area dropdown-menu badge

# 5. Запуск сервера розробки
npm run dev   # або yarn dev

Frontend Developer / Simulation Engineer
● Interactive Simulation: Developed a full-featured web application that visualizes harmonic oscillations with real physical formulas and precise mathematical calculations.
● Visualization & Graphing: Implemented real-time annotated charts (position, velocity, acceleration, energy), phase space diagrams, FFT spectral analysis, and oscilloscope-style energy flows using Recharts and HTML5 Canvas.
● Physics Engine: Programmed accurate motion equations (x(t), v(t), a(t), E) with damping, frequency, and energy transformations.
● User Experience: Built interactive controls for amplitude, mass, stiffness, damping, and phase with tooltips, hover explanations, dark/light themes, and comparison mode for two models.
● Audio Integration: Added sound feedback at equilibrium points using Web Audio API.
● Technologies: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Recharts, HTML5 Canvas, Web Audio API.

## Deploy on Vercel

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
![image](https://github.com/user-attachments/assets/43cd07a8-94af-4283-916c-ace8849f2154)
![image](https://github.com/user-attachments/assets/72ee958c-efee-4ee5-8508-db64609752f8)


