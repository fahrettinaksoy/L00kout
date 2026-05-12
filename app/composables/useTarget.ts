import { parseTarget, type TargetInfo } from '../../shared/url'

export { parseTarget }

export const useTarget = () => {
  const target = useState<TargetInfo | null>('target', () => null)
  const setTarget = (input: string) => {
    target.value = parseTarget(input)
    return target.value
  }
  return { target, setTarget }
}
