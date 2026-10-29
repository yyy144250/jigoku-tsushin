export type EmberMode = 'none' | 'dusk' | 'hell';

interface Ember {
  x: number;
  y: number;
  r: number;
  vy: number;
  drift: number;
  life: number;
  decay: number;
}

const SETTINGS: Record<EmberMode, { limit: number; speed: number; color: string }> = {
  none: { limit: 0, speed: 1, color: '255, 30, 40' },
  dusk: { limit: 70, speed: 1, color: '255, 170, 90' },
  hell: { limit: 140, speed: 2, color: '255, 10, 20' },
};

/** 背景缓缓上升的火星；getMode 每帧读取，切换模式不必重启动画。返回停止函数 */
export function startEmbers(canvas: HTMLCanvasElement, getMode: () => EmberMode) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};

  const embers: Ember[] = [];
  let frameId = requestAnimationFrame(frame);

  resize();
  window.addEventListener('resize', resize);

  return () => {
    cancelAnimationFrame(frameId);
    window.removeEventListener('resize', resize);
  };

  function resize() {
    canvas.width = window.innerWidth * devicePixelRatio;
    canvas.height = window.innerHeight * devicePixelRatio;
    ctx!.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  }

  function frame() {
    const { limit, speed, color } = SETTINGS[getMode()];
    ctx!.clearRect(0, 0, window.innerWidth, window.innerHeight);
    if (embers.length < limit && Math.random() < 0.5) embers.push(spawn());

    for (let i = embers.length - 1; i >= 0; i--) {
      const ember = embers[i]!;
      ember.y -= ember.vy * speed;
      ember.drift += 0.02;
      ember.x += Math.sin(ember.drift) * 0.3;
      ember.life -= ember.decay;
      if (ember.life <= 0 || ember.y < -10) {
        embers.splice(i, 1);
        continue;
      }
      ctx!.beginPath();
      ctx!.fillStyle = `rgba(${color}, ${ember.life * 0.8})`;
      ctx!.shadowColor = `rgb(${color})`;
      ctx!.shadowBlur = 8;
      ctx!.arc(ember.x, ember.y, ember.r, 0, Math.PI * 2);
      ctx!.fill();
    }
    frameId = requestAnimationFrame(frame);
  }

  function spawn(): Ember {
    return {
      x: Math.random() * window.innerWidth,
      y: window.innerHeight + 10,
      r: Math.random() * 1.8 + 0.4,
      vy: Math.random() * 0.6 + 0.2,
      drift: Math.random() * Math.PI * 2,
      life: 1,
      decay: Math.random() * 0.002 + 0.001,
    };
  }
}
