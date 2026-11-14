import type { Register, ThemeSetArgs } from 'claude-code'

import { frame } from './frame.js'
import { makeColors } from './make-colors.js'

// false: show blackhole.png, the still frame, instead of the animation.
const ANIMATE = true
// The app redraws a mod's drawing ten times a second at most.
const FRAME_MS = 100

// Near-black space, copper accretion-disk accents. Dark mode only.
const { theme, problems } = makeColors({
  label: 'ASCII Black Hole',
  only: 'dark',
  roles: { accent: '#d9935a', danger: '#d0573f', success: '#7fa65a', warning: '#d6a64a', pro: '#a98bd0' },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#0b0908',
        'surface-1': '#13100d',
        'surface-2': '#1a1612',
        'surface-3': '#211b16',
        'text-primary': '#f1e6d6',
        'text-secondary': '#cdbfac',
        'text-muted': '#a8998a',
      },
    },
  },
})

const LOOK: ThemeSetArgs = ANIMATE
  ? { colors: theme, backdrop: { scene: 'black-hole', glass: { blur: 8, tint: '#0b0908', opacity: 0.55 } } }
  : { colors: theme, backdrop: { image: { source: 'blackhole.png' } } }

export const register: Register = on => {
  let startedAt = 0

  on('session.start', async ($, e, next) => {
    const unpainted = problems.find(line => line.startsWith("Desktop won't paint"))

    if (unpainted !== undefined) {
      $.ui.toast(unpainted)
    }
    const set = await $.theme.set(LOOK)

    if (!set.isDrawn) {
      $.ui.status(set.reason)
    }
    if (ANIMATE) {
      startedAt = await $.clock.now()
      $.clock.every(FRAME_MS, () => $.ui.invalidate('ui.render'))
    }

    return next(e)
  })

  on('ui.render', { component: 'Backdrop' }, async ($, e, next) => {
    if (e.props.plugin !== 'ascii-black-hole' || e.props.scene !== 'black-hole') {
      return next(e)
    }
    if (e.surface !== 'desktop' && e.surface !== 'mobile') {
      return next(e)
    }
    const { Svg } = $.ui.resolve(e)
    const t = startedAt === 0 ? 0 : ((await $.clock.now()) - startedAt) / 1000

    return <Svg source={frame(t)} alt="An ASCII black hole, its copper disk slowly turning" />
  })
}
