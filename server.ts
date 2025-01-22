
import { registerClient } from "./sseRegistration.ts";
import { initDB } from './remoteProcedures.ts'

export const DEV = !!Deno.env.get("DEV")

const bc = new BroadcastChannel("sse-rpc");

// hot start db
await initDB()

// main server
Deno.serve({ port: 9099 }, async (request: Request): Promise<Response> => {
      // Is this a Registration request?
      if (request.url.includes("SSERPC/kvRegistration")) {
         // register our new RPC-client
         return registerClient()

      } // POST request = KvRPC (Remote Procedure Calls)    
      else if (request.method === 'POST') {
         // extract the request payload
         const data = await request.json();
         // inform all interested parties about this new RPC request
         bc.postMessage(data);
         // acknowledge the request 
         return new Response('', {
            status: 200, headers: {
               "Access-Control-Allow-Origin": "*",
               "Cache-Control": "no-cache",
               "Access-Control-Allow-Methods": "GET OPTIONS POST DELETE",
            }
         })
      } // an unknown request was recieved
      else {
         // acknowledge the request
         return new Response(`<h1>Unknown request!</h1> 
<h3>Was neither an SSE registration request, nor a recognized RPC request!</h3>
<h3>Please see <a href="https://github.com/nhrones/KvRPC_TreeClient">KvRPC_TreeClient for usage.</a></h3>`, 
        { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" }});
      }
   }
)
