import { useStore } from '@/store/store';
import { SpritePortrait } from './SpritePortrait';
import { PixelBadge } from './PixelBadge';
import {
  useFleetTelemetry,
  type AgentUsageSample, type BreakerState
} from '@/hooks/useTelemetry';

/**
 * FLEET — the control-room overview (#7B.1). One cell per live agent: sprite,
 * status, live cost, a tokens-burned sparkline, the last tool, and a budget
 * meter normalized to the priciest agent and colored by headroom. A circuit
 * breaker (Lane A #6) flips the row to a coral ⚠ state. All styling derives from
 * the design tokens — no new palette.
 */
export function FleetGrid() {
  const agents = useStore((s) => s.agents);
  const live = agents.filter((a) => a.ptyId);
  const { samples, spark, rate, lastTool, breakers } = useFleetTelemetry();

  const maxCost = Math.max(0.0001, ...live.map((a) => samples[a.id]?.usd ?? 0));

  // Fleet totals.
  let sumCost = 0;
  let sumInput = 0;
  let sumCacheRead = 0;
  let sumRate = 0;
  for (const a of live) {
    const s = samples[a.id];
    if (s) { sumCost += s.usd; sumInput += s.input + s.cacheRead + s.cacheCreation; sumCacheRead += s.cacheRead; }
    sumRate += rate[a.id] ?? 0;
  }
  const fleetCachePct = sumInput > 0 ? Math.round((sumCacheRead / sumInput) * 100) : 0;

  if (live.length === 0) {
    return (
      <div style={{ fontSize: 12, color: 'var(--cth-ink-500)', padding: 8 }}>
        No live agents. Spawn one and its telemetry appears here in real time.
      </div>
    );
  }

  return (
    <div>
      <div style={{
        display: 'grid', gridTemplateColumns: '24px 1fr auto', gap: 0,
        boxShadow: 'inset 0 0 0 1px var(--cth-ink-300)', background: 'var(--cth-paper-100)'
      }}>
        {live.map((a) => (
          <FleetCell
            key={a.id}
            name={a.name}
            character={a.character}
            status={a.status}
            sample={samples[a.id]}
            maxCost={maxCost}
            spark={spark[a.id] ?? []}
            tool={lastTool[a.id]}
            breaker={breakers[a.id]}
          />
        ))}
      </div>
      {/* Fleet summary band */}
      <div style={{
        display: 'flex', gap: 14, marginTop: 8, padding: '6px 8px',
        background: 'var(--cth-cream-200)', boxShadow: 'inset 0 0 0 1px var(--cth-ink-700)',
        fontFamily: 'var(--cth-font-mono)', fontSize: 11, color: 'var(--cth-ink-900)', flexWrap: 'wrap'
      }}>
        <span>Σ <strong>${sumCost.toFixed(2)}</strong></span>
        <span style={{ color: 'var(--cth-ink-700)' }}>inputs {fmtTokens(sumInput)} (cache {fleetCachePct}%)</span>
        <span style={{ color: 'var(--cth-ink-700)' }}>{Math.round(sumRate).toLocaleString()} tok/min</span>
      </div>
    </div>
  );
}

function FleetCell({ name, character, status, sample, maxCost, spark, tool, breaker }: {
  name: string;
  character: Parameters<typeof SpritePortrait>[0]['character'];
  status: Parameters<typeof PixelBadge>[0]['status'];
  sample?: AgentUsageSample;
  maxCost: number;
  spark: number[];
  tool?: string;
  breaker?: BreakerState;
}) {
  const cost = sample?.usd ?? 0;
  const pct = Math.min(100, Math.round((cost / maxCost) * 100));
  const armed = breaker && (breaker.level === 'constrained' || breaker.level === 'stopped');
  const meterColor = armed
    ? 'var(--cth-coral)'
    : pct >= 90 ? 'var(--cth-coral)' : pct >= 60 ? 'var(--cth-lemon)' : 'var(--cth-mint)';

  const cellBg = armed ? 'var(--cth-coral-light)' : 'transparent';
  const rowBorder = 'inset 0 -1px 0 var(--cth-ink-300)';

  return (
    <>
      {/* sprite */}
      <div style={{ boxShadow: rowBorder, background: cellBg, display: 'flex', alignItems: 'center', justifyContent: 'center', height: 30, overflow: 'hidden' }}>
        <SpritePortrait character={character} scale={1} />
      </div>
      {/* name + status + sparkline + tool */}
      <div style={{ boxShadow: rowBorder, background: cellBg, display: 'flex', alignItems: 'center', gap: 6, padding: '0 8px', minWidth: 0 }}>
        <span style={{ fontSize: 12, color: 'var(--cth-ink-900)', width: 64, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</span>
        <PixelBadge status={armed ? 'looping' : status} />
        <Sparkline series={spark} />
        {tool && (
          <span style={{
            fontSize: 10, lineHeight: '14px', padding: '0 5px', flexShrink: 0,
            background: 'var(--cth-paper-200)', boxShadow: 'inset 0 0 0 1px var(--cth-ink-300)', color: 'var(--cth-ink-700)'
          }}>{tool}</span>
        )}
        {armed && <span title={breaker?.reason} style={{ color: 'var(--cth-coral)', fontSize: 12 }}>⚠</span>}
      </div>
      {/* cost + budget meter */}
      <div style={{ boxShadow: rowBorder, background: cellBg, display: 'flex', alignItems: 'center', gap: 6, padding: '0 8px' }}>
        <span style={{ fontFamily: 'var(--cth-font-mono)', fontSize: 11, color: 'var(--cth-ink-900)', width: 52, textAlign: 'right' }}>${cost.toFixed(2)}</span>
        <div style={{ width: 70, height: 8, background: 'var(--cth-cream-200)', boxShadow: 'inset 0 0 0 1px var(--cth-ink-300)' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: meterColor }} />
        </div>
        <span style={{ fontSize: 10, color: 'var(--cth-ink-500)', width: 28, textAlign: 'right' }}>{pct}%</span>
      </div>
    </>
  );
}

/** Block-character sparkline — matches the neo-brutalist mono aesthetic. */
function Sparkline({ series }: { series: number[] }) {
  const blocks = '▁▂▃▄▅▆▇█';
  const max = Math.max(1, ...series);
  const text = series.length
    ? series.map((v) => blocks[Math.min(blocks.length - 1, Math.round((v / max) * (blocks.length - 1)))]).join('')
    : '▁▁▁▁▁▁';
  return (
    <span style={{ flex: 1, fontFamily: 'var(--cth-font-mono)', fontSize: 12, lineHeight: '12px', color: 'var(--cth-sky)', whiteSpace: 'nowrap', overflow: 'hidden', minWidth: 0 }}>
      {text}
    </span>
  );
}

function fmtTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}
