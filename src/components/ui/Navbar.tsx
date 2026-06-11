import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export function Navbar() {
  const { profile, signOut } = useAuth()
  const location = useLocation()

  const navLinks = profile?.is_admin
    ? [
        { to: '/dashboard', label: '🏆 Ranking' },
        { to: '/admin', label: '⚙️ Admin' },
      ]
    : [
        { to: '/predictions', label: '⚽ Palpites' },
        { to: '/dashboard', label: '🏆 Ranking' },
      ]

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link to="/predictions" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.5rem' }}>🏆</span>
          <span className="nav-logo-text">
            Bolão WC26
          </span>
        </Link>

        {/* Nav Links */}
        <div className="nav-links">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className="nav-link"
              style={{
                color: location.pathname === link.to ? 'var(--color-accent-primary)' : 'var(--color-text-secondary)',
                background: location.pathname === link.to ? 'rgba(0, 212, 170, 0.1)' : 'transparent',
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* User + Logout */}
        <div className="nav-user">
          <div style={{ textAlign: 'right' }}>
            <div className="nav-user-name" style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
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
