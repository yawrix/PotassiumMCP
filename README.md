# 🧪 PotassiumMCP

**Talk to your AI. It hacks the game.**

PotassiumMCP securely connects any MCP-compatible AI directly to a live Roblox game using a **High-Performance WebSocket Architecture**. 21 built-in tools give your AI the ability to scan, decompile, fuzz, and exploit — all from a chat window. No programming required.

You bring the game. The AI does the rest.

---

## 🚀 The Multi-Client WebSocket Update (v1.2.0)

PotassiumMCP has been completely rewritten to run on a parallelized WebSocket engine (`ws://127.0.0.1:38741`), totally untethered from legacy FileSystem IPC methods.

- **Zero configuration:** No more `EXECUTOR_WORKSPACE` variables needed!
- **Insane parallelization:** Unleash up to 500+ asynchronous attack threads dynamically hitting the game server without hanging your executor.
- **Unrestricted Access:** Completely gutted local limits (`safety.js` removed) — the AI has 100% unrestricted access to raw remote fuzzing.
- **Multi-Client support:** Control limitless alts simultaneously, deploy coordinate arrays, or mass-broadcast scripts directly from the agent.

---

## What can it do?

- **Decompile any script** in the game and read its source code
- **Scan every remote** the game uses and test them with malicious inputs
- **Fuzz purchase remotes** with economy-breaking payloads (price = -1, quantity = MAX_INT, etc.)
- **Simulate clicking buttons** so the game thinks you opened a shop before you fire the remote
- **Detect anti-cheat systems** before you start testing
- **Monitor all network traffic** in real-time
- **Run arbitrary Lua** for anything the built-in tools don't cover

The toolkit works with any game. Your AI figures out the game's specific logic, finds the vulnerabilities, and tests them — all through conversation.

---

## Prerequisites

1. **A sUNC-compatible Roblox executor** with `WebSocket.connect` support
2. **[Node.js](https://nodejs.org)** v18 or newer
3. **An MCP-compatible AI client** — VS Code, Cursor, Claude Desktop, Claude Code, Antigravity, or any MCP client

---

## Quick start

```bash
git clone https://github.com/yawrix/PotassiumMCP.git
cd PotassiumMCP
node setup.js
```

The setup script will:
- Install npm dependencies automatically
- Generate `.vscode/mcp.json` and `.cursor/mcp.json` with the correct paths
- Print ready-to-paste configs for Claude Desktop and other clients

**That's it.** The WebSocket transport natively handles all environment routing for you.

---

## Connect your client

PotassiumMCP uses **stdio transport** — your AI client starts the MCP server process automatically. 

> **Note:** Replace `YOUR_USERNAME` with your actual system username and adjust the path to wherever you cloned PotassiumMCP.

### JSON configuration

**Windows:**
```json
{
  "mcpServers": {
    "PotassiumMCP": {
      "command": "node",
      "args": ["C:\\Users\\YOUR_USERNAME\\Desktop\\PotassiumMCP\\bridge\\src\\mcp-server.js"]
    }
  }
}
```

**macOS / Linux:**
```json
{
  "mcpServers": {
    "PotassiumMCP": {
      "command": "node",
      "args": ["/Users/YOUR_USERNAME/Desktop/PotassiumMCP/bridge/src/mcp-server.js"]
    }
  }
}
```

---

## All 21 tools

### Recon — figure out what the game has
| Tool | What it does |
|---|---|
| `scan_remotes` | Lists every RemoteEvent and RemoteFunction the game exposes |
| `search_scripts` | Finds scripts by name or by searching their decompiled source |
| `find_instances` | Deep search across all services, including hidden/nil-parented objects |
| `inspect_instance` | Reads properties and children of any instance in the game |
| `get_game_info` | Game ID, place version, player count, executor info |
| `get_connections` | Shows what scripts are connected to a remote |

### Analysis — understand the code
| Tool | What it does |
|---|---|
| `decompile_script` | Gets the full source code of any script |
| `get_upvalues` | Reads hidden variables and constants inside a script's closure |
| `get_environment` | Reads a running script's globals and imports |
| `detect_anticheat` | Scans for executor detection, hooks, and integrity checks |

### Monitoring — watch what happens
| Tool | What it does |
|---|---|
| `spy_remotes` | Captures every FireServer/InvokeServer call in real-time |
| `http_spy` | Logs all HTTP requests the game makes |
| `monitor_changes` | Watches a specific property and reports when it changes |

### Testing — break things
| Tool | What it does |
|---|---|
| `call_remote` | Fires any remote with whatever arguments you want |
| `fuzz_remote` | Blasts a remote with 13 malicious payloads and checks if your stats changed |
| `execute_probe` | Quick echo test and rate limit check on a remote |
| `snapshot_state` | Captures your full player state (coins, items, everything) |
| `snapshot_diff` | Takes a before/after snapshot to see what changed |

### Exploit — make it happen
| Tool | What it does |
|---|---|
| `fire_signal` | Simulates clicking UI buttons (open shops, accept dialogs) |
| `execute_lua` | Runs any Lua code you want inside the game |
| `read_log` | Reads the agent's debug log |
| `list_clients` | Discover all active alt accounts listening on the websocket node |
| `broadcast_lua` | Target multi-client environments to broadcast identical remote calls in unison |

---

## Compatibility

PotassiumMCP works with any executor that supports sUNC (Semi-Unified Naming Convention). If your executor has the required globals below, it should work.

**Required globals:** `WebSocket.connect`, `hookmetamethod`, `firesignal`, `getgenv`, `decompile`, `getsenv`, `getscriptclosure`

---

## Architecture Blueprint

```
┌─────────────────┐      MCP        ┌──────────────────┐    WebSocket    ┌──────────────────┐
│   AI Assistant   │ ◄────────────► │   MCP Server     │ ◄────────────► │  In-Game Agent   │
│  (your editor)   │    (stdio)      │  (Node.js)       │  (ws://38741)  │  (dispatcher.lua)│
└─────────────────┘                 └──────────────────┘                └──────────────────┘
```

1. You ask your AI to do something ("scan all remotes in this game")
2. Your AI calls a PotassiumMCP tool via MCP
3. The MCP server delegates the JSON task through a persistent WebSocket loop (`ws://127.0.0.1:38741`)
4. The dispatcher (running inside Roblox) rapidly absorbs the packet, invokes the engine threads, and immediately snaps back a result payload.
5. The MCP server reads the result and translates it contextually back to your LLM.

---

## License

MIT — do whatever you want with it.
