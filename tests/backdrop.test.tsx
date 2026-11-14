import { expect, mock, test } from 'claude-code/testing'

const RUN = { origin: { kind: 'composer' }, presentation: { isFullscreen: false, columns: 80 } } as const

const STILL = {
  plugin: 'ascii-black-hole',
  component: 'Backdrop',
  requestId: 'backdrop',
  props: { scene: 'still', plugin: 'ascii-black-hole', glass: { blur: 16, opacity: 0.6 } },
} as const

test('the default background is one unchanging SVG under the size cap', async ($, on) => {
  mock.store(on)
  const themes: { backdrop?: unknown }[] = []
  on('theme.set', (_, e) => {
    themes.push(e as { backdrop?: unknown })
    return { value: { isDrawn: true, requestId: 'backdrop' } }
  })
  on('command.register', () => ({ value: { command: 'blackhole' } }))
  on('session.start', (_, e) => ({ cwd: e.cwd }))

  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })
  expect(JSON.stringify(themes.at(-1))).toContain('"scene":"still"')

  const sources: string[] = []
  for (const surface of ['desktop', 'mobile', 'desktop'] as const) {
    const ui = await $.ui.mount({ ...STILL, surface })
    const source = String((await ui.find({ type: 'Svg' }))?.props.source ?? '')
    expect(source.startsWith('<svg')).toBe(true)
    expect(source.length).toBeLessThanOrEqual(131_072)
    sources.push(source)
    await ui.unmount()
  }
  expect(new Set(sources).size).toBe(1)
})

test('/blackhole switches the mode and remembers it', async ($, on) => {
  mock.store(on)
  const themes: unknown[] = []
  on('theme.set', (_, e) => {
    themes.push(e)
    return { value: { isDrawn: true, requestId: 'backdrop' } }
  })
  on('command.register', () => ({ value: { command: 'blackhole' } }))
  on('session.start', (_, e) => ({ cwd: e.cwd }))

  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })
  const ran = await $.command.run({ ...RUN, command: 'blackhole', args: 'jpg' })
  expect((ran as { text?: string }).text).toContain('background is now "jpg"')
  expect(JSON.stringify(themes.at(-1))).toContain('blackhole.jpg')

  // a new session starts in the mode last chosen
  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })
  expect(JSON.stringify(themes.at(-1))).toContain('blackhole.jpg')

  const bad = await $.command.run({ ...RUN, command: 'blackhole', args: 'gif' })
  expect(JSON.stringify(bad)).toContain('Unknown mode')
})
