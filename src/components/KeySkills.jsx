import { useEffect, useRef } from "react";
import data from "../data/key-skills.json";
import usePrefersReducedMotion from "../hooks/usePrefersReducedMotion";
import "./KeySkills.css";

/* Key skills — a grid of colour tiles, each naming one skill and showing it as
   a small looping abstract animation: two figures lean toward each other
   (empathy), a tangle straightens (problem solving), nodes orbit and link
   (systems), a shape keeps becoming another (creativity), bars grow (data),
   scattered dots snap to a grid (alignment), a layout builds itself
   (prototyping), coins stack (business). All SVG; the motion is CSS keyframes and
   SMIL, and stops entirely when the visitor prefers reduced motion. */

const INK = "#3b3f49"; // charcoal, not black
const WHITE = "#ffffff";

const SHAPES = {
  circle: "M120.0 18.0 C125.0 18.0 130.2 18.7 135.0 20.0 C139.8 21.3 144.7 23.3 149.0 25.8 C153.3 28.3 157.5 31.4 161.0 35.0 C164.6 38.5 167.7 42.7 170.2 47.0 C172.7 51.3 174.7 56.2 176.0 61.0 C177.3 65.8 178.0 71.0 178.0 76.0 C178.0 81.0 177.3 86.2 176.0 91.0 C174.7 95.8 172.7 100.7 170.2 105.0 C167.7 109.3 164.6 113.5 161.0 117.0 C157.5 120.6 153.3 123.7 149.0 126.2 C144.7 128.7 139.8 130.7 135.0 132.0 C130.2 133.3 125.0 134.0 120.0 134.0 C115.0 134.0 109.8 133.3 105.0 132.0 C100.2 130.7 95.3 128.7 91.0 126.2 C86.7 123.7 82.5 120.6 79.0 117.0 C75.4 113.5 72.3 109.3 69.8 105.0 C67.3 100.7 65.3 95.8 64.0 91.0 C62.7 86.2 62.0 81.0 62.0 76.0 C62.0 71.0 62.7 65.8 64.0 61.0 C65.3 56.2 67.3 51.3 69.8 47.0 C72.3 42.7 75.4 38.5 79.0 35.0 C82.5 31.4 86.7 28.3 91.0 25.8 C95.3 23.3 100.2 21.3 105.0 20.0 C109.8 18.7 115.0 18.0 120.0 18.0Z",
  badge: "M120.0 18.0 C124.1 18.0 127.6 28.7 132.2 30.4 C136.8 32.1 143.4 26.8 147.5 28.3 C151.7 29.7 154.4 35.2 156.9 39.1 C159.4 42.9 159.6 47.7 162.7 51.4 C165.8 55.0 174.7 57.1 175.3 61.2 C175.9 65.3 166.4 71.1 166.4 76.0 C166.4 80.9 175.9 86.7 175.3 90.8 C174.7 94.9 165.8 97.0 162.7 100.7 C159.6 104.3 159.4 109.1 156.9 112.9 C154.4 116.8 151.7 122.3 147.5 123.7 C143.4 125.2 136.8 119.9 132.2 121.6 C127.6 123.3 124.1 134.0 120.0 134.0 C115.9 134.0 112.4 123.3 107.8 121.6 C103.2 119.9 96.6 125.2 92.5 123.7 C88.3 122.3 85.6 116.8 83.1 112.9 C80.6 109.1 80.4 104.3 77.3 100.7 C74.2 97.0 65.3 94.9 64.7 90.8 C64.1 86.7 73.6 80.9 73.6 76.0 C73.6 71.1 64.1 65.3 64.7 61.2 C65.3 57.1 74.2 55.0 77.3 51.4 C80.4 47.7 80.6 42.9 83.1 39.1 C85.6 35.2 88.3 29.7 92.4 28.3 C96.6 26.8 103.2 32.1 107.8 30.4 C112.4 28.7 115.9 18.0 120.0 18.0Z",
  flower: "M120.0 18.0 C124.0 18.0 129.1 26.5 132.0 31.2 C134.9 35.8 133.9 43.9 137.4 45.9 C140.9 47.9 147.3 43.0 152.8 43.2 C158.3 43.4 168.2 43.5 170.2 47.0 C172.2 50.5 167.4 59.2 164.8 64.0 C162.2 68.8 154.8 72.0 154.8 76.0 C154.8 80.0 162.2 83.2 164.8 88.0 C167.4 92.8 172.2 101.5 170.2 105.0 C168.2 108.5 158.3 108.6 152.8 108.8 C147.3 109.0 140.9 104.1 137.4 106.1 C133.9 108.1 134.9 116.2 132.0 120.8 C129.1 125.5 124.0 134.0 120.0 134.0 C116.0 134.0 110.9 125.5 108.0 120.8 C105.1 116.2 106.1 108.1 102.6 106.1 C99.1 104.1 92.7 109.0 87.2 108.8 C81.7 108.6 71.8 108.5 69.8 105.0 C67.8 101.5 72.6 92.8 75.2 88.0 C77.8 83.2 85.2 80.0 85.2 76.0 C85.2 72.0 77.8 68.8 75.2 64.0 C72.6 59.2 67.8 50.5 69.8 47.0 C71.8 43.5 81.7 43.4 87.2 43.2 C92.7 43.0 99.1 47.9 102.6 45.9 C106.1 43.9 105.1 35.8 108.0 31.2 C110.9 26.5 116.0 18.0 120.0 18.0Z",
  squircle: "M120.0 26.5 C124.4 26.5 129.0 25.8 133.2 26.7 C137.5 27.6 141.7 29.6 145.5 31.8 C149.3 34.0 153.0 36.8 156.1 39.9 C159.2 43.0 162.0 46.7 164.2 50.5 C166.4 54.3 168.4 58.5 169.3 62.8 C170.2 67.0 169.5 71.6 169.5 76.0 C169.5 80.4 170.2 85.0 169.3 89.2 C168.4 93.5 166.4 97.7 164.2 101.5 C162.0 105.3 159.2 109.0 156.1 112.1 C153.0 115.2 149.3 118.0 145.5 120.2 C141.7 122.4 137.5 124.4 133.2 125.3 C129.0 126.2 124.4 125.5 120.0 125.5 C115.6 125.5 111.0 126.2 106.8 125.3 C102.5 124.4 98.3 122.4 94.5 120.2 C90.7 118.0 87.0 115.2 83.9 112.1 C80.8 109.0 78.0 105.3 75.8 101.5 C73.6 97.7 71.6 93.5 70.7 89.2 C69.8 85.0 70.5 80.4 70.5 76.0 C70.5 71.6 69.8 67.0 70.7 62.8 C71.6 58.5 73.6 54.3 75.8 50.5 C78.0 46.7 80.8 43.0 83.9 39.9 C87.0 36.8 90.7 34.0 94.5 31.8 C98.3 29.6 102.5 27.6 106.8 26.7 C111.0 25.8 115.6 26.5 120.0 26.5Z",
};

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

/* A looping line unravels into a straight one. Both ends stay where they are, so
   only the part in between moves — the loops shrink away until the line is clear. */
const LOOPS = "M24.0 76.0 C25.8 79.0 30.1 88.5 34.9 93.9 C39.8 99.3 46.3 104.5 53.2 108.3 C60.2 112.0 68.5 114.9 76.6 116.2 C84.7 117.5 93.8 117.5 101.9 116.2 C110.0 114.9 118.3 112.0 125.3 108.3 C132.2 104.5 138.7 99.3 143.6 93.9 C148.4 88.5 152.2 82.0 154.5 76.0 C156.8 70.0 157.6 63.5 157.3 58.1 C157.0 52.7 155.1 47.5 152.7 43.7 C150.3 40.0 146.5 37.1 143.0 35.8 C139.5 34.5 135.0 34.5 131.5 35.8 C128.0 37.1 124.2 40.0 121.8 43.7 C119.4 47.5 117.5 52.7 117.2 58.1 C116.9 63.5 117.7 70.0 120.0 76.0 C122.3 82.0 126.1 88.5 130.9 93.9 C135.8 99.3 142.3 104.5 149.2 108.3 C156.2 112.0 164.5 114.9 172.6 116.2 C180.7 117.5 189.8 117.5 197.9 116.2 C206.0 114.9 214.3 112.0 221.3 108.3 C228.2 104.5 234.7 99.3 239.6 93.9 C244.4 88.5 248.2 82.0 250.5 76.0 C252.8 70.0 253.6 63.5 253.3 58.1 C253.0 52.7 251.1 47.5 248.7 43.7 C246.3 40.0 242.5 37.1 239.0 35.8 C235.5 34.5 231.0 34.5 227.5 35.8 C224.0 37.1 220.2 40.0 217.8 43.7 C215.4 47.5 213.5 52.7 213.2 58.1 C212.9 63.5 215.5 73.0 216.0 76.0";
const STRAIGHT = "M24.0 76.0 C25.1 76.0 28.6 76.0 30.9 76.0 C33.1 76.0 35.4 76.0 37.7 76.0 C40.0 76.0 42.3 76.0 44.6 76.0 C46.9 76.0 49.1 76.0 51.4 76.0 C53.7 76.0 56.0 76.0 58.3 76.0 C60.6 76.0 62.9 76.0 65.1 76.0 C67.4 76.0 69.7 76.0 72.0 76.0 C74.3 76.0 76.6 76.0 78.9 76.0 C81.1 76.0 83.4 76.0 85.7 76.0 C88.0 76.0 90.3 76.0 92.6 76.0 C94.9 76.0 97.1 76.0 99.4 76.0 C101.7 76.0 104.0 76.0 106.3 76.0 C108.6 76.0 110.9 76.0 113.1 76.0 C115.4 76.0 117.7 76.0 120.0 76.0 C122.3 76.0 124.6 76.0 126.9 76.0 C129.1 76.0 131.4 76.0 133.7 76.0 C136.0 76.0 138.3 76.0 140.6 76.0 C142.9 76.0 145.1 76.0 147.4 76.0 C149.7 76.0 152.0 76.0 154.3 76.0 C156.6 76.0 158.9 76.0 161.1 76.0 C163.4 76.0 165.7 76.0 168.0 76.0 C170.3 76.0 172.6 76.0 174.9 76.0 C177.1 76.0 179.4 76.0 181.7 76.0 C184.0 76.0 186.3 76.0 188.6 76.0 C190.9 76.0 193.1 76.0 195.4 76.0 C197.7 76.0 200.0 76.0 202.3 76.0 C204.6 76.0 206.9 76.0 209.1 76.0 C211.4 76.0 214.9 76.0 216.0 76.0";

function ProblemSolving({ animate }) {
  const ease = "0.45 0 0.2 1";
  return (
    <g>
      <path d={animate ? LOOPS : STRAIGHT} fill="none" stroke={INK} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round">
        {animate && (
          <animate
            attributeName="d"
            dur="8s"
            repeatCount="indefinite"
            calcMode="spline"
            keyTimes="0;0.18;0.5;0.78;1"
            keySplines={`${ease};${ease};${ease};${ease}`}
            values={`${LOOPS};${LOOPS};${STRAIGHT};${STRAIGHT};${LOOPS}`}
          />
        )}
      </path>
      <circle cx="24" cy="76" r="6" fill={INK} />
      <circle cx="216" cy="76" r="10" fill={WHITE} stroke={INK} strokeWidth="4" />
    </g>
  );
}

/* Two rings of nodes turn in opposite directions, linked to a pulsing core */
function Systems() {
  const outer = [0, 1, 2, 3, 4].map((i) => {
    const a = (i * 72 - 90) * (Math.PI / 180);
    return [120 + 60 * Math.cos(a), 76 + 60 * Math.sin(a)];
  });
  const inner = [0, 1, 2].map((i) => {
    const a = (i * 120 - 30) * (Math.PI / 180);
    return [120 + 30 * Math.cos(a), 76 + 30 * Math.sin(a)];
  });
  return (
    <g>
      <g className="ks-turn ks-turn-a">
        {outer.map(([x, y], i) => (
          <line key={`s${i}`} x1="120" y1="76" x2={x} y2={y} stroke={INK} strokeWidth="2.5" />
        ))}
        <polygon points={outer.map((p) => p.join(",")).join(" ")} fill="none" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
        {outer.map(([x, y], i) => (
          <circle key={`o${i}`} cx={x} cy={y} r="9" fill={i % 2 ? WHITE : INK} stroke={INK} strokeWidth="3" />
        ))}
      </g>
      <g className="ks-turn ks-turn-b">
        {inner.map(([x, y], i) => (
          <circle key={`i${i}`} cx={x} cy={y} r="6.5" fill={INK} />
        ))}
      </g>
      <circle className="ks-core" cx="120" cy="76" r="14" fill={INK} />
    </g>
  );
}

/* One shape keeps becoming another; a paler echo follows a beat behind */
function Creativity({ animate }) {
  const seq = [SHAPES.circle, SHAPES.badge, SHAPES.flower, SHAPES.squircle, SHAPES.circle];
  const ease = "0.45 0 0.25 1";
  const morph = (begin) =>
    animate && (
      <animate
        attributeName="d"
        dur="12s"
        begin={begin}
        repeatCount="indefinite"
        calcMode="spline"
        keyTimes="0;0.25;0.5;0.75;1"
        keySplines={`${ease};${ease};${ease};${ease}`}
        values={seq.join(";")}
      />
    );
  return (
    <g className="ks-spin">
      <path d={SHAPES.badge} fill="none" stroke={INK} strokeWidth="2.5" opacity="0.45" transform="translate(120 76) scale(1.2) translate(-120 -76)">
        {morph("-1.5s")}
      </path>
      <path d={animate ? SHAPES.circle : SHAPES.badge} fill={INK}>
        {morph("0s")}
      </path>
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

/* A layout builds itself block by block; a spark lands when it's done */
function Prototyping() {
  return (
    <g>
      <rect x="22" y="12" width="196" height="126" rx="16" fill={WHITE} opacity="0.6" stroke={INK} strokeWidth="3" />
      <rect className="ks-build" style={{ "--d": "0s" }} x="40" y="30" width="96" height="14" rx="7" fill={INK} />
      <rect className="ks-build" style={{ "--d": "0.35s" }} x="40" y="56" width="160" height="42" rx="10" fill={INK} opacity="0.88" />
      <rect className="ks-build" style={{ "--d": "0.7s" }} x="40" y="108" width="64" height="16" rx="8" fill={INK} />
      <path
        className="ks-twinkle"
        d="M176 108 L180 117 L189 121 L180 125 L176 134 L172 125 L163 121 L172 117 Z"
        fill={WHITE}
        stroke={INK}
        strokeWidth="3"
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
const SMIL_PERIOD = { "problem-solving": 8, creativity: 12 };

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
        <Art animate={!reduced} />
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
        {!reduced && <p className="ks-hint">{data.hint}</p>}
        <div className={"ks-grid" + (reduced ? " is-still" : "")}>
          {data.skills.map((s) => (
            <Tile key={s.id} skill={s} reduced={reduced} />
          ))}
        </div>
      </div>
    </section>
  );
}
