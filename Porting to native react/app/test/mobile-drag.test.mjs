// Mobile tap/drag regression test. Run it, do not trust reasoning about it.
//
//   1. npx vite build && npx vite preview --port 4178
//   2. "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless \
//        --remote-debugging-port=9223 --user-data-dir=/tmp/cdp about:blank
//   3. node test/mobile-drag.test.mjs
//
// WHY CDP AND NOT jsdom/synthetic events: the drag-vs-scroll decision depends on
// trusted touch events, touch-action, and whether the compositor has already
// claimed the gesture. dispatchEvent reproduces none of that, and every one of
// the three traps below produced a confident FALSE PASS during development:
//
//   1. document.querySelector('svg') grabs an icon. The page has 60+ SVGs; the
//      map is the one that CONTAINS [data-i] nodes.
//   2. getBoundingClientRect() moves when the PAGE scrolls, so a scroll reads
//      as a successful drag. Measure in SVG user space (the <g> transform) and
//      keep an untouched control node.
//   3. Node stroke-width and node opacity do not change on selection. Edge
//      stroke-opacity does (0.5 -> 0.3). Verify any instrument against a clean
//      0px tap before believing a FAIL.
const BASE = 'http://localhost:9223'

const targets = await (await fetch(`${BASE}/json/list`)).json()
let page = targets.find((t) => t.type === 'page')
if (!page) {
  page = await (await fetch(`${BASE}/json/new?about:blank`)).json()
}
const ws = new WebSocket(page.webSocketDebuggerUrl)
let id = 0
const pending = new Map()
ws.onmessage = (m) => {
  const msg = JSON.parse(m.data)
  if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id) }
}
await new Promise((r) => (ws.onopen = r))
const send = (method, params = {}) =>
  new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })) })
const evalJs = async (expr) => {
  const r = await send('Runtime.evaluate', { expression: expr, awaitPromiseresult: true, returnByValue: true })
  return r.result?.result?.value
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

await send('Page.enable')
await send('Runtime.enable')
// Emulate a phone so pointerType is "touch" and the layout is mobile.
await send('Emulation.setDeviceMetricsOverride',
  { width: 390, height: 844, deviceScaleFactor: 3, mobile: true })
await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 })

await send('Page.navigate', { url: 'http://localhost:4178/' })
await sleep(3500)

// Reach the symptom map and let the force layout settle.
const opened = await evalJs(`(() => {
  const btn = [...document.querySelectorAll('button')].find(b => /symptom/i.test(b.textContent||''))
  if (btn) { btn.click(); return btn.textContent.trim() }
  return null
})()`)
await sleep(4000)
// The symptom map needs a symptom picked before it draws anything.
const picked = await evalJs(`(() => {
  const btns = [...document.querySelectorAll('button')]
  const target = btns.find(b => /fatigue|bloating|anxiety|brain fog/i.test(b.textContent||''))
  if (target) { target.click(); return target.textContent.trim() }
  return null
})()`)
console.log('picked symptom:', picked)
await sleep(4000)

const nodeInfo = await evalJs(`(() => {
  // The page has 60+ SVGs (icons). The map is the one that CONTAINS nodes.
  const svg = [...document.querySelectorAll('svg')].find(s => s.querySelector('[data-i]'))
  if (!svg) return null
  const nodes = [...svg.querySelectorAll('[data-i]')].filter(n => getComputedStyle(n).display !== 'none')
  if (!nodes.length) return null
  // Target the child <circle>: a node <g>'s bounding box includes its text label,
  // so its centre can miss the node entirely.
  const g = nodes[Math.floor(nodes.length / 2)]
  const c = g.querySelector('circle') || g
  const r = c.getBoundingClientRect()
  return { count: nodes.length, i: g.dataset.i,
           x: r.x + r.width / 2, y: r.y + r.height / 2,
           inView: r.top > 60 && r.bottom < innerHeight - 20 }
})()`)
console.log('opened tab:', opened, '| node:', JSON.stringify(nodeInfo))
if (!nodeInfo) { console.log('NO MAP FOUND'); 
// --- TEST 3 (the regression this must not cause): a QUICK vertical swipe with
// no long-press must still scroll the page and must NOT drag the node.
const q0 = await nodeSvgXY(nodeInfo.i)
const qs0 = await evalJs('scrollY')
const qp = await nodeXY(nodeInfo.i)
await touch('touchStart', qp.x, qp.y)
await sleep(30)                       // no hold - straight into the swipe
for (let s2 = 1; s2 <= 8; s2++) { await touch('touchMove', qp.x, qp.y - s2 * 9); await sleep(25) }
await touch('touchEnd', qp.x, qp.y - 72)
await sleep(700)
const q1 = await nodeSvgXY(nodeInfo.i)
const qs1 = await evalJs('scrollY')
const qMoved = Math.hypot(q1.x - q0.x, q1.y - q0.y)
console.log('TEST 3 quick swipe -> node moved', qMoved.toFixed(1), 'px, page scrolled',
  (qs1 - qs0).toFixed(0), 'px')
console.log('TEST 3', qMoved < 10 ? 'PASS - scrolling past a node still works'
  : 'FAIL - a scroll attempt dragged the node')

ws.close(); process.exit(1) }

if (!nodeInfo.inView) {
  await evalJs(`[...document.querySelectorAll('svg')].find(s=>s.querySelector('[data-i]')).scrollIntoView({block:'center'})`)
  await sleep(900)
}
// Viewport coords are contaminated by page scroll - the whole map shifts and
// reads as movement. SVG user-space coords cannot be moved by scrolling.
async function nodeSvgXY(i) {
  return evalJs(`(() => {
    const g = [...document.querySelectorAll('[data-i]')].find(n => n.dataset.i === ${JSON.stringify(i)})
    // Nodes are positioned by a translate() on the <g>; the circles have no cx/cy.
    const t = g.getAttribute('transform') || ''
    const inner = t.slice(t.indexOf('(') + 1, t.indexOf(')'))
    const parts = inner.split(/[ ,]+/)
    return parts.length === 2 ? { x: +parts[0], y: +parts[1] } : null
  })()`)
}
async function nodeXY(i) {
  return evalJs(`(() => {
    const g = [...document.querySelectorAll('[data-i]')].find(n => n.dataset.i === ${JSON.stringify(i)})
    const c = g.querySelector('circle') || g
    const r = c.getBoundingClientRect()
    return { x: r.x + r.width/2, y: r.y + r.height/2 }
  })()`)
}

const pos = await nodeXY(nodeInfo.i)
console.log('node at', JSON.stringify(pos))


const touch = (type, x, y) =>
  send('Input.dispatchTouchEvent', {
    type, touchPoints: type === 'touchEnd' ? [] : [{ x, y, radiusX: 12, radiusY: 12, force: 1 }],
  })

// --- TEST 1: a wobbly tap (finger drifts ~8px, mostly vertical) still selects.
// Selecting a node dims the edges it is not part of: stroke-opacity 0.5 -> 0.3.
// Verified against a clean 0px tap first - node stroke-width and node opacity
// both stay identical on selection, so neither is a usable instrument.
const edgeOpacity = () => evalJs(`(() => {
  const svg = [...document.querySelectorAll('svg')].find(s => s.querySelector('[data-i]'))
  return [...svg.querySelectorAll('line')].slice(0, 6)
    .map(l => l.getAttribute('stroke-opacity')).join(',')
})()`)
const fadedBefore = await edgeOpacity()
await touch('touchStart', pos.x, pos.y)
await sleep(40)
await touch('touchMove', pos.x + 2, pos.y - 7)
await sleep(40)
await touch('touchEnd', pos.x + 2, pos.y - 7)
await sleep(500)
const fadedAfter = await edgeOpacity()
console.log('TEST 1 wobbly tap -> edge opacity', fadedBefore, '->', fadedAfter)
console.log('TEST 1', fadedAfter !== fadedBefore
  ? 'PASS - the tap registered as a selection'
  : 'FAIL - a slightly-wobbled tap did nothing at all')

// --- TEST 2: a mostly-vertical drag actually moves the node.
// CONTROL: the force layout drifts nodes on its own, so an untouched node is
// measured over the same window. Without this, simulation drift reads as a
// successful drag.
const controlIdx = await evalJs(`(() => {
  const svg = [...document.querySelectorAll('svg')].find(s => s.querySelector('[data-i]'))
  const others = [...svg.querySelectorAll('[data-i]')].filter(n => n.dataset.i !== ${JSON.stringify(nodeInfo.i)})
  return others[Math.floor(others.length/2)].dataset.i
})()`)
const c0 = await nodeSvgXY(controlIdx)
const p0svg = await nodeSvgXY(nodeInfo.i)
const scroll0 = await evalJs('scrollY')
const p0 = await nodeXY(nodeInfo.i)
await touch('touchStart', p0.x, p0.y)
// Hold still past LONG_PRESS_MS to arm the drag - the standard touch gesture.
await sleep(400)
for (let s = 1; s <= 8; s++) {
  await touch('touchMove', p0.x + s * 2, p0.y - s * 9)
  await sleep(35)
}
await touch('touchEnd', p0.x + 16, p0.y - 72)
await sleep(700)
const p1svg = await nodeSvgXY(nodeInfo.i)
const c1 = await nodeSvgXY(controlIdx)
const scroll1 = await evalJs('scrollY')
const moved = Math.hypot(p1svg.x - p0svg.x, p1svg.y - p0svg.y)
const drift = Math.hypot(c1.x - c0.x, c1.y - c0.y)
const dyUp = p0svg.y - p1svg.y
console.log('TEST 2 (SVG space) dragged node moved', moved.toFixed(1),
  'px, dy up ' + dyUp.toFixed(1) + '; untouched control drifted', drift.toFixed(1),
  'px; page scrolled', (scroll1 - scroll0).toFixed(0), 'px')
console.log('TEST 2', (dyUp > 15 && moved > drift * 2)
  ? 'PASS - node followed the finger, not the page'
  : 'FAIL - movement indistinguishable from simulation drift')


// --- TEST 3 (the regression this must not cause): a QUICK vertical swipe with
// no long-press must still scroll the page and must NOT drag the node.
const q0 = await nodeSvgXY(nodeInfo.i)
const qs0 = await evalJs('scrollY')
const qp = await nodeXY(nodeInfo.i)
await touch('touchStart', qp.x, qp.y)
await sleep(30)                       // no hold - straight into the swipe
for (let s2 = 1; s2 <= 8; s2++) { await touch('touchMove', qp.x, qp.y - s2 * 9); await sleep(25) }
await touch('touchEnd', qp.x, qp.y - 72)
await sleep(700)
const q1 = await nodeSvgXY(nodeInfo.i)
const qs1 = await evalJs('scrollY')
const qMoved = Math.hypot(q1.x - q0.x, q1.y - q0.y)
console.log('TEST 3 quick swipe -> node moved', qMoved.toFixed(1), 'px, page scrolled',
  (qs1 - qs0).toFixed(0), 'px')
console.log('TEST 3', qMoved < 10 ? 'PASS - scrolling past a node still works'
  : 'FAIL - a scroll attempt dragged the node')

ws.close()
