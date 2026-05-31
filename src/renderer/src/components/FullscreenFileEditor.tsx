import { useEffect } from 'react';
import { CodeEditor } from './CodeEditor';
import { useStore } from '@/store/store';

/**
 * Full-window overlay editor. The absolute file path is in store; we derive
 * root + rel by trying registered repos / agent cwds.
 */
export function FullscreenFileEditor() {
  const fullscreenFilePath = useStore(s => s.fullscreenFilePath);
  const setFullscreenFile = useStore(s => s.setFullscreenFile);
  const agents = useStore(s => s.agents);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); setFullscreenFile(null); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setFullscreenFile]);

  if (!fullscreenFilePath) return null;

  // Find the agent cwd that's a prefix of this path. Falls back to using the
  // file's parent dir as the root so we can still read it.
  const matchedAgent = agents.find(a => fullscreenFilePath.startsWith(a.cwd + '/') || fullscreenFilePath === a.cwd);
  const root = matchedAgent?.cwd ?? fullscreenFilePath.replace(/\/[^/]+$/, '');
  const rel = matchedAgent
    ? fullscreenFilePath.slice(matchedAgent.cwd.length + 1)
    : fullscreenFilePath.split('/').pop() ?? fullscreenFilePath;

  const copyPath = () => {
    navigator.clipboard.writeText(fullscreenFilePath).catch(() => { /* noop */ });
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'var(--cth-cream-100)',
      zIndex: 280,
      display: 'flex', flexDirection: 'column',
      paddingTop: 36
    }}>
      <div
        className="cth-titlebar-drag"
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 36,
          background: 'linear-gradient(180deg, var(--cth-cream-100) 0%, var(--cth-cream-200) 100%)',
          borderBottom: '2px solid var(--cth-ink-900)',
          display: 'flex', alignItems: 'center',
          paddingLeft: 96, paddingRight: 12, gap: 12,
          userSelect: 'none',
          fontFamily: 'var(--cth-font-display)', fontSize: 12, lineHeight: '20px',
          color: 'var(--cth-ink-900)'
        }}
      >
        MUNDER DIFFLIN · FILE
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        <CodeEditor
          root={root}
          filePath={rel}
          fullscreen
          onToggleFullscreen={() => setFullscreenFile(null)}
          onCopyPath={copyPath}
        />
      </div>
    </div>
  );
}
