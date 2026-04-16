# 🎯 AI PPT Maker

> Generate beautiful, AI-powered PowerPoint presentations in seconds. Choose styles, edit slides, add charts & images, and export to `.pptx` — all from your browser.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-12-FFCA28?logo=firebase&logoColor=black)

---

## ✨ Features

- 🤖 **AI-Powered Content Generation** — Describe your topic and get a full slide deck generated instantly
- 🎨 **Multiple Design Styles** — Choose from a curated collection of professional presentation themes
- 📊 **Dynamic Charts** — Bar, Line, Pie, and Donut charts rendered with Recharts
- 🖼️ **Smart Image Integration** — Auto-fetch relevant images from Pexels based on slide content
- ✏️ **Live Slide Editor** — Edit titles, headlines, bullet points, and layouts in real-time
- 📑 **Outline Builder** — Review and modify the AI-generated outline before generating slides
- 📥 **Export to .pptx** — Download your presentation as a PowerPoint file with one click
- 🔐 **User Authentication** — Secure sign-in and project management via Clerk
- ☁️ **Cloud Storage** — Save projects to Firebase Firestore
- 💳 **Premium Tier** — Razorpay-powered subscription for advanced features
- 🖼️ **ImageKit CDN** — Optimized image delivery and transformations

---

## 🛠️ Tech Stack

| Layer          | Technology                              |
| -------------- | --------------------------------------- |
| **Framework**  | React 19 + TypeScript                   |
| **Bundler**    | Vite 7                                  |
| **Styling**    | Tailwind CSS 4 + Radix UI + shadcn/ui   |
| **Animations** | Motion (Framer Motion)                  |
| **Charts**     | Recharts                                |
| **Auth**       | Clerk                                   |
| **Database**   | Firebase Firestore                      |
| **Payments**   | Razorpay                                |
| **Images**     | Pexels API + ImageKit                   |
| **Export**     | PptxGenJS                               |
| **Routing**    | React Router DOM v7                     |

---

## 📁 Project Structure

```
ai-ppt-maker/
├── public/                  # Static assets
├── config/
│   └── FirebaseConfig.ts    # Firebase initialization
├── context/
│   └── UserDetailContext.tsx # Global user state
├── src/
│   ├── components/
│   │   └── ui/
│   │       ├── custom/      # App-specific components
│   │       │   ├── Header.tsx
│   │       │   ├── Hero.tsx
│   │       │   ├── MyProjects.tsx
│   │       │   ├── PromptBox.tsx
│   │       │   ├── SlideCanvas.tsx
│   │       │   ├── SlidesStyle.tsx
│   │       │   └── OutlineSection.tsx
│   │       └── *.tsx        # shadcn/ui primitives
│   ├── lib/
│   │   ├── exportPptx.ts    # PowerPoint export logic
│   │   ├── pexels.ts        # Pexels image fetching
│   │   ├── imagekit.ts      # ImageKit integration
│   │   ├── razorpay.ts      # Payment utilities
│   │   ├── types.ts         # TypeScript type definitions
│   │   └── utils.ts         # Shared utilities
│   ├── workspace/           # Dashboard & project management
│   │   └── project/
│   │       ├── outline/     # Outline editor page
│   │       └── slides/      # Slide editor page
│   ├── pricing/             # Pricing / subscription page
│   ├── App.tsx              # Landing page (Header + Hero)
│   ├── main.tsx             # App entry point & routing
│   └── index.css            # Global styles
├── .env                     # Environment variables (not committed)
├── .gitignore
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9

### 1. Clone the Repository

```bash
git clone https://github.com/AnantTirupati/AIpptGenerator.git
cd AIpptGenerator
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the project root with the following variables:

```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
VITE_RAZORPAY_KEY_SECRET=your_razorpay_key_secret
VITE_IMAGEKIT_URL_ENDPOINT=your_imagekit_url_endpoint
VITE_IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
VITE_IMAGEKIT_KEY_SECRET=your_imagekit_key_secret
VITE_PEXELS_API_KEY=your_pexels_api_key
```

### 4. Start the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### 5. Build for Production

```bash
npm run build
npm run preview
```

---

## 🔧 Environment Variables Reference

| Variable                       | Description                          | Required |
| ------------------------------ | ------------------------------------ | -------- |
| `VITE_CLERK_PUBLISHABLE_KEY`   | Clerk authentication publishable key | ✅       |
| `VITE_FIREBASE_API_KEY`        | Firebase project API key             | ✅       |
| `VITE_RAZORPAY_KEY_ID`         | Razorpay payment gateway key ID      | ✅       |
| `VITE_RAZORPAY_KEY_SECRET`     | Razorpay payment gateway secret      | ✅       |
| `VITE_IMAGEKIT_URL_ENDPOINT`   | ImageKit CDN URL endpoint            | ✅       |
| `VITE_IMAGEKIT_PUBLIC_KEY`     | ImageKit public key                  | ✅       |
| `VITE_IMAGEKIT_KEY_SECRET`     | ImageKit private key                 | ✅       |
| `VITE_PEXELS_API_KEY`          | Pexels stock photo API key           | ✅       |

---

## 📸 How It Works

1. **Enter a Topic** — Type your presentation topic in the prompt box
2. **AI Generates Outline** — An intelligent outline is created with slide titles and key points
3. **Choose a Style** — Pick from multiple professional design themes
4. **Edit & Customize** — Modify titles, bullets, add charts, and choose image layouts
5. **Export** — Download your polished presentation as a `.pptx` file

---

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👤 Author

**Anant Tirupati**

- GitHub: [@AnantTirupati](https://github.com/AnantTirupati)

---

<p align="center">
  Made with ❤️
</p>
