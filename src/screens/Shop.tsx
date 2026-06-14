import { useState } from 'react'
import { useStore } from '@/state/store'
import { StatusBar } from '@/components/StatusBar'
import { useContent } from '@/content/runtime'
import type { ShopCategory, ShopItem } from '@/domain/types'
import { dateKey } from '@/domain/datetime'
import { useT } from '@/i18n'

const TAB_IDS: ShopCategory[] = ['avatars', 'themes', 'pets', 'powerups']

const SPIN_KEY = 'eduquest.lastSpin'

export function Shop() {
  const t = useT()
  const [tab, setTab] = useState<ShopCategory>('avatars')
  const [confirm, setConfirm] = useState<ShopItem | null>(null)
  const [spunToday, setSpunToday] = useState(() => {
    try {
      return localStorage.getItem(SPIN_KEY) === dateKey()
    } catch {
      return false
    }
  })
  const coins = useStore((s) => s.user.coins)
  const gems = useStore((s) => s.user.gems)
  const owned = useStore((s) => s.user.ownedItems)
  const purchase = useStore((s) => s.purchaseItem)
  const addRewards = useStore((s) => s.addRewards)
  const pushToast = useStore((s) => s.pushToast)
  const shopItems = useContent((c) => c.shopItems)
  const spinPrizes = useContent((c) => c.economy.dailySpinPrizes)

  const items = shopItems.filter((i) => i.category === tab)

  function doSpin() {
    if (spunToday) return
    const prize = spinPrizes[Math.floor(Math.random() * spinPrizes.length)]
    addRewards(prize)
    const label = prize.coins ? `🪙 ${prize.coins} ${t.shop.coins}` : `💎 ${prize.gems} ${t.shop.gems}`
    pushToast({ message: t.shop.spinPrize(label), emoji: '🎡', kind: 'success' })
    try {
      localStorage.setItem(SPIN_KEY, dateKey())
    } catch {
      /* ignore */
    }
    setSpunToday(true)
  }

  function confirmPurchase() {
    if (confirm) {
      purchase(confirm.id)
      setConfirm(null)
    }
  }

  return (
    <div id="screen-shop">
      <div className="shop-header">
        <StatusBar />
        <div className="shop-title-row">
          <h1>{t.shop.title}</h1>
        </div>
        <div className="shop-balance">
          <div className="shop-balance-item">🪙 {coins.toLocaleString()}</div>
          <div className="shop-balance-item">💎 {gems}</div>
        </div>
      </div>

      <div className={`spin-card${spunToday ? ' is-disabled' : ''}`} onClick={doSpin} role="button">
        <div className="spin-wheel-icon">🎡</div>
        <div className="spin-info">
          <h3>{t.shop.luckySpin}</h3>
          <p>{spunToday ? t.shop.spinDone : t.shop.spinAvailable}</p>
        </div>
        <div className="spin-btn-tag">{spunToday ? t.common.done : t.common.free}</div>
      </div>

      <div className="shop-tabs">
        {TAB_IDS.map((id) => (
          <button key={id} className={`shop-tab${tab === id ? ' active' : ''}`} onClick={() => setTab(id)}>
            {t.shop.tabs[id]}
          </button>
        ))}
      </div>

      <div className="shop-grid">
        {items.map((item) => {
          const isOwned = owned.includes(item.id)
          return (
            <div
              key={item.id}
              className={`shop-item${isOwned ? ' is-disabled' : ''}`}
              onClick={() => !isOwned && setConfirm(item)}
              role="button"
            >
              <div className="shop-item-preview">{item.preview}</div>
              <h4>{item.name}</h4>
              <div className="shop-item-price">
                {item.currency === 'coins' ? '🪙' : '💎'} {isOwned ? t.common.owned : item.price}
              </div>
              {item.rarity && item.rarity !== 'common' && (
                <span className={`shop-item-tag tag-${item.rarity}`}>
                  {t.shop.rarity[item.rarity as keyof typeof t.shop.rarity] ?? item.rarity.toUpperCase()}
                </span>
              )}
            </div>
          )
        })}
      </div>

      <div className="bottom-spacer" />

      {confirm && (
        <div className="modal-scrim" onClick={() => setConfirm(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 56 }}>{confirm.preview}</div>
            <h3>{confirm.name}</h3>
            <p>
              {t.shop.buyFor} {confirm.currency === 'coins' ? '🪙' : '💎'} {confirm.price}?
            </p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setConfirm(null)}>
                {t.common.cancel}
              </button>
              <button className="btn-primary" onClick={confirmPurchase}>
                {t.common.buy}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
