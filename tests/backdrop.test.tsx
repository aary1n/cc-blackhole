import { expect, mock, test } from 'claude-code/testing'

const BACKDROP = {
  plugin: 'ascii-black-hole',
  component: 'Backdrop',
  requestId: 'backdrop',
  props: { scene: 'black-hole', plugin: 'ascii-black-hole', glass: { blur: 8, tint: '#0b0908', opacity: 0.55 } },
} as const

test('the backdrop is an SVG under the size cap that moves with the clock', async ($, on) => {
  const clock = mock.clock(on, { now: 1_000 })
  const themes: unknown[] = []
  on('theme.set', (_, e) => {
    themes.push(e)
    return { value: { isDrawn: true, requestId: 'backdrop' } }
  })
  on('session.start', (_, e) => ({ cwd: e.cwd }))

  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })
  expect(themes).toHaveLength(1)

  const sources: string[] = []
  for (const at of [0, 1_300, 4_700]) {
    await clock.advance(at === 0 ? 0 : at - (clock.now() - 1_000))
    for (const surface of ['desktop', 'mobile'] as const) {
      const ui = await $.ui.mount({ ...BACKDROP, surface })
      const svg = await ui.find({ type: 'Svg' })
      const source = String(svg?.props.source ?? '')
      expect(source.startsWith('<svg')).toBe(true)
      expect(source.length).toBeLessThanOrEqual(131_072)
      if (surface === 'desktop') sources.push(source)
      await ui.unmount()
    }
  }
  // the disk turns: each moment draws a different frame
  expect(new Set(sources).size).toBe(3)
})
