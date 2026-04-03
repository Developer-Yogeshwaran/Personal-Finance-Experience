# 💎 Beacon Finance

**Beacon Finance** is a high-fidelity, premium personal finance dashboard designed for the next generation of digital-first users. Built with a focus on modern aesthetic excellence and powerful interactive state management, it serves as a flagship piece for senior-level frontend engineering portfolios.

## 🚀 Key Features

### 🎨 Design & Aesthetic
- **Glassmorphism 2.0**: High-density frosted glass effects using `-webkit-backdrop-filter` and advanced CSS variables.
- **3D Interactive Assets**: A 3D-flipping virtual credit card wallet built with `perspective` and `preserve-3d` transforms.
- **Dynamic Background Orbs**: Smoothly animated, blurring SVG-gradient orbs that create a sense of depth and focus.
- **Mouse-Reactive Panels**: "Flare" lighting effects that follow the user's cursor across individual application panels.

### 📊 Financial Engineering
- **Investment Portfolio Tracker**: Real-time style market ticker for crypto and stocks, plus a D3-style SVG donut chart for asset allocation.
- **Smart Calendar Integration**: A daily transaction grid with automated "Net Worth" pulse indicators and date-specific spending views.
- **AI Financial Assistant**: A rule-based natural language chat widget with asynchronous "Thinking..." states and state-aware financial queries.
- **Bank-Sync Simulator**: An automated "Plaid-style" onboarding flow with mock-security scanning and asynchronous data injection.

### 🛠️ Technical Prowess
- **Zero Dependencies**: Pure Vanilla JS, HTML5, and CSS3 implementation—showcasing raw engineering and DOM manipulation skills.
- **Full Responsiveness**: Adaptive layouts that switch between **Professional Sidebar (Desktop)** and **Native Bottom-Nav (Mobile)** using fluid media queries.
- **Advanced State Management**: Centralized, persistent data store with `localStorage` synchronization for a seamless session experience.
- **Performance Optimized**: Highly efficient SVG-driven charts and lightweight CSS keyframe animations for 60FPS interaction.

---

## 🛠️ Tech Stack
- **Structure**: Semantic HTML5
- **Logic**: Vanilla JavaScript (ES6+)
- **Styling**: Modern CSS3 (Grid, Flexbox, Variable-driven themes)
- **Visuals**: SVG & CSS 3D Transforms

## 📱 Mobile Preview
The application is fully optimized for mobile devices, featuring a touch-first bottom navigation bar and adaptive grid scaling to ensure a "native app" feel on any smartphone.

---

## 🏗️ Implementation Path: From Scratch to Production

### **Phase 1: Conceptual Scaffold (HTML5 & DOM)**
Starting with a clean-sheet, semantic HTML5 structure. The core challenge was building a multi-view application (Dashboard, Transactions, Calendar, etc.) into a single-page architecture without external routing libraries. I implemented a custom `showView` logic to manage page state.

### **Phase 2: The Glassmorphic System (CSS Design)**
Implemented a global CSS theme architecture powered by variables (`:root`). I used `-webkit-backdrop-filter` for the frosting effects and layered `SVG Radial Orbs` to achieve high-density visual depth. The layout uses a dynamic **Grid/Flexbox hybrid** that flips to a **Fixed Bottom-Nav** on mobile devices.

### **Phase 3: Interactive Financial Logic (Vanilla JS)**
Developing the custom business logic for real-time calculation:
- **Net Worth Pulsing Engine**: A JS loop that computes balance trends in real-time.
- **3D Card Wallet**: Using `preserve-3d` transforms and `setInterval` for a live-updating clock.
- **AI Chat Logic**: Rule-based natural language processing to query the `localStorage` state.

### **Phase 4: Async Simulations (Plaid & AI)**
The final stage was simulating professional fintech APIs. I built a mock **Bank-Sync flow** and an **AI Receipt Scanner** using asynchronous `setTimeout` loops and CSS `@keyframes` (scanners) to mimic real-world network latency and processing.

---

Developed by **YOGESHWARAN A** (Portfolio Project)
