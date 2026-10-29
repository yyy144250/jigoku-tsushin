import type { Grudge } from '@jigoku/shared';
import clsx from 'clsx';
import { useState } from 'react';
import { abandonGrudge, contractGrudge } from '../api/grudges';
import { ScriptLines } from '../components/ScriptLines';
import { StrawDoll, type DollState } from '../components/StrawDoll';
import { useScript } from '../hooks/useScript';
import { isAbortError } from '../lib/sleep';
import styles from './DuskScene.module.css';

interface DuskSceneProps {
  grudge: Grudge;
  onContract: (grudge: Grudge) => void;
  onAbandon: () => void;
}

const GRASS_PATH =
  'M0 60 L0 40 L20 22 L28 42 L45 15 L55 40 L70 28 L82 44 L100 18 L112 42 L130 30 L145 46 L160 20 L170 42 L190 34 L205 12 L215 40 L240 30 L255 44 L270 24 L282 42 L300 16 L310 40 L335 32 L350 46 L365 22 L378 42 L400 28 L415 10 L425 40 L450 34 L465 46 L480 20 L492 42 L510 30 L525 14 L535 42 L560 32 L575 46 L590 22 L602 42 L620 26 L635 12 L645 40 L670 34 L685 46 L700 20 L712 42 L730 28 L745 16 L755 42 L780 32 L795 46 L810 22 L822 42 L840 30 L855 12 L865 40 L890 34 L905 46 L920 20 L932 42 L950 28 L965 16 L975 42 L1000 30 L1000 60 Z';

export function DuskScene({ grudge, onContract, onAbandon }: DuskSceneProps) {
  const [dollState, setDollState] = useState<DollState>('hidden');
  const [unraveled, setUnraveled] = useState(false);
  const awaitingChoice = dollState === 'pullable';

  const { lines, play } = useScript(async ({ say, sleep }) => {
    await sleep(1600);
    await say('……是你在呼唤我吧。', { variant: 'speaker' });
    await sleep(800);
    setDollState('shown');
    await sleep(1400);
    await say('收下它。', { variant: 'speaker' });
    await sleep(900);
    await say('如果你真的想要报仇，就解开这根红线。');
    await say(`解开红线，就意味着与我正式订立契约。「${grudge.targetName}」会立刻被流放到地狱。`);
    await sleep(500);
    await say('不过，报了仇之后，你自己也要付出代价。');
    await say('诅咒他人者，须掘两座坟墓。');
    await say('等你死去的时候，你的灵魂也将堕入地狱，永世不得往生。');
    await sleep(700);
    await say('……接下来，由你自己决定。', { variant: 'speaker' });
    await sleep(600);
    await say('（点击稻草人身上的红线）', { variant: 'hint', speed: 40 });
    setDollState('pullable');
  });

  return (
    <section className={clsx('scene', styles.root)}>
      <svg className={styles.grass} viewBox="0 0 1000 60" preserveAspectRatio="none" aria-hidden>
        <path fill="#0a0101" d={GRASS_PATH} />
      </svg>
      <div className={styles.body}>
        <StrawDoll state={dollState} unraveled={unraveled} onPull={handlePull} />
        <div className={styles.dialogue}>
          <ScriptLines lines={lines} className={styles.lines} variantClassNames={styles} />
          <div className={clsx(styles.choices, awaitingChoice && styles.visible)}>
            <button className={styles.giveUp} type="button" disabled={!awaitingChoice} onClick={handleGiveUp}>
              …… 我放弃
            </button>
          </div>
        </div>
      </div>
    </section>
  );

  function handlePull() {
    if (!awaitingChoice) return;
    setDollState('shown');
    setUnraveled(true);

    play(async ({ say, sleep }) => {
      try {
        const [contracted] = await Promise.all([contractGrudge(grudge.id), sleep(1600)]);
        setDollState('gone');
        await sleep(800);
        onContract(contracted);
      } catch (error) {
        if (isAbortError(error)) throw error;
        console.error(error);
        setUnraveled(false);
        await say('……线没能解开。（通信失败，请再试一次）', { variant: 'hint', speed: 40 });
        setDollState('pullable');
      }
    });
  }

  function handleGiveUp() {
    if (!awaitingChoice) return;
    setDollState('shown');
    abandonGrudge(grudge.id).catch(console.error);

    play(async ({ say, sleep }) => {
      await say('……是吗。', { variant: 'speaker', speed: 200 });
      await sleep(1200);
      setDollState('gone');
      await sleep(1200);
      onAbandon();
    });
  }
}
