// Ported near-verbatim from `GFA_buildSymptomMap` in
// gut-flora-atlas.readable.html (~line 24929-25996, 1067 lines) - the
// force-directed graph engine, plain vanilla SVG/DOM manipulation (not
// JSX), used by 3 features: the global Bacteria<->Symptom map, the global
// Symptom<->Bacteria map (same engine, swapped pinType), and the
// per-condition scoped map. Deliberately ported as close to verbatim as
// possible rather than "modernized" - every threshold, comment, and
// workaround here (custom double-click detection, drag jitter threshold,
// hard collision resolution, invisible hit-targets) represents a real,
// previously-debugged interaction bug, documented as such in the
// original's own comments (kept verbatim below). This is exactly the
// class of code where a casual rewrite risks silently reintroducing a
// bug that was already found and fixed once - see PORTING_PLAN.md /
// ARCHITECTURE.md's project history for why this discipline matters.
//
// Only mechanical changes made: GFA_-prefixed helper calls renamed to
// imports (esc/dirColor/dirArrow/copyTipText), and `function
// GFA_buildSymptomMap(...)` -> `export function buildSymptomMap(...)`.
// Not yet reviewed line-by-line against the live original in a browser -
// see PORTING_PLAN.md's verification notes.
//
// One real addition since the port, not in the original: an optional 9th
// param, `onBackgroundClick` - fired from onPointerUp whenever a plain
// click lands on empty canvas (not a node, not a drag). Lets a caller
// hook "user clicked the background" without adding a second click
// listener of its own on top of this engine's existing pointer handling
// (which already tracks bgDown/dragNode precisely to distinguish a real
// background click from a node click or a drag) - SymptomTab.jsx uses it
// to clear its symptom/condition picker selection.
import { dirColor, dirArrow } from '../theme'

function esc(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
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
    } catch (e) {
      done(false)
    }
  }
}

export function buildSymptomMap(host, tip, data, mode, pinType, forceAllLabels, scramble, hiddenNamesRef, onBackgroundClick) {
    pinType = pinType || "bact";
    var NS = "http://www.w3.org/2000/svg";
    // Matches the invisible hit-target circle radius set on every node below
    // (`hit.setAttribute("r", HIT_R)`). Referenced again in the physics
    // collision floor so two nodes are never allowed to settle close enough
    // for their hit-targets to fully overlap - see that usage's comment for
    // why this needed its own constant instead of reusing each node's
    // visible radius (a.r/b.r).
    var HIT_R = 14; // bumped from 12 - "bubbles are too small to click," bumped one size step app-wide (both engines)
    var symptomsIn = (data && data.symptoms) || [],
      bacteriaIn = (data && data.bacteria) || [];
    var W = 1000,
      H = Math.max(420, Math.min(920, 250 + (symptomsIn.length + bacteriaIn.length) * 7)),
      upC = "#FF5C86",
      downC = "#4FC3F7";
    var PAL = ["#5B8DEF", "#B57BFF", "#FFA62B", "#FF6B6B", "#3DDC97", "#F45BAF", "#33C7E8", "#C3E88D", "#FF8FA3", "#8FD3F4", "#FFD166", "#9D8DF1"];
    host.innerHTML = "";

    var symptoms = (data && data.symptoms) || [];
    var bacteria = (data && data.bacteria) || [];

    var nodes = [],
      symIdx = {};
    symptoms.forEach(function(name, i) {
      var n = {
        type: "symptom",
        name: name,
        label: name,
        color: PAL[i % PAL.length],
        deg: 0,
        i: nodes.length,
        pin: pinType === "symptom"
      };
      symIdx[name] = n.i;
      nodes.push(n);
    });
    var edges = [];
    bacteria.forEach(function(b) {
      var bi = nodes.length;
      var bNode = {
        type: "bact",
        name: b.name,
        deg: 0,
        i: bi,
        pin: pinType === "bact",
        items: []
      };
      nodes.push(bNode);
      (b.up || []).forEach(function(x) {
        var si = symIdx[x.symptom];
        if (si == null) return;
        nodes[si].deg++;
        bNode.deg++;
        bNode.items.push({
          symptom: x.symptom,
          color: nodes[si].color,
          dir: "up",
          note: x.note,
          ref: x.ref,
          url: x.url
        });
        edges.push({
          s: si,
          t: bi,
          dir: "up",
          note: x.note,
          ref: x.ref,
          url: x.url
        });
      });
      (b.down || []).forEach(function(x) {
        var si = symIdx[x.symptom];
        if (si == null) return;
        nodes[si].deg++;
        bNode.deg++;
        bNode.items.push({
          symptom: x.symptom,
          color: nodes[si].color,
          dir: "down",
          note: x.note,
          ref: x.ref,
          url: x.url
        });
        edges.push({
          s: si,
          t: bi,
          dir: "down",
          note: x.note,
          ref: x.ref,
          url: x.url
        });
      });
      (b.both || []).forEach(function(x) {
        var si = symIdx[x.symptom];
        if (si == null) return;
        nodes[si].deg++;
        bNode.deg++;
        bNode.items.push({
          symptom: x.symptom,
          color: nodes[si].color,
          dir: "both",
          note: x.note,
          ref: x.ref,
          url: x.url
        });
        edges.push({
          s: si,
          t: bi,
          dir: "both",
          note: x.note,
          ref: x.ref,
          url: x.url
        });
      });
    });

    var vis = function(n) {
      if (n.type === "symptom") return true;
      return n.deg > 0 && (mode === "all" || n.deg >= 2);
    };
    var V = nodes.filter(vis),
      rm = {};
    V.forEach(function(n, i) {
      rm[n.i] = i;
    });
    var E = edges.filter(function(e) {
      return rm[e.s] != null && rm[e.t] != null;
    }).map(function(e) {
      return {
        s: rm[e.s],
        t: rm[e.t],
        dir: e.dir,
        note: e.note,
        ref: e.ref,
        url: e.url
      };
    });
    V.forEach(function(n) {
      n.adj = [];
      n.adjE = [];
    });
    E.forEach(function(e, ei) {
      V[e.s].adj.push(e.t);
      V[e.t].adj.push(e.s);
      V[e.s].adjE.push(ei);
      V[e.t].adjE.push(ei);
    });

    var rimV = V.filter(function(n) {
      return n.pin;
    });
    var rimRad = pinType === "bact" ? 0.48 : 0.33;

    function placeDynamic() {
      V.forEach(function(n) {
        if (!n.pin) {
          if (scramble) {
            n.x = W / 2 + (Math.random() - 0.5) * W * 0.7;
            n.y = H / 2 + (Math.random() - 0.5) * H * 0.7;
            n.vx = 0;
            n.vy = 0;
            return;
          }
          var sx = 0,
            sy = 0,
            c = 0;
          n.adj.forEach(function(j) {
            if (V[j].pin) {
              sx += V[j].x;
              sy += V[j].y;
              c++;
            }
          });
          if (c) {
            n.x = W / 2 + (sx / c - W / 2) * 0.55 + (Math.random() - 0.5) * 6;
            n.y = H / 2 + (sy / c - H / 2) * 0.55 + (Math.random() - 0.5) * 6;
          } else {
            n.x = W / 2 + (Math.random() - 0.5) * W * 0.2;
            n.y = H / 2 + (Math.random() - 0.5) * H * 0.2;
          }
          n.vx = 0;
          n.vy = 0;
        }
      });
    }
    if (scramble) {
      // Fisher-Yates shuffle so the rim order itself is randomized too, not
      // just the inward-drifting nodes — a real "new arrangement" each click.
      for (var si = rimV.length - 1; si > 0; si--) {
        var sj = Math.floor(Math.random() * (si + 1));
        var tmp = rimV[si];
        rimV[si] = rimV[sj];
        rimV[sj] = tmp;
      }
    }
    rimV.forEach(function(n, k) {
      var a = 2 * Math.PI * k / Math.max(rimV.length, 1) - Math.PI / 2;
      n.x = W / 2 + Math.cos(a) * W * rimRad;
      n.y = H / 2 + Math.sin(a) * H * rimRad;
      n.vx = 0;
      n.vy = 0;
    });
    placeDynamic();
    // Barycenter crossing-reduction: re-sort the rim by the angle of each node's
    // neighbor centroid, then re-place dynamic nodes. A few passes converge to a
    // layout with far fewer crossing lines than the arbitrary insertion order.
    // Only applied when bacteria are the rim (there are many of them, decluttering
    // matters) — when symptoms are the rim there are few enough that a fixed,
    // thematically-grouped order (GI -> systemic -> neuro-sensory -> mood) reads
    // better than a data-driven shuffle, so that order is left alone. Skipped
    // entirely while scrambling, since re-sorting would just undo the shuffle.
    if (pinType === "bact" && !scramble) {
      for (var xpass = 0; xpass < 3; xpass++) {
        rimV.forEach(function(n) {
          var sx = 0,
            sy = 0,
            c = 0;
          n.adj.forEach(function(j) {
            sx += V[j].x;
            sy += V[j].y;
            c++;
          });
          n._ang = c ? Math.atan2((sy / c) - H / 2, (sx / c) - W / 2) : Math.random() * 2 * Math.PI;
        });
        rimV.sort(function(a, b) {
          return a._ang - b._ang;
        });
        rimV.forEach(function(n, k) {
          var a = 2 * Math.PI * k / Math.max(rimV.length, 1) - Math.PI / 2;
          n.x = W / 2 + Math.cos(a) * W * rimRad;
          n.y = H / 2 + Math.sin(a) * H * rimRad;
          n.vx = 0;
          n.vy = 0;
        });
        placeDynamic();
      }
    }

    // Label-collision avoidance: symptom labels and any bacterium with 3+
    // connections always show — they seed the "taken" list unconditionally.
    // Everything else (low-connection bacteria, the "outside" long tail) is
    // best-effort: shown when it doesn't collide with an already-placed label.
    // Small maps (e.g. a single condition's own taxa) pass forceAllLabels to
    // skip the collision math entirely and just label every node.
    if (forceAllLabels) {
      V.forEach(function(n) {
        n.showLabel = true;
      });
    } else {
      var acceptedBoxes = [];

      function bactBox(n) {
        var nm = n.name.length > 22 ? n.name.slice(0, 21) + "…" : n.name,
          w = nm.length * 4.6,
          h = 10,
          labelCy = n.y - n.r - 2.5 - h / 2;
        return {
          x0: n.x - w / 2,
          x1: n.x + w / 2,
          y0: labelCy - h / 2,
          y1: labelCy + h / 2
        };
      }
      V.forEach(function(n) {
        if (n.type === "symptom") {
          n.showLabel = true;
          var w = n.label.length * 7,
            h = 14,
            labelCy = n.y - n.r - 6 - h / 2;
          acceptedBoxes.push({
            x0: n.x - w / 2,
            x1: n.x + w / 2,
            y0: labelCy - h / 2,
            y1: labelCy + h / 2
          });
        } else if (n.deg > 3) {
          n.showLabel = true;
          acceptedBoxes.push(bactBox(n));
        }
      });
      var candidates = V.filter(function(n) {
        return n.type === "bact" && n.deg <= 3;
      });
      candidates.sort(function(a, b) {
        return b.deg - a.deg;
      });
      candidates.forEach(function(n) {
        var box = bactBox(n);
        var overlaps = acceptedBoxes.some(function(b) {
          return !(box.x1 < b.x0 - 2 || box.x0 > b.x1 + 2 || box.y1 < b.y0 - 2 || box.y0 > b.y1 + 2);
        });
        if (!overlaps) {
          n.showLabel = true;
          acceptedBoxes.push(box);
        }
      });
    }

    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    svg.setAttribute("width", "100%");
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    svg.style.display = "block";
    svg.style.height = "auto";
    svg.style.touchAction = "pan-x pan-y pinch-zoom";

    var gE = document.createElementNS(NS, "g"),
      gN = document.createElementNS(NS, "g");
    svg.appendChild(gE);
    svg.appendChild(gN);
    host.appendChild(svg);
    var eEls = E.map(function(e) {
      var l = document.createElementNS(NS, "line");
      l.setAttribute("stroke", dirColor(e.dir));
      l.setAttribute("stroke-opacity", "0.5");
      l.setAttribute("stroke-width", "1.15");
      gE.appendChild(l);
      return l;
    });
    var nEls = V.map(function(n, i) {
      var g = document.createElementNS(NS, "g");
      g.setAttribute("data-i", i);
      g.style.cursor = "pointer";
      // Invisible hit-target underneath the visible dot: low-connection bacteria
      // in a small (e.g. per-condition) map can render at just 2-5px, far too
      // small to reliably grab. This keeps the visible circle's true size while
      // making every node draggable regardless of how small it draws.
      var hit = document.createElementNS(NS, "circle");
      hit.setAttribute("r", HIT_R);
      hit.setAttribute("fill", "transparent");
      g.appendChild(hit);
      var circ = document.createElementNS(NS, "circle");
      if (n.type === "symptom") {
        var r = 15 + Math.min(n.deg, 40) * 0.3; // bumped from 13 + deg*0.28 - "make all nodes one size larger" for easier clicking
        n.r = r;
        circ.setAttribute("r", r);
        circ.setAttribute("fill", n.color);
        circ.setAttribute("stroke", "#160E2B");
        circ.setAttribute("stroke-width", "1.4");
        g.appendChild(circ);
        if (n.showLabel) {
          var tx = document.createElementNS(NS, "text");
          tx.setAttribute("text-anchor", "middle");
          tx.setAttribute("dy", String(-(r + 6)));
          tx.setAttribute("font-size", "9.5");
          tx.setAttribute("font-weight", "800");
          tx.setAttribute("fill", "#F1EAFF");
          tx.setAttribute("pointer-events", "none");
          tx.textContent = n.label;
          g.appendChild(tx);
        }
      } else {
        var rr = 3.2 + Math.min(n.deg, 6) * 1.0; // bumped from 2.2 + deg*0.9
        n.r = rr;
        circ.setAttribute("r", rr);
        circ.setAttribute("fill", n.deg >= 2 ? "#B9A7F0" : "#7C6BA8");
        circ.setAttribute("fill-opacity", n.deg >= 2 ? "0.95" : "0.66");
        g.appendChild(circ);
        if (n.showLabel) {
          var tb = document.createElementNS(NS, "text");
          tb.setAttribute("text-anchor", "middle");
          tb.setAttribute("dy", String(-(rr + 2.5)));
          tb.setAttribute("font-size", "7.5");
          tb.setAttribute("fill", "#A08FC7");
          tb.setAttribute("pointer-events", "none");
          tb.textContent = n.name.length > 22 ? n.name.slice(0, 21) + "…" : n.name;
          g.appendChild(tb);
        }
      }
      gN.appendChild(g);
      return {
        g: g,
        node: n
      };
    });

    var alpha = 1,
      tick = 0,
      raf = 0,
      stopped = false;
    var maxTick = V.length > 150 ? 300 : 360;
    var kRep = mode === "all" ? 230 : 420,
      linkLen = mode === "all" ? 54 : 96,
      kLink = 0.04,
      cx = W / 2,
      cy = H / 2;

    var curr = null;
    var dragNode = null;
    var dragIdx = null; // V-array position of dragNode, NOT dragNode.i (see onPointerDown's comment) - what selectedNodes/showConnectionsOnly/hideNode/selectByNames all actually index by.
    var isDragging = false;
    var bgDown = false;
    var dragStartX = 0,
      dragStartY = 0;
    var DRAG_THRESHOLD = 4; // px of real movement required before a click becomes a drag — real mice/trackpads almost never report exactly 0 movement between pointerdown/pointerup, so without this a plain click is misread as a drag and never registers as a selection.
    var lastClickIdx = null,
      lastClickTime = 0;
    var DBLCLICK_WINDOW = 400; // ms — our own double-click detection (matching node INDEX, not exact pixel position), replacing reliance on the browser's native dblclick event. Native dblclick failed to fire reliably here: its target-matching seems to be thrown off by a few px of cursor drift between the two clicks (or by the node itself drifting under force-directed physics between clicks), which a real click on a small node easily triggers.
    var selectedNodes = new Set();
    var pinnedEls = {};
    var zCounter = 10;
    var wrap = tip.parentNode || host.parentNode;
    var hideTimer = null;
    var hiddenNodes = new Set();

    function step() {
      tick++;
      for (var i = 0; i < V.length; i++) {
        var a = V[i];
        for (var j = i + 1; j < V.length; j++) {
          var b = V[j];
          var dx = a.x - b.x,
            dy = a.y - b.y;
          if (Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01) {
            dx = (Math.random() - 0.5) * 0.5;
            dy = (Math.random() - 0.5) * 0.5;
          }
          var d2 = dx * dx + dy * dy + 0.01,
            d = Math.sqrt(d2);
          // Two dynamic (unpinned) nodes pulled by nearly the same set of spring
          // anchors should be allowed to cluster close together — e.g. two
          // symptoms with ~100% overlapping bacteria shouldn't be forced apart
          // just because they're both large circles. Only rim-involved pairs
          // need the full repulsion to keep the rim legible.
          var bothDynamic = !a.pin && !b.pin;
          var kRepPair = bothDynamic ? kRep * 0.35 : kRep;
          var force = kRepPair / d2 * alpha;
          // BUG FIX: this floor used to be plain `a.r + b.r + 2` - fine for
          // keeping the visible circles from overlapping, but the invisible
          // hit-target circle every node gets (radius HIT_R, see its own
          // comment above) is much bigger than most nodes' visible radius.
          // Two dynamic nodes with reduced repulsion (bothDynamic above)
          // would settle right at that smaller floor, close enough that
          // their HIT_R-radius hit-targets fully overlapped - the topmost
          // one in SVG paint order silently ate 100% of clicks aimed at the
          // one(s) underneath, which were then unclickable no matter where
          // within the overlap you clicked (reported: "only the outer
          // [rim] nodes are selectable" on the Symptom<->Bacteria maps -
          // the brain map doesn't have this bug because GFA_buildMap has no
          // bothDynamic reduced-repulsion special case, so its nodes never
          // settle this close together). Flooring by HIT_R too keeps every
          // node's hit-target clear of its neighbors' regardless of how
          // tightly their visible circles are allowed to cluster.
          var mind = Math.max(a.r, HIT_R) + Math.max(b.r, HIT_R) + 2;
          if (d < mind) force += (mind - d) * 0.35;
          var fx = dx / d * force,
            fy = dy / d * force;
          a.vx += fx;
          a.vy += fy;
          b.vx -= fx;
          b.vy -= fy;
        }
      }
      for (var k = 0; k < E.length; k++) {
        var e = E[k],
          na = V[e.s],
          nb = V[e.t];
        var ex = nb.x - na.x,
          ey = nb.y - na.y,
          ed = Math.sqrt(ex * ex + ey * ey) + 0.01;
        var lf = (ed - linkLen) * kLink * alpha,
          lfx = ex / ed * lf,
          lfy = ey / ed * lf;
        na.vx += lfx;
        na.vy += lfy;
        nb.vx -= lfx;
        nb.vy -= lfy;
      }
      for (var m = 0; m < V.length; m++) {
        var n = V[m];
        if (n.pin || n.manualPin || n === dragNode) {
          n.vx = 0;
          n.vy = 0;
          continue;
        }
        n.vx += (cx - n.x) * 0.006 * alpha;
        n.vy += (cy - n.y) * 0.006 * alpha;
        n.vx *= 0.85;
        n.vy *= 0.85;
        n.x += Math.max(-9, Math.min(9, n.vx));
        n.y += Math.max(-9, Math.min(9, n.vy));
        n.x = Math.max(14, Math.min(W - 14, n.x));
        n.y = Math.max(28, Math.min(H - 14, n.y));
      }
      // Hard collision resolution for dynamic (unpinned) nodes: springs from a
      // near-identical neighbor set can out-pull the velocity-based repulsion
      // above and re-stack two nodes every tick. This runs as a direct position
      // correction *after* that, every tick, so two symptoms/bacteria with
      // heavy shared overlap settle touching-but-distinct instead of coincident.
      for (var i2 = 0; i2 < V.length; i2++) {
        var a2 = V[i2];
        if (a2.pin || a2 === dragNode) continue;
        var aFrozen = !!a2.manualPin;
        for (var j2 = i2 + 1; j2 < V.length; j2++) {
          var b2 = V[j2];
          if (b2.pin || b2 === dragNode) continue;
          var bFrozen = !!b2.manualPin;
          if (aFrozen && bFrozen) continue; // both stuck in place, nothing to resolve
          var dx2 = a2.x - b2.x,
            dy2 = a2.y - b2.y;
          if (Math.abs(dx2) < 0.01 && Math.abs(dy2) < 0.01) {
            dx2 = (Math.random() - 0.5) * 0.5;
            dy2 = (Math.random() - 0.5) * 0.5;
          }
          var d2b = Math.sqrt(dx2 * dx2 + dy2 * dy2),
            mind2 = a2.r + b2.r + (a2.type === "symptom" && b2.type === "symptom" ? 12 : 3);
          if (d2b < mind2) {
            var ux = dx2 / d2b,
              uy = dy2 / d2b;
            if (aFrozen) {
              b2.x -= ux * (mind2 - d2b);
              b2.y -= uy * (mind2 - d2b);
            } else if (bFrozen) {
              a2.x += ux * (mind2 - d2b);
              a2.y += uy * (mind2 - d2b);
            } else {
              var push = (mind2 - d2b) / 2;
              a2.x += ux * push;
              a2.y += uy * push;
              b2.x -= ux * push;
              b2.y -= uy * push;
            }
          }
        }
      }
      render();
      alpha *= 0.985;
      if (tick < maxTick && !stopped) raf = requestAnimationFrame(step);
      else raf = 0;
    }

    function render() {
      for (var i = 0; i < E.length; i++) {
        var e = E[i],
          l = eEls[i],
          a = V[e.s],
          b = V[e.t];
        l.setAttribute("x1", a.x);
        l.setAttribute("y1", a.y);
        l.setAttribute("x2", b.x);
        l.setAttribute("y2", b.y);
      }
      for (var q = 0; q < nEls.length; q++) {
        var ne = nEls[q];
        ne.g.setAttribute("transform", "translate(" + ne.node.x + "," + ne.node.y + ")");
      }
    }

    raf = requestAnimationFrame(step);

    function setHi(idx) {
      var active = new Set(selectedNodes);
      if (idx != null) active.add(idx);

      if (active.size === 0) {
        for (var i = 0; i < eEls.length; i++) {
          eEls[i].setAttribute("stroke-opacity", "0.5");
          eEls[i].setAttribute("stroke-width", "1.15");
        }
        for (var q = 0; q < nEls.length; q++) nEls[q].g.style.opacity = "1";
        return;
      }

      var hiE = {},
        hiN = {};
      active.forEach(function(nodeIdx) {
        hiN[nodeIdx] = 1;
        V[nodeIdx].adjE.forEach(function(x) {
          hiE[x] = 1;
        });
        V[nodeIdx].adj.forEach(function(x) {
          hiN[x] = 1;
        });
      });

      for (var i = 0; i < eEls.length; i++) {
        if (hiE[i]) {
          eEls[i].setAttribute("stroke-opacity", "0.98");
          eEls[i].setAttribute("stroke-width", "2.1");
        } else {
          eEls[i].setAttribute("stroke-opacity", "0.09");
          eEls[i].setAttribute("stroke-width", "0.7");
        }
      }
      for (var q = 0; q < nEls.length; q++) nEls[q].g.style.opacity = "1"; // general rule: selection only dims/highlights connections, nodes stay fully visible so you can still click around and compare
    }

    var srcRow = function(note, ref, url) {
      var bits = [];
      if (note) bits.push('<div style="color:#B9A7F0;margin-top:1px">' + esc(note) + '</div>');
      if (ref) {
        var refHtml = url ? '<a href="' + esc(url) + '" target="_blank" rel="noopener" style="color:#8FD3F4;text-decoration:underline">' + esc(ref) + ' ↗</a>' : esc(ref);
        bits.push('<div style="color:#6b5c8f;margin-top:1px">Source: ' + refHtml + '</div>');
      }
      return bits.join("");
    };

    function buildTipHtml(idx) {
      var node = V[idx],
        html;
      if (node.type === "symptom") {
        var srows = node.adjE.map(function(ei) {
          var e = E[ei];
          var oi = e.s === idx ? e.t : e.s;
          return {
            name: V[oi].name,
            dir: e.dir,
            note: e.note,
            ref: e.ref,
            url: e.url
          };
        }).sort(function(a, b) {
          return a.name.localeCompare(b.name);
        });
        var sshown = srows.slice(0, 25);
        var srowsHtml = sshown.map(function(x) {
          return '<div style="margin:4px 0;padding-bottom:4px;border-bottom:1px solid rgba(255,255,255,.06)">' + esc(x.name) + ' <b style="color:' + dirColor(x.dir) + '">' + dirArrow(x.dir) + '</b>' + srcRow(x.note, x.ref, x.url) + '</div>';
        }).join("");
        var smore = srows.length > sshown.length ? '<div style="color:#7C6BA8;margin-top:3px">+' + (srows.length - sshown.length) + ' more</div>' : "";

        // New (no minified-source equivalent): two-hop cross-reference -
        // for every bacterium this symptom touches (e.g. FUT2 -> decreased
        // Sutterella), look at every OTHER symptom that ALSO touches that
        // same bacterium. Same direction (also decreases Sutterella) means
        // "moves this bacterium the same way" - surfaced as "Most Likely
        // Related Symptoms". Opposite direction (increases Sutterella)
        // means the other symptom is associated with more of the very
        // thing this one suppresses - surfaced as "Most likely protective
        // to have <this node>", since having it would work against that
        // symptom's own bacterial signature. "both"/mixed edges on either
        // side are skipped rather than guessed at - only clean up/down
        // pairs get bucketed. A symptom CAN legitimately land in both
        // lists (related via one shared bacterium, protective via
        // another) - that's real nuance, not deduplicated away.
        var relatedSet = {},
          protectiveSet = {};
        node.adjE.forEach(function(ei) {
          var e = E[ei];
          var myDir = e.dir;
          if (myDir !== "up" && myDir !== "down") return;
          var bi = e.s === idx ? e.t : e.s;
          var bNode = V[bi];
          if (!bNode || !bNode.adjE) return;
          bNode.adjE.forEach(function(ei2) {
            var e2 = E[ei2];
            var si2 = e2.s === bi ? e2.t : e2.s;
            if (si2 === idx) return;
            var otherNode = V[si2];
            if (!otherNode || otherNode.type !== "symptom") return;
            var otherDir = e2.dir;
            if (otherDir !== "up" && otherDir !== "down") return;
            if (otherDir === myDir) relatedSet[otherNode.name] = true;
            else protectiveSet[otherNode.name] = true;
          });
        });
        var relatedNames = Object.keys(relatedSet).sort();
        var protectiveNames = Object.keys(protectiveSet).sort();
        var relatedLine = relatedNames.length ? '<div style="color:#8FD3F4;font-size:10.5px;margin-bottom:4px"><b>Most Likely Related Symptoms:</b> ' + esc(relatedNames.join(", ")) + '</div>' : "";
        var protectiveLine = protectiveNames.length ? '<div style="color:#3DDC97;font-size:10.5px;margin-bottom:5px;padding-bottom:5px;border-bottom:1px solid rgba(255,255,255,.08)"><b>Most likely protective to have ' + esc(node.name) + ':</b> ' + esc(protectiveNames.join(", ")) + '</div>' : "";

        html = '<div style="font-weight:700;color:#F1EAFF">' + esc(node.name) + '</div><div style="color:#A08FC7;font-size:10px;margin-bottom:3px">' + node.deg + ' bacteria linked</div>' + relatedLine + protectiveLine + '<div style="font-size:10.5px;line-height:1.5;max-height:260px;overflow-y:auto">' + srowsHtml + smore + '</div>';
      } else {
        var relatedNames = node.items.map(function(x) {
          return x.symptom;
        }).filter(function(v, i, a) {
          return a.indexOf(v) === i;
        });
        var relatedLine = '<div style="color:#8FD3F4;font-size:10.5px;margin-bottom:5px;padding-bottom:5px;border-bottom:1px solid rgba(255,255,255,.08)"><b>Related Conditions:</b> ' + esc(relatedNames.join(", ")) + '</div>';
        var rows = node.items.map(function(x) {
          return '<div style="margin:4px 0;padding-bottom:4px;border-bottom:1px solid rgba(255,255,255,.06)"><span style="display:inline-flex;align-items:center;gap:4px"><span style="width:7px;height:7px;border-radius:9px;background:' + (x.color || "#A08FC7") + ';display:inline-block"></span>' + esc(x.symptom) + ' <b style="color:' + dirColor(x.dir) + '">' + dirArrow(x.dir) + '</b></span>' + srcRow(x.note, x.ref, x.url) + '</div>';
        }).join("");
        rows = relatedLine + rows;
        html = '<div style="font-weight:700;color:#F1EAFF">' + esc(node.name) + '</div><div style="color:#A08FC7;font-size:10px;margin-bottom:3px">linked to ' + node.deg + ' symptom' + (node.deg > 1 ? "s" : "") + '</div><div style="font-size:10.5px;line-height:1.5;max-height:260px;overflow-y:auto">' + rows + '</div>';
      }
      return html;
    }

    function wireChrome(el) {
      if (el.dataset.wired) return;
      el.dataset.wired = "1";
      el.addEventListener("pointerdown", function(ev) {
        el.style.zIndex = String(++zCounter);
        var closeH = ev.target && ev.target.closest && ev.target.closest(".gfa-tip-close");
        if (closeH) {
          ev.preventDefault();
          ev.stopPropagation();
          closePinned(+el.dataset.idx);
          setHi(curr);
          return;
        }
        var copyH = ev.target && ev.target.closest && ev.target.closest(".gfa-tip-copy");
        if (copyH) {
          ev.preventDefault();
          ev.stopPropagation();
          copyTipText(el, copyH);
        }
      });
      var gfaDragging = false,
        gfaSX = 0,
        gfaSY = 0,
        gfaSL = 0,
        gfaST = 0;
      el.addEventListener("pointerdown", function(ev) {
        var handle = ev.target && ev.target.closest && ev.target.closest(".gfa-tip-drag");
        if (!handle) return;
        gfaDragging = true;
        gfaSX = ev.clientX;
        gfaSY = ev.clientY;
        gfaSL = parseFloat(el.style.left) || 0;
        gfaST = parseFloat(el.style.top) || 0;
        if (el.setPointerCapture) try {
          el.setPointerCapture(ev.pointerId);
        } catch (e) {}
        ev.preventDefault();
      });
      el.addEventListener("pointermove", function(ev) {
        if (!gfaDragging) return;
        var dx = ev.clientX - gfaSX,
          dy = ev.clientY - gfaSY;
        var rect = wrap.getBoundingClientRect();
        var nx = gfaSL + dx,
          ny = gfaST + dy;
        var tw = el.offsetWidth,
          th = el.offsetHeight;
        nx = Math.max(4, Math.min(nx, rect.width - tw - 4));
        ny = Math.max(4, Math.min(ny, rect.height - th - 4));
        el.style.left = nx + "px";
        el.style.top = ny + "px";
      });
      el.addEventListener("pointerup", function(ev) {
        gfaDragging = false;
      });
      el.addEventListener("pointercancel", function(ev) {
        gfaDragging = false;
      });
      var gfaResizing = false,
        gfaRSX = 0,
        gfaRSY = 0,
        gfaRSW = 0,
        gfaRSH = 0,
        gfaRSL = 0,
        gfaRST = 0;
      el.addEventListener("pointerdown", function(ev) {
        var rHandle = ev.target && ev.target.closest && ev.target.closest(".gfa-tip-resize");
        if (!rHandle) return;
        gfaResizing = true;
        gfaRSX = ev.clientX;
        gfaRSY = ev.clientY;
        gfaRSW = el.offsetWidth;
        gfaRSH = el.offsetHeight;
        gfaRSL = parseFloat(el.style.left) || 0;
        gfaRST = parseFloat(el.style.top) || 0;
        el.style.maxWidth = "none";
        el.style.overflow = "auto";
        el.style.userSelect = "none";
        if (el.setPointerCapture) try {
          el.setPointerCapture(ev.pointerId);
        } catch (e) {}
        ev.preventDefault();
        ev.stopPropagation();
      });
      el.addEventListener("pointermove", function(ev) {
        if (!gfaResizing) return;
        var dw = ev.clientX - gfaRSX,
          dh = ev.clientY - gfaRSY;
        var nw = Math.max(160, Math.min(gfaRSW - dw, 560));
        var nh = Math.max(90, Math.min(gfaRSH - dh, 600));
        el.style.width = nw + "px";
        el.style.height = nh + "px";
        el.style.left = (gfaRSL + (gfaRSW - nw)) + "px";
        el.style.top = (gfaRST + (gfaRSH - nh)) + "px";
      });
      el.addEventListener("pointerup", function(ev) {
        gfaResizing = false;
        el.style.userSelect = "";
      });
      el.addEventListener("pointercancel", function(ev) {
        gfaResizing = false;
        el.style.userSelect = "";
      });
    }

    function renderTip(el, idx, withChrome) {
      var html = buildTipHtml(idx);
      if (withChrome) {
        el.innerHTML = '<div class="gfa-tip-drag" style="cursor:move;padding:2px 20px 2px 20px;margin:-2px -2px 4px -2px;color:#7C6BA8;font-size:9px;text-align:center;border-bottom:1px solid rgba(255,255,255,.08);user-select:none;touch-action:none">&#10021; drag to move</div><div class="gfa-tip-resize" style="position:absolute;left:0;top:0;width:20px;height:20px;cursor:nwse-resize;background:rgba(124,107,168,.35);border-radius:10px 0 8px 0;opacity:.85;font-size:13px;line-height:20px;text-align:center;color:#E4DBFF;user-select:none;touch-action:none;z-index:2">&#8598;</div><div class="gfa-tip-copy" title="Copy this popup\'s text" style="position:absolute;right:20px;top:2px;width:16px;height:16px;cursor:pointer;font-size:12px;line-height:16px;text-align:center;color:#8FD3F4;user-select:none;touch-action:none;z-index:3">&#128203;</div><div class="gfa-tip-close" title="Close" style="position:absolute;right:2px;top:2px;width:16px;height:16px;cursor:pointer;font-size:14px;line-height:15px;text-align:center;color:#B9A7F0;user-select:none;touch-action:none;z-index:3">&times;</div>' + html;
        wireChrome(el);
      } else {
        el.innerHTML = html;
      }
    }

    function showPreview(idx) {
      if (hideTimer) {
        clearTimeout(hideTimer);
        hideTimer = null;
      }
      renderTip(tip, idx, false);
      tip.style.opacity = "1";
      tip.style.pointerEvents = "auto";
      var node = V[idx];
      var pt = svg.createSVGPoint();
      pt.x = node.x;
      pt.y = node.y;
      var sp = pt.matrixTransform(svg.getScreenCTM());
      var rect = wrap.getBoundingClientRect();
      var tw = tip.offsetWidth,
        th = tip.offsetHeight;
      var edge = Math.max(node.r || 8, 12);
      var baseX = sp.x - rect.left,
        baseY = sp.y - rect.top;
      var nx = baseX + edge + 6;
      if (nx + tw > rect.width - 4) nx = baseX - edge - 6 - tw;
      var ny = baseY - th / 2;
      nx = Math.max(4, Math.min(nx, rect.width - tw - 4));
      ny = Math.max(4, Math.min(ny, rect.height - th - 4));
      tip.style.left = nx + "px";
      tip.style.top = ny + "px";
    }

    function cancelHidePreview() {
      if (hideTimer) {
        clearTimeout(hideTimer);
        hideTimer = null;
      }
    }

    function hidePreview() {
      if (hideTimer) clearTimeout(hideTimer);
      hideTimer = setTimeout(function() {
        tip.style.opacity = "0";
        tip.style.pointerEvents = "none";
        hideTimer = null;
      }, 200);
    }

    function showPinned(idx) {
      var key = String(idx);
      var el = pinnedEls[key];
      var isNew = !el;
      if (!el) {
        el = document.createElement("div");
        el.className = "gfa-tip-instance";
        el.style.cssText = tip.style.cssText;
        el.style.opacity = "1";
        el.style.pointerEvents = "auto";
        el.dataset.idx = key;
        wrap.appendChild(el);
        pinnedEls[key] = el;
      }
      el.style.zIndex = String(++zCounter);
      renderTip(el, idx, true);
      if (isNew) {
        // Open right next to the node that was actually double-clicked
        // (same node->screen conversion the old hover preview used), not in a
        // fixed corner of the map — the whole point of pinning is "here's
        // this node's info," so it should visually stay near that node. Still
        // draggable/closeable afterward via the existing chrome.
        var node = V[idx];
        var pt = svg.createSVGPoint();
        pt.x = node.x;
        pt.y = node.y;
        var sp = pt.matrixTransform(svg.getScreenCTM());
        var rect = wrap.getBoundingClientRect();
        var tw = el.offsetWidth,
          th = el.offsetHeight;
        var edge = Math.max(node.r || 8, 12);
        var baseX = sp.x - rect.left,
          baseY = sp.y - rect.top;
        var n = Object.keys(pinnedEls).length - 1;
        var off = (n % 8) * 20; // stagger multiple simultaneously-open popups so they don't perfectly overlap
        var nx = baseX + edge + 6 + off;
        if (nx + tw > rect.width - 6) nx = baseX - edge - 6 - tw - off;
        var ny = baseY - th / 2 + off;
        nx = Math.max(6, Math.min(nx, rect.width - tw - 6));
        ny = Math.max(6, Math.min(ny, rect.height - th - 6));
        el.style.left = nx + "px";
        el.style.top = ny + "px";
      }
    }

    function closePinned(idx) {
      var key = String(idx);
      var el = pinnedEls[key];
      if (el) {
        if (el.parentNode) el.parentNode.removeChild(el);
        delete pinnedEls[key];
      }
    }

    function closeAllPinned() {
      Object.keys(pinnedEls).forEach(function(key) {
        var el = pinnedEls[key];
        if (el && el.parentNode) el.parentNode.removeChild(el);
      });
      pinnedEls = {};
      selectedNodes.clear();
    }

    function onPointerDown(ev) {
      if (ev.button === 2 || ev.buttons === 2) return; // right-click is handled by onContextMenu only
      var el = ev.target;
      while (el && el !== svg && !(el.dataset && el.dataset.i != null)) el = el.parentNode;
      if (el && el.dataset && el.dataset.i != null) {
        var idx = +el.dataset.i;
        dragNode = V[idx];
        // idx here IS the correct V-array position (data-i was set from the
        // V.map() loop index at element-creation time). dragNode.i, by
        // contrast, is that node's index into the UNFILTERED nodes array
        // from before symptom/bacteria filtering - the two only coincide
        // when nothing before this node in the array got filtered out. Bug:
        // clicking a bacterium got a DIFFERENT bacterium selected/pinned
        // whenever an earlier-ordered, zero-degree bacterium had been
        // dropped by vis() ahead of it, shifting every later bact node's
        // true V-position below its stale .i. Capturing the right index
        // here (not reading dragNode.i again in onPointerUp) fixes it.
        dragIdx = idx;
        isDragging = false;
        bgDown = false;
        dragStartX = ev.clientX;
        dragStartY = ev.clientY;
        svg.setPointerCapture(ev.pointerId);
      } else {
        bgDown = true;
      }
    }

    function onPointerMove(ev) {
      if (dragNode) {
        if (!isDragging) {
          var jitterDx = ev.clientX - dragStartX,
            jitterDy = ev.clientY - dragStartY;
          if (Math.hypot(jitterDx, jitterDy) < DRAG_THRESHOLD) return; // still just a click, not a drag yet
        }
        if (ev.cancelable) ev.preventDefault();
        isDragging = true;
        var pt = svg.createSVGPoint();
        pt.x = ev.clientX;
        pt.y = ev.clientY;
        var svgP = pt.matrixTransform(svg.getScreenCTM().inverse());
        dragNode.x = svgP.x;
        dragNode.y = svgP.y;
        dragNode.vx = 0;
        dragNode.vy = 0;

        alpha = 1;
        tick = 0;
        stopped = false;
        if (!raf) raf = requestAnimationFrame(step);

        // Popups open only via double-click now; no preview during drag.
        return;
      }

      var el = ev.target;
      while (el && el !== svg && !(el.dataset && el.dataset.i != null)) el = el.parentNode;
      if (el && el.dataset && el.dataset.i != null) {
        var idx = +el.dataset.i;
        if (idx !== curr) {
          curr = idx;
          setHi(curr);
        }
        // Popups open only via double-click now; hover no longer shows a preview.
      } else {
        if (curr != null) {
          curr = null;
          setHi(null);
        }
        hidePreview();
      }
    }

    function onPointerUp(ev) {
      if (dragNode) {
        svg.releasePointerCapture(ev.pointerId);
        if (isDragging) {
          // A manually-dragged node sticks where you dropped it instead of the
          // springs immediately pulling it back to its computed position —
          // otherwise a drag looks like it silently does nothing.
          dragNode.manualPin = true;
          dragNode.vx = 0;
          dragNode.vy = 0;
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
          var clickedIdx = dragIdx;
          var now = Date.now();
          var isDoubleClick = lastClickIdx === clickedIdx && (now - lastClickTime) < DBLCLICK_WINDOW;
          if (isDoubleClick) {
            lastClickIdx = null;
            lastClickTime = 0; // consumed — a 3rd quick click starts fresh, not a chained toggle
            if (pinnedEls[String(clickedIdx)]) {
              closePinned(clickedIdx);
            } else {
              selectedNodes.add(clickedIdx);
              showPinned(clickedIdx);
              hidePreview();
            }
          } else {
            lastClickIdx = clickedIdx;
            lastClickTime = now;
            if (selectedNodes.has(clickedIdx)) {
              selectedNodes.delete(clickedIdx);
            } else {
              selectedNodes.add(clickedIdx);
            }
          }
          setHi(curr);
        }
        dragNode = null;
        isDragging = false;
      } else if (bgDown) {
        if (selectedNodes.size) {
          closeAllPinned();
          setHi(curr);
        }
        if (typeof onBackgroundClick === "function") onBackgroundClick();
      }
      bgDown = false;
    }

    function onPointerLeave(ev) {
      if (!dragNode) {
        if (ev.relatedTarget && tip.contains(ev.relatedTarget)) return;
        curr = null;
        setHi(null);
        hidePreview();
      }
    }

    function onTipLeave(ev) {
      if (ev.relatedTarget && host.contains(ev.relatedTarget)) return;
      curr = null;
      setHi(null);
      hidePreview();
    }
    tip.addEventListener("pointerleave", onTipLeave);
    tip.addEventListener("pointerenter", cancelHidePreview);

    function hideNode(idx) {
      if (hiddenNodes.has(idx)) return;
      hiddenNodes.add(idx);
      if (hiddenNamesRef && hiddenNamesRef.current) hiddenNamesRef.current.add(V[idx].name);
      nEls[idx].g.style.display = "none";
      for (var i = 0; i < E.length; i++) {
        if (E[i].s === idx || E[i].t === idx) eEls[i].style.display = "none";
      }
      closePinned(idx);
      selectedNodes.delete(idx);
      if (curr === idx) {
        curr = null;
      }
      hidePreview();
      setHi(curr);
    }

    function showConnectionsOnly() {
      if (!selectedNodes.size) return;
      var keep = new Set(selectedNodes);
      if (selectedNodes.size === 1) {
        selectedNodes.forEach(function(idx) {
          if (V[idx]) V[idx].adj.forEach(function(j) {
            keep.add(j);
          });
        });
      } else {
        // Only keep neighbors SHARED by 2+ selected nodes — a region/taxon
        // touched by just one of the selected conditions isn't a connection
        // between the selection, so it shouldn't survive the filter either.
        var neighborCount = {};
        selectedNodes.forEach(function(idx) {
          if (!V[idx]) return;
          V[idx].adj.forEach(function(j) {
            neighborCount[j] = (neighborCount[j] || 0) + 1;
          });
        });
        Object.keys(neighborCount).forEach(function(j) {
          if (neighborCount[j] >= 2) keep.add(+j);
        });
      }
      V.forEach(function(n, idx) {
        if (!keep.has(idx)) hideNode(idx);
      });
    }

    function hideIsolatedNodes() {
      V.forEach(function(n, idx) {
        if (n.deg < 2) hideNode(idx);
      });
    }

    // New (no minified-source equivalent): "Show Increased Only" / "Show
    // Decreased Only" buttons. Edge-level, not node-level, unlike
    // hideIsolatedNodes/showConnectionsOnly above - a single bacterium can
    // legitimately have both up- and down-linked symptoms at once, so
    // filtering by hiding whole NODES would either hide a node that still
    // has a real matching edge, or leave the wrong-direction edges drawn
    // on a node that survives because it also has a right-direction one.
    // "both" (yellow, mixed-evidence) edges intentionally count toward
    // EITHER filter, not neither - a mixed finding isn't a non-answer to
    // "does this move it up" or "down", it's evidence of both, per an
    // explicit request. One-way like hideIsolatedNodes (not a live
    // toggle) - "Snap back into position" is this app's one universal
    // reset for every filter button, kept consistent rather than growing
    // a second reset concept just for this pair.
    function showDirectionOnly(want) {
      var matches = function(dir) {
        return dir === want || dir === "both";
      };
      E.forEach(function(e, i) {
        if (!matches(e.dir)) eEls[i].style.display = "none";
      });
      V.forEach(function(n, idx) {
        var hasVisibleEdge = n.adjE.some(function(ei) {
          return matches(E[ei].dir);
        });
        if (!hasVisibleEdge) hideNode(idx);
      });
    }

    // New (no minified-source equivalent): lets a caller programmatically
    // select nodes by NAME rather than requiring a real click in the SVG -
    // added specifically so SymptomTab.jsx's map-builder picker can put its
    // newly-added condition nodes into the SAME selection state a manual
    // click would, so the existing Show Connections button (which only
    // ever looked at `selectedNodes`, populated exclusively by clicks
    // before this) works on picker-added nodes without the user having to
    // separately click each one inside the graph first. Deliberately
    // reuses `selectedNodes`/`setHi` as-is rather than inventing a second,
    // parallel selection concept.
    function selectByNames(names) {
      // Clears first, not just adds - see buildMap.js's identical fix for
      // why (repeated calls on a still-live graph instance must not
      // accumulate past selections forever). No-op for the existing
      // "call once right after a fresh build" use.
      selectedNodes.clear();
      var wanted = new Set(names || []);
      V.forEach(function(n, idx) {
        if (wanted.has(n.name)) selectedNodes.add(idx);
      });
      setHi(curr);
    }

    function onContextMenu(ev) {
      var el = ev.target;
      while (el && el !== svg && !(el.dataset && el.dataset.i != null)) el = el.parentNode;
      if (el && el.dataset && el.dataset.i != null) {
        ev.preventDefault();
        hideNode(+el.dataset.i);
      }
    }

    svg.addEventListener("pointerdown", onPointerDown);
    svg.addEventListener("pointermove", onPointerMove);
    svg.addEventListener("pointerup", onPointerUp);
    svg.addEventListener("pointercancel", onPointerUp);
    svg.addEventListener("pointerleave", onPointerLeave);
    svg.addEventListener("contextmenu", onContextMenu);

    if (hiddenNamesRef && hiddenNamesRef.current) {
      V.forEach(function(n, idx) {
        if (hiddenNamesRef.current.has(n.name)) hideNode(idx);
      });
    }

    var stopFn = function() {
      stopped = true;
      cancelAnimationFrame(raf);
      if (hideTimer) {
        clearTimeout(hideTimer);
        hideTimer = null;
      }
      svg.removeEventListener("pointerdown", onPointerDown);
      svg.removeEventListener("pointermove", onPointerMove);
      svg.removeEventListener("pointerup", onPointerUp);
      svg.removeEventListener("pointercancel", onPointerUp);
      svg.removeEventListener("pointerleave", onPointerLeave);
      svg.removeEventListener("contextmenu", onContextMenu);
      tip.removeEventListener("pointerleave", onTipLeave);
      tip.removeEventListener("pointerenter", cancelHidePreview);
      closeAllPinned();
      host.innerHTML = "";
      if (tip) {
        tip.style.opacity = "0";
        tip.style.pointerEvents = "none";
      }
    };
    stopFn.showConnectionsOnly = showConnectionsOnly;
    stopFn.hideIsolatedNodes = hideIsolatedNodes;
    stopFn.selectByNames = selectByNames;
    stopFn.showIncreasedOnly = function() { showDirectionOnly("up"); };
    stopFn.showDecreasedOnly = function() { showDirectionOnly("down"); };
    return stopFn;
  }
