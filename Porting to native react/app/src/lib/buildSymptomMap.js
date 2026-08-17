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
// A press on empty canvas does NOTHING here, on purpose. This engine used to
// expose an `onBackgroundClick` callback (SymptomTab wired it to "reset the
// picker"), and it also closed every pinned popup. Both were removed by
// request: a stray click on empty space was silently discarding a map the user
// had built by hand, and the resulting rebuild changed the document height
// enough that the browser clamped the scroll and the page appeared to jump
// upward on its own. Clearing is now only ever explicit - the popups' own x,
// and the picker's own reset button. See onPointerUp.
import { dirColor, dirArrow } from '../theme'
import { isIntervention } from './interventions'

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

export function buildSymptomMap(host, tip, data, mode, pinType, forceAllLabels, scramble, hiddenNamesRef, fullData,
  conditionIndex) {
    pinType = pinType || "bact";
    // Optional 10th param: the UNFILTERED symptom+bacteria universe (every
    // real symptom, plus whatever conditions are currently overlaid) to
    // cross-reference against in buildTipHtml below - independent of
    // `data`, which may be narrowed down to just one or two nodes by
    // SymptomTab.jsx's map-builder picker. Without this, selecting only
    // "Non-secretor (FUT2)" (so the visible graph has no OTHER symptom
    // node to compare against) silently produced no Related/Protective
    // lists at all, even though the answer doesn't depend on what's
    // currently checked in the picker. Defaults to `data` itself, which
    // exactly preserves prior behavior for every caller that doesn't pass
    // this (BacteriumFocusMap.jsx etc.) - their own `data` is already the
    // full relevant universe for what they show, no picker involved.
    var xrefData = fullData || data;
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
    // Portrait-phone adaptation: the SVG is width:100%/height:auto with a
    // fixed viewBox, so its rendered height is always just renderedWidth *
    // (H/W) - on a narrow phone container that produced the SAME
    // wide/short aspect ratio a desktop gets, squeezing nodes into a short
    // strip instead of using the real vertical scroll room a phone screen
    // actually has. Taller viewBox on narrow containers (host.clientWidth
    // reflects the real rendered width here, read post-layout since this
    // runs inside React's useEffect) spreads the rim/physics bounds
    // (W/H-proportional throughout this file) out vertically instead,
    // giving nodes more room and more separation between hit-targets.
    if (host.clientWidth && host.clientWidth < 560) {
      H = Math.round(H * 1.4);
    }
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
        // New (no minified-source equivalent): optional display override,
        // separate from `name` (which stays the canonical bucket name
        // used for matching/keying elsewhere - hiddenNamesRef,
        // selectByNames, xref indices, etc. - untouched). Only
        // conditionSymptomData.js currently supplies this, for the case
        // where a condition's own taxon name is more specific than the
        // canonical bucket it matched against (e.g. this condition only
        // ever reported "Escherichia coli", not "Escherichia/Shigella" -
        // showing the broader combined name implied Shigella was part of
        // this condition's own research when it wasn't).
        label: b.label || b.name,
        deg: 0,
        i: bi,
        pin: pinType === "bact",
        items: []
      };
      nodes.push(bNode);
      // One loop over the four directions, replacing three near-identical copies.
      // "none" is the fourth: tested, no reliable effect - see dirColor in theme.js.
      ["up", "down", "both", "none"].forEach(function(dir) {
        (b[dir] || []).forEach(function(x) {
          var si = symIdx[x.symptom];
          if (si == null) return;
          nodes[si].deg++;
          bNode.deg++;
          bNode.items.push({
            symptom: x.symptom,
            color: nodes[si].color,
            dir: dir,
            note: x.note,
            ref: x.ref,
            url: x.url
          });
          edges.push({
            s: si,
            t: bi,
            dir: dir,
            note: x.note,
            ref: x.ref,
            url: x.url
          });
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

    // COLOUR GROUPING. Nodes whose edges are the same colour are pulled to the
    // same horizontal zone, so the taxa a condition DEPLETES sit together, the
    // ones an intervention RAISES sit together, and the contested ones sit between.
    // Two effects, both asked for: same-coloured nodes end up adjacent (easier to
    // read as a group than scattered), and edges of one colour stop crossing edges
    // of another to reach nodes on the far side.
    //
    // Zones run left to right: decreased, contested/null, increased. A node's zone
    // is decided by which colour it carries MOST, so a taxon that is mostly
    // depleted still reads as depleted even if one intervention raises it.
    if (pinType === "symptom") {
      V.forEach(function(n, selfIdx) {
        if (n.pin) return;
        // A CONTINUOUS left-to-right axis rather than three buckets: score each
        // taxon by how far its edges lean increased vs decreased, and place it
        // along x accordingly. Purely depleted taxa sit far left, purely raised
        // ones far right, mixed and contested ones in between - so the row reads
        // as a gradient of "what this is doing to me", and the organism the
        // interventions raise most (Roseburia, fed by every HMO here) ends up
        // furthest right with the others trailing left along the same axis.
        //
        // Contested and null edges count toward the total but not the lean, so a
        // taxon with one up, one down and one contested sits at centre rather
        // than being dragged by whichever it happens to have more of.
        // Ordered by what the CONDITIONS do to it, not by every edge it has:
        // decreased by them to the RIGHT, increased by them to the LEFT, as asked
        // ("the ones that are all pink from FUT2 on right and all blue from FUT2 on
        // left"). Keyed on the conditions/symptoms group generally rather than on
        // FUT2 by name, so the row still sorts sensibly when the picker selection
        // changes - with FUT2, ADHD and Iron deficiency selected they all point the
        // same way anyway.
        //
        // Edges to the interventions are deliberately ignored here. They would pull
        // an organism left precisely BECAUSE something corrects it, which is the
        // opposite of the sort wanted: the row should say what is wrong, and the
        // intervention edges then visibly reach across it.
        var up = 0, down = 0, total = 0;
        n.adjE.forEach(function(ei) {
          var e = E[ei];
          var other = V[e.s === selfIdx ? e.t : e.s];
          if (!other || !other.pin || isIntervention(other.name)) return;
          total++;
          if (e.dir === "up") up++;
          else if (e.dir === "down") down++;
        });
        var lean = total ? (down - up) / total : 0;   // +1 (all decreased) -> right
        n.groupX = W * (0.5 + lean * 0.38);
      });
    }

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
    // Rim order is meaningful, not decorative. Placed in raw data order the
    // conditions and the interventions interleave around the circle, and the
    // shared taxa get pulled in every direction at once. Grouped - everything you
    // HAVE on one arc, everything you TAKE on the opposite arc - the taxa they
    // share settle in the middle between them, and "these two conditions deplete
    // the same organisms those three feed" becomes something you can see rather
    // than something you have to trace edge by edge.
    //
    // Only for the symptom rim: when bacteria are on the rim there are far more of
    // them and the barycenter crossing-reduction below is the better tool. Stable
    // partition, so within each group the data order is preserved.
    var rimAngles = null;
    if (!scramble && pinType === "symptom") {
      var haves = [], takes = [];
      rimV.forEach(function(n) {
        (isIntervention(n.name) ? takes : haves).push(n);
      });
      // Each group gets its own arc, CENTRED on a diagonal: everything you HAVE
      // (conditions, symptoms, genotype) around the top-LEFT, everything you TAKE
      // around the bottom-RIGHT, with the shared taxa in the band between them.
      // Requested that way, and the diagonal reads better than top/bottom did -
      // the band of shared taxa runs corner to corner, which is the longest line
      // available and so the one with the most room for labels. Centring each arc
      // (rather than letting one group follow the other around the circle) is what
      // keeps it symmetrical, and it holds as either group grows.
      //
      // Screen angles: -PI/2 is top, 0 is right, +PI/2 is bottom, PI is left.
      // So -3PI/4 is top-left and +PI/4 is bottom-right.
      var total = Math.max(haves.length + takes.length, 1);
      rimAngles = [];
      rimV = haves.concat(takes);
      var span = function(count) { return 2 * Math.PI * count / total; };
      [[haves, -3 * Math.PI / 4], [takes, Math.PI / 4]].forEach(function(pair) {
        var group = pair[0], centre = pair[1], arc = span(group.length);
        var step = group.length > 1 ? arc / group.length : 0;
        var start = centre - (arc - step) / 2;
        group.forEach(function(_, i) { rimAngles.push(start + i * step); });
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
      var a = rimAngles ? rimAngles[k] : 2 * Math.PI * k / Math.max(rimV.length, 1) - Math.PI / 2;
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
        var nm = n.label.length > 22 ? n.label.slice(0, 21) + "…" : n.label,
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
    // Nothing in this SVG is selectable text, and letting it be selectable
    // was an outright bug on desktop. Pressing a node starts the browser's
    // own text-selection drag (pointerdown never preventDefaults - it can't,
    // touch needs the default to scroll), and a selection drag AUTOSCROLLS
    // the page as soon as the cursor nears a viewport edge. Reported symptom:
    // grab a node, pull it slightly up, and the whole page rockets to
    // scrollTop 0, taking the node you were dragging off screen with it -
    // measured going 1720 -> 0 in about a second while the button was held.
    // user-select:none stops the selection ever starting, which removes the
    // autoscroll with it. It also stops a double-click on the map selecting
    // a mouthful of node labels.
    svg.style.userSelect = "none";
    svg.style.webkitUserSelect = "none";

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
          // Every taxon label used to sit ABOVE its circle, so in the crowded band
          // they all competed for one strip of pixels while the space directly
          // below every node went unused - including on the isolated nodes, whose
          // labels pointed up into the crush for no reason. Alternating by index
          // halves how many labels contend for any given row, and it is stable
          // (parity of a fixed index, not of a position that moves every frame),
          // so a label does not flip sides as the simulation settles.
          // A node with no other connections gets its label ABOVE, always: it sits
          // out on its own with clear space over it, and the crowding that makes
          // alternating worthwhile is happening below among the connected nodes.
          var labelBelow = n.deg > 1 && (n.i % 2) === 1;
          tb.setAttribute("dy", String(labelBelow ? rr + 8 : -(rr + 2.5)));
          tb.setAttribute("font-size", "7.5");
          tb.setAttribute("fill", "#A08FC7");
          tb.setAttribute("pointer-events", "none");
          tb.textContent = n.label.length > 22 ? n.label.slice(0, 21) + "…" : n.label;
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
    var dragStartX = 0,
      dragStartY = 0;
    // Roughly a short taxon label's width, and the vertical band within which two
    // labels would print over each other.
    // Lay the inner nodes out as a horizontal band rather than a cloud - symptom
    // rim only, where the taxa sit in the middle with room either side.
    var flatten = pinType === "symptom";
    var LABEL_GAP = 78,
      LABEL_ROW = 13;
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
          // 0.35 let taxa with near-identical neighbour sets settle almost on top
          // of each other. Their circles coped; their LABELS did not - the middle
          // of the map became a stack of overlapping text you could only read by
          // dragging nodes apart one at a time. Raised to 0.8 for the symptom rim,
          // where the taxa cluster in the middle and there is empty canvas going
          // spare; the bacteria rim keeps the original value, since there the
          // clustering is the point and the rim itself provides the spacing.
          var kRepPair = bothDynamic ? kRep * (pinType === "symptom" ? 0.8 : 0.35) : kRep;
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
          // Labels are HORIZONTAL text, so crowding hurts sideways far more than
          // it does vertically: two taxa a comfortable distance apart on a circle
          // can still have their names printed straight through each other. The
          // circles were never the problem - "align the overlapping nodes
          // horizontally" is the fix, so enforce a wider gap along x, and only
          // between taxa that are close to sharing a row (|dy| small), which is
          // exactly when their labels collide. Vertical stacking is left alone;
          // labels sit clear of each other there already.
          if (bothDynamic && Math.abs(dy) < LABEL_ROW && Math.abs(dx) < LABEL_GAP) {
            var pushX = (LABEL_GAP - Math.abs(dx)) * 0.10 * alpha;
            fx += (dx >= 0 ? 1 : -1) * pushX;
          }
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
        // The centring pull used to be equal in both axes, which gathers the taxa
        // into a blob. On the symptom map they are pulled into a BAND instead:
        // weak horizontally so they spread wide, strong vertically so they flatten
        // onto a reading line. Eyes track left to right, labels are horizontal
        // text, and a row of names is scannable in a way a cloud never is - so the
        // axis with the most room should be the one carrying the most nodes.
        // Slight label overlap is an accepted trade for that.
        // Deliberately WEAK: the zone is a bias, not a magnet. At 0.02 it beat the
        // horizontal label separation and squeezed every taxon back into a knot -
        // worse than no grouping at all. At 0.005 nodes drift toward their colour's
        // zone while repulsion still spreads them out within it.
        n.vx += ((flatten && n.groupX != null ? n.groupX : cx) - n.x) * (flatten ? 0.005 : 0.006) * alpha;
        // Nodes carrying 2+ connections are the ones worth comparing, so they are
        // held on ONE horizontal line - a single row you read across, with the
        // increased/decreased gradient running along it. Singly-connected taxa get
        // a much weaker pull and settle above and below the row, which also stops
        // them competing for space with the nodes that matter most.
        var rowPull = flatten ? (n.deg >= 2 ? 0.22 : 0.03) : 0.006;
        n.vy += (cy - n.y) * rowPull * alpha;
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
      // HARD ROW. A spring toward the midline gets you a band, not a line - the
      // repulsion and overlap passes keep nudging nodes off it. Taxa with 2+
      // connections are therefore held at exactly one y, every frame, after all
      // other forces have run. They still move freely along x, so the
      // increased/decreased gradient and the label spacing both still work; they
      // just do it on a single readable row.
      //
      // A node you have dragged (manualPin) is exempt - if you place it somewhere,
      // it stays there.
      if (flatten) {
        for (var rr2 = 0; rr2 < V.length; rr2++) {
          var rn = V[rr2];
          if (rn.pin || rn.manualPin || rn === dragNode) continue;
          if (rn.deg >= 2) {
            rn.y = cy;
            rn.vy = 0;
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

    // Built once per graph build (not per tooltip open) from xrefData -
    // bactName -> [{symptom, dir}] and symptomName -> [{bact, dir}], the
    // two lookup directions buildTipHtml's Related/Protective computation
    // needs. Deliberately independent of V/E/nodes above (the possibly-
    // narrowed, currently-RENDERED graph) - this always reflects the full
    // universe xrefData represents, per its own comment.
    var xrefBactToSymptoms = {},
      xrefSymptomToBact = {};
    (xrefData.bacteria || []).forEach(function(b) {
      var list = [];
      ["up", "down", "both", "none"].forEach(function(dir) {
        (b[dir] || []).forEach(function(x) { list.push({ symptom: x.symptom, dir: dir }); });
      });
      xrefBactToSymptoms[b.name] = list;
      list.forEach(function(x) {
        var arr = xrefSymptomToBact[x.symptom] || (xrefSymptomToBact[x.symptom] = []);
        arr.push({ bact: b.name, dir: x.dir });
      });
    });

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
        // same bacterium, and tally how many shared bacteria they agree
        // (same direction) vs. disagree (opposite direction) on. Uses
        // xrefSymptomToBact/xrefBactToSymptoms (built from xrefData, the
        // full symptom+condition universe) rather than this node's own
        // adjE/the local V/E graph - so this still computes a real answer
        // even when the CURRENTLY RENDERED map has been narrowed by the
        // map-builder picker down to just this one node with no other
        // symptom visible to compare against (e.g. picking only
        // "Non-secretor (FUT2)" with nothing else checked).
        //
        // FIXED: an earlier version bucketed per shared-bacterium PAIR
        // independently, so a high-degree node (FUT2 links 27 bacteria)
        // could land the SAME other symptom in both "related" (agreed on
        // one bacterium) and "protective" (disagreed on a different one)
        // at once - confusing on its own, and with enough bacteria in
        // play it flooded both lists with nearly every symptom in the
        // map, which isn't useful signal. Now it's the NET tally across
        // every bacterium the two symptoms actually share: more
        // agreements -> related, more disagreements -> protective, an
        // even split is genuinely ambiguous and excluded from both
        // rather than forced into either. Sorted by margin (how lopsided/
        // how many shared bacteria agree) so the strongest, most-connected
        // matches lead the list, and capped, same "+N more" pattern the
        // bacteria list below already uses, so a hub node like FUT2
        // doesn't dump its entire symptom universe into the tooltip.
        var tally = {};
        (xrefSymptomToBact[node.name] || []).forEach(function(link) {
          if (link.dir !== "up" && link.dir !== "down") return;
          (xrefBactToSymptoms[link.bact] || []).forEach(function(o) {
            if (o.symptom === node.name) return;
            if (o.dir !== "up" && o.dir !== "down") return;
            var rec = tally[o.symptom] || (tally[o.symptom] = { agree: 0, disagree: 0 });
            if (o.dir === link.dir) rec.agree++;
            else rec.disagree++;
          });
        });
        var related = [],
          protective = [];
        Object.keys(tally).forEach(function(name) {
          var t = tally[name];
          if (t.agree > t.disagree) related.push({ name: name, margin: t.agree - t.disagree });
          else if (t.disagree > t.agree) protective.push({ name: name, margin: t.disagree - t.agree });
          // else: tied - genuinely ambiguous, left out of both on purpose
        });
        var byMargin = function(a, b) {
          return b.margin - a.margin || a.name.localeCompare(b.name);
        };
        related.sort(byMargin);
        protective.sort(byMargin);
        var LIST_CAP = 8;
        var relatedShown = related.slice(0, LIST_CAP).map(function(x) { return x.name; });
        var relatedMore = related.length > LIST_CAP ? related.length - LIST_CAP : 0;
        var protectiveShown = protective.slice(0, LIST_CAP).map(function(x) { return x.name; });
        var protectiveMore = protective.length > LIST_CAP ? protective.length - LIST_CAP : 0;
        // CORRECTED after a user-reported case (FUT2 vs. Alcohol-related
        // dysbiosis) came out flatly backwards from the real, known
        // relationship (FUT2 non-secretor status is a documented RISK
        // factor there, not protective). Root cause isn't a bug in the
        // tally math - it's that "opposite direction on some shared
        // bacteria" is a coincidental statistical correlation, not a
        // causal or literature-verified claim, and it can contradict real
        // biology, as it did here. The word "protective" asserted more
        // than this computation can actually support. Relabeled to a
        // plainly descriptive, non-causal framing (what the data literally
        // shows: an opposite bacterial signature) with an explicit
        // exploratory-only caveat, rather than trying to hand-exclude
        // individual wrong-sounding cases one at a time - that wouldn't
        // scale and wouldn't fix the next one this same shortcut produces.
        var relatedLine = relatedShown.length ? '<div style="color:#8FD3F4;font-size:10.5px;margin-bottom:4px"><b>Most Likely Related Symptoms:</b> ' + esc(relatedShown.join(", ")) + (relatedMore ? ' <span style="color:#7C6BA8">+' + relatedMore + ' more</span>' : '') + '<div style="color:#7C6BA8;font-size:9.5px;margin-top:1px">Inferred from shared bacteria moving the same direction — not a verified or causal claim.</div></div>' : "";
        var protectiveLine = protectiveShown.length ? '<div style="color:#3DDC97;font-size:10.5px;margin-bottom:5px;padding-bottom:5px;border-bottom:1px solid rgba(255,255,255,.08)"><b>Opposite Bacterial Signature (exploratory, not a protective claim):</b> ' + esc(protectiveShown.join(", ")) + (protectiveMore ? ' <span style="color:#7C6BA8">+' + protectiveMore + ' more</span>' : '') + '<div style="color:#7C6BA8;font-size:9.5px;margin-top:1px">These symptoms\' bacteria move the opposite direction on shared genera — a statistical pattern, not evidence this taxon protects against them; can contradict real biology.</div></div>' : "";

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
        // Which of the app's CONDITIONS raise or lower this organism - the question
        // people actually arrive with ("what makes this go up?"), which the
        // per-symptom rows below answer only one row at a time. Built from
        // seed_data by the caller (see SymptomTab), so it covers every condition
        // in the app rather than only the ones currently drawn on this map.
        var condLine = "";
        if (conditionIndex && conditionIndex[node.name]) {
          var ci = conditionIndex[node.name];
          var block = function(label, list, color) {
            if (!list || !list.length) return "";
            var shown = list.slice(0, 14);
            var more = list.length > shown.length ? " +" + (list.length - shown.length) + " more" : "";
            return '<div style="margin-bottom:4px"><b style="color:' + color + '">' + label + '</b> ' +
              '<span style="color:#D6CCF2">' + esc(shown.join(", ")) + esc(more) + '</span></div>';
          };
          var body = block("Conditions which increase it:", ci.up, dirColor("up")) +
            block("Conditions which decrease it:", ci.down, dirColor("down")) +
            block("Contested in:", ci.both, dirColor("both"));
          if (body) {
            condLine = '<div style="font-size:10.5px;margin-bottom:6px;padding-bottom:5px;' +
              'border-bottom:1px solid rgba(255,255,255,.08)">' + body + '</div>';
          }
        }
        rows = relatedLine + condLine + rows;
        // If this node's display label differs from its internal/matching
        // name, it's showing a more specific name than the canonical
        // bucket it matched against (see conditionSymptomData.js's own
        // comment) - surface that plainly rather than leaving it
        // implicit, so it's clear WHY the two differ (usually: this app
        // groups a few genera that 16S rRNA sequencing typically can't
        // tell apart, e.g. Escherichia/Shigella) instead of it looking
        // like a labeling inconsistency.
        var canonNote = node.label !== node.name
          ? '<div style="color:#7C6BA8;font-size:9.5px;margin-bottom:5px">Grouped in this app\'s data with ' + esc(node.name) + ' (taxa that standard sequencing typically can\'t distinguish) - shown here under the name this condition\'s own research specifically reported.</div>'
          : "";
        html = '<div style="font-weight:700;color:#F1EAFF">' + esc(node.label) + '</div>' + canonNote + '<div style="color:#A08FC7;font-size:10px;margin-bottom:3px">linked to ' + node.deg + ' symptom' + (node.deg > 1 ? "s" : "") + '</div><div style="font-size:10.5px;line-height:1.5;max-height:260px;overflow-y:auto">' + rows + '</div>';
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
        dragStartX = ev.clientX;
        dragStartY = ev.clientY;
        // New: pointer capture is deferred to onPointerMove now, not
        // claimed here - see that comment for why. Reported mobile bug:
        // touching down ON a node (e.g. ADHD, sitting right where a thumb
        // naturally lands) while trying to scroll PAST it deselected
        // whatever was previously pinned. Root cause: capturing the
        // pointer the instant a node is touched, before knowing whether
        // the gesture is a drag or a scroll attempt, let a vertical swipe
        // get claimed as "drag this node" (once past DRAG_THRESHOLD,
        // preventDefault blocks the browser's own scroll entirely) instead
        // of being released to the page - flinging the node somewhere via
        // an accidental drag, not literally clearing selectedNodes, but
        // looking exactly like "my selection is gone."
      }
      // No else branch any more: a press that misses every node used to be
      // recorded (bgDown) so onPointerUp could treat it as a background click.
      // Background clicks do nothing now, so there is nothing to record.
    }

    function onPointerMove(ev) {
      if (dragNode) {
        if (!isDragging) {
          var jitterDx = ev.clientX - dragStartX,
            jitterDy = ev.clientY - dragStartY;
          var jitterDist = Math.hypot(jitterDx, jitterDy);
          if (jitterDist < DRAG_THRESHOLD) return; // still just a click, not a drag yet
          // TOUCH ONLY: predominantly VERTICAL movement past the threshold
          // reads as "trying to scroll the page," not "trying to drag this
          // node" - this SVG's own touch-action already permits vertical
          // panning (see its own setup), so release the node back and let the
          // browser handle the rest of the gesture natively instead of
          // preventDefault-ing it away below. A horizontal or diagonal
          // drag still claims the node as before - only a clearly-vertical
          // swipe gets read as scroll intent, so dragging a node up/down
          // deliberately still works, just needs a bit of sideways motion
          // too (matches how most drag-vs-scroll disambiguation on touch
          // works elsewhere on the web).
          //
          // Deliberately NOT applied to a mouse. There is no drag-vs-scroll
          // ambiguity to resolve there: a mouse scrolls with the wheel, so
          // holding the button down on a node and moving is unambiguously a
          // drag, whichever direction it goes. Applying the touch heuristic
          // to mice made "drag this node upward" impossible - the node was
          // released mid-gesture and never moved at all, and the abandoned
          // gesture became a browser text-selection drag that autoscrolled
          // the page instead (see the userSelect note in the SVG setup).
          if (ev.pointerType !== "mouse" && Math.abs(jitterDy) > Math.abs(jitterDx) * 1.5) {
            dragNode = null;
            return;
          }
          svg.setPointerCapture(ev.pointerId);
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
        // Pointer capture is now only claimed once a real drag is
        // confirmed (see onPointerMove) - a plain tap that never crossed
        // DRAG_THRESHOLD never captured anything, so this release is a
        // guaranteed no-op in that case. Modern browsers already treat
        // releasing an uncaptured pointer as a silent no-op rather than
        // throwing, but wrapped defensively anyway rather than assuming
        // that behavior everywhere.
        try { svg.releasePointerCapture(ev.pointerId); } catch { /* not captured, harmless */ }
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
      }
      // A press on the map's BACKGROUND is now deliberately inert. It used to
      // close every pinned popup AND fire onBackgroundClick, which SymptomTab
      // wired to "reset the picker to show everything" - so one stray click on
      // empty canvas silently threw away a map you had built by hand (e.g.
      // 2'-FL + FUT2), and rebuilding the full map shrank the document enough
      // that the browser clamped the scroll position, which read as the page
      // lurching upward on its own. Removed by request: nothing about clicking
      // empty space says "discard my work." Both clearing paths remain
      // available explicitly - the popups have their own x, and the picker has
      // its own reset button.
    }

    // New: pointercancel used to be routed straight to onPointerUp, so a
    // touch gesture the browser CANCELS to take over natively (pinch-zoom,
    // double-tap-zoom) ran the exact same click/selection/background-clear
    // logic a real pointerup does - the actual root cause of the reported
    // "zooming clears my selection" bug on these maps specifically (a
    // separate mechanism from the ConditionsGrid instance of the same
    // symptom, which used a plain DOM onClick, not pointer events). A
    // cancel means the browser took the gesture over; user intent is
    // unknown, so this just resets transient state without treating it as
    // any kind of click.
    function onPointerCancel(ev) {
      if (dragNode) {
        try { svg.releasePointerCapture(ev.pointerId); } catch { /* already released/invalid, harmless */ }
      }
      dragNode = null;
      isDragging = false;
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
    svg.addEventListener("pointercancel", onPointerCancel);
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
      svg.removeEventListener("pointercancel", onPointerCancel);
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
