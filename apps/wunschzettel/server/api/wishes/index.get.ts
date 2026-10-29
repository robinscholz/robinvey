import { listWishes } from '@robinscholz/database'

export default defineEventHandler(() => listWishes(useDatabase()))
