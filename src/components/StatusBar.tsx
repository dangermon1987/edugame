/** iOS-style status bar matching the prototype. `dark` for light backgrounds. */
export function StatusBar({ dark = false }: { dark?: boolean }) {
  const color = dark ? 'var(--color-text-primary)' : undefined
  return (
    <div className="status-bar" style={dark ? { background: 'var(--color-bg)' } : undefined}>
      <span className="time" style={color ? { color } : undefined}>
        9:41
      </span>
      <div className="icons">
        <i className="fas fa-signal" style={{ fontSize: 11, color }} />
        <i className="fas fa-wifi" style={{ fontSize: 11, color }} />
        <i className="fas fa-battery-full" style={{ fontSize: 11, color }} />
      </div>
    </div>
  )
}
