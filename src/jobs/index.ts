import type { RunJobAccess } from 'payload'

import type { User } from '../payload-types'
import { isAdminUser } from '../access/isAdmin'
import { heartbeatTask } from './heartbeat'
import { seedDirectoryTask } from './seedDirectory'
import { checkStalenessTask } from './checkStaleness'
import { dedupFlagTask } from './dedupFlag'
import { aggregateEventsTask } from './aggregateEvents'

export { heartbeatTask } from './heartbeat'
export { seedDirectoryTask, runSeedDirectory } from './seedDirectory'
export { checkStalenessTask, runCheckStaleness } from './checkStaleness'
export { dedupFlagTask, runDedupFlag } from './dedupFlag'
export { aggregateEventsTask, runAggregateEvents } from './aggregateEvents'
export {
  ingestDraftDefaults,
  INGEST_DEFAULT_STATUS,
  type IngestStatus,
} from './draftDefaults'

/** All Jobs Queue tasks (AR20). Add new pipeline tasks here. */
export const jobTasks = [
  heartbeatTask,
  seedDirectoryTask,
  checkStalenessTask,
  dedupFlagTask,
  aggregateEventsTask,
]

/**
 * Who may trigger queue runs (AR20). Admin/operator staff via the Local API, OR the
 * Railway cron Route Handler which authenticates with CRON_SECRET before running with
 * overrideAccess. Anonymous requests are denied.
 */
export const canRunJobs: RunJobAccess = ({ req }) =>
  isAdminUser(req.user as User | null | undefined)
