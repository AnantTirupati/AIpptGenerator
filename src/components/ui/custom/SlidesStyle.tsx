import React from 'react'
import BoldRed from '../../../assets/BoldRed.png';
import CreativeOrange from '../../../assets/CreativeOrange.png';
import EducationBlue from '../../../assets/EducationBlue.png';
import FinanceGray from '../../../assets/FinanceGray.png';
import HealthcareTeal from '../../../assets/HealthcareTeal.png';
import LuxuryBlack from '../../../assets/LuxuryBlack.png';
import MinimalWhite from '../../../assets/MinimalWhite.png';
import ModernDark from '../../../assets/ModernDark.png';
import NatureGreen from '../../../assets/NatureGreen.png';
import ProfessionalBlue from '../../../assets/ProfessionalBlue.png';
import StartUpPurple from '../../../assets/StartUpPurple.png';
import TechNeon from '../../../assets/TechNeon.png';

const Design_Styles = [
  {
    styleName: "Professional Blue 💼",
    colors: {
      primary: "#0A66C2", secondary: "#1C1C1C", accent: "#E8F0FE",
      background: "#FFFFFF", gradient: "linear-gradient(135deg, #0A66C2, #E8F0FE)"
    },
    designGuide: "Create a clean corporate slide with minimal icons and structured layouts.",
    icon: "Briefcase", bannerImage: ProfessionalBlue
  },
  {
    styleName: "Modern Dark 🚀",
    colors: {
      primary: "#0F172A", secondary: "#38BDF8", accent: "#E5E7EB",
      background: "#020617", gradient: "linear-gradient(135deg, #020617, #0F172A)"
    },
    designGuide: "Use bold typography, dark backgrounds, and glowing accent elements.",
    icon: "Rocket", bannerImage: ModernDark
  },
  {
    styleName: "Startup Purple ✨",
    colors: {
      primary: "#7C3AED", secondary: "#111827", accent: "#EDE9FE",
      background: "#FFFFFF", gradient: "linear-gradient(135deg, #7C3AED, #C4B5FD)"
    },
    designGuide: "Trendy startup visuals with rounded cards and playful spacing.",
    icon: "Zap", bannerImage: StartUpPurple
  },
  {
    styleName: "Minimal White ⚪",
    colors: {
      primary: "#111827", secondary: "#6B7280", accent: "#F3F4F6",
      background: "#FFFFFF", gradient: "linear-gradient(180deg, #FFFFFF, #F9FAFB)"
    },
    designGuide: "Very clean slides with lots of white space and thin dividers.",
    icon: "Minus", bannerImage: MinimalWhite
  },
  {
    styleName: "Tech Neon 💻",
    colors: {
      primary: "#22D3EE", secondary: "#0F172A", accent: "#67E8F9",
      background: "#020617", gradient: "linear-gradient(135deg, #22D3EE, #3B82F6)"
    },
    designGuide: "Futuristic tech look with neon highlights and dark sections.",
    icon: "Cpu", bannerImage: TechNeon
  },
  {
    styleName: "Nature Green 🌿",
    colors: {
      primary: "#16A34A", secondary: "#14532D", accent: "#DCFCE7",
      background: "#F0FDF4", gradient: "linear-gradient(135deg, #16A34A, #86EFAC)"
    },
    designGuide: "Eco-friendly visuals with organic shapes and soft gradients.",
    icon: "Leaf", bannerImage: NatureGreen
  },
  {
    styleName: "Creative Orange 🎨",
    colors: {
      primary: "#F97316", secondary: "#1F2933", accent: "#FFEDD5",
      background: "#FFFFFF", gradient: "linear-gradient(135deg, #F97316, #FDBA74)"
    },
    designGuide: "Energetic slides with bold headings and creative layouts.",
    icon: "Palette", bannerImage: CreativeOrange
  },
  {
    styleName: "Luxury Black 🖤",
    colors: {
      primary: "#000000", secondary: "#D4AF37", accent: "#F5F5F5",
      background: "#0A0A0A", gradient: "linear-gradient(135deg, #000000, #2A2A2A)"
    },
    designGuide: "High-end luxury feel with gold accents and elegant fonts.",
    icon: "Crown", bannerImage: LuxuryBlack
  },
  {
    styleName: "Education Blue 📘",
    colors: {
      primary: "#2563EB", secondary: "#1E3A8A", accent: "#DBEAFE",
      background: "#FFFFFF", gradient: "linear-gradient(135deg, #2563EB, #93C5FD)"
    },
    designGuide: "Clear academic slides with diagrams and bullet clarity.",
    icon: "BookOpen", bannerImage: EducationBlue
  },
  {
    styleName: "Finance Grey 📊",
    colors: {
      primary: "#374151", secondary: "#111827", accent: "#E5E7EB",
      background: "#FFFFFF", gradient: "linear-gradient(135deg, #374151, #9CA3AF)"
    },
    designGuide: "Professional financial decks with charts and data emphasis.",
    icon: "BarChart", bannerImage: FinanceGray
  },
  {
    styleName: "Healthcare Teal 🏥",
    colors: {
      primary: "#0D9488", secondary: "#134E4A", accent: "#CCFBF1",
      background: "#F0FDFA", gradient: "linear-gradient(135deg, #0D9488, #5EEAD4)"
    },
    designGuide: "Calm and trustworthy visuals with soft colors.",
    icon: "HeartPulse", bannerImage: HealthcareTeal
  },
  {
    styleName: "Bold Red 🔥",
    colors: {
      primary: "#DC2626", secondary: "#7F1D1D", accent: "#FEE2E2",
      background: "#FFFFFF", gradient: "linear-gradient(135deg, #DC2626, #FCA5A5)"
    },
    designGuide: "Attention-grabbing slides for marketing and pitch decks.",
    icon: "Flame", bannerImage: BoldRed
  }
];

type Props = {
  selectedStyle: string;
  onStyleChange: (styleName: string) => void;
}

function SlidesStyle({ selectedStyle, onStyleChange }: Props) {
  return (
    <div>
      <div className='mt-5'>
        <h2 className='font-bold text-xl'>Select Slides Style</h2>
        <div className='grid grid-cols-2 md:grid-cols-3 gap-5 mt-4'>
          {Design_Styles.map((design, index) => (
            <div
              className={`hover:scale-105 transition-all cursor-pointer 
              ${design.styleName === selectedStyle ? 'p-2 border-2 border-primary rounded-2xl' : ''}`}
              onClick={() => onStyleChange(design.styleName)}
              key={index}
            >
              <img
                src={design.bannerImage}
                alt={design.styleName}
                width={300}
                height={300}
                className='w-full h-[180px] rounded-2xl object-cover'
              />
              <h2 className='font-medium text-center mt-1'>{design.styleName}</h2>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export { Design_Styles };
export default SlidesStyle
