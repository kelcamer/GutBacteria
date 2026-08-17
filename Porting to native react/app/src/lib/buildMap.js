// Ported near-verbatim from `GFA_buildMap` in gut-flora-atlas.readable.html
// (~line 27238-28117, 406 lines) - the force-directed graph engine that
// powers two features: the all-conditions "Condition <-> bacteria map"
// (Gfx -> ConditionsMap.jsx, pinType left undefined -> defaults to "cond")
// and the "Condition <-> brain region" maps (GFA_BrainTab -> BrainTab.jsx,
// which reuses the SAME rim/node/taxa vocabulary but every "taxon" name is
// actually a brain region, matched against BRAIN_REGION_INFO for the
// tooltip description + up/down symptom lists).
//
// This is a separate, smaller engine from `buildSymptomMap` (1067 lines) -
// different signature/param order, different node-sizing formula, and a
// brain-region-aware tooltip branch that GFA_buildSymptomMap doesn't have.
// They were NOT unified: despite superficial similarity (both are
// force-directed rim/center SVG graphs with the same drag/pin/double-click
// interaction model), the original never merged them, and inventing a
// shared abstraction here would be a real behavior-risking rewrite, not a
// port. Ported as close to verbatim as possible, matching the discipline
// established for buildSymptomMap.js - every threshold and comment
// (including the ones documenting past interaction bugs) is preserved.
//
// Only mechanical changes made: GFA_-prefixed helper calls renamed to
// local functions/imports (esc/lum/copyTipText local, dirColor/dirArrow
// imported from theme), GFA_BRAIN_REGION_INFO -> imported BRAIN_REGION_INFO,
// and `function GFA_buildMap(...)` -> `export function buildMap(...)`.
import { dirColor, dirArrow } from '../theme'
import { BRAIN_REGION_INFO } from '../data/brainRegionInfo'
import { canonTaxon } from './conditionSymptomData'

function esc(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
}

function lum(hex) {
  try {
    const c = (hex || '#888888').replace('#', '')
    const r = parseInt(c.slice(0, 2), 16) / 255
    const g = parseInt(c.slice(2, 4), 16) / 255
    const b = parseInt(c.slice(4, 6), 16) / 255
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  } catch {
    return 0.5
  }
}

function copyTipText(el, btn) {
  const clone = el.cloneNode(true)
  ;['gfa-tip-drag', 'gfa-tip-resize', 'gfa-tip-close', 'gfa-tip-copy'].forEach((cls) => {
    const n = clone.querySelector('.' + cls)
    if (n && n.parentNode) n.parentNode.removeChild(n)
  })
  const text = (clone.innerText || clone.textContent || '').replace(/\n{3,}/g, '\n\n').trim()
  const done = (ok) => {
    if (!btn) return
    const orig = btn.innerHTML
    btn.innerHTML = ok ? '&#10003;' : '&#10007;'
    setTimeout(() => { btn.innerHTML = orig }, 900)
  }
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => done(true)).catch(() => done(false))
  } else {
    try {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0'
      document.body.appendChild(ta)
      ta.focus()
      ta.select()
      const ok = document.execCommand('copy')
      document.body.removeChild(ta)
      done(ok)
    } catch {
      done(false)
    }
  }
}

export function buildMap(host, tip, conds, mode, scramble, dimNodes, pinType, hiddenNamesRef, onBackgroundClick, symptomXrefData) {
  pinType = pinType || 'cond'
  const NS = 'http://www.w3.org/2000/svg'
  const W = 1000
  let H = 820
  // Portrait-phone adaptation - mirrors buildSymptomMap.js's identical fix
  // (see its own comment): width:100%/height:auto plus a fixed viewBox
  // means rendered height is always renderedWidth * (H/W), so a narrow
  // phone container got the same wide/short aspect ratio a desktop does.
  // Taller viewBox on narrow containers spreads the rim/physics bounds
  // (W/H-proportional throughout this file) out vertically instead.
  if (host.clientWidth && host.clientWidth < 560) {
    H = Math.round(H * 1.4)
  }
  host.innerHTML = ''
  // Matches the invisible hit-target circle radius set on every node below,
  // and floors the physics collision distance the same way
  // buildSymptomMap.js's own HIT_R already does - added here as a
  // preemptive safety measure while bumping node sizes ("bubbles too small
  // to click," app-wide), since a bigger hit target only stays useful if
  // two nodes are never allowed to settle close enough for their hit
  // targets to fully overlap.
  const HIT_R = 14

  const nodes = []
  const condIdx = []
  ;(conds || []).forEach((c, ci) => {
    const n = {
      type: 'cond',
      name: c.name,
      label: c.abbr || c.name.slice(0, 4),
      color: c.color || '#A08FC7',
      deg: (c.taxa || []).length,
      i: nodes.length,
      pin: pinType === 'cond',
    }
    condIdx[ci] = n.i
    nodes.push(n)
  })
  const bMap = {}
  const edges = []
  ;(conds || []).forEach((c, ci) => {
    const cI = condIdx[ci]
    ;(c.taxa || []).forEach((t) => {
      const nm = ((t && t.name) || '').trim()
      if (!nm) return
      let bi = bMap[nm]
      if (bi == null) {
        bi = nodes.length
        bMap[nm] = bi
        nodes.push({ type: 'bact', name: nm, deg: 0, conds: [], i: bi, pin: pinType === 'bact' })
      }
      nodes[bi].deg++
      nodes[bi].conds.push({ name: c.name, color: c.color, dir: t.dir, note: t.note, refs: t.refs, links: t.links })
      edges.push({ s: cI, t: bi, dir: t.dir })
    })
  })

  const vis = (n) => n.type === 'cond' || mode === 'all' || n.deg >= 2
  const V = nodes.filter(vis)
  const rm = {}
  V.forEach((n, i) => { rm[n.i] = i })
  const E = edges
    .filter((e) => rm[e.s] != null && rm[e.t] != null)
    .map((e) => ({ s: rm[e.s], t: rm[e.t], dir: e.dir }))
  V.forEach((n) => { n.adj = []; n.adjE = [] })
  E.forEach((e, ei) => {
    V[e.s].adj.push(e.t)
    V[e.t].adj.push(e.s)
    V[e.s].adjE.push(ei)
    V[e.t].adjE.push(ei)
  })

  let rimV = V.filter((n) => n.pin)
  const rimRad = pinType === 'bact' ? 0.42 : 0.37
  if (scramble) {
    for (let si = rimV.length - 1; si > 0; si--) {
      const sj = Math.floor(Math.random() * (si + 1))
      const tmp = rimV[si]
      rimV[si] = rimV[sj]
      rimV[sj] = tmp
    }
  }
  rimV.forEach((n, k) => {
    const a = (2 * Math.PI * k) / Math.max(rimV.length, 1) - Math.PI / 2
    n.x = W / 2 + Math.cos(a) * W * rimRad
    n.y = H / 2 + Math.sin(a) * H * rimRad
    n.vx = 0
    n.vy = 0
  })
  V.forEach((n) => {
    if (!n.pin) {
      if (scramble) {
        n.x = W / 2 + (Math.random() - 0.5) * W * 0.8
        n.y = H / 2 + (Math.random() - 0.5) * H * 0.8
        n.vx = 0
        n.vy = 0
        return
      }
      let sx = 0, sy = 0, c = 0
      n.adj.forEach((j) => {
        if (V[j].pin) {
          sx += V[j].x
          sy += V[j].y
          c++
        }
      })
      if (c) {
        n.x = W / 2 + (sx / c - W / 2) * 0.7 + (Math.random() - 0.5) * 40
        n.y = H / 2 + (sy / c - H / 2) * 0.7 + (Math.random() - 0.5) * 40
      } else {
        n.x = W / 2 + (Math.random() - 0.5) * W * 0.4
        n.y = H / 2 + (Math.random() - 0.5) * H * 0.4
      }
      n.vx = 0
      n.vy = 0
    }
  })

  const svg = document.createElementNS(NS, 'svg')
  svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H)
  svg.setAttribute('width', '100%')
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet')
  svg.style.display = 'block'
  svg.style.height = 'auto'
  svg.style.touchAction = 'pan-x pan-y pinch-zoom'

  const gE = document.createElementNS(NS, 'g')
  const gN = document.createElementNS(NS, 'g')
  svg.appendChild(gE)
  svg.appendChild(gN)
  host.appendChild(svg)
  const eEls = E.map((e) => {
    const l = document.createElementNS(NS, 'line')
    l.setAttribute('stroke', dirColor(e.dir))
    l.setAttribute('stroke-opacity', '0.5')
    l.setAttribute('stroke-width', '1.15')
    gE.appendChild(l)
    return l
  })
  const nEls = V.map((n, i) => {
    const g = document.createElementNS(NS, 'g')
    g.setAttribute('data-i', i)
    g.style.cursor = 'pointer'
    const hit = document.createElementNS(NS, 'circle')
    hit.setAttribute('r', HIT_R)
    hit.setAttribute('fill', 'transparent')
    g.appendChild(hit)
    const circ = document.createElementNS(NS, 'circle')
    if (n.type === 'cond') {
      const r = 9.5 + Math.min(n.deg, 24) * 0.24 // bumped from 8 + deg*0.22
      n.r = r
      circ.setAttribute('r', r)
      circ.setAttribute('fill', n.color)
      circ.setAttribute('stroke', '#160E2B')
      circ.setAttribute('stroke-width', '1.4')
      g.appendChild(circ)
      const tx = document.createElementNS(NS, 'text')
      tx.setAttribute('text-anchor', 'middle')
      tx.setAttribute('dy', '0.32em')
      tx.setAttribute('font-size', '8.5')
      tx.setAttribute('font-weight', '800')
      tx.setAttribute('fill', lum(n.color) > 0.62 ? '#160E2B' : '#F1EAFF')
      tx.setAttribute('pointer-events', 'none')
      tx.textContent = n.label
      g.appendChild(tx)
    } else {
      const rr = 3.4 + Math.min(n.deg, 9) * 0.95 // bumped from 2.4 + deg*0.85
      n.r = rr
      circ.setAttribute('r', rr)
      circ.setAttribute('fill', n.deg >= 2 ? '#B9A7F0' : '#7C6BA8')
      circ.setAttribute('fill-opacity', n.deg >= 2 ? '0.95' : '0.66')
      g.appendChild(circ)
      const tb = document.createElementNS(NS, 'text')
      tb.setAttribute('text-anchor', 'middle')
      tb.setAttribute('dy', String(-(rr + 2.5)))
      tb.setAttribute('font-size', '7.5')
      tb.setAttribute('fill', '#A08FC7')
      tb.setAttribute('pointer-events', 'none')
      tb.textContent = n.name.length > 22 ? n.name.slice(0, 21) + '…' : n.name
      g.appendChild(tb)
    }
    gN.appendChild(g)
    return { g, node: n }
  })

  let alpha = 1, tick = 0, raf = 0, stopped = false
  const maxTick = V.length > 150 ? 300 : 360
  const kRep = mode === 'all' ? 230 : 420
  const linkLen = mode === 'all' ? 52 : 92
  const kLink = 0.04
  const cx = W / 2, cy = H / 2

  let curr = null
  let dragNode = null
  let dragIdx = null // V-array position of dragNode, NOT dragNode.i - see onPointerDown's comment (same fix as buildSymptomMap.js's identical bug: clicking a node could select a DIFFERENT one whenever an earlier zero-degree node had been filtered out of V, shifting every later node's true V-position below its stale .i)
  let isDragging = false
  let bgDown = false
  let dragStartX = 0, dragStartY = 0
  const DRAG_THRESHOLD = 4 // px of real movement required before a click becomes a drag — real mice/trackpads almost never report exactly 0 movement between pointerdown/pointerup, so without this a plain click is misread as a drag and never registers as a selection.
  let lastClickIdx = null, lastClickTime = 0
  const DBLCLICK_WINDOW = 400 // ms — our own double-click detection (matching node INDEX, not exact pixel position), replacing reliance on the browser's native dblclick event. Native dblclick failed to fire reliably here: its target-matching seems to be thrown off by a few px of cursor drift between the two clicks (or by the node itself drifting under force-directed physics between clicks), which a real click on a small node easily triggers.
  const selectedNodes = new Set()
  let pinnedEls = {}
  let zCounter = 10
  const wrap = tip.parentNode || host.parentNode
  let hideTimer = null
  const hiddenNodes = new Set()

  function step() {
    tick++
    for (let i = 0; i < V.length; i++) {
      const a = V[i]
      for (let j = i + 1; j < V.length; j++) {
        const b = V[j]
        const dx = a.x - b.x, dy = a.y - b.y
        const d2 = dx * dx + dy * dy + 0.01
        const d = Math.sqrt(d2)
        let force = (kRep / d2) * alpha
        const mind = Math.max(a.r, HIT_R) + Math.max(b.r, HIT_R) + 2
        if (d < mind) force += (mind - d) * 0.05
        const fx = (dx / d) * force, fy = (dy / d) * force
        a.vx += fx
        a.vy += fy
        b.vx -= fx
        b.vy -= fy
      }
    }
    for (let k = 0; k < E.length; k++) {
      const e = E[k], na = V[e.s], nb = V[e.t]
      const ex = nb.x - na.x, ey = nb.y - na.y
      const ed = Math.sqrt(ex * ex + ey * ey) + 0.01
      const lf = (ed - linkLen) * kLink * alpha
      const lfx = (ex / ed) * lf, lfy = (ey / ed) * lf
      na.vx += lfx
      na.vy += lfy
      nb.vx -= lfx
      nb.vy -= lfy
    }
    for (let m = 0; m < V.length; m++) {
      const n = V[m]
      if (n.pin || n.manualPin || n === dragNode) {
        n.vx = 0
        n.vy = 0
        continue
      }
      n.vx += (cx - n.x) * 0.006 * alpha
      n.vy += (cy - n.y) * 0.006 * alpha
      n.vx *= 0.85
      n.vy *= 0.85
      n.x += Math.max(-9, Math.min(9, n.vx))
      n.y += Math.max(-9, Math.min(9, n.vy))
      n.x = Math.max(14, Math.min(W - 14, n.x))
      n.y = Math.max(28, Math.min(H - 14, n.y))
    }
    render()
    alpha *= 0.985
    if (tick < maxTick && !stopped) raf = requestAnimationFrame(step)
    else raf = 0
  }

  function render() {
    for (let i = 0; i < E.length; i++) {
      const e = E[i], l = eEls[i], a = V[e.s], b = V[e.t]
      l.setAttribute('x1', a.x)
      l.setAttribute('y1', a.y)
      l.setAttribute('x2', b.x)
      l.setAttribute('y2', b.y)
    }
    for (let q = 0; q < nEls.length; q++) {
      const ne = nEls[q]
      ne.g.setAttribute('transform', 'translate(' + ne.node.x + ',' + ne.node.y + ')')
    }
  }

  raf = requestAnimationFrame(step)

  function setHi(idx) {
    const active = new Set(selectedNodes)
    if (idx != null) active.add(idx)

    if (active.size === 0) {
      for (let i = 0; i < eEls.length; i++) {
        eEls[i].setAttribute('stroke-opacity', '0.5')
        eEls[i].setAttribute('stroke-width', '1.15')
      }
      for (let q = 0; q < nEls.length; q++) nEls[q].g.style.opacity = '1'
      return
    }

    const hiE = {}, hiN = {}
    active.forEach((nodeIdx) => {
      hiN[nodeIdx] = 1
      V[nodeIdx].adjE.forEach((x) => { hiE[x] = 1 })
      V[nodeIdx].adj.forEach((x) => { hiN[x] = 1 })
    })

    for (let i = 0; i < eEls.length; i++) {
      if (hiE[i]) {
        eEls[i].setAttribute('stroke-opacity', '0.98')
        eEls[i].setAttribute('stroke-width', '2.1')
      } else {
        eEls[i].setAttribute('stroke-opacity', '0.09')
        eEls[i].setAttribute('stroke-width', '0.7')
      }
    }
    for (let q = 0; q < nEls.length; q++) nEls[q].g.style.opacity = '1' // general rule: selection only dims/highlights connections, nodes stay fully visible so you can still click around and compare
  }

  // New (no minified-source equivalent): optional cross-reference into
  // symptom_data.json, mirroring buildSymptomMap.js's own xrefBactToSymptoms
  // - built once here (not per popup) as canonicalized-bacterium-name ->
  // [{symptom, dir}], so a condition's own taxa (species/strain-level names
  // like "Bifidobacterium bifidum") can be matched against symptom_data
  // .json's genus-level bacteria entries the same way bacteriumFocusMap.js
  // already does (canonTaxon). Only built if the caller actually passes
  // symptomXrefData - every other behavior here is unchanged when it's
  // omitted.
  const xrefBactToSymptoms = {}
  if (symptomXrefData) {
    ;(symptomXrefData.bacteria || []).forEach((b) => {
      const list = []
      ;(b.up || []).forEach((x) => list.push({ symptom: x.symptom, dir: 'up' }))
      ;(b.down || []).forEach((x) => list.push({ symptom: x.symptom, dir: 'down' }))
      ;(b.both || []).forEach((x) => list.push({ symptom: x.symptom, dir: 'both' }))
      xrefBactToSymptoms[b.name] = list
    })
  }

  const srcRow = (note, ref, url) => {
    const bits = []
    if (note) bits.push('<div style="color:#B9A7F0;margin-top:1px">' + esc(note) + '</div>')
    if (ref) {
      const refHtml = url
        ? '<a href="' + esc(url) + '" target="_blank" rel="noopener" style="color:#8FD3F4;text-decoration:underline">' + esc(ref) + ' ↗</a>'
        : esc(ref)
      bits.push('<div style="color:#6b5c8f;margin-top:1px">Source: ' + refHtml + '</div>')
    }
    return bits.join('')
  }

  function buildTipHtml(idx) {
    const node = V[idx]
    let html
    if (node.type === 'cond') {
      const cond = conds[node.i]
      const taxa = (cond && cond.taxa) || []
      const isBrain = !!(BRAIN_REGION_INFO && taxa.length && BRAIN_REGION_INFO[taxa[0].name])
      const trows = taxa
        .map((t) => {
          const bi = bMap[(t.name || '').trim()]
          const also = bi != null ? nodes[bi].conds.filter((oc) => oc.name !== cond.name).map((oc) => oc.name) : []
          const alsoHtml = also.length ? '<div style="color:#6b5c8f;margin-top:1px">Also in: ' + esc(also.join(', ')) + '</div>' : ''
          const link = (t.links && t.links[0]) || null
          const regionInfo = isBrain && BRAIN_REGION_INFO[t.name]
          const descHtml = regionInfo ? ' - ' + esc(regionInfo.desc) : ''
          return (
            '<div style="margin:4px 0;padding-bottom:4px;border-bottom:1px solid rgba(255,255,255,.06)">' +
            esc(t.name) + ' <b style="color:' + dirColor(t.dir) + '">' + dirArrow(t.dir) + '</b>' +
            '<span style="color:#B9A7F0">' + descHtml + '</span>' + srcRow(t.note, t.refs, link ? link.url : null) + alsoHtml + '</div>'
          )
        })
        .join('')
      let summaryHtml = ''
      if (isBrain) {
        const upItems = [], downItems = [], seen = {}
        taxa.forEach((t) => {
          const info = BRAIN_REGION_INFO[t.name]
          if (!info) return
          const list = t.dir === 'up' ? info.up : t.dir === 'down' ? info.down : (info.up || []).concat(info.down || [])
          ;(list || []).forEach((s) => {
            const key = s.toLowerCase()
            if (!seen[key]) {
              seen[key] = 1
              ;(t.dir === 'down' ? downItems : upItems).push(s)
            }
          })
        })
        const symLis = upItems.concat(downItems).slice(0, 10).map((s) => '<li>' + esc(s) + '</li>').join('')
        if (symLis) {
          summaryHtml =
            '<div style="margin-top:6px;padding-top:6px;border-top:1px solid rgba(255,255,255,.08)"><b style="color:#F1EAFF;font-size:10.5px">Likely symptom presentation</b><div style="color:#7C6BA8;font-size:9.5px;margin-bottom:2px">Synthesized from this condition\'s regions and their reported directions — not a diagnostic claim.</div><ul style="margin:2px 0 0 16px;padding:0;color:#A08FC7">' +
            symLis + '</ul></div>'
        }
      } else if (Object.keys(xrefBactToSymptoms).length) {
        // New (no minified-source equivalent): cross-references this
        // condition's own bacteria taxa against symptom_data.json - same
        // net-tally technique buildSymptomMap.js's symptom-node popups use
        // (agree/disagree per shared bacterium, summed across every
        // bacterium this condition and a candidate symptom both touch, so
        // one lucky/unlucky single bacterium can't misrepresent a
        // multi-bacterium condition), ranked by margin, capped at 8.
        const tally = {}
        taxa.forEach((t) => {
          if (t.dir !== 'up' && t.dir !== 'down') return
          const canon = canonTaxon((t.name || '').trim())
          ;(xrefBactToSymptoms[canon] || []).forEach((o) => {
            if (o.dir !== 'up' && o.dir !== 'down') return
            const rec = tally[o.symptom] || (tally[o.symptom] = { agree: 0, disagree: 0 })
            if (o.dir === t.dir) rec.agree++
            else rec.disagree++
          })
        })
        // Same near-duplicate-concept exclusion as
        // symptomMapConditionOverlay.js's withExtraConditions: a condition
        // sharing its exact parenthetical abbreviation with a symptom (only
        // "FUT2 (Non-secretor)" the condition vs. "Non-secretor status
        // (FUT2)" the symptom, checked - the only such pair app-wide) is
        // the same underlying concept represented twice, so it'll always
        // land at/near the top of "related" by sheer near-total agreement -
        // true but redundant, not useful signal, so it's excluded here too.
        const abbrMatch = (cond.name || '').match(/\(([^)]+)\)/)
        const abbrPattern = abbrMatch ? new RegExp('\\(' + abbrMatch[1].replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\)', 'i') : null
        const related = []
        Object.keys(tally).forEach((name) => {
          if (abbrPattern && abbrPattern.test(name)) return
          const rec = tally[name]
          if (rec.agree > rec.disagree) related.push({ name, margin: rec.agree - rec.disagree })
        })
        related.sort((a, b) => b.margin - a.margin || a.name.localeCompare(b.name))
        const CAP = 8
        const shown = related.slice(0, CAP)
        const more = related.length > CAP ? related.length - CAP : 0
        if (shown.length) {
          summaryHtml =
            // Caveat strengthened after a user-reported case in the sibling
            // buildSymptomMap.js popup came out backwards from the real,
            // known biology (see that file's own comment) - this is the
            // same shared-bacteria statistical inference, so it carries
            // the same risk of contradicting real biology, not just being
            // "non-diagnostic."
            '<div style="margin-top:6px;padding-top:6px;border-top:1px solid rgba(255,255,255,.08)"><b style="color:#8FD3F4;font-size:10.5px">Most Likely Related Symptoms</b><div style="color:#7C6BA8;font-size:9.5px;margin-bottom:2px">Inferred from shared bacteria moving the same direction, most-shared first — a statistical pattern, not a verified or causal claim.</div>' +
            esc(shown.map((x) => x.name).join(', ')) + (more ? ' <span style="color:#7C6BA8">+' + more + ' more</span>' : '') + '</div>'
        }
      }
      html =
        '<div style="font-weight:700;color:#F1EAFF">' + esc(node.name) + '</div><div style="color:#A08FC7;font-size:10px;margin-bottom:3px">' +
        node.deg + ' taxa mapped</div>' + summaryHtml +
        '<div style="font-size:10.5px;line-height:1.5;max-height:260px;overflow-y:auto;margin-top:6px">' +
        (trows || '<div style="color:#7C6BA8">No taxa logged.</div>') + '</div>'
    } else {
      const rows = node.conds
        .map((x) => {
          const link = (x.links && x.links[0]) || null
          return (
            '<div style="margin:4px 0;padding-bottom:4px;border-bottom:1px solid rgba(255,255,255,.06)"><span style="display:inline-flex;align-items:center;gap:4px"><span style="width:7px;height:7px;border-radius:9px;background:' +
            (x.color || '#A08FC7') + ';display:inline-block"></span>' + esc(x.name) + ' <b style="color:' + dirColor(x.dir) + '">' + dirArrow(x.dir) + '</b></span>' +
            srcRow(x.note, x.refs, link ? link.url : null) + '</div>'
          )
        })
        .join('')
      const info = BRAIN_REGION_INFO && BRAIN_REGION_INFO[node.name]
      let infoHtml = ''
      if (info) {
        const upItems = (info.up || []).map((s) => '<li>' + esc(s) + '</li>').join('')
        const downItems = (info.down || []).map((s) => '<li>' + esc(s) + '</li>').join('')
        infoHtml =
          '<div style="color:#C9BEEA;margin-bottom:6px;padding-bottom:6px;border-bottom:1px solid rgba(255,255,255,.08)">' + esc(info.desc) + '</div>' +
          (upItems ? '<div style="margin-bottom:3px"><b style="color:' + dirColor('up') + '">▲ If increased:</b><ul style="margin:2px 0 0 16px;padding:0;color:#A08FC7">' + upItems + '</ul></div>' : '') +
          (downItems ? '<div style="margin-bottom:6px"><b style="color:' + dirColor('down') + '">▼ If decreased:</b><ul style="margin:2px 0 0 16px;padding:0;color:#A08FC7">' + downItems + '</ul></div>' : '')
      }
      html =
        '<div style="font-weight:700;color:#F1EAFF">' + esc(node.name) + '</div><div style="color:#A08FC7;font-size:10px;margin-bottom:3px">in ' +
        node.deg + ' condition' + (node.deg > 1 ? 's' : '') + '</div><div style="font-size:10.5px;line-height:1.5;max-height:260px;overflow-y:auto">' + infoHtml + rows + '</div>'
    }
    return html
  }

  function wireChrome(el) {
    if (el.dataset.wired) return
    el.dataset.wired = '1'
    el.addEventListener('pointerdown', (ev) => {
      el.style.zIndex = String(++zCounter)
      const closeH = ev.target && ev.target.closest && ev.target.closest('.gfa-tip-close')
      if (closeH) {
        ev.preventDefault()
        ev.stopPropagation()
        closePinned(+el.dataset.idx)
        setHi(curr)
        return
      }
      const copyH = ev.target && ev.target.closest && ev.target.closest('.gfa-tip-copy')
      if (copyH) {
        ev.preventDefault()
        ev.stopPropagation()
        copyTipText(el, copyH)
      }
    })
    let gfaDragging = false, gfaSX = 0, gfaSY = 0, gfaSL = 0, gfaST = 0
    el.addEventListener('pointerdown', (ev) => {
      const handle = ev.target && ev.target.closest && ev.target.closest('.gfa-tip-drag')
      if (!handle) return
      gfaDragging = true
      gfaSX = ev.clientX
      gfaSY = ev.clientY
      gfaSL = parseFloat(el.style.left) || 0
      gfaST = parseFloat(el.style.top) || 0
      if (el.setPointerCapture) try { el.setPointerCapture(ev.pointerId) } catch { /* noop */ }
      ev.preventDefault()
    })
    el.addEventListener('pointermove', (ev) => {
      if (!gfaDragging) return
      const dx = ev.clientX - gfaSX, dy = ev.clientY - gfaSY
      const rect = wrap.getBoundingClientRect()
      let nx = gfaSL + dx, ny = gfaST + dy
      const tw = el.offsetWidth, th = el.offsetHeight
      nx = Math.max(4, Math.min(nx, rect.width - tw - 4))
      ny = Math.max(4, Math.min(ny, rect.height - th - 4))
      el.style.left = nx + 'px'
      el.style.top = ny + 'px'
    })
    el.addEventListener('pointerup', () => { gfaDragging = false })
    el.addEventListener('pointercancel', () => { gfaDragging = false })
    let gfaResizing = false, gfaRSX = 0, gfaRSY = 0, gfaRSW = 0, gfaRSH = 0, gfaRSL = 0, gfaRST = 0
    el.addEventListener('pointerdown', (ev) => {
      const rHandle = ev.target && ev.target.closest && ev.target.closest('.gfa-tip-resize')
      if (!rHandle) return
      gfaResizing = true
      gfaRSX = ev.clientX
      gfaRSY = ev.clientY
      gfaRSW = el.offsetWidth
      gfaRSH = el.offsetHeight
      gfaRSL = parseFloat(el.style.left) || 0
      gfaRST = parseFloat(el.style.top) || 0
      el.style.maxWidth = 'none'
      el.style.overflow = 'auto'
      el.style.userSelect = 'none'
      if (el.setPointerCapture) try { el.setPointerCapture(ev.pointerId) } catch { /* noop */ }
      ev.preventDefault()
      ev.stopPropagation()
    })
    el.addEventListener('pointermove', (ev) => {
      if (!gfaResizing) return
      const dw = ev.clientX - gfaRSX, dh = ev.clientY - gfaRSY
      const nw = Math.max(160, Math.min(gfaRSW - dw, 560))
      const nh = Math.max(90, Math.min(gfaRSH - dh, 600))
      el.style.width = nw + 'px'
      el.style.height = nh + 'px'
      el.style.left = gfaRSL + (gfaRSW - nw) + 'px'
      el.style.top = gfaRST + (gfaRSH - nh) + 'px'
    })
    el.addEventListener('pointerup', () => { gfaResizing = false; el.style.userSelect = '' })
    el.addEventListener('pointercancel', () => { gfaResizing = false; el.style.userSelect = '' })
  }

  function renderTip(el, idx, withChrome) {
    const html = buildTipHtml(idx)
    if (withChrome) {
      el.innerHTML =
        '<div class="gfa-tip-drag" style="cursor:move;padding:2px 20px 2px 20px;margin:-2px -2px 4px -2px;color:#7C6BA8;font-size:9px;text-align:center;border-bottom:1px solid rgba(255,255,255,.08);user-select:none;touch-action:none">&#10021; drag to move</div><div class="gfa-tip-resize" style="position:absolute;left:0;top:0;width:20px;height:20px;cursor:nwse-resize;background:rgba(124,107,168,.35);border-radius:10px 0 8px 0;opacity:.85;font-size:13px;line-height:20px;text-align:center;color:#E4DBFF;user-select:none;touch-action:none;z-index:2">&#8598;</div><div class="gfa-tip-copy" title="Copy this popup\'s text" style="position:absolute;right:20px;top:2px;width:16px;height:16px;cursor:pointer;font-size:12px;line-height:16px;text-align:center;color:#8FD3F4;user-select:none;touch-action:none;z-index:3">&#128203;</div><div class="gfa-tip-close" title="Close" style="position:absolute;right:2px;top:2px;width:16px;height:16px;cursor:pointer;font-size:14px;line-height:15px;text-align:center;color:#B9A7F0;user-select:none;touch-action:none;z-index:3">&times;</div>' +
        html
      wireChrome(el)
    } else {
      el.innerHTML = html
    }
  }

  function showPreview(idx) {
    if (hideTimer) { clearTimeout(hideTimer); hideTimer = null }
    renderTip(tip, idx, false)
    tip.style.opacity = '1'
    tip.style.pointerEvents = 'auto'
    const node = V[idx]
    const pt = svg.createSVGPoint()
    pt.x = node.x
    pt.y = node.y
    const sp = pt.matrixTransform(svg.getScreenCTM())
    const rect = wrap.getBoundingClientRect()
    const tw = tip.offsetWidth, th = tip.offsetHeight
    const edge = Math.max(node.r || 8, 12)
    const baseX = sp.x - rect.left, baseY = sp.y - rect.top
    let nx = baseX + edge + 6
    if (nx + tw > rect.width - 4) nx = baseX - edge - 6 - tw
    let ny = baseY - th / 2
    nx = Math.max(4, Math.min(nx, rect.width - tw - 4))
    ny = Math.max(4, Math.min(ny, rect.height - th - 4))
    tip.style.left = nx + 'px'
    tip.style.top = ny + 'px'
  }
  // eslint-disable-next-line no-unused-vars -- kept for parity with the original, which also defines it but never calls it (hover-preview was disabled in a past session; see buildSymptomMap.js's matching note)
  void showPreview

  function cancelHidePreview() {
    if (hideTimer) { clearTimeout(hideTimer); hideTimer = null }
  }

  function hidePreview() {
    if (hideTimer) clearTimeout(hideTimer)
    hideTimer = setTimeout(() => {
      tip.style.opacity = '0'
      tip.style.pointerEvents = 'none'
      hideTimer = null
    }, 200)
  }

  function showPinned(idx) {
    const key = String(idx)
    let el = pinnedEls[key]
    const isNew = !el
    if (!el) {
      el = document.createElement('div')
      el.className = 'gfa-tip-instance'
      el.style.cssText = tip.style.cssText
      el.style.opacity = '1'
      el.style.pointerEvents = 'auto'
      el.dataset.idx = key
      wrap.appendChild(el)
      pinnedEls[key] = el
    }
    el.style.zIndex = String(++zCounter)
    renderTip(el, idx, true)
    if (isNew) {
      // Open right next to the node that was actually double-clicked (same
      // node->screen conversion the old hover preview used), not in a fixed
      // corner of the map — the whole point of pinning is "here's this
      // node's info," so it should visually stay near that node. Still
      // draggable/closeable afterward via the existing chrome.
      const node = V[idx]
      const pt = svg.createSVGPoint()
      pt.x = node.x
      pt.y = node.y
      const sp = pt.matrixTransform(svg.getScreenCTM())
      const rect = wrap.getBoundingClientRect()
      const tw = el.offsetWidth, th = el.offsetHeight
      const edge = Math.max(node.r || 8, 12)
      const baseX = sp.x - rect.left, baseY = sp.y - rect.top
      const n = Object.keys(pinnedEls).length - 1
      const off = (n % 8) * 20 // stagger multiple simultaneously-open popups so they don't perfectly overlap
      let nx = baseX + edge + 6 + off
      if (nx + tw > rect.width - 6) nx = baseX - edge - 6 - tw - off
      let ny = baseY - th / 2 + off
      nx = Math.max(6, Math.min(nx, rect.width - tw - 6))
      ny = Math.max(6, Math.min(ny, rect.height - th - 6))
      el.style.left = nx + 'px'
      el.style.top = ny + 'px'
    }
  }

  function closePinned(idx) {
    const key = String(idx)
    const el = pinnedEls[key]
    if (el) {
      if (el.parentNode) el.parentNode.removeChild(el)
      delete pinnedEls[key]
    }
  }

  function closeAllPinned() {
    Object.keys(pinnedEls).forEach((key) => {
      const el = pinnedEls[key]
      if (el && el.parentNode) el.parentNode.removeChild(el)
    })
    pinnedEls = {}
    selectedNodes.clear()
  }

  function onPointerDown(ev) {
    if (ev.button === 2 || ev.buttons === 2) return // right-click is handled by onContextMenu only
    let el = ev.target
    while (el && el !== svg && !(el.dataset && el.dataset.i != null)) el = el.parentNode
    if (el && el.dataset && el.dataset.i != null) {
      const idx = +el.dataset.i
      dragNode = V[idx]
      dragIdx = idx
      isDragging = false
      bgDown = false
      dragStartX = ev.clientX
      dragStartY = ev.clientY
      // Pointer capture deferred to onPointerMove now, not claimed here -
      // mirrors buildSymptomMap.js's identical fix (see its own comment):
      // touching down ON a node while trying to scroll PAST it used to get
      // hijacked into an accidental drag, since capturing the pointer the
      // instant a node is touched (before knowing drag-vs-scroll intent)
      // let a vertical swipe get claimed as a drag once past
      // DRAG_THRESHOLD, blocking the browser's own scroll entirely.
    } else {
      bgDown = true
    }
  }

  function onPointerMove(ev) {
    if (dragNode) {
      if (!isDragging) {
        const jitterDx = ev.clientX - dragStartX, jitterDy = ev.clientY - dragStartY
        const jitterDist = Math.hypot(jitterDx, jitterDy)
        if (jitterDist < DRAG_THRESHOLD) return // still just a click, not a drag yet
        // Predominantly vertical movement past the threshold reads as
        // "trying to scroll the page," not "trying to drag this node" -
        // release it back to the browser's own touch-action pan handling
        // instead of claiming/preventDefault-ing it below. A horizontal or
        // diagonal drag still claims the node as before.
        if (Math.abs(jitterDy) > Math.abs(jitterDx) * 1.5) {
          dragNode = null
          return
        }
        svg.setPointerCapture(ev.pointerId)
      }
      if (ev.cancelable) ev.preventDefault()
      isDragging = true
      const pt = svg.createSVGPoint()
      pt.x = ev.clientX
      pt.y = ev.clientY
      const svgP = pt.matrixTransform(svg.getScreenCTM().inverse())
      dragNode.x = svgP.x
      dragNode.y = svgP.y
      dragNode.vx = 0
      dragNode.vy = 0

      alpha = 1
      tick = 0
      stopped = false
      if (!raf) raf = requestAnimationFrame(step)

      // Popups open only via double-click now; no preview during drag.
      return
    }

    let el = ev.target
    while (el && el !== svg && !(el.dataset && el.dataset.i != null)) el = el.parentNode
    if (el && el.dataset && el.dataset.i != null) {
      const idx = +el.dataset.i
      if (idx !== curr) {
        curr = idx
        setHi(curr)
      }
      // Popups open only via double-click now; hover no longer shows a preview.
    } else {
      if (curr != null) {
        curr = null
        setHi(null)
      }
      hidePreview()
    }
  }

  function onPointerUp(ev) {
    if (dragNode) {
      // Pointer capture is now only claimed once a real drag is confirmed
      // (see onPointerMove) - a plain tap that never crossed
      // DRAG_THRESHOLD never captured anything, so this release is a
      // guaranteed no-op in that case. Wrapped defensively rather than
      // assuming every browser silently no-ops releasing an uncaptured
      // pointer.
      try { svg.releasePointerCapture(ev.pointerId) } catch { /* not captured, harmless */ }
      if (isDragging) {
        dragNode.manualPin = true
        dragNode.vx = 0
        dragNode.vy = 0
      }
      if (!isDragging) {
        // Popups open only on double-click — detected here by matching node
        // INDEX within a short time window, not by the browser's native
        // dblclick event (which didn't fire reliably: its target-matching
        // gets thrown off by a few px of cursor drift between clicks, or by
        // the node itself drifting under force-directed physics, both of
        // which are easy to trigger on a real click of a small node). A
        // plain click still selects/deselects the node (drives the
        // highlight plus the Show Connections / Hide Isolated filters).
        const clickedIdx = dragIdx
        const now = Date.now()
        const isDoubleClick = lastClickIdx === clickedIdx && now - lastClickTime < DBLCLICK_WINDOW
        if (isDoubleClick) {
          lastClickIdx = null
          lastClickTime = 0 // consumed — a 3rd quick click starts fresh, not a chained toggle
          if (pinnedEls[String(clickedIdx)]) {
            closePinned(clickedIdx)
          } else {
            selectedNodes.add(clickedIdx)
            showPinned(clickedIdx)
            hidePreview()
          }
        } else {
          lastClickIdx = clickedIdx
          lastClickTime = now
          if (selectedNodes.has(clickedIdx)) selectedNodes.delete(clickedIdx)
          else selectedNodes.add(clickedIdx)
        }
        setHi(curr)
      }
      dragNode = null
      isDragging = false
    } else if (bgDown) {
      // REVERTED back to single-click: the double-click requirement was
      // guarding against pointercancel (a canceled touch gesture, e.g.
      // native pinch/double-tap-zoom taking over) reaching this branch -
      // that's now fixed at its actual source (see onPointerCancel below,
      // which handles cancels separately and never runs this logic at
      // all), so single-click is safe again without needing the extra
      // double-click layer on top.
      if (selectedNodes.size) {
        closeAllPinned()
        setHi(curr)
      }
      if (typeof onBackgroundClick === 'function') onBackgroundClick()
    }
    bgDown = false
  }

  // New: pointercancel used to be routed straight to onPointerUp, so a
  // touch gesture the browser CANCELS to take over natively (pinch-zoom,
  // double-tap-zoom) ran the exact same click/selection/background-clear
  // logic a real pointerup does - the actual root cause of the reported
  // "zooming clears my selection" bug on these maps specifically (a
  // separate mechanism from the ConditionsGrid instance of the same
  // symptom, which used a plain DOM onClick, not pointer events). A cancel
  // means the browser took the gesture over; user intent is unknown, so
  // this just resets transient state without treating it as any click.
  function onPointerCancel(ev) {
    if (dragNode) {
      try {
        svg.releasePointerCapture(ev.pointerId)
      } catch {
        // already released/invalid, harmless
      }
    }
    dragNode = null
    isDragging = false
    bgDown = false
  }

  function onPointerLeave(ev) {
    if (!dragNode) {
      if (ev.relatedTarget && tip.contains(ev.relatedTarget)) return
      curr = null
      setHi(null)
      hidePreview()
    }
  }

  function onTipLeave(ev) {
    if (ev.relatedTarget && host.contains(ev.relatedTarget)) return
    curr = null
    setHi(null)
    hidePreview()
  }
  tip.addEventListener('pointerleave', onTipLeave)
  tip.addEventListener('pointerenter', cancelHidePreview)

  function hideNode(idx) {
    if (hiddenNodes.has(idx)) return
    hiddenNodes.add(idx)
    if (hiddenNamesRef && hiddenNamesRef.current) hiddenNamesRef.current.add(V[idx].name)
    nEls[idx].g.style.display = 'none'
    for (let i = 0; i < E.length; i++) {
      if (E[i].s === idx || E[i].t === idx) eEls[i].style.display = 'none'
    }
    closePinned(idx)
    selectedNodes.delete(idx)
    if (curr === idx) curr = null
    hidePreview()
    setHi(curr)
  }

  function showConnectionsOnly() {
    if (!selectedNodes.size) return
    const keep = new Set(selectedNodes)
    if (selectedNodes.size === 1) {
      selectedNodes.forEach((idx) => {
        if (V[idx]) V[idx].adj.forEach((j) => { keep.add(j) })
      })
    } else {
      // Only keep neighbors SHARED by 2+ selected nodes — a region/taxon
      // touched by just one of the selected conditions isn't a connection
      // between the selection, so it shouldn't survive the filter either.
      const neighborCount = {}
      selectedNodes.forEach((idx) => {
        if (!V[idx]) return
        V[idx].adj.forEach((j) => { neighborCount[j] = (neighborCount[j] || 0) + 1 })
      })
      Object.keys(neighborCount).forEach((j) => {
        if (neighborCount[j] >= 2) keep.add(+j)
      })
    }
    V.forEach((n, idx) => {
      if (!keep.has(idx)) hideNode(idx)
    })
  }

  function hideIsolatedNodes() {
    V.forEach((n, idx) => {
      if (n.deg < 2) hideNode(idx)
    })
  }

  // New (no minified-source equivalent) - mirrors buildSymptomMap.js's own
  // showDirectionOnly exactly, including its "both"-counts-as-either-filter
  // semantics and one-way-until-Snap-back behavior; see that copy's
  // comment for the full reasoning. Edge-level, not node-level - a single
  // condition/region can have both up and down links at once.
  function showDirectionOnly(want) {
    const matches = (dir) => dir === want || dir === 'both'
    E.forEach((e, i) => {
      if (!matches(e.dir)) eEls[i].style.display = 'none'
    })
    V.forEach((n, idx) => {
      const hasVisibleEdge = n.adjE.some((ei) => matches(E[ei].dir))
      if (!hasVisibleEdge) hideNode(idx)
    })
  }

  function onContextMenu(ev) {
    let el = ev.target
    while (el && el !== svg && !(el.dataset && el.dataset.i != null)) el = el.parentNode
    if (el && el.dataset && el.dataset.i != null) {
      ev.preventDefault()
      hideNode(+el.dataset.i)
    }
  }

  svg.addEventListener('pointerdown', onPointerDown)
  svg.addEventListener('pointermove', onPointerMove)
  svg.addEventListener('pointerup', onPointerUp)
  svg.addEventListener('pointercancel', onPointerCancel)
  svg.addEventListener('pointerleave', onPointerLeave)
  svg.addEventListener('contextmenu', onContextMenu)

  if (hiddenNamesRef && hiddenNamesRef.current) {
    V.forEach((n, idx) => {
      if (hiddenNamesRef.current.has(n.name)) hideNode(idx)
    })
  }

  const stopFn = () => {
    stopped = true
    cancelAnimationFrame(raf)
    if (hideTimer) { clearTimeout(hideTimer); hideTimer = null }
    svg.removeEventListener('pointerdown', onPointerDown)
    svg.removeEventListener('pointermove', onPointerMove)
    svg.removeEventListener('pointerup', onPointerUp)
    svg.removeEventListener('pointercancel', onPointerCancel)
    svg.removeEventListener('pointerleave', onPointerLeave)
    svg.removeEventListener('contextmenu', onContextMenu)
    tip.removeEventListener('pointerleave', onTipLeave)
    tip.removeEventListener('pointerenter', cancelHidePreview)
    closeAllPinned()
    host.innerHTML = ''
    if (tip) tip.style.opacity = '0'
  }
  // New (no minified-source equivalent) - mirrors buildSymptomMap.js's own
  // selectByNames exactly (same V-array-position semantics showConnectionsOnly
  // above already relies on), added for GlobalSearch.jsx: jumping to a
  // brain region or condition from search highlights it as if it had been
  // clicked, without needing a real pointer event.
  function selectByNames(names) {
    // Clears first, not just adds: callers that re-invoke this on a
    // still-live graph instance (e.g. re-searching for a different
    // condition without the graph itself rebuilding) would otherwise
    // accumulate every past selection forever. A no-op change for the
    // existing "call once right after a fresh build" use, since
    // selectedNodes is already empty there.
    selectedNodes.clear()
    const wanted = new Set(names || [])
    V.forEach((n, idx) => {
      if (wanted.has(n.name)) selectedNodes.add(idx)
    })
    setHi(curr)
  }

  stopFn.showConnectionsOnly = showConnectionsOnly
  stopFn.hideIsolatedNodes = hideIsolatedNodes
  stopFn.selectByNames = selectByNames
  stopFn.showIncreasedOnly = () => showDirectionOnly('up')
  stopFn.showDecreasedOnly = () => showDirectionOnly('down')
  return stopFn
}

// dimNodes (the 6th param) is accepted for signature parity with the
// original but was unused there too - both call sites (GFA_BrainTab passes
// `false`, Gfx passes `undefined`) leave it a no-op. Not dead code we
// introduced; a pre-existing no-op parameter kept for fidelity.
