import clsx from 'clsx';
import { ScriptLines } from '../components/ScriptLines';
import { useScript } from '../hooks/useScript';
import styles from './TransmitScene.module.css';

export function TransmitScene({ onFinish }: { onFinish: () => void }) {
  const { lines } = useScript(async ({ say, sleep }) => {
    await sleep(800);
    await say('发送中……', { speed: 120 });
    await sleep(900);
    await say('已受理。', { variant: 'accent', speed: 160 });
    await sleep(1400);
    onFinish();
  });

  return (
    <section className={clsx('scene', styles.root)}>
      <ScriptLines lines={lines} className={styles.lines} variantClassNames={styles} />
    </section>
  );
}
