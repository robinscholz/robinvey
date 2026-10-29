import { missingSignInSettings, parseGithubIds } from '../utils/auth/settings'
import type { H3Event } from 'h3'

const WRITE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

let reported = false

// Workers only hand out environment variables during a request, so the
// settings are checked there and reported once per isolate.
function reportSignInSettings(event: H3Event, missing: Array<string>) {
  if (reported) {
    return
  }
  reported = true

  if (missing.length > 0) {
    console.error(
      `[auth] GitHub sign-in is not set up, nothing can be added. Missing: ${missing.join(', ')}`
    )
  }
  if (parseGithubIds(useRuntimeConfig(event).allowedGithubIds).length === 0) {
    console.warn(
      '[auth] NUXT_ALLOWED_GITHUB_IDS is empty, every account is turned away.'
    )
  }
}

// The list is for everyone; adding, editing and removing is for the owner.
function isPrivate(pathname: string, method: string): boolean {
  if (pathname === '/add' || pathname.startsWith('/add/')) {
    return true
  }
  return pathname.startsWith('/api/') && WRITE_METHODS.has(method)
}

const gate = defineEventHandler(async (event) => {
  const { pathname } = getRequestURL(event)
  if (!isPrivate(pathname, event.method)) {
    return
  }

  const missing = missingSignInSettings(event)
  reportSignInSettings(event, missing)
  if (missing.length === 0 && (await getUserSession(event)).user) {
    return
  }

  if (pathname.startsWith('/api/')) {
    throw createError({ statusCode: 401, statusMessage: 'Not signed in' })
  }

  return sendRedirect(
    event,
    missing.length > 0 ? '/login?error=unavailable' : '/login'
  )
})

// The gate goes to the front of the stack. `nuxt dev` only listens on
// localhost and stays open.
export default defineNitroPlugin((nitroApp) => {
  if (import.meta.dev) {
    return
  }

  nitroApp.h3App.stack.unshift({ route: '', handler: gate })
})
