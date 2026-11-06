import { cn } from '@lib/utils'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement>

export function Chip({ className, ...props }: Props) {
  return (
    <button
      className={cn(
        'rounded-[2px] border border-line bg-panel/70 px-3 py-2 font-mono text-[11px] tracking-[.08em] text-fg uppercase backdrop-blur transition-colors hover:border-muted aria-pressed:border-hot aria-pressed:text-hot',
        className,
      )}
      {...props}
    />
  )
}
