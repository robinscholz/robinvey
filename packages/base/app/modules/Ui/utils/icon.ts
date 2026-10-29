// Icons come from Symbols, the MaaS set, in the weight a step lighter than
// the text, so the marks in each row stay quiet.
export const IconPrefix = 'maas'
export const IconWeight = 300

export type IconWeight = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900

interface IconNamePayload {
  name: string
  weight?: IconWeight
  prefix?: string
}

export function iconName({
  name,
  weight = IconWeight,
  prefix = IconPrefix,
}: IconNamePayload): string {
  return `${prefix}:${name}-${weight}`
}
