import { AppRuntime } from "./effect/app-runtime"
import { Effect } from "effect"
import { Flag } from "@opencode-ai/core/flag/flag"
import { Server } from "./server/server"

process.env.AGENT = "1"
process.env.OPENCODE = "1"
process.env.OPENCODE_PID = String(process.pid)

const port = process.env.PORT || process.env.OPENCODE_PORT
const hostname = process.env.HOSTNAME || process.env.OPENCODE_HOSTNAME || "127.0.0.1"
const mdns = process.env.MDNS === "true" || process.env.OPENCODE_MDNS === "true"
const mdnsDomain = process.env.MDNS_DOMAIN || process.env.OPENCODE_MDNS_DOMAIN || "opencode.local"
const cors = process.env.CORS ? process.env.CORS.split(",") : []
const openWeb = process.env.OPEN_WEB || "false"

const ServerRuntimeLaunch = Effect.fn("ServerRuntime.launch")(function* () {
  if (!Flag.OPENCODE_SERVER_PASSWORD) {
    console.log("Warning: OPENCODE_SERVER_PASSWORD is not set; server is unsecured.")
  }

  const opts = {
    port: port ? parseInt(port, 10) : 4096,
    hostname,
    mdns,
    mdnsDomain,
    cors,
  }

  const server = yield* Effect.promise(() => Server.listen(opts))
  console.log(`opencode server listening on http://${server.hostname}:${server.port}`)

  yield* Effect.never
})

try {
  await AppRuntime.runPromise(ServerRuntimeLaunch())
} catch (e) {
  console.error("Server runtime error:", e)
  process.exitCode = 1
} finally {
  process.exit()
}

