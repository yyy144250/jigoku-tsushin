import type { ScriptLine } from '../hooks/useScript';

interface ScriptLinesProps {
  lines: ScriptLine[];
  className?: string;
  /** variant 到样式类名的映射，通常直接传入场景的 CSS Module */
  variantClassNames?: Readonly<Record<string, string>>;
}

export function ScriptLines({ lines, className, variantClassNames = {} }: ScriptLinesProps) {
  return (
    <div className={className} aria-live="polite">
      {lines.map((line) => (
        <p key={line.id} className={line.variant ? variantClassNames[line.variant] : undefined}>
          {line.text}
        </p>
      ))}
    </div>
  );
}
