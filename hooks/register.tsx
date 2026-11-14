import type { EngineInterface, Register, ThemeSetArgs } from 'claude-code'

import { frame } from './frame.js'
import { makeColors } from './make-colors.js'

// How the background is drawn. `/blackhole <mode>` switches it live and remembers it.
//   svg  the still frame as a vector scene (default)
//   png  the still frame as a 2560px image
//   jpg  the still frame as a smaller 1920px image
//   off  the colours alone, no background picture
const MODES = ['svg', 'png', 'jpg', 'off'] as const
type Mode = (typeof MODES)[number]
const DEFAULT_MODE: Mode = 'svg'
const isMode = (v: unknown): v is Mode => typeof v === 'string' && (MODES as readonly string[]).includes(v)

// The moment of the original animation the still frame shows.
const STILL_T = 2

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

const look = (mode: Mode): ThemeSetArgs => {
  switch (mode) {
    case 'svg':
      return { colors: theme, backdrop: { scene: 'still' } }
    case 'png':
      return { colors: theme, backdrop: { image: { source: 'blackhole.png' } } }
    case 'jpg':
      return { colors: theme, backdrop: { image: { source: 'blackhole.jpg' } } }
    case 'off':
      return { colors: theme }
  }
}

// Built once: the same SVG every time the app asks, so nothing about it changes.
let stillSvg: string | undefined
const still = () => (stillSvg ??= frame(STILL_T))

async function apply($: EngineInterface, mode: Mode): Promise<string> {
  const set = await $.theme.set(look(mode))

  return set.isDrawn
    ? `ascii-black-hole: background is now "${mode}".`
    : `ascii-black-hole: "${mode}" is set, but not drawn here: ${set.reason}`
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const unpainted = problems.find(line => line.startsWith("Desktop won't paint"))

    if (unpainted !== undefined) {
      $.ui.toast(unpainted)
    }
    await $.command.register({
      name: 'blackhole',
      description: 'Switch how the black hole background is drawn: svg, png, jpg or off',
      argumentHint: '[svg|png|jpg|off]',
    })
    const stored = await $.store.get('mode')
    await apply($, isMode(stored) ? stored : DEFAULT_MODE)

    return next(e)
  })

  on('command.run', { command: 'blackhole' }, async ($, e) => {
    const wanted = e.args.trim().toLowerCase()

    if (wanted === '') {
      const stored = await $.store.get('mode')
      const current = isMode(stored) ? stored : DEFAULT_MODE

      return { text: `Background mode: ${current}. Switch with /blackhole ${MODES.join(' | ')}.` }
    }
    if (!isMode(wanted)) {
      return { text: `Unknown mode "${wanted}". Use one of: ${MODES.join(', ')}.` }
    }
    await $.store.set('mode', wanted)

    return { text: await apply($, wanted) }
  })

  on('ui.render', { component: 'Backdrop' }, ($, e, next) => {
    if (e.props.plugin !== 'ascii-black-hole' || e.props.scene !== 'still') {
      return next(e)
    }
    if (e.surface !== 'desktop' && e.surface !== 'mobile') {
      return next(e)
    }
    const { Svg } = $.ui.resolve(e)

    return <Svg source={still()} alt="An ASCII black hole in the bottom right, its copper disk lit on the left" />
  })
}
