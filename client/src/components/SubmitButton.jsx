import Spinner from './Spinner'

/**
 * SubmitButton — a button that shows a spinner when loading.
 *
 * Props:
 *   loading  — boolean, disables the button and shows spinner
 *   children — default button label
 *   ...rest  — forwarded to <button>
 */
export default function SubmitButton({ loading = false, children, className = '', ...rest }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className={`
        relative flex items-center justify-center gap-2
        px-6 py-2.5 rounded-xl font-semibold text-white
        signature-gradient
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2
        ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-lg active:scale-95'}
        ${className}
      `}
      {...rest}
    >
      {loading ? <Spinner /> : children}
    </button>
  )
}
