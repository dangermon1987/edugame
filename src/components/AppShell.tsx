import { Outlet } from 'react-router-dom'
import { useStore } from '@/state/store'
import { BottomNav } from './BottomNav'
import { SideNav } from './SideNav'
import { Overlays } from './Overlays'

/**
 * Responsive shell (spec §9). The screens keep their pixel-accurate phone
 * layout (the prototypes are 390×844 mockups, and several screens are
 * pixel-positioned), framed differently per device:
 *  - phone (<768):           edge-to-edge full screen + bottom tab bar
 *  - tablet (768–1023):      centred app card + bottom tab bar, on a backdrop
 *  - desktop / TL (≥1024):   persistent side-nav rail + app card (no bottom bar)
 */
export function AppShell({ withNav }: { withNav: boolean }) {
  const theme = useStore((s) => s.user.settings.theme)

  return (
    <div className="app-stage">
      {withNav && <SideNav />}
      <div className="phone-frame" data-theme={theme || undefined}>
        <div className="screen-container">
          <div className="screen active">
            <Outlet />
          </div>
        </div>
        {withNav && <BottomNav />}
        <Overlays />
      </div>
    </div>
  )
}
