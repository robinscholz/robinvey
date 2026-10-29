import { parseGithubIds } from '../../utils/auth/settings'

// The allow list holds the numeric ID, since a login can be renamed and then
// claimed by someone else.
export default defineOAuthGitHubEventHandler({
  async onSuccess(event, { user }) {
    const githubId = user.id
    const { allowedGithubIds } = useRuntimeConfig(event)

    if (!parseGithubIds(allowedGithubIds).includes(githubId)) {
      console.warn(`[auth] turned away GitHub ID ${githubId} (${user.login})`)
      const query = new URLSearchParams({
        error: 'denied',
        id: String(githubId),
      })
      return sendRedirect(event, `/login?${query}`)
    }

    await replaceUserSession(event, {
      user: { githubId },
      loggedInAt: Date.now(),
    })
    return sendRedirect(event, '/add')
  },

  onError(event, error) {
    console.error(`[auth] ${error.message}`)
    return sendRedirect(event, '/login?error=failed')
  },
})
