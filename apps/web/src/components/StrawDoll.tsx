import clsx from 'clsx';
import styles from './StrawDoll.module.css';

export type DollState = 'hidden' | 'shown' | 'pullable' | 'gone';

interface StrawDollProps {
  state: DollState;
  /** 红线是否已解开，独立于 state，消失时也保持解开的样子 */
  unraveled: boolean;
  onPull: () => void;
}

const STRAW = '#c8a45c';
const STRAW_DARK = '#8a6a2e';
const STRAW_LINE = '#9c7a3c';
const THREAD = '#d40012';
const THREAD_PATH = 'M112 102 Q140 130 128 170 Q118 205 150 236';

export function StrawDoll({ state, unraveled, onPull }: StrawDollProps) {
  return (
    <svg
      className={clsx(styles.doll, styles[state], unraveled && styles.unraveled)}
      viewBox="0 0 200 300"
      role="img"
      aria-label="系着红线的稻草人"
    >
      <g stroke={STRAW_DARK} strokeWidth="1.2" fill={STRAW}>
        <rect x="36" y="116" width="128" height="16" rx="8" />
        <path d="M86 98 Q78 148 84 180 L72 272 L92 272 L100 204 L108 272 L128 272 L116 180 Q122 148 114 98 Z" />
        <ellipse cx="100" cy="60" rx="30" ry="38" />
      </g>
      <g stroke={STRAW_LINE} strokeWidth="0.9" fill="none" opacity="0.8">
        <path d="M84 30 Q82 60 88 92" />
        <path d="M92 24 Q90 60 94 96" />
        <path d="M100 22 L100 98" />
        <path d="M108 24 Q110 60 106 96" />
        <path d="M116 30 Q118 60 112 92" />
        <path d="M40 120 L160 120" />
        <path d="M40 124 L160 124" />
        <path d="M40 128 L160 128" />
        <path d="M90 104 Q86 150 90 178" />
        <path d="M100 102 L100 180" />
        <path d="M110 104 Q114 150 110 178" />
        <path d="M80 190 L76 268" />
        <path d="M86 190 L84 268" />
        <path d="M114 190 L116 268" />
        <path d="M120 190 L124 268" />
        <path d="M36 118 L28 112" />
        <path d="M36 124 L26 124" />
        <path d="M36 130 L28 136" />
        <path d="M164 118 L172 112" />
        <path d="M164 124 L174 124" />
        <path d="M164 130 L172 136" />
        <path d="M74 272 L70 282" />
        <path d="M82 272 L82 284" />
        <path d="M90 272 L94 282" />
        <path d="M110 272 L106 282" />
        <path d="M118 272 L118 284" />
        <path d="M126 272 L130 282" />
      </g>
      <g stroke={STRAW_DARK} strokeWidth="3" fill="none">
        <path d="M83 178 Q100 184 117 178" />
        <path d="M48 115 L48 133" />
        <path d="M152 115 L152 133" />
      </g>

      <ellipse
        className={styles.neckKnot}
        cx="100"
        cy="100"
        rx="15"
        ry="4"
        fill="none"
        stroke={THREAD}
        strokeWidth="2.5"
        pathLength={1}
      />
      <g className={styles.threadGroup} onClick={state === 'pullable' ? onPull : undefined}>
        <path d={THREAD_PATH} fill="none" stroke="transparent" strokeWidth="22" />
        <path
          className={styles.thread}
          d={THREAD_PATH}
          fill="none"
          stroke={THREAD}
          strokeWidth="2.5"
          strokeLinecap="round"
          pathLength={1}
        />
      </g>
    </svg>
  );
}
