import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { isAbortError, sleep } from '../lib/sleep';

export interface ScriptLine {
  id: number;
  text: string;
  variant?: string;
}

interface SayOptions {
  variant?: string;
  /** 每个字的间隔（毫秒） */
  speed?: number;
}

export interface ScriptContext {
  say: (text: string, options?: SayOptions) => Promise<void>;
  sleep: (ms: number) => Promise<void>;
}

export type Script = (context: ScriptContext) => Promise<void>;

const DEFAULT_SPEED = 55;
const PAUSE_CHARS = '，。、…—？';
const PAUSE_MULTIPLIER = 4;
const LINE_GAP = 350;

let nextLineId = 0;

/**
 * 逐字播放台词。initialScript 在挂载时播放，play 用于追加后续台词。
 * 组件卸载后所有脚本都会在下一个 await 处中止，不会再执行后面的代码。
 */
export function useScript(initialScript?: Script) {
  const [lines, setLines] = useState<ScriptLine[]>([]);
  const signalRef = useRef<AbortSignal | null>(null);
  const initialScriptRef = useRef(initialScript);

  const play = useCallback((script: Script) => {
    const signal = signalRef.current;
    if (!signal || signal.aborted) return;
    script(createContext(signal, setLines)).catch((error: unknown) => {
      if (!isAbortError(error)) console.error(error);
    });
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    signalRef.current = controller.signal;
    setLines([]);
    if (initialScriptRef.current) play(initialScriptRef.current);
    return () => controller.abort();
  }, [play]);

  return { lines, play };
}

function createContext(signal: AbortSignal, setLines: Dispatch<SetStateAction<ScriptLine[]>>): ScriptContext {
  const wait = (ms: number) => sleep(ms, signal);

  return {
    sleep: wait,
    async say(text, { variant, speed = DEFAULT_SPEED } = {}) {
      const id = nextLineId++;
      setLines((prev) => [...prev, { id, text: '', variant }]);
      let shown = '';
      for (const char of text) {
        shown += char;
        const snapshot = shown;
        setLines((prev) => prev.map((line) => (line.id === id ? { ...line, text: snapshot } : line)));
        await wait(PAUSE_CHARS.includes(char) ? speed * PAUSE_MULTIPLIER : speed);
      }
      await wait(LINE_GAP);
    },
  };
}
