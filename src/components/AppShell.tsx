import { Outlet } from 'react-router-dom'
import { useStore } from '@/state/store'
import { BottomNav } from './BottomNav'
import { Overlays } from './Overlays'

/**
 * The device frame that wraps every screen. Renders the routed screen inside
 * `.screen-container > .screen.active` to reuse the prototype's styling, applies
 * the active theme, and (optionally) shows the persistent bottom nav.
 *
 * Drive is connected explicitly from Settings (an OAuth prompt on boot would be
 * hostile), so there is no silent auto-reconnect here.
 */
export function AppShell({ withNav }: { withNav: boolean }) {
  const theme = useStore((s) => s.user.settings.theme)

  return (
    <div className="phone-frame" data-theme={theme || undefined}>
      <div className="screen-container">
        <div className="screen active">
          <Outlet />
        </div>
      </div>
      {withNav && <BottomNav />}
      <Overlays />
    </div>
  )
}
