import { useState } from 'react'
import { useStore } from '@/state/store'
import { StatusBar } from '@/components/StatusBar'
import { SectionHeader } from '@/components/ui'
import { useContent, RARITY_LABEL } from '@/content/runtime'
import { useT } from '@/i18n'
import type { StickerRarity } from '@/content/schema'

export function Stickers() {
  const t = useT()
  const owned = useStore((s) => s.user.stickers)
  const stickers = useContent((c) => c.stickers)
  const [filter, setFilter] = useState<StickerRarity | 'all'>('all')

  const ownedCount = owned.length
  const shinyCount = stickers.filter((s) => owned.includes(s.id) && s.rarity === 'shiny').length

  const collections = Array.from(new Set(stickers.map((s) => s.collection)))
  const visible = (rarity: StickerRarity) => filter === 'all' || filter === rarity

  return (
    <div id="screen-stickers">
      <div className="sticker-header">
        <StatusBar />
        <div className="sticker-title-row">
          <h1>{t.stickers.title}</h1>
        </div>
        <div className="sticker-count-row">
          <div className="sticker-count-tag">📋 {t.stickers.collected(ownedCount, stickers.length)}</div>
          <div className="sticker-count-tag">✨ {t.stickers.shiny(shinyCount)}</div>
        </div>
      </div>

      <div className="rarity-tabs">
        <button className={`rarity-tab${filter === 'all' ? ' active' : ''}`} onClick={() => setFilter('all')}>
          {t.stickers.all}
        </button>
        {(Object.keys(RARITY_LABEL) as StickerRarity[]).map((r) => (
          <button key={r} className={`rarity-tab${filter === r ? ' active' : ''}`} onClick={() => setFilter(r)}>
            {t.stickers.rarities[r]}
          </button>
        ))}
      </div>

      <div className="completion-card">
        <div className="completion-header">
          <h4>{t.stickers.total}</h4>
          <span>
            {ownedCount}/{stickers.length}
          </span>
        </div>
        <div className="completion-bar">
          <div className="completion-fill" style={{ width: `${Math.round((ownedCount / stickers.length) * 100)}%` }} />
        </div>
        <div className="completion-detail">
          <span>{t.stickers.percent(Math.round((ownedCount / stickers.length) * 100))}</span>
          <span>{t.stickers.earnHint}</span>
        </div>
      </div>

      {collections.map((col) => {
        const items = stickers.filter((s) => s.collection === col && visible(s.rarity))
        if (items.length === 0) return null
        const colOwned = stickers.filter((s) => s.collection === col && owned.includes(s.id)).length
        const colTotal = stickers.filter((s) => s.collection === col).length
        return (
          <div key={col}>
            <SectionHeader title={col} action={<a>{colOwned}/{colTotal}</a>} />
            <div className="sticker-grid">
              {items.map((s) => {
                const has = owned.includes(s.id)
                return (
                  <div className={`sticker-slot${has ? '' : ' empty'}`} key={s.id}>
                    <div className={`sticker-icon ${has ? 'collected' : 'empty'}${has && s.rarity === 'shiny' ? ' shiny' : ''}`}>
                      {has && s.rarity === 'shiny' && <span className="sticker-rarity">✨</span>}
                      {has ? s.emoji : '❓'}
                    </div>
                    <div className="sticker-name">{has ? s.name : '???'}</div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      <div className="bottom-spacer" />
    </div>
  )
}
