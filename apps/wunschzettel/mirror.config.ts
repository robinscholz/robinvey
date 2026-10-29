import { extendMirrorConfig } from '@maas/mirror'

// The stock mirror-tokens tree, fetched from git on every token build, with
// the local tree merged over it: config.json points the grey palette at
// neutral, so surface, primary and secondary lose their blue tint, and
// application.json halves the focus line and its halo, to 1px and 2px.
export default extendMirrorConfig({
  source: [
    { type: 'git', repo: 'magicasaservice/mirror-tokens' },
    { type: 'local', path: './tokens' },
  ],
})
