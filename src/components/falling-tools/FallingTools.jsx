import { useEffect, useRef } from 'react';
import Matter from 'matter-js';
import { TOOLS } from './tools';
import './FallingTools.css';

// ---------- CONFIG ----------
const CFG = {
  iconSizeDesktop: 56,
  iconSizeMobile: 44,
  tagHeightDesktop: 40, // pill tags: width = height × aspect
  tagHeightMobile: 30,
  mobileBreakpoint: 560,
  gravity: 1,
  restitution: 0.45, // bounciness, 0–1
  friction: 0.35,
  dropIntervalMs: 130, // stagger between each item starting to fall
  dropJitterMs: 90,
  dropZoneWidth: 0.5, // fraction of stage width the drop zone covers (above fullWidthBelow)
  dropZoneAlign: 'center', // 'left' | 'right' | 'center'
  fullWidthBelow: 991, // stage width (px) below which the drop zone becomes 100%
};

/**
 * Falling tool icons + word-tag pills, meant to sit as a hero
 * background layer. Renders behind your real heading/CTA content —
 * give this a `position: relative` parent with an explicit height,
 * and give your foreground content `position: relative; z-index: 1`
 * so it stacks above this layer.
 *
 * Usage:
 *   <section style={{ position: 'relative', height: '100vh' }}>
 *     <FallingTools />
 *     <div style={{ position: 'relative', zIndex: 1 }}>
 *       <h1>Your headline</h1>
 *     </div>
 *   </section>
 */
export default function FallingTools() {
  const rootRef = useRef(null);
  const stageRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    if (!root || !stage) return;

    const srLabel = 'Tools: ' + TOOLS.map((t) => t.label).join(', ') + '.';
    root.setAttribute('aria-label', srLabel);

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function dims(tool) {
      const mobile = stage.clientWidth <= CFG.mobileBreakpoint;
      if (tool.aspect) {
        const h = mobile ? CFG.tagHeightMobile : CFG.tagHeightDesktop;
        return { w: h * tool.aspect, h };
      }
      const s = mobile ? CFG.iconSizeMobile : CFG.iconSizeDesktop;
      return { w: s, h: s };
    }

    function favUrl(tool) {
      return tool.src || `https://www.google.com/s2/favicons?sz=128&domain=${tool.domain}`;
    }

    function makeIconEl(tool, d) {
      const el = document.createElement('div');
      el.className = 'falling-tool' + (tool.aspect ? ' falling-tool--pill' : '');
      el.style.width = `${d.w}px`;
      el.style.height = `${d.h}px`;
      el.title = tool.label;
      const img = document.createElement('img');
      img.src = favUrl(tool);
      img.alt = '';
      img.loading = 'lazy';
      img.draggable = false;
      el.appendChild(img);
      return el;
    }

    // Reduced-motion fallback: just lay everything out, no physics
    if (reduceMotion) {
      root.classList.add('no-motion');
      TOOLS.forEach((tool) => {
        const el = makeIconEl(tool, dims(tool));
        el.classList.add('is-live');
        stage.appendChild(el);
      });
      return;
    }

    // ---------- physics ----------
    const engine = Matter.Engine.create();
    engine.gravity.y = CFG.gravity;
    engine.enableSleeping = true;
    const world = engine.world;
    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);

    let ground, leftWall, rightWall;
    let bodies = []; // { body, el, w, h }
    let timers = [];

    function zoneWidthPx() {
      const w = stage.clientWidth;
      return w <= CFG.fullWidthBelow ? w : w * CFG.dropZoneWidth;
    }

    function zoneBounds() {
      const w = stage.clientWidth;
      const zw = zoneWidthPx();
      if (w <= CFG.fullWidthBelow) return { min: 0, max: w };
      if (CFG.dropZoneAlign === 'center') return { min: (w - zw) / 2, max: (w + zw) / 2 };
      return CFG.dropZoneAlign === 'right' ? { min: w - zw, max: w } : { min: 0, max: zw };
    }

    function buildBounds() {
      if (ground) Matter.Composite.remove(world, [ground, leftWall, rightWall]);
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      const t = 60;
      const zb = zoneBounds();
      ground = Matter.Bodies.rectangle(w / 2, h + t / 2, w + t * 2, t, { isStatic: true, friction: CFG.friction });
      leftWall = Matter.Bodies.rectangle(zb.min - t / 2, h / 2, t, h * 4, { isStatic: true });
      rightWall = Matter.Bodies.rectangle(zb.max + t / 2, h / 2, t, h * 4, { isStatic: true });
      Matter.Composite.add(world, [ground, leftWall, rightWall]);
    }

    function clearIcons() {
      timers.forEach(clearTimeout);
      timers = [];
      bodies.forEach((b) => {
        Matter.Composite.remove(world, b.body);
        b.el.remove();
      });
      bodies = [];
    }

    function spawnIcon(tool) {
      const d = dims(tool);
      const el = makeIconEl(tool, d);
      stage.appendChild(el);

      const zb = zoneBounds();
      const x = zb.min + d.w / 2 + Math.random() * Math.max(zb.max - zb.min - d.w, 1);
      const body = Matter.Bodies.rectangle(x, -d.h, d.w, d.h, {
        chamfer: { radius: Math.min(d.w, d.h) * (tool.aspect ? 0.5 : 0.14) },
        restitution: CFG.restitution,
        friction: CFG.friction,
        frictionAir: 0.005,
        angle: (Math.random() - 0.5) * 0.6,
      });
      Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.15);
      Matter.Body.setVelocity(body, { x: (Math.random() - 0.5) * 2, y: 0 });
      Matter.Composite.add(world, body);
      bodies.push({ body, el, w: d.w, h: d.h });

      requestAnimationFrame(() => el.classList.add('is-live'));
    }

    function shuffled(arr) {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    }

    function runDrop() {
      clearIcons();
      buildBounds();
      shuffled(TOOLS).forEach((tool, i) => {
        const delay = i * CFG.dropIntervalMs + Math.random() * CFG.dropJitterMs;
        timers.push(setTimeout(() => spawnIcon(tool), delay));
      });
    }

    function onAfterUpdate() {
      bodies.forEach((b) => {
        if (b.body.isSleeping) return;
        const p = b.body.position;
        const a = b.body.angle;
        b.el.style.transform = `translate(${p.x - b.w / 2}px, ${p.y - b.h / 2}px) rotate(${a}rad)`;
      });
    }
    Matter.Events.on(engine, 'afterUpdate', onAfterUpdate);

    buildBounds();
    runDrop(); // falls once on mount — call runDrop() again yourself if you want a replay trigger

    let resizeTimer;
    function onResize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(buildBounds, 200);
    }
    window.addEventListener('resize', onResize);

    // cleanup on unmount (e.g. route change) — stops the engine and
    // removes every DOM node/listener this effect created
    return () => {
      window.removeEventListener('resize', onResize);
      clearTimeout(resizeTimer);
      timers.forEach(clearTimeout);
      Matter.Events.off(engine, 'afterUpdate', onAfterUpdate);
      Matter.Runner.stop(runner);
      Matter.Engine.clear(engine);
      bodies.forEach((b) => b.el.remove());
      stage.innerHTML = '';
    };
  }, []);

  return (
    <div ref={rootRef} className="falling-tools">
      <div ref={stageRef} className="falling-tools__stage" aria-hidden="true" />
    </div>
  );
}
