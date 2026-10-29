import type { Grudge } from '@jigoku/shared';
import clsx from 'clsx';
import { useState } from 'react';
import { EmberCanvas, type EmberMode } from './components/EmberCanvas';
import { DuskScene } from './scenes/DuskScene';
import { GateScene } from './scenes/GateScene';
import { IntroScene } from './scenes/IntroScene';
import { TransmitScene } from './scenes/TransmitScene';
import { VerdictScene } from './scenes/VerdictScene';

type Stage =
  | { scene: 'intro' }
  | { scene: 'gate' }
  | { scene: 'transmit'; grudge: Grudge }
  | { scene: 'dusk'; grudge: Grudge }
  | { scene: 'verdict'; grudge: Grudge };

const EMBER_MODES: Record<Stage['scene'], EmberMode> = {
  intro: 'none',
  gate: 'none',
  transmit: 'none',
  dusk: 'dusk',
  verdict: 'hell',
};

export function App() {
  const [stage, setStage] = useState<Stage>({ scene: 'intro' });
  const plain = stage.scene === 'intro' || stage.scene === 'gate';

  return (
    <div className={clsx('app', plain && 'app--plain')}>
      <EmberCanvas mode={EMBER_MODES[stage.scene]} />

      {stage.scene === 'intro' && <IntroScene onFinish={backToGate} />}
      {stage.scene === 'gate' && <GateScene onSent={(grudge) => setStage({ scene: 'transmit', grudge })} />}
      {stage.scene === 'transmit' && (
        <TransmitScene onFinish={() => setStage({ scene: 'dusk', grudge: stage.grudge })} />
      )}
      {stage.scene === 'dusk' && (
        <DuskScene
          grudge={stage.grudge}
          onContract={(grudge) => setStage({ scene: 'verdict', grudge })}
          onAbandon={backToGate}
        />
      )}
      {stage.scene === 'verdict' && <VerdictScene grudge={stage.grudge} onBack={backToGate} />}

      <div className="overlay overlay--scanlines" />
      <div className="overlay overlay--vignette" />
      {stage.scene === 'verdict' && <div className="overlay overlay--flash" />}
    </div>
  );

  function backToGate() {
    setStage({ scene: 'gate' });
  }
}
