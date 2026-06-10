import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export function Navbar() {
  const { profile, signOut } = useAuth()
  const location = useLocation()

  const navLinks = [
    { to: '/predictions', label: '⚽ Palpites' },
    { to: '/dashboard', label: '🏆 Ranking' },
    ...(profile?.is_admin ? [{ to: '/admin', label: '⚙️ Admin' }] : []),
  ]

  return (
    <nav className="navbar">
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '64px',
      }}>
        {/* Logo */}
        <Link to="/predictions" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.5rem' }}>🏆</span>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: '1.125rem',
            background: 'linear-gradient(135deg, #00d4aa, #00a8ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Bolão WC26
          </span>
        </Link>

        {/* Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              style={{
                padding: '0.375rem 0.875rem',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: 500,
                textDecoration: 'none',
                color: location.pathname === link.to ? 'var(--color-accent-primary)' : 'var(--color-text-secondary)',
                background: location.pathname === link.to ? 'rgba(0, 212, 170, 0.1)' : 'transparent',
                transition: 'all 0.2s ease',
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* User + Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
              {profile?.username ?? 'Usuário'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-accent-gold)', fontWeight: 700 }}>
              {profile?.total_points ?? 0} pts
            </div>
          </div>
          <button
            onClick={signOut}
            className="btn btn-ghost btn-sm"
            title="Sair"
          >
            Sair
          </button>
        </div>
      </div>
    </nav>
  )
}
