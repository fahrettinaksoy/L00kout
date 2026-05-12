const STORAGE_KEY = 'l00kout_locale'
const SUPPORTED = ['tr', 'en'] as const
type Locale = (typeof SUPPORTED)[number]

const pickLocale = (): Locale | null => {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored && (SUPPORTED as readonly string[]).includes(stored)) return stored as Locale
  const nav = (navigator.language || '').slice(0, 2).toLowerCase()
  if ((SUPPORTED as readonly string[]).includes(nav)) return nav as Locale
  return null
}

export default defineNuxtPlugin((nuxtApp) => {
  const { $i18n } = nuxtApp as any
  if (!$i18n) return

  const initial = pickLocale()
  if (initial && $i18n.locale.value !== initial) {
    $i18n.setLocale(initial)
  }

  watch(
    () => $i18n.locale.value,
    (val: string) => {
      if (val && (SUPPORTED as readonly string[]).includes(val)) {
        localStorage.setItem(STORAGE_KEY, val)
      }
    },
  )
})
