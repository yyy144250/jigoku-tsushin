import { createGrudgeSchema, TARGET_NAME_MAX_LENGTH, type Grudge } from '@jigoku/shared';
import clsx from 'clsx';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { createGrudge } from '../api/grudges';
import { sleep } from '../lib/sleep';
import styles from './GateScene.module.css';

const FOCUS_DELAY = 800;
const GLITCH_DURATION = 700;

type Phase = 'idle' | 'sending' | 'failed';

export function GateScene({ onSent }: { onSent: (grudge: Grudge) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  const [shaking, setShaking] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), FOCUS_DELAY);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className={clsx('scene', styles.root, phase === 'sending' && 'glitch')}>
      <form className={styles.form} autoComplete="off" onSubmit={handleSubmit}>
        <p className={styles.label}>あなたの怨み、晴らします。</p>
        <input
          ref={inputRef}
          className={clsx(styles.input, shaking && styles.shake)}
          value={name}
          maxLength={TARGET_NAME_MAX_LENGTH}
          aria-label="怨恨之人的名字"
          onChange={(event) => setName(event.target.value)}
          onAnimationEnd={() => setShaking(false)}
        />
        <button className={styles.send} type="submit" disabled={phase === 'sending'}>
          送信
        </button>
        <p className={styles.error} role="alert">
          {phase === 'failed' ? '通信中断，请再试一次。' : ''}
        </p>
      </form>
      <p className={styles.disclaimer}>※ 本页面为《地狱少女》同人致敬作品，送出的名字会被记录在地狱的名册里。</p>
    </section>
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (phase === 'sending') return;

    const parsed = createGrudgeSchema.safeParse({ targetName: name });
    if (!parsed.success) {
      setShaking(true);
      inputRef.current?.focus();
      return;
    }

    setPhase('sending');
    try {
      const [grudge] = await Promise.all([createGrudge(parsed.data), sleep(GLITCH_DURATION)]);
      onSent(grudge);
    } catch (error) {
      console.error(error);
      setPhase('failed');
    }
  }
}
