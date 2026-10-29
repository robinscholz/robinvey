import type { H3Event } from 'h3'

// Nuxt hands a single numeric env value over as a number, a list as a string.
export function parseGithubIds(list: string | number): Array<number> {
  return String(list)
    .split(',')
    .map((entry) => Number(entry.trim()))
    .filter((id) => Number.isSafeInteger(id) && id > 0)
}

// Named by environment variable, since that is what has to be set on the host.
// An empty allow list is not missing: signing in still works and shows the
// ID that has to go on it.
export function missingSignInSettings(event?: H3Event): Array<string> {
  const { session, oauth } = useRuntimeConfig(event)
  const settings: Record<string, boolean> = {
    NUXT_SESSION_PASSWORD: session.password.length >= 32,
    NUXT_OAUTH_GITHUB_CLIENT_ID: Boolean(oauth.github.clientId),
    NUXT_OAUTH_GITHUB_CLIENT_SECRET: Boolean(oauth.github.clientSecret),
  }

  return Object.keys(settings).filter((name) => !settings[name])
}
