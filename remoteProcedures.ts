// deno-lint-ignore-file no-explicit-any
export const DEV = true
export const LOCAL = false

const KEY = ["PWA"]


let db: Deno.Kv
export async function initDB() {
   if (LOCAL) {
      db = await Deno.openKv(); //"./data.db");
   } else {
      db = await Deno.openKv();
   }
}

/** get a record */
export async function getRow(key = ["PWA"]) {
   console.info('get Row: ', key)
   if (!db) await initDB()
   const result = await db.get(key)
   return result
}

/** set a record */
export async function setRow(value: any) {
   if (!db) await initDB()
   const result = await db.set(["PWA"], value);
   if (result.versionstamp) {
      fireMutationEvent(["PWA"], "SetRow")
   } else {
      console.error('kvdb.setRow failed!')
   }
   //console.log(`SetRow = value "${value}", result "${JSON.stringify(result)}"`)
   return result
}

export async function loadTestSet() {
   console.log(`$$$$$$$$$$$$$$$$$$$$$   Loading Test Set`)
   if (!db) await initDB()
   await db.set(KEY, JSON.stringify({
      id: 0,
      host: "New",
      login: "me",
      pw: "123",
      remarks: ""
   })
   )
}


/**
 * Fire an event reporting a DenoKv record mutation
 */
const fireMutationEvent = (key: any[], type: string) => {
   const bc = new BroadcastChannel("sse-rpc")
   bc.postMessage({ txID: -1, procedure: "MUTATION", params: { key, type } })
   bc.close();
}