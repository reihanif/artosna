# 🌿 Artosna — Personal Financial Tracker

![Vue](https://img.shields.io/badge/Vue.js-3.x-42b883?logo=vue.js&logoColor=white)
![Vuetify](https://img.shields.io/badge/Vuetify-3.x-1867C0?logo=vuetify&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Backend-3ecf8e?logo=supabase&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)
![Status](https://img.shields.io/badge/Status-Active-success)

---

**Artosna** helps you stay financially mindful by tracking your income, expenses, and budgets in a calm and minimalist way.  
Built with **Vue 3**, **Vuetify**, and **Supabase**, it offers a smooth and elegant experience for managing your personal finances.

---

## 🖼️ Preview

![Artosna Screenshot](public/preview.png)  
<sub>*Example preview — replace with your own screenshot or app banner.*</sub>

---

## ✨ Features

- 📊 Track income & expenses  
- 💰 Manage budgets & spending goals  
- 🗂️ Categorize transactions  
- 📅 Periodic summaries (daily, weekly, monthly)  
- ☁️ Cloud sync via Supabase  
- 🔐 Secure authentication (Supabase Auth)  
- 📱 PWA support — installable & works offline  
- 🎨 Beautiful Material Design UI with Vuetify  

---

## 🧩 Tech Stack

| Technology | Purpose |
|-------------|----------|
| [Vue 3](https://vuejs.org/) | Frontend framework |
| [Vite](https://vitejs.dev/) | Development & build tool |
| [Vuetify](https://vuetifyjs.com/) | Material Design UI components |
| [Pinia](https://pinia.vuejs.org/) | State management |
| [Vue Router](https://router.vuejs.org/) | Client-side routing |
| [Supabase](https://supabase.com/) | Authentication & database |
| [Tailwind CSS](https://tailwindcss.com/) | Optional utility-first styling |
| [PWA](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps) | Offline & installable support |

---

## 🚀 Quick Start

```bash
# Clone the project
git clone https://github.com/yourusername/artosna.git
cd artosna

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your Supabase keys:
# VITE_SUPABASE_URL=your-url
# VITE_SUPABASE_ANON_KEY=your-anon-key

# Run in development
npm run dev
