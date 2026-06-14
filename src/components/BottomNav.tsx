import { useLocation, useNavigate } from 'react-router-dom'
import { useT } from '@/i18n'

export function BottomNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const t = useT()
  const ITEMS = [
    { path: '/', icon: 'fas fa-home', label: t.nav.home },
    { path: '/learn', icon: 'fas fa-book', label: t.nav.learn },
    { path: '/play', icon: 'fas fa-play', label: t.nav.play, center: true },
    { path: '/shop', icon: 'fas fa-store', label: t.nav.shop },
    { path: '/profile', icon: 'fas fa-user', label: t.nav.profile },
  ]

  return (
    <div className="bottom-nav">
      {ITEMS.map((item) => {
        const active = pathname === item.path
        return (
          <div
            key={item.path}
            className={`nav-item${item.center ? ' center-action' : ''}${active ? ' active' : ''}`}
            data-screen={item.path}
            onClick={() => navigate(item.path)}
            role="button"
            tabIndex={0}
            aria-label={item.label}
            onKeyDown={(e) => e.key === 'Enter' && navigate(item.path)}
          >
            <i className={item.icon} />
            {!item.center && <span>{item.label}</span>}
          </div>
        )
      })}
    </div>
  )
}
