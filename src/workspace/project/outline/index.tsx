import SlidesStyle from '@/components/ui/custom/SlidesStyle';
import { firebaseDb, GeminiAiModel } from './../../../../config/FirebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import OutlineSection from '@/components/ui/custom/OutlineSection';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles } from 'lucide-react';
import type { FullSlide, OutlineSlide, ProjectDetail } from '../../../lib/types';
import { Design_Styles } from '@/components/ui/custom/SlidesStyle';

// ─── Prompt templates ─────────────────────────────────────────────────────────
const OUTLINE_PROMPT = `Generate a detailed PowerPoint slide outline for the topic {userInputPrompt}. create {noOfSlides} slides in total. Each slide should follow the following rules:
 Rules:
- First slide must be an introduction
- Last slide must be a conclusion or summary
- Each slide must contain:
  - One clear slide title
  - 3 to 5 concise bullet points
- Keep language simple, professional, and student-friendly
- Do not include emojis, markdown, or formatting symbols
- Do not add extra explanations outside slides

STRICT OUTPUT FORMAT (JSON ONLY):
{
  "slides": [
    {
      "title": "Slide title",
      "points": ["Point 1","Point 2","Point 3"],
      "outline" : "Brief explanation of slide content"
    }
  ]
}`;

const FULL_SLIDES_PROMPT = `You are a professional PowerPoint presentation designer.

Topic: {userInputPrompt}
Design Style: {styleName}
Style Guide: {designGuide}

Slide outline to expand:
{outlineJson}

For EACH slide choose the best layout and enrich with visuals:
- "text"        → pure content slide (intro, conclusion, concept explanation)
- "image-right" → topic benefits from a supporting photo; provide imageKeyword
- "chart"       → slide has statistics, comparisons, growth, percentages, rankings → provide chartType + realistic chartData

Rules:
- At least 2 slides must use "chart" layout with numeric data
- At least 2 slides must use "image-right" layout
- chartData must have realistic, contextually relevant numbers
- imageKeyword must be a 1-3 word English phrase suitable for a stock photo search

Return ONLY valid JSON (no markdown, no code fences):
{
  "slides": [
    {
      "slideNumber": 1,
      "title": "Slide title",
      "headline": "Powerful one-liner subtitle",
      "bulletPoints": ["Point 1", "Point 2", "Point 3"],
      "speakerNotes": "Presenter talking points",
      "slideLayout": "text",
      "imageKeyword": "",
      "chartType": null,
      "chartData": null
    },
    {
      "slideNumber": 2,
      "title": "Data Slide Example",
      "headline": "Key statistics at a glance",
      "bulletPoints": ["Trend 1", "Trend 2"],
      "speakerNotes": "Walk audience through the chart",
      "slideLayout": "chart",
      "imageKeyword": "",
      "chartType": "bar",
      "chartData": {
        "labels": ["2021", "2022", "2023", "2024"],
        "datasets": [{ "name": "Growth %", "values": [12, 28, 45, 67] }]
      }
    }
  ]
}`;


// ─── Types ────────────────────────────────────────────────────────────────────
type SlideRange = "4to6" | "6to8" | "8to10" | "10to12";

function Outline() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [generatingSlides, setGeneratingSlides] = useState(false);
  const [outline, setOutline] = useState<OutlineSlide[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [projectData, setProjectData] = useState<ProjectDetail | null>(null);

  useEffect(() => {
    projectId && getProjectDetail();
  }, [projectId]);

  const getProjectDetail = async () => {
    const docRef = doc(firebaseDb, 'projects', projectId ?? '');
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return;

    const data = docSnap.data() as ProjectDetail;
    setProjectData(data);
    if (data.selectedStyle) setSelectedStyle(data.selectedStyle);
    if (data.outline && data.outline.length > 0) {
      setOutline(data.outline);
    } else {
      GenerateSlidesOutline(data);
    }
  };

  const slideRangeMap: Record<SlideRange, string> = {
    "4to6": "4 to 6",
    "6to8": "6 to 8",
    "8to10": "8 to 10",
    "10to12": "10 to 12",
  };

  // ─── Step 1: Generate outline ───────────────────────────────────────────────
  const GenerateSlidesOutline = async (data: ProjectDetail) => {
    setLoading(true);
    const prompt = OUTLINE_PROMPT
      .replace('{userInputPrompt}', data.userInputPrompt)
      .replace('{noOfSlides}', slideRangeMap[data.noOfSlides as SlideRange]);

    try {
      const result = await GeminiAiModel.generateContent(prompt);
      const cleaned = result.response.text().replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      const slides: OutlineSlide[] = parsed.slides ?? [];
      setOutline(slides);
      await updateDoc(doc(firebaseDb, 'projects', data.projectId), { outline: slides });
    } catch (err) {
      console.error('Outline generation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  // ─── Step 2: Generate full slide content ────────────────────────────────────
  const GenerateFullSlides = async () => {
    if (!projectData || outline.length === 0) return;
    setGeneratingSlides(true);

    const styleInfo = Design_Styles.find(s => s.styleName === selectedStyle) ?? Design_Styles[0];

    const prompt = FULL_SLIDES_PROMPT
      .replace('{userInputPrompt}', projectData.userInputPrompt)
      .replace('{styleName}', styleInfo.styleName)
      .replace('{designGuide}', styleInfo.designGuide)
      .replace('{outlineJson}', JSON.stringify(outline, null, 2));

    try {
      const result = await GeminiAiModel.generateContent(prompt);
      const cleaned = result.response.text().replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      const fullSlides: FullSlide[] = parsed.slides ?? [];

      await updateDoc(doc(firebaseDb, 'projects', projectData.projectId), {
        fullSlides,
        selectedStyle,
      });

      navigate(`/workspace/project/${projectId}/slides`);
    } catch (err) {
      console.error('Full slide generation failed:', err);
      alert('Failed to generate slide content. Please try again.');
    } finally {
      setGeneratingSlides(false);
    }
  };

  const handleStyleChange = async (styleName: string) => {
    setSelectedStyle(styleName);
    if (projectId) {
      await updateDoc(doc(firebaseDb, 'projects', projectId), { selectedStyle: styleName });
    }
  };

  return (
    <div className="flex justify-center mt-20 pb-20">
      <div className="max-w-3xl w-full px-4">
        <h2 className="font-bold text-2xl">Settings and Slides Outline</h2>

        <SlidesStyle selectedStyle={selectedStyle} onStyleChange={handleStyleChange} />
        <OutlineSection loading={loading} outline={outline} />

        {/* Generate Slides CTA */}
        {outline.length > 0 && !loading && (
          <div className="mt-8 flex flex-col items-center gap-3">
            {!selectedStyle && (
              <p className="text-sm text-amber-600 font-medium">
                ⚠️ Select a slide style above before generating slides.
              </p>
            )}
            <Button
              size="lg"
              className="gap-2 px-8 text-base"
              disabled={!selectedStyle || generatingSlides}
              onClick={GenerateFullSlides}
            >
              {generatingSlides
                ? <><Loader2 className="w-5 h-5 animate-spin" /> Generating Slides…</>
                : <><Sparkles className="w-5 h-5" /> Generate Slides →</>
              }
            </Button>
            <p className="text-xs text-muted-foreground">
              AI will generate full content for each slide. You can edit everything afterwards.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Outline;
