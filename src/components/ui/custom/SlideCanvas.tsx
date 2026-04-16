import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  PieChart, Pie, Cell,
  LineChart, Line,
} from 'recharts';
import type { FullSlide } from '../../../lib/types';
import { Design_Styles } from './SlidesStyle';
import { fetchPexelsImageUrl } from '../../../lib/pexels';

const PIE_COLORS = ['#0A66C2', '#7C3AED', '#16A34A', '#F97316', '#DC2626', '#0D9488', '#D4AF37'];

export const FONT_OPTIONS = [
  { label: 'Inter',            value: "'Inter', sans-serif" },
  { label: 'Roboto',           value: "'Roboto', sans-serif" },
  { label: 'Poppins',          value: "'Poppins', sans-serif" },
  { label: 'Montserrat',       value: "'Montserrat', sans-serif" },
  { label: 'Playfair Display', value: "'Playfair Display', serif" },
  { label: 'Lato',             value: "'Lato', sans-serif" },
  { label: 'Georgia',          value: 'Georgia, serif' },
];

// ─── Async Pexels image with loading state ─────────────────────────────────────
function PexelsImage({
  keyword, fallbackGradient,
}: { keyword: string; fallbackGradient: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!keyword) return;
    setUrl(null);
    setFailed(false);
    fetchPexelsImageUrl(keyword).then((u) => {
      if (u) setUrl(u);
      else setFailed(true);
    });
  }, [keyword]);

  const fillStyle: React.CSSProperties = { width: '100%', height: '100%', objectFit: 'cover', display: 'block' };

  if (url) return <img src={url} alt={keyword} style={fillStyle} />;

  // Loading / failed state — show gradient with label
  return (
    <div style={{
      ...fillStyle,
      background: fallbackGradient,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 6,
    }}>
      {!failed && (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.6 }}>
          <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" strokeDasharray="40" strokeDashoffset="15">
            <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite" />
          </circle>
        </svg>
      )}
      <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11, textAlign: 'center', padding: '0 8px' }}>
        {failed ? `📸 ${keyword}` : 'Loading image…'}
      </span>
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────────
type Props = {
  slide: FullSlide;
  slideIndex: number;
  selectedStyle: string;
  scale?: number;
  isActive?: boolean;
};

function SlideCanvas({ slide, slideIndex, selectedStyle, scale = 1, isActive = false }: Props) {
  const styleData = Design_Styles.find((s) => s.styleName === selectedStyle) ?? Design_Styles[0];
  const c = styleData?.colors ?? {
    primary: '#0A66C2', secondary: '#1C1C1C',
    accent: '#E8F0FE', background: '#FFFFFF',
    gradient: 'linear-gradient(135deg, #0A66C2, #E8F0FE)',
  };

  const fontFamily  = slide.editedFontFamily ?? "'Inter', sans-serif";
  const titleColor  = slide.editedTitleColor  ?? c.primary;
  const bodyColor   = slide.editedBodyColor   ?? c.secondary;

  const title    = slide.editedTitle         ?? slide.title;
  const headline = slide.editedHeadline      ?? slide.headline;
  const bullets  = slide.editedBulletPoints  ?? slide.bulletPoints ?? [];
  const layout   = slide.slideLayout         ?? 'text';
  const keyword  = slide.imageKeyword ?? '';

  // ─── Chart data ──────────────────────────────────────────────────────────────
  const cd = slide.chartData;
  const barLineData = cd
    ? cd.labels.map((label, i) => {
        const entry: Record<string, string | number> = { name: label };
        cd.datasets.forEach((ds) => { entry[ds.name] = ds.values[i] ?? 0; });
        return entry;
      })
    : [];
  const pieData = cd
    ? cd.labels.map((label, i) => ({ name: label, value: cd.datasets[0]?.values[i] ?? 0 }))
    : [];

  const tick = { fontSize: 11, fill: bodyColor, fontFamily };

  const renderChart = () => {
    if (!cd || !slide.chartType) return null;
    const W = 856, H = 245;
    switch (slide.chartType) {
      case 'bar':
        return (
          <BarChart width={W} height={H} data={barLineData} margin={{ top: 8, right: 8, left: -10, bottom: 4 }}>
            <XAxis dataKey="name" tick={tick} />
            <YAxis tick={tick} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 11, fontFamily }} />
            {cd.datasets.map((ds, i) => (
              <Bar key={ds.name} dataKey={ds.name} fill={PIE_COLORS[i % PIE_COLORS.length]} radius={[4, 4, 0, 0]} />
            ))}
          </BarChart>
        );
      case 'line':
        return (
          <LineChart width={W} height={H} data={barLineData} margin={{ top: 8, right: 8, left: -10, bottom: 4 }}>
            <XAxis dataKey="name" tick={tick} />
            <YAxis tick={tick} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 11, fontFamily }} />
            {cd.datasets.map((ds, i) => (
              <Line key={ds.name} type="monotone" dataKey={ds.name}
                stroke={PIE_COLORS[i % PIE_COLORS.length]} strokeWidth={2.5} dot={{ r: 3 }} />
            ))}
          </LineChart>
        );
      case 'pie':
      case 'donut':
        return (
          <PieChart width={W} height={H}>
            <Pie data={pieData} cx={W / 2} cy={H / 2 - 8}
              innerRadius={slide.chartType === 'donut' ? 55 : 0}
              outerRadius={88} paddingAngle={3} dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
            </Pie>
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 11, fontFamily }} />
          </PieChart>
        );
      default: return null;
    }
  };

  const textBlock = (maxBullets?: number, small = false) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, overflow: 'hidden', fontFamily }}>
      <div style={{ fontSize: small ? 26 : 34, fontWeight: 800, color: titleColor, lineHeight: 1.2 }}>{title}</div>
      {headline && (
        <div style={{ fontSize: small ? 13 : 15, color: bodyColor, fontStyle: 'italic', opacity: 0.85 }}>{headline}</div>
      )}
      <div style={{ width: 56, height: 3, borderRadius: 2, background: c.gradient }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {(maxBullets ? bullets.slice(0, maxBullets) : bullets).map((pt, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: titleColor, marginTop: 5, flexShrink: 0 }} />
            <div style={{ fontSize: small ? 13 : 14, color: bodyColor, lineHeight: 1.5 }}>{pt}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const imgPanelStyle: React.CSSProperties = { width: '100%', height: '100%', overflow: 'hidden' };

  return (
    <div style={{
      width: 960, height: 540,
      transform: `scale(${scale})`, transformOrigin: 'top left',
      backgroundColor: c.background, position: 'relative', overflow: 'hidden',
      borderRadius: 10, flexShrink: 0,
      boxShadow: isActive
        ? `0 0 0 3px ${titleColor}, 0 12px 40px rgba(0,0,0,0.25)`
        : '0 4px 24px rgba(0,0,0,0.15)',
      fontFamily,
    }}>
      {/* Top gradient bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 6, background: c.gradient }} />

      {/* Slide number */}
      <div style={{
        position: 'absolute', top: 14, right: 14, width: 28, height: 28, borderRadius: '50%',
        backgroundColor: titleColor + '25', color: titleColor,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, fontWeight: 700, zIndex: 10, fontFamily,
      }}>
        {slideIndex + 1}
      </div>

      {/* ── CHART ─────────────────────────────────────────────────────────────── */}
      {layout === 'chart' && cd && slide.chartType ? (
        <div style={{ position: 'absolute', top: 20, left: 48, right: 48, bottom: 36, display: 'flex', flexDirection: 'column', fontFamily }}>
          <div style={{ fontSize: 26, fontWeight: 800, color: titleColor, lineHeight: 1.2 }}>{title}</div>
          {headline && <div style={{ fontSize: 13, color: bodyColor, fontStyle: 'italic', opacity: 0.85, marginTop: 4 }}>{headline}</div>}
          <div style={{ width: 56, height: 3, borderRadius: 2, background: c.gradient, marginTop: 8 }} />
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 8 }}>
            {renderChart()}
          </div>
        </div>

      /* ── IMAGE RIGHT ──────────────────────────────────────────────────────── */
      ) : layout === 'image-right' && keyword ? (
        <div style={{ position: 'absolute', top: 20, left: 48, right: 0, bottom: 36, display: 'flex' }}>
          <div style={{ flex: 1, paddingRight: 12, overflow: 'hidden' }}>{textBlock()}</div>
          <div style={{ width: 368, flexShrink: 0, ...imgPanelStyle }}>
            <PexelsImage keyword={keyword} fallbackGradient={c.gradient} />
          </div>
        </div>

      /* ── IMAGE LEFT ───────────────────────────────────────────────────────── */
      ) : layout === 'image-left' && keyword ? (
        <div style={{ position: 'absolute', top: 20, left: 0, right: 48, bottom: 36, display: 'flex' }}>
          <div style={{ width: 360, flexShrink: 0, ...imgPanelStyle }}>
            <PexelsImage keyword={keyword} fallbackGradient={c.gradient} />
          </div>
          <div style={{ flex: 1, paddingLeft: 20, overflow: 'hidden' }}>{textBlock()}</div>
        </div>

      /* ── TEXT (default) ───────────────────────────────────────────────────── */
      ) : (
        <div style={{ position: 'absolute', top: 28, left: 48, right: 56, bottom: 44 }}>{textBlock()}</div>
      )}

      {/* Bottom bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 36,
        backgroundColor: titleColor + '14',
        display: 'flex', alignItems: 'center', paddingLeft: 56, paddingRight: 56, justifyContent: 'space-between',
        fontFamily,
      }}>
        <span style={{ fontSize: 10, color: bodyColor + '99', letterSpacing: '0.08em' }}>AI PPT MAKER</span>
        <span style={{ fontSize: 10, color: bodyColor + '66' }}>{styleData.styleName}</span>
      </div>
    </div>
  );
}

export default SlideCanvas;
