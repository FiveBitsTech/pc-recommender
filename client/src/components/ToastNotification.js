import { toast } from 'react-toastify'

let lastErrorMessage = null
let lastErrorTime = 0
const ERROR_DEDUP_TIME = 3000

/** Toasts: una sola línea corta. Nunca párrafos ni listas. */
const MAX_TOAST_CHARS = 72

const toOneLineToast = message => {
  const raw = Array.isArray(message) ? message.join(', ') : String(message ?? '')
  const oneLine = raw.replace(/\s+/g, ' ').trim()
  if (oneLine.length <= MAX_TOAST_CHARS) return oneLine
  return `${oneLine.slice(0, MAX_TOAST_CHARS - 1).trimEnd()}…`
}

const toastOpts = {
  position: 'top-right',
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  style: { whiteSpace: 'nowrap', maxWidth: 420 }
}

export const notificationErrorMessage = message => {
  const text = toOneLineToast(message)
  const now = Date.now()

  if (text === lastErrorMessage && now - lastErrorTime < ERROR_DEDUP_TIME) {
    return
  }

  lastErrorMessage = text
  lastErrorTime = now

  return toast.error(text, { ...toastOpts, autoClose: 2000 })
}

export const notificationWarningMessage = message => {
  return toast.warning(toOneLineToast(message), { ...toastOpts, autoClose: 2500 })
}

export const notificationSuccesMessage = message => {
  return toast.success(toOneLineToast(message), { ...toastOpts, autoClose: 2000 })
}

export const notificationInfoMessage = message => {
  return toast.info(toOneLineToast(message), { ...toastOpts, autoClose: 3000 })
}
