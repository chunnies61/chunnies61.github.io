import { useEffect, useRef } from "react";
import data from "../data/key-skills.json";
import usePrefersReducedMotion from "../hooks/usePrefersReducedMotion";
import "./KeySkills.css";

/* How I work — a grid of colour tiles, each naming one skill and showing it as a
   small looping drawing: two chat bubbles and a heart (empathy), a missing
   puzzle piece snaps into place (problem solving), a pulse lights a chain of
   screens (systems), one sketched idea wins out (creativity), bars grow (data),
   scattered dots snap to a grid (alignment), a prompt becomes a clickable
   interface (prototyping), coins stack (business). All SVG with CSS keyframes;
   every drawing rests in its finished pose, which is all that shows when the
   visitor prefers reduced motion. */

const INK = "#1f2228"; // deep charcoal, just short of black
const WHITE = "#ffffff";

/* Listening both ways: a dark bubble "types" (three bouncing dots), a white bubble
   replies, and a heart rises between them. */
function Empathy() {
  return (
    <g strokeLinejoin="round">
      <g className="ks-bubble-a">
        <rect x="30" y="26" width="108" height="46" rx="23" fill={INK} />
        <path d="M46 66 L38 86 L64 70 Z" fill={INK} />
        {[62, 84, 106].map((cx, i) => (
          <circle key={cx} className="ks-typing" style={{ "--d": `${i * 0.15}s` }} cx={cx} cy="49" r="5.5" fill={WHITE} />
        ))}
      </g>
      <g className="ks-bubble-b">
        <rect x="102" y="80" width="108" height="46" rx="23" fill={WHITE} stroke={INK} strokeWidth="3" />
        {/* the tail: a white patch hides the bubble's outline where it joins */}
        <path d="M178 122 L198 138 L192 120" fill={WHITE} />
        <path d="M178 124.5 L198 138 L192 122" fill="none" stroke={INK} strokeWidth="3" />
        <rect className="ks-reply" x="124" y="95" width="66" height="7" rx="3.5" fill={INK} />
        <rect className="ks-reply" style={{ "--d": "0.2s" }} x="124" y="107" width="42" height="7" rx="3.5" fill={INK} fillOpacity="0.45" />
      </g>
      <path
        className="ks-heart"
        d="M183 64 C161 50 163 24 183 35 C203 24 205 50 183 64 Z"
        fill={WHITE}
        stroke={INK}
        strokeWidth="3"
      />
    </g>
  );
}

/* A jigsaw piece: a square of side S at (x, y) whose edges are flat (0), carry a knob
   (1) or take a socket (-1), listed top, right, bottom, left. The outline runs
   clockwise, so sweep 1 bulges a knob outward and sweep 0 cuts a socket inward. */
function piecePath(x, y, S, [top, right, bottom, left]) {
  const a = S * 0.34; // where the knob starts along the edge
  const b = S * 0.66; // and where it ends
  const r = S * 0.19; // a little more than half the gap, so the knob reads as a bulb
  const knob = (t, ex, ey) => (t === 0 ? "" : `L${ex[0]} ${ex[1]} A${r} ${r} 0 1 ${t > 0 ? 1 : 0} ${ey[0]} ${ey[1]} `);
  return (
    `M${x} ${y} ` +
    knob(top, [x + a, y], [x + b, y]) + `L${x + S} ${y} ` +
    knob(right, [x + S, y + a], [x + S, y + b]) + `L${x + S} ${y + S} ` +
    knob(bottom, [x + S - a, y + S], [x + S - b, y + S]) + `L${x} ${y + S} ` +
    knob(left, [x, y + S - a], [x, y + S - b]) + "Z"
  );
}

/* A missing puzzle piece floats in, turns, snaps into its gap, and a spark lands.
   Three ink pieces and a dashed outline of the gap; the white piece is the answer. */
const PS = 54; // piece size
const PX = 66; // grid left
const PY = 30; // grid top
const PIECES = {
  tl: piecePath(PX, PY, PS, [0, 1, -1, 0]),
  bl: piecePath(PX, PY + PS, PS, [1, -1, 0, 0]),
  br: piecePath(PX + PS, PY + PS, PS, [-1, 0, 0, 1]),
  tr: piecePath(PX + PS, PY, PS, [0, 0, 1, -1]),
};

function ProblemSolving({ bg }) {
  return (
    <g strokeLinejoin="round">
      {["tl", "bl", "br"].map((k) => (
        <path key={k} d={PIECES[k]} fill={INK} stroke={bg} strokeWidth="2.5" />
      ))}
      <path d={PIECES.tr} fill="none" stroke={INK} strokeWidth="2.5" strokeDasharray="5 5" opacity="0.45" />
      <path className="ks-piece" d={PIECES.tr} fill={WHITE} stroke={INK} strokeWidth="3" />
      <path
        className="ks-piece-spark"
        d="M196 22 L200 31 L209 35 L200 39 L196 48 L192 39 L183 35 L192 31 Z"
        fill={WHITE}
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
    </g>
  );
}

/* The whole chain, not just the screen: four small screens linked into a flow. A
   pulse runs from the first, through both middle ones, to the last, lighting each
   screen as it arrives. Drawn finished (all lit); the animation lights them in turn. */
const SCREENS = [
  { id: "a", x: 30, y: 62, step: 1 },
  { id: "b", x: 102, y: 22, step: 2 },
  { id: "c", x: 102, y: 102, step: 2 },
  { id: "d", x: 174, y: 62, step: 3 },
];
const SW = 36; // screen width
const SH = 28; // screen height
const mid = (id) => {
  const s = SCREENS.find((x) => x.id === id);
  return [s.x + SW / 2, s.y + SH / 2];
};
const LINKS = [
  ["a", "b", 1],
  ["a", "c", 1],
  ["b", "d", 2],
  ["c", "d", 2],
];

function Systems() {
  return (
    <g strokeLinecap="round" strokeLinejoin="round">
      {LINKS.map(([f, t]) => {
        const [x1, y1] = mid(f);
        const [x2, y2] = mid(t);
        return <line key={`b${f}${t}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={INK} strokeWidth="3" opacity="0.25" />;
      })}
      {LINKS.map(([f, t, d]) => {
        const [x1, y1] = mid(f);
        const [x2, y2] = mid(t);
        return (
          <line
            key={`l${f}${t}`}
            className={`ks-link ks-link-${d}`}
            pathLength="1"
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={INK}
            strokeWidth="3"
          />
        );
      })}
      {SCREENS.map((sc) => (
        <g key={sc.id}>
          <rect x={sc.x} y={sc.y} width={SW} height={SH} rx="6" fill={WHITE} stroke={INK} strokeWidth="3" />
          <rect className={`ks-lit ks-lit-${sc.step}`} x={sc.x} y={sc.y} width={SW} height={SH} rx="6" fill={INK} stroke={INK} strokeWidth="3" />
          <rect x={sc.x + 7} y={sc.y + 8} width="14" height="4" rx="2" fill={WHITE} />
          <rect x={sc.x + 7} y={sc.y + 16} width="22" height="4" rx="2" fill={WHITE} />
        </g>
      ))}
    </g>
  );
}

/* Exploring many ideas, keeping the one that feels right: four sketched shapes pop up
   in a row, three fade away, and the star moves to the centre, fills in and earns a
   spark. Drawn finished (the star, centred and filled); the animation tells the story. */
function starPath(cx, cy, R, r, n = 5) {
  const pts = [];
  for (let i = 0; i < n * 2; i++) {
    const rad = i % 2 ? r : R;
    const a = -Math.PI / 2 + (i * Math.PI) / n;
    pts.push(`${(cx + rad * Math.cos(a)).toFixed(1)} ${(cy + rad * Math.sin(a)).toFixed(1)}`);
  }
  return `M${pts.join(" L")} Z`;
}
const STAR = starPath(120, 80, 36, 16);

function Creativity() {
  return (
    <g strokeLinejoin="round">
      <circle className="ks-idea" style={{ "--d": "0s" }} cx="44" cy="80" r="17" fill={WHITE} stroke={INK} strokeWidth="3" opacity="0" />
      <path className="ks-idea" style={{ "--d": "0.15s" }} d="M94 63 L112 95 L76 95 Z" fill={WHITE} stroke={INK} strokeWidth="3" opacity="0" />
      <rect className="ks-idea" style={{ "--d": "0.3s" }} x="129" y="64" width="32" height="32" rx="5" fill={WHITE} stroke={INK} strokeWidth="3" opacity="0" />
      <g className="ks-chosen">
        <path d={STAR} fill={WHITE} stroke={INK} strokeWidth="3" />
        <path className="ks-chosen-fill" d={STAR} fill={INK} stroke={INK} strokeWidth="3" />
      </g>
      <path
        className="ks-chosen-spark"
        d="M170 30 L174 39 L183 43 L174 47 L170 56 L166 47 L157 43 L166 39 Z"
        fill={WHITE}
        stroke={INK}
        strokeWidth="3"
      />
    </g>
  );
}

/* Bars rise in turn, the last one topped with a mark */
function DataDriven() {
  const heights = [40, 62, 54, 88, 106, 128];
  return (
    <g>
      {heights.map((h, i) => (
        <g key={i} className="ks-bar" style={{ "--d": `${i * 0.13}s` }}>
          <rect x={24 + i * 34} y={142 - h} width="22" height={h} rx="11" fill={INK} />
          {i === heights.length - 1 && <circle cx={24 + i * 34 + 11} cy={142 - h + 11} r="5" fill={WHITE} />}
        </g>
      ))}
    </g>
  );
}

/* Scattered dots find their place in a grid */
const DOT_OFFSETS = [
  [-46, -30], [34, -44], [-22, 40], [52, 26],
  [-50, 18], [28, 46], [-34, -52], [46, -18],
  [-14, 52], [40, 38], [-52, -8], [22, -50],
];
function Alignment() {
  return (
    <g>
      {DOT_OFFSETS.map(([dx, dy], i) => (
        <circle
          key={i}
          className="ks-dot"
          cx={66 + (i % 4) * 36}
          cy={40 + Math.floor(i / 4) * 36}
          r="8"
          fill={i === 5 ? WHITE : INK}
          stroke={INK}
          strokeWidth={i === 5 ? 3 : 0}
          style={{ "--dx": `${dx}px`, "--dy": `${dy}px`, "--d": `${(i % 5) * 0.09}s` }}
        />
      ))}
    </g>
  );
}

/* A prompt is typed, the sparkle generates, an interface assembles itself, and a
   cursor clicks its button: a prototype that actually works. Every piece sits in
   its finished place; the animation only brings it in, so a still frame (reduced
   motion) shows the finished, clicked state. */
function Prototyping() {
  return (
    <g>
      <rect x="22" y="12" width="196" height="126" rx="16" fill={WHITE} opacity="0.6" stroke={INK} strokeWidth="3" />
      {/* the prompt bar, its typed line, and the sparkle that sends it */}
      <rect x="34" y="24" width="172" height="24" rx="12" fill={WHITE} stroke={INK} strokeWidth="2.5" />
      <rect className="ks-type" x="46" y="33" width="104" height="6" rx="3" fill={INK} />
      <path
        className="ks-gen"
        d="M188 27 L191 33 L197 36 L191 39 L188 45 L185 39 L179 36 L185 33 Z"
        fill={INK}
        strokeLinejoin="round"
      />
      {/* the generated interface: an image card, two lines of text and a button */}
      <rect className="ks-pop" style={{ "--d": "0s" }} x="34" y="58" width="94" height="66" rx="10" fill={INK} />
      <rect className="ks-pop" style={{ "--d": "0.25s" }} x="138" y="60" width="68" height="9" rx="4.5" fill={INK} />
      <rect className="ks-pop" style={{ "--d": "0.4s" }} x="138" y="76" width="48" height="9" rx="4.5" fill={INK} fillOpacity="0.45" />
      <g className="ks-pop" style={{ "--d": "0.55s" }}>
        <rect className="ks-press" x="138" y="98" width="68" height="24" rx="12" fill={INK} />
      </g>
      <circle className="ks-ripple" cx="172" cy="110" r="16" fill="none" stroke={INK} strokeWidth="2.5" opacity="0" />
      {/* the cursor, resting on the button once it has clicked */}
      <path
        className="ks-cursor"
        d="M170 106 L170 128 L176 122 L180 131 L184 129 L180 120 L188 120 Z"
        fill={WHITE}
        stroke={INK}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    </g>
  );
}

/* Coins drop in one on another until there's a stack */
function Business() {
  return (
    <g>
      {[0, 1, 2, 3, 4].map((i) => {
        const y = 112 - i * 17;
        return (
          <g key={i} className="ks-coin" style={{ "--d": `${i * 0.28}s` }}>
            <rect x="68" y={y} width="104" height="16" fill={INK} />
            <ellipse cx="120" cy={y + 16} rx="52" ry="13" fill={INK} />
            <ellipse cx="120" cy={y} rx="52" ry="13" fill={WHITE} stroke={INK} strokeWidth="3" />
          </g>
        );
      })}
    </g>
  );
}

const ART = {
  empathy: Empathy,
  "problem-solving": ProblemSolving,
  systems: Systems,
  creativity: Creativity,
  data: DataDriven,
  influence: Alignment,
  prototyping: Prototyping,
  finance: Business,
};

/* Move across a tile (or drag, on touch) to play its drawing by hand: the pointer's
   left-to-right position is the animation's progress, so the line unravels, the
   rings turn and the shape morphs as you go. Let go and it carries on looping from
   where you left it. CSS animations are scrubbed through the Web Animations API,
   the SMIL morphs through the svg's own clock. */
function useScrub(tileRef, svgRef, enabled, smilPeriod) {
  useEffect(() => {
    const tile = tileRef.current;
    const svg = svgRef.current;
    if (!enabled || !tile || !svg || !svg.getAnimations) return undefined;

    let list = []; // [animation, iteration duration in ms]
    let active = false;
    let current = 0;
    let target = 0;
    let raf = 0;

    const phase = () => {
      const [a, d] = list[0] ?? [];
      if (a && d) return (((a.currentTime ?? 0) / d) % 1 + 1) % 1;
      if (smilPeriod) return ((svg.getCurrentTime() / smilPeriod) % 1 + 1) % 1;
      return 0;
    };
    const apply = (p) => {
      for (const [a, d] of list) a.currentTime = p * d;
      if (smilPeriod) svg.setCurrentTime(p * smilPeriod);
    };
    const aim = (e) => {
      const r = tile.getBoundingClientRect();
      target = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    };
    const tick = () => {
      current += (target - current) * 0.18;
      apply(current);
      raf = active ? requestAnimationFrame(tick) : 0;
    };
    const begin = (e) => {
      if (active) return;
      active = true;
      list = svg
        .getAnimations({ subtree: true })
        .map((a) => [a, a.effect?.getTiming().duration])
        .filter(([, d]) => typeof d === "number" && d > 0);
      for (const [a] of list) a.pause();
      svg.pauseAnimations?.();
      current = phase();
      aim(e);
      raf = requestAnimationFrame(tick);
    };
    const move = (e) => {
      if (active) aim(e);
    };
    const end = () => {
      if (!active) return;
      active = false;
      cancelAnimationFrame(raf);
      for (const [a] of list) a.play();
      svg.unpauseAnimations?.();
    };

    tile.addEventListener("pointerenter", begin);
    tile.addEventListener("pointermove", move);
    tile.addEventListener("pointerleave", end);
    tile.addEventListener("pointercancel", end);
    return () => {
      end();
      tile.removeEventListener("pointerenter", begin);
      tile.removeEventListener("pointermove", move);
      tile.removeEventListener("pointerleave", end);
      tile.removeEventListener("pointercancel", end);
    };
  }, [tileRef, svgRef, enabled, smilPeriod]);
}

// How long one loop of the SMIL-driven drawings lasts, in seconds
const SMIL_PERIOD = {};

function Tile({ skill, reduced }) {
  const tile = useRef(null);
  const svg = useRef(null);
  const Art = ART[skill.id];
  useScrub(tile, svg, !reduced, SMIL_PERIOD[skill.id]);
  return (
    <article className="ks-tile" ref={tile} style={{ background: skill.bg }}>
      <h3>{skill.title}</h3>
      <p>{skill.desc}</p>
      <svg ref={svg} className="ks-art" viewBox="0 0 240 150" preserveAspectRatio="xMidYMax meet" aria-hidden="true" focusable="false">
        <Art animate={!reduced} bg={skill.bg} />
      </svg>
    </article>
  );
}

export default function KeySkills() {
  const reduced = usePrefersReducedMotion();
  return (
    <section className="section">
      <div className="wrap">
        <p className="eyebrow center">{data.eyebrow}</p>
        <h2 className="section-title center">{data.title}</h2>
        <div className={"ks-grid" + (reduced ? " is-still" : "")}>
          {data.skills.map((s) => (
            <Tile key={s.id} skill={s} reduced={reduced} />
          ))}
        </div>
      </div>
    </section>
  );
}
