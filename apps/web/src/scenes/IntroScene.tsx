import clsx from 'clsx';
import { useEffect, useRef } from 'react';
import { burnFlame } from '../lib/flame';
import { isAbortError, sleep } from '../lib/sleep';
import styles from './IntroScene.module.css';

const AFTER_FLAME_DELAY = 400;

export function IntroScene({ onFinish }: { onFinish: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onFinishRef = useRef(onFinish);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const controller = new AbortController();
    const { signal } = controller;

    burnFlame(canvas, signal)
      .then(() => sleep(AFTER_FLAME_DELAY, signal))
      .then(() => onFinishRef.current())
      .catch((error: unknown) => {
        if (!isAbortError(error)) console.error(error);
      });

    return () => controller.abort();
  }, []);

  return (
    <section className={clsx('scene', styles.root)} title="点击全屏" onClick={requestFullscreen}>
      <canvas ref={canvasRef} className={styles.canvas} />
    </section>
  );
}

function requestFullscreen() {
  document.documentElement.requestFullscreen?.().catch(() => {});
}
