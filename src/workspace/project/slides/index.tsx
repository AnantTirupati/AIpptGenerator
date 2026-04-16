import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { firebaseDb } from '../../../../config/FirebaseConfig';
import type { ChartType, FullSlide, ProjectDetail, SlideLayout } from '../../../lib/types';
import SlideCanvas, { FONT_OPTIONS } from '../../../components/ui/custom/SlideCanvas';
import Header from '../../../components/ui/custom/Header';
import { Button } from '../../../components/ui/button';
import { Textarea } from '../../../components/ui/textarea';
import { Input } from '../../../components/ui/input';
import { exportToPptx } from '../../../lib/exportPptx';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../../../components/ui/select';
import {
  ArrowLeft, Download, Loader2, ChevronLeft, ChevronRight,
  PlusCircle, Trash2, FileText, ImageIcon, BarChart2, Type, Palette,
} from 'lucide-react';

// ─── Thumbnail scale ───────────────────────────────────────────────────────────
const THUMB_SCALE = 0.195; // 960 * 0.195 ≈ 187px wide
const THUMB_W = Math.round(960 * THUMB_SCALE);
const THUMB_H = Math.round(540 * THUMB_SCALE);

function SlidesPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [slides, setSlides] = useState<FullSlide[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [saving, setSaving] = useState(false);

  // debounce ref for auto-save
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Canvas scale (fit to available width) ──────────────────────────────────
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [canvasScale, setCanvasScale] = useState(0.65);

  useEffect(() => {
    const obs = new ResizeObserver((entries) => {
      for (const e of entries) {
        const w = e.contentRect.width;
        setCanvasScale(Math.min(0.85, Math.max(0.3, (w - 40) / 960)));
      }
    });
    if (canvasContainerRef.current) obs.observe(canvasContainerRef.current);
    return () => obs.disconnect();
  }, []);

  // ─── Load project ────────────────────────────────────────────────────────────
  useEffect(() => {
    projectId && loadProject();
  }, [projectId]);

  const loadProject = async () => {
    const snap = await getDoc(doc(firebaseDb, 'projects', projectId!));
    if (!snap.exists()) return;
    const data = snap.data() as ProjectDetail;
    setProject(data);
    setSlides(data.fullSlides ?? []);
  };

  // ─── Persist to Firestore ────────────────────────────────────────────────────
  const persistSlides = useCallback((updated: FullSlide[]) => {
    if (!projectId) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaving(true);
      await updateDoc(doc(firebaseDb, 'projects', projectId), { fullSlides: updated });
      setSaving(false);
    }, 600);
  }, [projectId]);

  // ─── Edit helpers ────────────────────────────────────────────────────────────
  const updateSlide = (idx: number, patch: Partial<FullSlide>) => {
    setSlides((prev) => {
      const next = prev.map((s, i) => (i === idx ? { ...s, ...patch } : s));
      persistSlides(next);
      return next;
    });
  };

  const addSlide = () => {
    const newSlide: FullSlide = {
      slideNumber: slides.length + 1,
      title: 'New Slide',
      headline: 'Add your subtitle here',
      bulletPoints: ['Key point 1', 'Key point 2', 'Key point 3'],
      speakerNotes: '',
      imageKeyword: '',
    };
    const updated = [...slides, newSlide];
    setSlides(updated);
    persistSlides(updated);
    setActiveIdx(updated.length - 1);
  };

  const deleteSlide = (idx: number) => {
    if (slides.length <= 1) return;
    const updated = slides.filter((_, i) => i !== idx);
    setSlides(updated);
    persistSlides(updated);
    setActiveIdx(Math.min(idx, updated.length - 1));
  };

  // ─── PPT Export ──────────────────────────────────────────────────────────────
  const handleExport = async () => {
    if (!project) return;
    setExporting(true);
    try {
      await exportToPptx(slides, project.selectedStyle ?? '', project.userInputPrompt);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const activeSlide = slides[activeIdx];

  if (!project) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin w-8 h-8 text-primary" />
      </div>
    );
  }

  if (slides.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <FileText className="w-12 h-12 text-muted-foreground" />
        <h2 className="text-xl font-bold">No slides generated yet</h2>
        <p className="text-muted-foreground">Please go back to the outline page and click "Generate Slides".</p>
        <Button onClick={() => navigate(`/workspace/project/${projectId}/outline`)}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Outline
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <Header />

      {/* ── Top action bar ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 py-2 border-b bg-card shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/workspace/project/${projectId}/outline`)}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Outline
          </Button>
          <div>
            <span className="font-semibold text-sm line-clamp-1 max-w-[320px]">
              {project.userInputPrompt}
            </span>
            <span className="text-xs text-muted-foreground">
              {slides.length} slide{slides.length !== 1 ? 's' : ''} ·{' '}
              {project.selectedStyle ?? 'Default Style'}
              {saving && ' · Saving…'}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExport} disabled={exporting}>
            {exporting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Download className="w-4 h-4 mr-2" />}
            Export .pptx
          </Button>
        </div>
      </div>

      {/* ── Main 3-column layout ───────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left: slide thumbnails */}
        <aside className="w-[220px] shrink-0 border-r bg-muted/30 overflow-y-auto flex flex-col gap-2 p-3">
          {slides.map((slide, i) => (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              className={`relative rounded-xl overflow-hidden border-2 transition-all focus:outline-none
                ${i === activeIdx ? 'border-primary shadow-md' : 'border-transparent hover:border-muted-foreground/30'}`}
              style={{ width: THUMB_W, height: THUMB_H + 28 }}
            >
              {/* Thumbnail */}
              <div style={{ width: THUMB_W, height: THUMB_H, overflow: 'hidden', position: 'relative' }}>
                <SlideCanvas
                  slide={slide}
                  slideIndex={i}
                  selectedStyle={project.selectedStyle ?? ''}
                  scale={THUMB_SCALE}
                  isActive={i === activeIdx}
                />
              </div>
              {/* Label */}
              <div className="text-[10px] text-muted-foreground text-center py-1 font-medium truncate px-1">
                {i + 1}. {(slide.editedTitle ?? slide.title).slice(0, 24)}
              </div>
              {/* Delete button */}
              {slides.length > 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); deleteSlide(i); }}
                  className="absolute top-1 right-1 w-5 h-5 bg-destructive/80 text-white rounded-full hidden group-hover:flex items-center justify-center text-[10px]"
                  title="Delete slide"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </button>
          ))}
          {/* Add slide button */}
          <button
            onClick={addSlide}
            className="flex items-center gap-1 justify-center rounded-xl border-2 border-dashed border-muted-foreground/30
              hover:border-primary hover:text-primary transition-all text-xs text-muted-foreground py-3"
            style={{ width: THUMB_W }}
          >
            <PlusCircle className="w-3 h-3" /> Add Slide
          </button>
        </aside>

        {/* Center: canvas preview */}
        <main
          ref={canvasContainerRef}
          className="flex-1 overflow-auto flex flex-col items-center justify-start bg-muted/10 p-6 gap-4"
        >
          {/* Prev/Next navigation */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground select-none">
            <button
              onClick={() => setActiveIdx((i) => Math.max(0, i - 1))}
              disabled={activeIdx === 0}
              className="rounded-full p-1 hover:bg-muted disabled:opacity-30"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span>Slide {activeIdx + 1} of {slides.length}</span>
            <button
              onClick={() => setActiveIdx((i) => Math.min(slides.length - 1, i + 1))}
              disabled={activeIdx === slides.length - 1}
              className="rounded-full p-1 hover:bg-muted disabled:opacity-30"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Canvas wrapper — sized to scale */}
          {activeSlide && (
            <div
              style={{
                width: Math.round(960 * canvasScale),
                height: Math.round(540 * canvasScale),
                flexShrink: 0,
              }}
            >
              <SlideCanvas
                slide={activeSlide}
                slideIndex={activeIdx}
                selectedStyle={project.selectedStyle ?? ''}
                scale={canvasScale}
                isActive
              />
            </div>
          )}
        </main>

        {/* Right: edit panel */}
        <aside className="w-[300px] shrink-0 border-l bg-card overflow-y-auto p-4 flex flex-col gap-4">
          <h3 className="font-bold text-sm">Edit Slide {activeIdx + 1}</h3>

          {activeSlide && (
            <>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Title</label>
                <Input
                  value={activeSlide.editedTitle ?? activeSlide.title}
                  onChange={(e) => updateSlide(activeIdx, { editedTitle: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Headline / Subtitle</label>
                <Input
                  value={activeSlide.editedHeadline ?? activeSlide.headline}
                  onChange={(e) => updateSlide(activeIdx, { editedHeadline: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Bullet Points
                </label>
                {(activeSlide.editedBulletPoints ?? activeSlide.bulletPoints ?? []).map((bp, bpIdx) => (
                  <div key={bpIdx} className="flex gap-2 items-start">
                    <span className="text-primary text-xs mt-2 font-bold shrink-0">•</span>
                    <Textarea
                      rows={2}
                      className="resize-none text-sm"
                      value={bp}
                      onChange={(e) => {
                        const updated = [...(activeSlide.editedBulletPoints ?? activeSlide.bulletPoints)];
                        updated[bpIdx] = e.target.value;
                        updateSlide(activeIdx, { editedBulletPoints: updated });
                      }}
                    />
                    <button
                      onClick={() => {
                        const updated = (activeSlide.editedBulletPoints ?? activeSlide.bulletPoints).filter((_, i) => i !== bpIdx);
                        updateSlide(activeIdx, { editedBulletPoints: updated });
                      }}
                      className="text-destructive hover:opacity-70 mt-2 shrink-0"
                      title="Remove bullet"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => {
                    const updated = [...(activeSlide.editedBulletPoints ?? activeSlide.bulletPoints), 'New point'];
                    updateSlide(activeIdx, { editedBulletPoints: updated });
                  }}
                >
                  <PlusCircle className="w-3 h-3 mr-1" /> Add Point
                </Button>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Speaker Notes</label>
                <Textarea
                  rows={4}
                  className="resize-none text-sm"
                  placeholder="Notes for presenting this slide…"
                  value={activeSlide.editedSpeakerNotes ?? activeSlide.speakerNotes}
                  onChange={(e) => updateSlide(activeIdx, { editedSpeakerNotes: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                  <ImageIcon className="w-3 h-3" /> Slide Layout
                </label>
                <Select
                  value={activeSlide.slideLayout ?? 'text'}
                  onValueChange={(v) => updateSlide(activeIdx, { slideLayout: v as SlideLayout })}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">📝 Text Only</SelectItem>
                    <SelectItem value="image-right">🖼 Image Right</SelectItem>
                    <SelectItem value="image-left">🖼 Image Left</SelectItem>
                    <SelectItem value="chart">📊 Chart</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Image keyword — shown for image layouts */}
              {(activeSlide.slideLayout === 'image-right' || activeSlide.slideLayout === 'image-left') && (
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Image Keyword</label>
                  <Input
                    placeholder="e.g. artificial intelligence"
                    value={activeSlide.imageKeyword}
                    onChange={(e) => updateSlide(activeIdx, { imageKeyword: e.target.value })}
                  />
                  <p className="text-[10px] text-muted-foreground">Used to fetch a relevant Unsplash photo.</p>
                </div>
              )}

              {/* Chart type — shown for chart layout */}
              {activeSlide.slideLayout === 'chart' && (
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                    <BarChart2 className="w-3 h-3" /> Chart Type
                  </label>
                  <Select
                    value={activeSlide.chartType ?? 'bar'}
                    onValueChange={(v) => updateSlide(activeIdx, { chartType: v as ChartType })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bar">📊 Bar Chart</SelectItem>
                      <SelectItem value="line">📈 Line Chart</SelectItem>
                      <SelectItem value="pie">🥧 Pie Chart</SelectItem>
                      <SelectItem value="donut">🍩 Donut Chart</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* ── Typography & Colours ─────────────────────────────────── */}
              <div className="border-t pt-3 mt-1">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1 mb-3">
                  <Type className="w-3 h-3" /> Typography &amp; Colours
                </p>

                {/* Font Family */}
                <div className="space-y-1 mb-3">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Font Family</label>
                  <Select
                    value={activeSlide.editedFontFamily ?? FONT_OPTIONS[0].value}
                    onValueChange={(v) => updateSlide(activeIdx, { editedFontFamily: v })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FONT_OPTIONS.map((f) => (
                        <SelectItem key={f.value} value={f.value} style={{ fontFamily: f.value }}>
                          {f.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Title Color */}
                <div className="space-y-1 mb-3">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                    <Palette className="w-3 h-3" /> Title Colour
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={activeSlide.editedTitleColor ?? '#0A66C2'}
                      onChange={(e) => updateSlide(activeIdx, { editedTitleColor: e.target.value })}
                      className="w-9 h-9 rounded-lg border cursor-pointer p-0.5"
                      title="Pick title colour"
                    />
                    <Input
                      value={activeSlide.editedTitleColor ?? ''}
                      placeholder="#0A66C2"
                      className="text-xs h-8 font-mono"
                      onChange={(e) => updateSlide(activeIdx, { editedTitleColor: e.target.value })}
                    />
                    <button
                      className="text-xs text-muted-foreground hover:text-foreground whitespace-nowrap"
                      onClick={() => updateSlide(activeIdx, { editedTitleColor: undefined })}
                      title="Reset to style default"
                    >
                      ↺
                    </button>
                  </div>
                </div>

                {/* Body Color */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                    <Palette className="w-3 h-3" /> Body Colour
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={activeSlide.editedBodyColor ?? '#1C1C1C'}
                      onChange={(e) => updateSlide(activeIdx, { editedBodyColor: e.target.value })}
                      className="w-9 h-9 rounded-lg border cursor-pointer p-0.5"
                      title="Pick body text colour"
                    />
                    <Input
                      value={activeSlide.editedBodyColor ?? ''}
                      placeholder="#1C1C1C"
                      className="text-xs h-8 font-mono"
                      onChange={(e) => updateSlide(activeIdx, { editedBodyColor: e.target.value })}
                    />
                    <button
                      className="text-xs text-muted-foreground hover:text-foreground whitespace-nowrap"
                      onClick={() => updateSlide(activeIdx, { editedBodyColor: undefined })}
                      title="Reset to style default"
                    >
                      ↺
                    </button>
                  </div>
                </div>
              </div>

              {/* Delete slide */}
              {slides.length > 1 && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => deleteSlide(activeIdx)}
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete This Slide
                </Button>
              )}
            </>
          )}
        </aside>
      </div>
    </div>
  );
}

export default SlidesPage;
