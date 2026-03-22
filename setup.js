#!/usr/bin/env node

/**
 * PotassiumMCP Setup Script
 * 
 * Run: node setup.js
 * 
 * Automatically:
 * 1. Installs npm dependencies
 * 2. Finds your executor's workspace directory
 * 3. Generates the correct MCP config for your editor
 * 4. Tells you exactly what to do next
 */

import { existsSync, writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { execSync } from 'node:child_process';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = __dirname;

const rl = createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise(r => rl.question(q, r));

function log(msg) { console.log(`  ${msg}`); }
function success(msg) { console.log(`  ✔ ${msg}`); }
function fail(msg) { console.log(`  ✖ ${msg}`); }
function header(msg) { console.log(`\n  ${msg}\n  ${'─'.repeat(msg.length)}`); }

async function main() {
  console.log('');
  console.log('  ╔══════════════════════════════════════╗');
  console.log('  ║     ⚗️  PotassiumMCP Setup           ║');
  console.log('  ╚══════════════════════════════════════╝');
  console.log('');

  // Step 1: Install dependencies
  header('Step 1: Dependencies');
  const bridgeDir = join(PROJECT_ROOT, 'bridge');
  const modulesExist = existsSync(join(bridgeDir, 'node_modules'));

  if (modulesExist) {
    success('Dependencies already installed');
  } else {
    log('Installing npm packages...');
    try {
      execSync('npm install', { cwd: bridgeDir, stdio: 'pipe' });
      success('Dependencies installed');
    } catch (e) {
      fail('npm install failed. Run it manually: cd bridge && npm install');
      process.exit(1);
    }
  }

  // Step 2: Find workspace
  header('Step 2: Executor workspace');
  const home = process.env.USERPROFILE || process.env.HOME || '';
  const candidates = [
    join(home, 'Documents', 'Potassium', 'workspace'),
    join(home, 'AppData', 'Local', 'Potassium', 'workspace'),
    join(home, 'Desktop', 'Potassium', 'workspace'),
    join(home, '.potassium', 'workspace'),
  ];

  let workspace = null;
  for (const dir of candidates) {
    if (existsSync(dir)) {
      workspace = dir;
      success(`Found workspace: ${dir}`);
      break;
    }
  }

  if (!workspace) {
    log('Could not auto-detect your workspace.');
    log('');
    log('Open your executor (Potassium, etc.) and check Settings');
    log('for the workspace/files directory path.');
    log('');
    workspace = await ask('  Paste your workspace path: ');
    workspace = workspace.trim().replace(/"/g, '');

    if (!workspace || !existsSync(workspace)) {
      fail(`Path does not exist: ${workspace}`);
      log('You can set it later in your MCP config as POTASSIUM_WORKSPACE');
      workspace = workspace || join(home, 'Documents', 'Potassium', 'workspace');
    } else {
      success(`Using: ${workspace}`);
    }
  }

  // Step 3: Detect editor
  header('Step 3: Editor config');
  const serverPath = resolve(join(PROJECT_ROOT, 'bridge', 'src', 'mcp-server.js'));
  const escapedWorkspace = workspace.replace(/\\/g, '\\\\');
  const escapedServer = serverPath.replace(/\\/g, '\\\\');

  // Generate VS Code config
  const vscodeDir = join(PROJECT_ROOT, '.vscode');
  if (!existsSync(vscodeDir)) mkdirSync(vscodeDir, { recursive: true });

  const vscodeMcp = {
    servers: {
      PotassiumMCP: {
        type: 'stdio',
        command: 'node',
        args: [serverPath],
        env: {
          POTASSIUM_WORKSPACE: workspace
        }
      }
    }
  };

  writeFileSync(
    join(vscodeDir, 'mcp.json'),
    JSON.stringify(vscodeMcp, null, 2)
  );
  success('Created .vscode/mcp.json');

  // Show config for other editors
  header('Step 4: You\'re ready!');
  console.log('');
  log('VS Code / Copilot:');
  log('  Already configured! Just open this folder in VS Code.');
  log('  The MCP server will start automatically when you chat.');
  console.log('');
  log('Cursor:');
  log('  Go to Settings → MCP Servers → Add, paste this:');
  console.log('');
  console.log(`  {`);
  console.log(`    "PotassiumMCP": {`);
  console.log(`      "command": "node",`);
  console.log(`      "args": ["${escapedServer}"],`);
  console.log(`      "env": {`);
  console.log(`        "POTASSIUM_WORKSPACE": "${escapedWorkspace}"`);
  console.log(`      }`);
  console.log(`    }`);
  console.log(`  }`);
  console.log('');
  log('Claude Desktop:');
  log('  Add to your claude_desktop_config.json:');
  console.log('');
  console.log(`  "PotassiumMCP": {`);
  console.log(`    "command": "node",`);
  console.log(`    "args": ["${escapedServer}"],`);
  console.log(`    "env": {`);
  console.log(`      "POTASSIUM_WORKSPACE": "${escapedWorkspace}"`);
  console.log(`    }`);
  console.log(`  }`);
  console.log('');

  header('Next steps');
  log('1. Open Roblox and join a game');
  log('2. Paste agent/dispatcher.lua into your executor and run it');
  log('3. Open your AI and start chatting — it has access to the game');
  console.log('');

  rl.close();
}

main().catch(e => {
  console.error('Setup failed:', e.message);
  process.exit(1);
});
