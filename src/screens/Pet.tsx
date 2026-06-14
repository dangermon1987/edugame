import { useStore } from '@/state/store'
import { SectionHeader } from '@/components/ui'
import { useT } from '@/i18n'

const EVO = [
  { emoji: '🥚', label: 'Egg' },
  { emoji: '🐣', label: 'Baby' },
  { emoji: '🐲', label: 'Teen' },
  { emoji: '🐉', label: 'Adult' },
]

export function Pet() {
  const pet = useStore((s) => s.user.pet)
  const coins = useStore((s) => s.user.coins)
  const petAction = useStore((s) => s.petAction)
  const addRewards = useStore((s) => s.addRewards)
  const pushToast = useStore((s) => s.pushToast)
  const t = useT()

  const mood = pet.happiness >= 70 ? { emoji: '😄', text: t.pet.moodHappy(pet.name) } : pet.happiness >= 40 ? { emoji: '🙂', text: t.pet.moodOk(pet.name) } : { emoji: '😢', text: t.pet.moodSad(pet.name) }

  function spendThen(cost: number, fn: () => void, msg: string, emoji: string) {
    if (cost > 0 && coins < cost) {
      pushToast({ message: t.pet.notEnoughCoins, emoji: '😅', kind: 'error' })
      return
    }
    if (cost > 0) addRewards({ coins: -cost })
    fn()
    pushToast({ message: msg, emoji, kind: 'success' })
  }

  const actions = [
    { emoji: '🍎', label: t.pet.actions.feed, cost: '🪙 20', run: () => spendThen(20, () => petAction('feed'), `${pet.name} ate happily!`, '🍎') },
    { emoji: '⚽', label: t.pet.actions.play, cost: '🪙 15', run: () => spendThen(15, () => petAction('play'), `${pet.name} had fun!`, '⚽') },
    { emoji: '👒', label: t.pet.actions.dressUp, cost: '🪙 30', run: () => spendThen(30, () => petAction('play'), `${pet.name} looks stylish!`, '👒') },
    { emoji: '🛁', label: t.pet.actions.bath, cost: '🪙 10', run: () => spendThen(10, () => petAction('feed'), `${pet.name} is squeaky clean!`, '🛁') },
    { emoji: '😴', label: t.pet.actions.nap, cost: 'FREE', run: () => spendThen(0, () => petAction('rest'), `${pet.name} feels rested!`, '😴') },
    { emoji: '📖', label: t.pet.actions.study, cost: '+50 XP', run: () => spendThen(0, () => { petAction('play'); addRewards({ xp: 50 }) }, `+50 XP with ${pet.name}!`, '📖') },
  ]

  return (
    <div id="screen-pet">
      <div className="pet-header">
        <div className="pet-title-row">
          <h1>{t.pet.title}</h1>
        </div>
        <div className="pet-stage">
          <div className="pet-creature" onClick={() => petAction('play')} role="button">
            {EVO[pet.evolutionStage]?.emoji ?? pet.species}
          </div>
          <div className="pet-name-tag">{pet.name}</div>
          <div className="pet-level-tag">
            {t.pet.stage(pet.evolutionStage + 1, EVO[pet.evolutionStage]?.label ?? '')} · {pet.xp}/300 {t.common.xp}
          </div>
        </div>
      </div>

      <div className="pet-stats-row">
        <div className="pet-stat-card">
          <div className="ps-emoji">😊</div>
          <div className="ps-label">{t.pet.happiness}</div>
          <div className="pet-stat-bar">
            <div className="pet-stat-fill" style={{ width: `${pet.happiness}%`, background: 'linear-gradient(90deg,var(--color-accent-yellow),var(--color-accent-orange))' }} />
          </div>
        </div>
        <div className="pet-stat-card">
          <div className="ps-emoji">🍎</div>
          <div className="ps-label">{t.pet.hunger}</div>
          <div className="pet-stat-bar">
            <div className="pet-stat-fill" style={{ width: `${pet.hunger}%`, background: 'linear-gradient(90deg,var(--color-accent-mint),var(--color-accent-green))' }} />
          </div>
        </div>
        <div className="pet-stat-card">
          <div className="ps-emoji">⚡</div>
          <div className="ps-label">{t.pet.energy}</div>
          <div className="pet-stat-bar">
            <div className="pet-stat-fill" style={{ width: `${pet.energy}%`, background: 'linear-gradient(90deg,var(--color-accent-blue),var(--color-primary))' }} />
          </div>
        </div>
      </div>

      <div className="pet-mood-card">
        <div className="pet-mood-emoji">{mood.emoji}</div>
        <div className="pet-mood-info">
          <h3>{mood.text}</h3>
          <p>{t.pet.moodSub(pet.name)}</p>
        </div>
      </div>

      <SectionHeader title={t.pet.evolution} action={<a>{EVO.length} {t.pet.stages}</a>} />
      <div className="evolution-track">
        <div className="evo-stages">
          <div className="evo-line">
            <div className="evo-line-fill" style={{ width: `${(pet.evolutionStage / 3) * 100}%` }} />
          </div>
          {EVO.map((e, i) => (
            <div className="evo-stage" key={e.label}>
              <div className={`evo-icon ${i < pet.evolutionStage ? 'unlocked' : i === pet.evolutionStage ? 'current' : 'locked'}`}>
                {e.emoji}
              </div>
              <div className="evo-label">{e.label}</div>
            </div>
          ))}
        </div>
      </div>

      <SectionHeader title={t.pet.activities} />
      <div className="pet-actions">
        {actions.map((a) => (
          <div className="pet-action-btn" key={a.label} onClick={a.run} role="button">
            <span className="pa-emoji">{a.emoji}</span>
            <span className="pa-label">{a.label}</span>
            <span className="pa-cost">{a.cost}</span>
          </div>
        ))}
      </div>

      <div className="bottom-spacer" />
    </div>
  )
}
