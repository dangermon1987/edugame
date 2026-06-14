import { useNavigate } from 'react-router-dom'
import { useStore } from '@/state/store'
import { StatusBar } from '@/components/StatusBar'
import { BackButton, SectionHeader } from '@/components/ui'
import { useContent } from '@/content/runtime'
import { useT } from '@/i18n'

export function ThemeSettings() {
  const navigate = useNavigate()
  const t = useT()
  const current = useStore((s) => s.user.settings.theme)
  const ownedItems = useStore((s) => s.user.ownedItems)
  const setTheme = useStore((s) => s.setTheme)
  const pushToast = useStore((s) => s.pushToast)
  const themes = useContent((c) => c.themes)
  const themeById = useContent((c) => c.themeById)
  const shopItems = useContent((c) => c.shopItems)

  // A theme is owned if it's the default ('') or its shop item has been bought.
  const ownedThemePayloads = new Set(
    shopItems.filter((i) => i.category === 'themes' && ownedItems.includes(i.id)).map((i) => i.payload),
  )
  const priceForTheme = (id: string) => shopItems.find((i) => i.category === 'themes' && i.payload === id)
  const isOwned = (id: string) => id === '' || ownedThemePayloads.has(id)

  const activeTheme = themeById[current] ?? themes[0]

  function choose(id: string) {
    if (!isOwned(id)) {
      pushToast({ message: t.themes.unlockInShop, emoji: '🔒', kind: 'info' })
      navigate('/shop')
      return
    }
    setTheme(id)
    pushToast({ message: t.themes.applied, emoji: '🎨', kind: 'success' })
  }

  return (
    <div id="screen-themes">
      <div className="theme-header">
        <StatusBar />
        <div style={{ padding: '0 4px' }}>
          <BackButton to="/settings" />
        </div>
        <div className="theme-title-row">
          <h1>
            <i className="fas fa-palette" /> {t.themes.title}
          </h1>
        </div>
      </div>

      <div className="current-theme-card">
        <div className="current-theme-icon">
          <span style={{ fontSize: 28 }}>{activeTheme.emoji}</span>
        </div>
        <div className="current-theme-info">
          <h3>{activeTheme.name}</h3>
          <p>{t.themes.currentLook}</p>
          <div className="current-theme-swatches">
            {activeTheme.swatch.map((c) => (
              <div key={c} className="mini-swatch" style={{ background: c }} />
            ))}
          </div>
        </div>
      </div>

      <SectionHeader title={t.themes.choose} action={<a>{t.themes.count(themes.length)}</a>} />
      <div className="theme-grid">
        {themes.map((theme) => {
          const owned = isOwned(theme.id)
          const active = current === theme.id
          const price = priceForTheme(theme.id)
          return (
            <div
              key={theme.id || 'default'}
              className={`theme-card${active ? ' active-theme' : ''}${owned ? '' : ' locked'}`}
              onClick={() => choose(theme.id)}
              role="button"
            >
              <div className="theme-card-preview">
                <div
                  className="preview-gradient"
                  style={{ background: `linear-gradient(135deg, ${theme.swatch[0]}, ${theme.swatch[1]})` }}
                />
                <div className="preview-dots">
                  {theme.swatch.map((c) => (
                    <div key={c} className="preview-dot" style={{ background: c }} />
                  ))}
                </div>
              </div>
              <div className="theme-card-name">
                {theme.emoji} {theme.name}
              </div>
              <div className="theme-card-swatches">
                {theme.swatch.map((c) => (
                  <div key={c} className="theme-swatch" style={{ background: c }} />
                ))}
              </div>
              <div className="theme-card-footer">
                {active ? (
                  <span className="theme-badge active-badge" style={{ background: 'var(--color-primary)', color: 'white' }}>
                    {t.themes.active}
                  </span>
                ) : owned ? (
                  <span className="theme-price free">{t.themes.owned}</span>
                ) : (
                  <span className={`theme-price ${price?.currency ?? 'coins'}`}>
                    {price?.currency === 'gems' ? '💎' : '🪙'} {price?.price ?? '—'}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="bottom-spacer" />
    </div>
  )
}
