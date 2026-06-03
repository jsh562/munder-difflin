import { PixelPanel } from './PixelPanel';
import { PixelBadge, StatusKind } from './PixelBadge';
import { SpritePortrait } from './SpritePortrait';
import { AccentColorName } from '@/design/tokens';
import { OfficeCharacterName } from '@/scene/office/cast';

export interface AgentCardProps {
  name: string;
  character: OfficeCharacterName;
  accent: AccentColorName;
  status: StatusKind;
  project: string;
  action?: string;
  progress?: number; // 0..8 segments filled
  selected?: boolean;
  /** The orchestrator — gets a persistent accent frame + GOD tag so it stands out. */
  isGod?: boolean;
  /** The prep assistant. Same size as every other card (no special sizing). */
  isAssistant?: boolean;
  onClick?: () => void;
}

export function AgentCard({
  name, character, accent, status, project, action, progress = 0, selected, isGod, onClick
}: AgentCardProps) {
  // The god is always framed (stands out from the row); others only when selected.
  const framed = isGod || selected;

  return (
    <button
      onClick={onClick}
      className="cth-titlebar-nodrag"
      style={{
        width: 220, minWidth: 220, height: 96,
        padding: 0, border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left'
      }}
    >
      <PixelPanel
        variant={framed ? 'active' : 'default'}
        accent={framed ? accent : undefined}
        style={{ height: '100%', padding: 8 }}
        noPadding
      >
        <div style={{ display: 'flex', gap: 8, height: '100%' }}>
          <div style={{
            width: 44, height: 64,
            background: `var(--cth-${accent}-light)`,
            boxShadow: 'inset 0 0 0 1px var(--cth-ink-900)',
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center', overflow: 'hidden',
            flexShrink: 0
          }}>
            <SpritePortrait character={character} scale={2} />
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'space-between' }}>
              <span style={{
                fontFamily: 'var(--cth-font-display)',
                fontSize: 'var(--cth-text-display-sm)',
                lineHeight: 'var(--cth-lh-display-sm)',
                color: 'var(--cth-ink-900)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>{name.toUpperCase()}</span>
              <PixelBadge status={status} />
            </div>

            <div style={{
              display: 'flex', alignItems: 'center', gap: 5,
              fontSize: 'var(--cth-text-body-sm)',
              lineHeight: '16px',
              color: 'var(--cth-ink-500)',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
            }}>
              {isGod && (
                <span style={{
                  fontFamily: 'var(--cth-font-display)', fontSize: 8, lineHeight: '12px',
                  background: `var(--cth-${accent})`, color: 'var(--cth-ink-900)',
                  padding: '1px 5px 0', boxShadow: 'inset 0 0 0 1px var(--cth-ink-900)', flexShrink: 0
                }}>GOD</span>
              )}
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{project}</span>
            </div>

            <div style={{
              fontSize: 'var(--cth-text-body-sm)',
              lineHeight: '16px',
              color: 'var(--cth-ink-900)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>{/* The "idle" badge already conveys idle — don't echo "awaiting". */
              (status === 'idle' ? '' : action) || ' '}</div>

            <div style={{ display: 'flex', gap: 2, marginTop: 2 }}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} style={{
                  width: 14, height: 6,
                  background: i < progress
                    ? `var(--cth-${accent})`
                    : 'var(--cth-cream-200)',
                  boxShadow: 'inset 0 0 0 1px var(--cth-ink-900)'
                }}/>
              ))}
            </div>
          </div>
        </div>
      </PixelPanel>
    </button>
  );
}
