export type SlideRange = "4to6" | "6to8" | "8to10" | "10to12";
export type ChartType = 'bar' | 'pie' | 'line' | 'donut';
export type SlideLayout = 'text' | 'image-right' | 'image-left' | 'chart';

export type ChartDataset = { name: string; values: number[] };
export type ChartData = { labels: string[]; datasets: ChartDataset[] };

export type OutlineSlide = {
  title: string;
  points: string[];
  outline: string;
};

export type FullSlide = {
  slideNumber: number;
  title: string;
  headline: string;
  bulletPoints: string[];
  speakerNotes: string;
  imageKeyword: string;
  slideLayout?: SlideLayout;
  chartType?: ChartType | null;
  chartData?: ChartData | null;
  // Editable text overrides
  editedTitle?: string;
  editedHeadline?: string;
  editedBulletPoints?: string[];
  editedSpeakerNotes?: string;
  // Editable style overrides
  editedFontFamily?: string;
  editedTitleColor?: string;
  editedBodyColor?: string;
};

export type ProjectDetail = {
  noOfSlides: SlideRange;
  projectId: string;
  userInputPrompt: string;
  createdBy: string;
  createdAt: any;
  outline?: OutlineSlide[];
  selectedStyle?: string;
  fullSlides?: FullSlide[];
};

export type UserDetail = {
  fullName: string;
  email: string;
  createdAt: any;
  credits: number;
  isPremium?: boolean;
  razorpayPaymentId?: string;
  premiumSince?: any;
  premiumPlan?: string;
};
