import type { ReactNode } from 'react'
export type BadgeVariant = 'success' | 'warning' | 'danger' | 'muted' | 'accent'
interface Props { variant: BadgeVariant; children: ReactNode; dot?: boolean }

const dotClass: Record<BadgeVariant, string> = {
  success: 'dot-green', warning: 'dot-amber', danger: 'dot-red', muted: 'dot-gray', accent: 'dot-gray'
}

export default function Badge({ variant, children, dot }: Props) {
  return (
    <span className={`badge badge-${variant}`}>
      {dot && <span className={`dot ${dotClass[variant]}`} />}
      {children}
    </span>
  )
}
