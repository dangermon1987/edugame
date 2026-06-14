import { HashRouter, Routes, Route } from 'react-router-dom'
import { useAuth } from '@/auth/store'
import { AuthScreen } from './screens/AuthScreen'
import { AppShell } from './components/AppShell'
import { Home } from './screens/Home'
import { Learn } from './screens/Learn'
import { Play } from './screens/Play'
import { Shop } from './screens/Shop'
import { Profile } from './screens/Profile'
import { SubjectHub } from './screens/SubjectHub'
import { Quiz } from './screens/Quiz'
import { FlashcardHub } from './screens/FlashcardHub'
import { FlashcardStudy } from './screens/FlashcardStudy'
import { CompeteLobby } from './screens/CompeteLobby'
import { CompeteLive } from './screens/CompeteLive'
import { Pet } from './screens/Pet'
import { AdventureMap } from './screens/AdventureMap'
import { Arcade } from './screens/Arcade'
import { MemoryGame } from './screens/MemoryGame'
import { Stickers } from './screens/Stickers'
import { Workshop } from './screens/Workshop'
import { ThemeSettings } from './screens/ThemeSettings'
import { Settings } from './screens/Settings'
import { ParentDashboard } from './screens/ParentDashboard'

export function App() {
  const ready = useAuth((s) => s.ready)
  const account = useAuth((s) => s.account)

  if (!ready) return null
  if (!account) return <AuthScreen />

  return (
    <HashRouter>
      <Routes>
        {/* Screens with the persistent bottom navigation */}
        <Route element={<AppShell withNav />}>
          <Route path="/" element={<Home />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/play" element={<Play />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/subject/:id" element={<SubjectHub />} />
          <Route path="/flashcards" element={<FlashcardHub />} />
          <Route path="/compete" element={<CompeteLobby />} />
          <Route path="/pet" element={<Pet />} />
          <Route path="/map" element={<AdventureMap />} />
          <Route path="/arcade" element={<Arcade />} />
          <Route path="/stickers" element={<Stickers />} />
          <Route path="/workshop" element={<Workshop />} />
          <Route path="/themes" element={<ThemeSettings />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/parent" element={<ParentDashboard />} />
        </Route>

        {/* Focused, full-screen experiences (no bottom nav) */}
        <Route element={<AppShell withNav={false} />}>
          <Route path="/quiz/:lessonId" element={<Quiz />} />
          <Route path="/flashcards/:deckId/study" element={<FlashcardStudy />} />
          <Route path="/compete/live" element={<CompeteLive />} />
          <Route path="/memory" element={<MemoryGame />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
