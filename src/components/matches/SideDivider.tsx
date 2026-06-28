// SideDivider.tsx
// Separador visual entre Chave A e Chave B dentro de uma fase do mata-mata

interface SideDividerProps {
  side: 'A' | 'B'
}

export function SideDivider({ side }: SideDividerProps) {
  const isA = side === 'A'

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.75rem',
      margin: '1.25rem 0 0.875rem',
    }}>
      <div style={{ height: '1px', flex: 1, background: 'var(--color-border)' }} />
      <span style={{
        fontSize: '0.7rem', fontWeight: 700,
        letterSpacing: '0.1em', textTransform: 'uppercase',
        padding: '3px 12px', borderRadius: '100px',
        border: `1px solid ${isA ? 'rgba(0,212,170,0.35)' : 'rgba(233,69,96,0.35)'}`,
        color: isA ? 'var(--color-accent-primary)' : 'var(--color-accent-secondary)',
        background: isA ? 'rgba(0,212,170,0.07)' : 'rgba(233,69,96,0.07)',
      }}>
        Chave {side}
      </span>
      <div style={{ height: '1px', flex: 1, background: 'var(--color-border)' }} />
    </div>
  )
}
