export const useInfoDrawer = () => {
  const openCheckId = useState<string | null>('infoDrawerCheckId', () => null)
  const isOpen = computed({
    get: () => openCheckId.value !== null,
    set: (v: boolean) => {
      if (!v) openCheckId.value = null
    },
  })
  const open = (id: string) => {
    openCheckId.value = id
  }
  const close = () => {
    openCheckId.value = null
  }
  return { openCheckId, isOpen, open, close }
}
