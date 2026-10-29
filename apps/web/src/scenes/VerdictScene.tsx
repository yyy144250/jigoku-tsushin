import type { Grudge } from '@jigoku/shared';
import clsx from 'clsx';
import { useState } from 'react';
import { ScriptLines } from '../components/ScriptLines';
import { useScript } from '../hooks/useScript';
import styles from './VerdictScene.module.css';

interface VerdictSceneProps {
  grudge: Grudge;
  onBack: () => void;
}

export function VerdictScene({ grudge, onBack }: VerdictSceneProps) {
  const [sealVisible, setSealVisible] = useState(false);
  const [backVisible, setBackVisible] = useState(false);

  const { lines } = useScript(async ({ say, sleep }) => {
    await sleep(1800);
    await say('迷失于黑暗中的可悲之影，', { speed: 110 });
    await say('伤人、辱人，', { speed: 110 });
    await say('沉溺于罪孽的业障之魂——', { speed: 110 });
    await sleep(1400);
    await say('要不要，试着死一次？', { variant: 'big', speed: 180 });
    await sleep(2400);
    await say(`「${grudge.targetName}」已被流放至地狱。`, { variant: 'small', speed: 80 });
    await say('此怨，已了。', { variant: 'small', speed: 140 });
    await sleep(1600);
    await say('——而你的胸口，浮现出了一枚印记。', { variant: 'small', speed: 80 });
    setSealVisible(true);
    await sleep(2200);
    setBackVisible(true);
  });

  return (
    <section className={clsx('scene', styles.root)}>
      <ScriptLines lines={lines} className={styles.lines} variantClassNames={styles} />
      <svg className={clsx(styles.seal, sealVisible && styles.visible)} viewBox="0 0 72 72" aria-hidden>
        <circle cx="36" cy="36" r="30" fill="none" stroke="#1d0a0a" strokeWidth="5" />
        <circle cx="36" cy="36" r="30" fill="none" stroke="#5a0006" strokeWidth="1.5" />
        <path
          d="M36 14 L36 58 M18 30 Q36 40 54 30 M22 50 Q36 40 50 50"
          fill="none"
          stroke="#5a0006"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      <button
        className={clsx(styles.back, backVisible && styles.visible)}
        type="button"
        disabled={!backVisible}
        onClick={onBack}
      >
        返回
      </button>
    </section>
  );
}
