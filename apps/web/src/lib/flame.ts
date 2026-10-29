interface FlameParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  life: number;
  decay: number;
  seed: number;
  thin: boolean;
}

const BACKGROUND = '#101010';
const IGNITE_END = 0.8;
const FADE_START = 4.4;
const FADE_DURATION = 1.2;

/**
 * 开场火焰：燃起、摇曳，最后化作几缕残焰散去。
 * 全部熄灭或 signal 中止时 resolve。
 */
export function burnFlame(canvas: HTMLCanvasElement, signal: AbortSignal) {
  return new Promise<void>((resolve) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      resolve();
      return;
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width * devicePixelRatio;
    canvas.height = height * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);

    const size = Math.min(Math.max(height / 900, 0.6), 1.3);
    const baseX = width / 2;
    const baseY = height * 0.62;
    const particles: FlameParticle[] = [];
    const start = performance.now();
    let frameId = requestAnimationFrame(frame);

    signal.addEventListener(
      'abort',
      () => {
        cancelAnimationFrame(frameId);
        resolve();
      },
      { once: true },
    );

    function frame(now: number) {
      const t = (now - start) / 1000;
      const strength = strengthAt(t);
      const fading = t > FADE_START;

      const spawnCount = Math.round(strength * 5);
      for (let i = 0; i < spawnCount; i++) particles.push(spawn(strength, fading));

      ctx!.globalCompositeOperation = 'source-over';
      ctx!.fillStyle = BACKGROUND;
      ctx!.fillRect(0, 0, width, height);
      ctx!.globalCompositeOperation = 'lighter';
      drawAmbientGlow(strength);

      const sway = Math.sin(t * 2.3) * 0.25 + Math.sin(t * 5.1) * 0.12;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]!;
        p.life -= p.decay;
        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }
        p.vx += Math.sin(t * 7 + p.seed) * 0.04 + Math.sin(p.y * 0.03 + t * 4) * 0.08 + sway * 0.03;
        if (!p.thin) p.vx += (baseX - p.x) * 0.0015;
        p.x += p.vx;
        p.y += p.vy;
        drawParticle(p);
      }

      if (fading && particles.length === 0) {
        resolve();
        return;
      }
      frameId = requestAnimationFrame(frame);
    }

    function strengthAt(t: number) {
      if (t < IGNITE_END) return t / IGNITE_END;
      if (t < FADE_START) return 1;
      return Math.max(0, 1 - (t - FADE_START) / FADE_DURATION);
    }

    function spawn(strength: number, fading: boolean): FlameParticle {
      return {
        x: baseX + (Math.random() - 0.5) * 34 * size,
        y: baseY + Math.random() * 10 * size,
        vx: (Math.random() - 0.5) * 0.6,
        vy: -(2 + Math.random() * 1.8) * size,
        r: (16 + Math.random() * 20) * size * (0.5 + 0.5 * strength),
        life: 1,
        decay: fading ? 0.009 + Math.random() * 0.007 : 0.011 + Math.random() * 0.008,
        seed: Math.random() * 100,
        thin: fading,
      };
    }

    function drawAmbientGlow(strength: number) {
      const radius = 260 * size;
      const centerY = baseY - 80 * size;
      const glow = ctx!.createRadialGradient(baseX, centerY, 0, baseX, centerY, radius);
      glow.addColorStop(0, `rgba(255, 70, 40, ${0.07 * strength})`);
      glow.addColorStop(1, 'rgba(255, 70, 40, 0)');
      ctx!.fillStyle = glow;
      ctx!.fillRect(baseX - radius, centerY - radius, radius * 2, radius * 2);
    }

    /** 刚生成的粒子在火焰底部，偏黄；越往上越偏粉红并变淡 */
    function drawParticle(p: FlameParticle) {
      const age = 1 - p.life;
      const grow = Math.sin(Math.PI * 0.5 * Math.min(age * 1.6, 1));
      const radius = Math.max(p.r * (0.25 + 0.75 * grow) * (0.4 + 0.6 * p.life), 0.1);
      const hue = (338 + 50 * p.life ** 1.4) % 360;
      const light = 48 + 12 * p.life ** 2;
      const alpha = (p.thin ? 0.3 : 0.1) * p.life;

      ctx!.save();
      ctx!.translate(p.x, p.y);
      ctx!.scale(p.thin ? 0.35 : 0.95, p.thin ? 2.2 : 1.3);
      const gradient = ctx!.createRadialGradient(0, 0, 0, 0, 0, radius);
      gradient.addColorStop(0, `hsla(${hue}, 100%, ${light}%, ${alpha})`);
      gradient.addColorStop(1, `hsla(${hue}, 100%, ${light}%, 0)`);
      ctx!.fillStyle = gradient;
      ctx!.beginPath();
      ctx!.arc(0, 0, radius, 0, Math.PI * 2);
      ctx!.fill();
      ctx!.restore();
    }
  });
}
