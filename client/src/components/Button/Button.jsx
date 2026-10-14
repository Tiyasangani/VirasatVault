import { Link } from 'react-router-dom'

// variant: primary | secondary | ghost | danger. Renders a Link when `to` is given.
export default function Button({ variant = 'primary', to, href, size, className = '', children, ...rest }) {
  const cls = `btn btn-${variant} ${size === 'sm' ? 'btn-sm' : ''} ${className}`
  if (to) return <Link to={to} className={cls} {...rest}>{children}</Link>
  if (href) return <a href={href} className={cls} {...rest}>{children}</a>
  return <button type="button" className={cls} {...rest}>{children}</button>
}
