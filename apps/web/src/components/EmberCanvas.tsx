import { useEffect, useRef } from 'react';
import { startEmbers, type EmberMode } from '../lib/embers';

export type { EmberMode };

export function EmberCanvas({ mode }: { mode: EmberMode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modeRef = useRef(mode);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    return startEmbers(canvas, () => modeRef.current);
  }, []);

  return <canvas ref={canvasRef} className="embers" aria-hidden />;
}
