import { Auth1701839162576 } from './migrations/1701839162576-auth'
import { Unique1701850059394 } from './migrations/1701850059394-unique'
import { StatePrimaryColumn1701934832212 } from './migrations/1701934832212-state-primary-column'
import { Messages1702084032175 } from './migrations/1702084032175-messages'
import { AddDeletedData1702200040189 } from './migrations/1702200040189-add-deleted-data'

/**
 * add manual migrations that has been created so webpack can compile it
 */
export const migrations = [
    Auth1701839162576,
    Unique1701850059394,
    StatePrimaryColumn1701934832212,
    Messages1702084032175,
    AddDeletedData1702200040189,
]
