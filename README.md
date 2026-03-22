# 🧪 PotassiumMCP

**Talk to your AI. It hacks the game.**

PotassiumMCP connects any MCP-compatible AI (VS Code Copilot, Cursor, Claude Desktop) directly to a live Roblox game. 21 built-in tools give your AI the ability to scan, decompile, fuzz, and exploit — all from a chat window. No scripting required.

You bring the game. The AI does the rest.

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

## Getting started

### What you need

1. **[Potassium](https://voxlis.net/)** or any sUNC-compatible Roblox executor
2. **[Node.js](https://nodejs.org)** v18 or newer
3. **An MCP-compatible AI client** — VS Code with GitHub Copilot, Cursor, or similar

### Step 1: Download and setup

```bash
git clone https://github.com/yawrix/PotassiumMCP.git
cd PotassiumMCP
node setup.js
```

The setup script will:
- Install dependencies automatically
- Find your executor's workspace directory
- Generate the correct MCP config for your editor (VS Code, Cursor, or Claude Desktop)
- Tell you exactly what to do next

**That's the entire install.** One command.

### Step 2: Open in your editor

The repo ships with pre-configured MCP configs:

| Editor | Config file | What to do |
|---|---|---|
| **VS Code** (Copilot) | `.vscode/mcp.json` | Just open the folder — it works |
| **Cursor** | `.cursor/mcp.json` | Just open the folder — it works |
| **Claude Desktop** | — | `setup.js` prints the config to paste |
| **Codex / Other** | — | `setup.js` prints the config to paste |

If you ran `node setup.js`, it already configured everything for your editor.

### Step 3: Run it

1. Open Roblox and join any game
2. Paste `agent/dispatcher.lua` into your executor and run it
3. Open your AI and start chatting. It has full access to the game.

No background processes, no terminal windows. Your AI client launches the MCP server automatically.

<details>
<summary>Manual config (if setup.js doesn't work)</summary>

**VS Code** → create `.vscode/mcp.json`:
```json
{
  "servers": {
    "PotassiumMCP": {
      "type": "stdio",
      "command": "node",
      "args": ["bridge/src/mcp-server.js"],
      "env": {
        "POTASSIUM_WORKSPACE": "C:\\Users\\YOUR_NAME\\Documents\\Potassium\\workspace"
      }
    }
  }
}
```

**Cursor** → Settings → MCP Servers → Add:
```json
{
  "PotassiumMCP": {
    "command": "node",
    "args": ["C:/full/path/to/PotassiumMCP/bridge/src/mcp-server.js"],
    "env": {
      "POTASSIUM_WORKSPACE": "C:\\Users\\YOUR_NAME\\Documents\\Potassium\\workspace"
    }
  }
}
```

> **Finding your workspace path:** Open your executor, go to Settings, and look for the workspace/files directory. That's what goes in `POTASSIUM_WORKSPACE`.

</details>

---

## How it works

```
┌─────────────────┐      MCP        ┌──────────────────┐    File IPC     ┌──────────────────┐
│   AI Assistant   │ ◄────────────► │   MCP Server     │ ◄────────────► │  In-Game Agent   │
│  (your editor)   │    (stdio)      │  (Node.js)       │  (temp files)  │  (dispatcher.lua)│
└─────────────────┘                 └──────────────────┘                └──────────────────┘
```

1. You ask your AI to do something ("scan all remotes in this game")
2. Your AI calls a PotassiumMCP tool via MCP
3. The MCP server writes a small JSON request to a temp file
4. The dispatcher (running inside Roblox) picks it up, runs the tool, writes the result
5. The MCP server reads the result and sends it back to your AI
6. Your AI interprets the result and decides what to do next

**All temp files are automatically deleted after processing.** Nothing accumulates on disk.

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

---

## Compatibility

PotassiumMCP works with any executor that supports sUNC (Semi-Unified Naming Convention):

| Executor | Status |
|---|---|
| Potassium | ✅ Fully supported |
| Any sUNC executor | ✅ Should work |

**Required globals:** `writefile`, `readfile`, `listfiles`, `delfile`, `hookmetamethod`, `firesignal`, `getgenv`, `decompile`, `getsenv`, `getscriptclosure`

---

## Project structure

```
PotassiumMCP/
├── agent/
│   └── dispatcher.lua       # Runs inside Roblox — all 21 tools
├── bridge/
│   ├── package.json
│   └── src/
│       ├── mcp-server.js    # MCP server — your AI talks to this
│       ├── transport.js     # Handles temp file communication
│       ├── protocol.js      # Message format definitions
│       ├── logger.js        # Audit logging
│       └── safety.js        # Rate limiting and safety checks
├── config/
│   └── default.json         # Default settings
├── .gitignore
├── LICENSE
└── README.md
```

---

## Adding your own tools

Every tool has two parts: the Lua implementation and the MCP definition.

1. Write your tool function in `agent/dispatcher.lua`
2. Add the MCP schema in `bridge/src/mcp-server.js`
3. Add the tool name to the array in `bridge/src/protocol.js`

---

## License

MIT — do whatever you want with it.
