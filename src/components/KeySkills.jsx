import { useEffect, useRef } from "react";
import data from "../data/key-skills.json";
import usePrefersReducedMotion from "../hooks/usePrefersReducedMotion";
import "./KeySkills.css";

/* Key skills — a grid of colour tiles, each naming one skill and showing it as
   a small looping abstract animation: two figures lean toward each other
   (empathy), a loose ball is caught and kept (ownership), nodes orbit and link
   (design systems), a dot is steered off the wrong branch (critical thinking), bars grow (data),
   scattered dots snap to a grid (alignment), a layout builds itself
   (prototyping), coins stack (business). All SVG; the motion is CSS keyframes and
   SMIL, and stops entirely when the visitor prefers reduced motion. */

const INK = "#1f2228"; // deep charcoal, just short of black
const WHITE = "#ffffff";

/* Two figures lean in until they touch, then a spark appears between them */
function Empathy() {
  return (
    <g>
      <rect className="ks-lean ks-lean-l" x="70" y="30" width="34" height="112" rx="17" fill={INK} />
      <rect className="ks-lean ks-lean-r" x="136" y="30" width="34" height="112" rx="17" fill={WHITE} stroke={INK} strokeWidth="3" />
      <circle className="ks-spark-dot" cx="120" cy="24" r="8" fill={INK} />
    </g>
  );
}

/* A loose ball drifts about with nobody to catch it. Then a cup rises under it, the ball
   drops in and stays, and a spark lands: the problem nobody owned now has an owner. A
   dashed outline of the cup is there from the start, the place where someone should be. */
const CUP = "M88 84 L88 104 Q88 124 108 124 L132 124 Q152 124 152 104 L152 84";
function Ownership() {
  return (
    <g strokeLinecap="round" strokeLinejoin="round">
      <path d={CUP} fill="none" stroke={INK} strokeWidth="3" strokeDasharray="2 8" opacity="0.5" />
      <path className="ks-cup" d={CUP} fill="none" stroke={INK} strokeWidth="8" />
      <circle className="ks-ball" cx="120" cy="44" r="15" fill={INK} />
      <path
        className="ks-own-spark"
        d="M196 22 L200 31 L209 35 L200 39 L196 48 L192 39 L183 35 L192 31 Z"
        fill={WHITE}
        stroke={INK}
        strokeWidth="3"
      />
    </g>
  );
}

/* One master component and the instances that follow it: the instances drop into a grid,
   the master pulses as it is edited, and the change runs through every instance in turn. */
const INSTANCES = [
  [132, 44],
  [172, 44],
  [132, 84],
  [172, 84],
];
function DesignSystems() {
  return (
    <g>
      <g className="ks-master">
        <rect x="36" y="44" width="70" height="70" rx="16" fill={INK} />
        <path d="M71 62 L83 74 L71 86 L59 74 Z" fill={WHITE} />
      </g>
      {INSTANCES.map(([x, y], i) => (
        <rect
          key={i}
          className="ks-inst"
          style={{ "--d": `${i * 0.18}s` }}
          x={x}
          y={y}
          width="32"
          height="32"
          rx="9"
          fill={WHITE}
          stroke={INK}
          strokeWidth="3"
        />
      ))}
    </g>
  );
}

/* A road forks. A dot sets off down the wrong branch, is turned back at the fork, takes the
   other one and arrives at a tick: the draft goes where it likes until someone decides. */
function CriticalThinking() {
  return (
    <g strokeLinecap="round" strokeLinejoin="round" fill="none">
      <path d="M28 96 L100 96" stroke={INK} strokeWidth="8" />
      <path d="M100 96 L150 52 L200 52" stroke={INK} strokeWidth="8" opacity="0.3" />
      <path d="M100 96 L150 120 L200 120" stroke={INK} strokeWidth="8" />
      <g opacity="0.55">
        <circle cx="200" cy="52" r="15" fill={WHITE} stroke={INK} strokeWidth="3" strokeDasharray="4 4" />
        <path d="M194 46 L206 58 M206 46 L194 58" stroke={INK} strokeWidth="4" />
      </g>
      <circle cx="200" cy="120" r="15" fill={WHITE} stroke={INK} strokeWidth="3.5" />
      <path className="ks-tick" d="M192 120 L198 126 L209 113" stroke={INK} strokeWidth="4.5" />
      <circle className="ks-walk" cx="28" cy="96" r="11" fill={WHITE} stroke={INK} strokeWidth="4" />
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
  ownership: Ownership,
  "design-systems": DesignSystems,
  "critical-thinking": CriticalThinking,
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

// How long one loop of the SMIL-driven drawings lasts, in seconds (none at the moment:
// every drawing is CSS keyframes)
const SMIL_PERIOD = {};

function Tile({ skill, reduced, index }) {
  const tile = useRef(null);
  const svg = useRef(null);
  const Art = ART[skill.id];
  useScrub(tile, svg, !reduced, SMIL_PERIOD[skill.id]);
  return (
    <article
      className="ks-tile"
      ref={tile}
      data-reveal
      style={{ background: skill.bg, "--reveal-delay": `${(index % 4) * 90}ms` }}
    >
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
        <p className="eyebrow center" data-reveal>
          {data.eyebrow}
        </p>
        <h2 className="section-title center" data-reveal style={{ "--reveal-delay": "70ms" }}>
          {data.title}
        </h2>
        <div className={"ks-grid" + (reduced ? " is-still" : "")}>
          {data.skills.map((s, i) => (
            <Tile key={s.id} skill={s} reduced={reduced} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
