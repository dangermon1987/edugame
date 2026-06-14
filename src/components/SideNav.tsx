import { useLocation, useNavigate } from 'react-router-dom'
import { useContent } from '@/content/runtime'
import { useT } from '@/i18n'

/**
 * Persistent left navigation rail shown on tablet-landscape / desktop
 * (>= 1024px), replacing the bottom tab bar per spec §9. Hidden on smaller
 * screens via CSS.
 */
export function SideNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const title = useContent((c) => c.app.title)
  const t = useT()
  const ITEMS = [
    { path: '/', icon: 'fas fa-home', label: t.nav.home },
    { path: '/learn', icon: 'fas fa-book', label: t.nav.learn },
    { path: '/play', icon: 'fas fa-play', label: t.nav.play },
    { path: '/shop', icon: 'fas fa-store', label: t.nav.shop },
    { path: '/profile', icon: 'fas fa-user', label: t.nav.profile },
  ]

  return (
    <nav className="side-nav" aria-label="Primary">
      <div className="side-nav-brand">
        <span className="side-nav-logo">🎓</span>
        <span className="side-nav-title">{title}</span>
      </div>
      {ITEMS.map((item) => {
        const active = pathname === item.path
        return (
          <button
            key={item.path}
            className={`side-nav-item${active ? ' active' : ''}`}
            onClick={() => navigate(item.path)}
            aria-current={active ? 'page' : undefined}
          >
            <i className={item.icon} />
            <span>{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
