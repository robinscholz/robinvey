import { extendMirrorConfig, stockSelectors } from '@maas/mirror'

// The stock tree comes from git, pinned to v2 until mirror-tokens merges it
// into main. The robinvey theme sits one rung above the base and the colour
// mode, so <html data-theme="robinvey"> swaps type and paper in one place.
export default extendMirrorConfig({
  source: [
    { type: 'git', repo: 'magicasaservice/mirror-tokens', ref: 'v2' },
    { type: 'local', path: './tokens' },
  ],
  targets: {
    'theme/mono/application': null,
    'theme/robinvey/application': {
      include: [{ src: 'config' }],
      selector: stockSelectors.theme('robinvey'),
      files: [{ src: 'theme/robinvey' }],
    },
    'theme/robinvey/dark/application': {
      include: [{ src: 'config' }],
      selector: stockSelectors.themeDark('robinvey'),
      files: [{ src: 'theme/robinveyDark' }],
    },
  },
})
