/**
 * Resolves a structured error payload (`{ code, context }`) into a localised
 * string. Falls back to a generic message if the code is unknown.
 */

import type { CheckErrorPayload } from '~/types/check'

export const useCheckError = () => {
  const { t, te } = useI18n()

  const format = (err: CheckErrorPayload | undefined | null): string => {
    if (!err) return t('errors.INTERNAL_ERROR')
    const key = `errors.${err.code}`
    if (te(key)) return t(key, err.context ?? {})
    return t('errors.INTERNAL_ERROR')
  }

  return { format }
}
