import { useId, useRef, useState, type ReactNode } from 'react'

interface Props {
  label: string
  type?: string
  value: string
  onChange: (v: string) => void
  name?: string
  autoComplete?: string
  disabled?: boolean
  className?: string
  rightIcon?: ReactNode
  onRightClick?: () => void
  rightAriaLabel?: string
}

export default function FloatingInput({ label, type = 'text', value, onChange, name, autoComplete, disabled, className, rightIcon, onRightClick, rightAriaLabel }: Props) {
  const [focused, setFocused] = useState(false)
  const reactId = useId()
  const id = name || `fi-${reactId}`
  const isDate = type === 'date'
  // Float when focused or has value; for date we keep label at border even when inactive (grey)
  const hasValue = value != null && String(value).length > 0
  const active = focused || hasValue
  const inputRef = useRef<HTMLInputElement>(null) // visible input
  const dateRef = useRef<HTMLInputElement>(null)  // hidden native date input
  const openPicker = () => {
    const el = dateRef.current
    if (!el) return
    // Prefer native showPicker if available
    // @ts-ignore
    if (typeof el.showPicker === 'function') {
      // @ts-ignore
      el.showPicker()
    } else {
      el.focus(); el.click()
    }
  }

  return (
    <div className={"relative " + (className || '')}>
      {isDate && (
        <svg
          aria-hidden
          onMouseDown={(e)=>{ e.preventDefault(); openPicker() }}
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 cursor-pointer"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
      )}
      {isDate ? (
        <>
          {/* Visible formatted text input */}
          <input
            type="text"
            value={value ? new Intl.DateTimeFormat(undefined, { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(value)) : ''}
            onFocus={() => { setFocused(true); openPicker() }}
            onBlur={() => setFocused(false)}
            onClick={() => openPicker()}
            readOnly
            className={"input peer pl-10 " + (rightIcon ? 'pr-10' : '')}
            placeholder=""
            name={name}
            id={id}
            ref={inputRef}
            autoComplete={autoComplete}
            disabled={disabled}
          />
          {/* Hidden native date input used only to pick value */}
          <input
            ref={dateRef}
            type="date"
            className="sr-only absolute opacity-0 pointer-events-none"
            value={value}
            onChange={(e)=> onChange(e.target.value)}
            tabIndex={-1}
          />
        </>
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={"input peer " + (rightIcon ? 'pr-10' : '')}
          placeholder=""
          name={name}
          id={id}
          ref={inputRef}
          autoComplete={autoComplete}
          disabled={disabled}
        />
      )}
      {rightIcon && (
        <button type="button" aria-label={rightAriaLabel}
          className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 grid place-items-center text-gray-500 hover:text-gray-700"
          onMouseDown={(e)=> e.preventDefault()}
          onClick={onRightClick}
        >
          {rightIcon}
        </button>
      )}
      <label
        htmlFor={id}
        className={[
          'absolute left-3 px-1 transition-all duration-150 pointer-events-none z-[1] bg-white',
          // position
          active ? 'top-0 -translate-y-1/2 text-xs' : (isDate ? 'top-0 -translate-y-1/2 text-xs' : 'top-2.5'),
          // color
          focused ? 'text-brand' : 'text-gray-500'
        ].join(' ')}
      >
        {label}
      </label>
    </div>
  )
}
