import PptxGenJS from 'pptxgenjs';
import type { FullSlide } from './types';
import { Design_Styles } from '../components/ui/custom/SlidesStyle';
import { fetchPexelsImageBase64 } from './pexels';

const strip = (hex: string) => hex.replace('#', '');
const CHART_COLORS = ['0A66C2', '7C3AED', '16A34A', 'F97316', 'DC2626', '0D9488', 'D4AF37'];


export const exportToPptx = async (
  slides: FullSlide[],
  selectedStyle: string,
  projectTitle: string
): Promise<void> => {
  const styleData = Design_Styles.find((s) => s.styleName === selectedStyle) ?? Design_Styles[0];
  const c = styleData.colors;

  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = 'AI PPT Maker';
  pptx.title = projectTitle;

  for (let idx = 0; idx < slides.length; idx++) {
    const sd = slides[idx];
    const slide = pptx.addSlide();
    const layout = sd.slideLayout ?? 'text';

    const title = sd.editedTitle ?? sd.title;
    const headline = sd.editedHeadline ?? sd.headline;
    const bullets = sd.editedBulletPoints ?? sd.bulletPoints ?? [];

    // ── Background ────────────────────────────────────────────────────────────
    slide.background = { color: strip(c.background) };

    // ── Top accent bar ────────────────────────────────────────────────────────
    slide.addShape('rect' as any, {
      x: 0, y: 0, w: '100%', h: 0.08,
      fill: { color: strip(c.primary) },
      line: { type: 'none' },
    });

    // ─────────────────────────────────────────────────────────────────────────
    // CHART layout
    // ─────────────────────────────────────────────────────────────────────────
    if (layout === 'chart' && sd.chartType && sd.chartData) {
      slide.addText(title, { x: 0.4, y: 0.2, w: 9.2, h: 0.85, fontSize: 24, bold: true, color: strip(c.primary), fontFace: 'Calibri' });
      if (headline) slide.addText(headline, { x: 0.4, y: 1.1, w: 9.2, h: 0.45, fontSize: 13, italic: true, color: strip(c.secondary), fontFace: 'Calibri' });

      const pptxChartData = sd.chartData.datasets.map((ds) => ({
        name: ds.name,
        labels: sd.chartData!.labels,
        values: ds.values,
      }));

      const chartTypeMap: Record<string, string> = {
        bar: 'bar', line: 'line', pie: 'pie', donut: 'doughnut',
      };

      (slide as any).addChart(chartTypeMap[sd.chartType] ?? 'bar', pptxChartData, {
        x: 0.4, y: 1.65, w: 9.2, h: 3.3,
        chartColors: CHART_COLORS,
        showLegend: true,
        legendPos: 'b',
        showValue: sd.chartType === 'bar',
        dataLabelFontSize: 10,
      });

    // ─────────────────────────────────────────────────────────────────────────
    // IMAGE layouts (right / left)
    // ─────────────────────────────────────────────────────────────────────────
    } else if ((layout === 'image-right' || layout === 'image-left') && sd.imageKeyword) {
      const isRight = layout === 'image-right';
      const txtX = isRight ? 0.4 : 4.4;
      const txtW = 4.6;
      const imgX = isRight ? 5.3 : 0.2;
      const imgW = 4.3;
      const imgH = 4.0;

      // Text
      slide.addText(title, { x: txtX, y: 0.2, w: txtW, h: 0.85, fontSize: 22, bold: true, color: strip(c.primary), fontFace: 'Calibri' });
      if (headline) slide.addText(headline, { x: txtX, y: 1.1, w: txtW, h: 0.4, fontSize: 12, italic: true, color: strip(c.secondary), fontFace: 'Calibri' });
      if (bullets.length) {
        slide.addText(
          bullets.map((b) => ({ text: b, options: { bullet: { type: 'bullet' } } })),
          { x: txtX, y: 1.6, w: txtW, h: 3.1, fontSize: 13, color: strip(c.secondary), fontFace: 'Calibri', lineSpacingMultiple: 1.35 }
        );
      }

      // Image — fetch from Pexels, fall back to gradient rect
      const imgB64 = await fetchPexelsImageBase64(sd.imageKeyword);
      if (imgB64) {
        slide.addImage({ data: imgB64, x: imgX, y: 0.85, w: imgW, h: imgH });
      } else {
        slide.addShape('rect' as any, {
          x: imgX, y: 0.85, w: imgW, h: imgH,
          fill: { color: strip(c.primary) },
          line: { type: 'none' },
        });
        slide.addText(`📸 ${sd.imageKeyword}`, {
          x: imgX, y: 0.85 + imgH / 2 - 0.3, w: imgW, h: 0.6,
          fontSize: 13, bold: true, color: 'FFFFFF', align: 'center',
        });
      }

    // ─────────────────────────────────────────────────────────────────────────
    // TEXT layout (default)
    // ─────────────────────────────────────────────────────────────────────────
    } else {
      slide.addText(title, { x: 0.4, y: 0.2, w: 9.2, h: 0.95, fontSize: 26, bold: true, color: strip(c.primary), fontFace: 'Calibri' });
      if (headline) slide.addText(headline, { x: 0.4, y: 1.2, w: 9.2, h: 0.45, fontSize: 14, italic: true, color: strip(c.secondary), fontFace: 'Calibri' });
      if (bullets.length) {
        slide.addText(
          bullets.map((b) => ({ text: b, options: { bullet: { type: 'bullet' } } })),
          { x: 0.4, y: 1.75, w: 9.2, h: 3.2, fontSize: 14, color: strip(c.secondary), fontFace: 'Calibri', lineSpacingMultiple: 1.45 }
        );
      }
    }

    // ── Slide number ──────────────────────────────────────────────────────────
    slide.addText(`${idx + 1}`, { x: 9.3, y: 0.12, w: 0.5, h: 0.35, fontSize: 10, color: strip(c.secondary) + '88', align: 'right' });

    // ── Footer ────────────────────────────────────────────────────────────────
    slide.addShape('rect' as any, {
      x: 0, y: 5.2, w: '100%', h: 0.3,
      fill: { color: strip(c.primary) + '22' },
      line: { type: 'none' },
    });
    slide.addText('AI PPT Maker', { x: 0.4, y: 5.22, w: 4, h: 0.26, fontSize: 9, color: strip(c.secondary) + '88', fontFace: 'Calibri' });
  }

  await pptx.writeFile({ fileName: `${projectTitle.slice(0, 50)}.pptx` });
};
