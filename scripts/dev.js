import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const serverDir = path.resolve(rootDir, 'server');

console.log('\x1b[36m%s\x1b[0m', '🚀 Starting EcoPulseAI Full-Stack Architecture...');
console.log('\x1b[90m%s\x1b[0m', '   Frontend: React + Vite (http://localhost:5173)');
console.log('\x1b[90m%s\x1b[0m', '   Backend:  Node.js + AI Heat Engine (http://localhost:5001)');
console.log('');

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

// 1. Start Node.js Server
const serverProcess = spawn(npmCmd, ['run', 'dev'], {
  cwd: serverDir,
  shell: true,
  stdio: 'pipe',
});

serverProcess.stdout?.on('data', (data) => {
  process.stdout.write(`\x1b[34m[SERVER]\x1b[0m ${data.toString()}`);
});

serverProcess.stderr?.on('data', (data) => {
  process.stderr.write(`\x1b[31m[SERVER ERROR]\x1b[0m ${data.toString()}`);
});

// 2. Start Vite Client
const clientProcess = spawn(npmCmd, ['run', 'dev:client'], {
  cwd: rootDir,
  shell: true,
  stdio: 'pipe',
});

clientProcess.stdout?.on('data', (data) => {
  process.stdout.write(`\x1b[35m[CLIENT]\x1b[0m ${data.toString()}`);
});

clientProcess.stderr?.on('data', (data) => {
  process.stderr.write(`\x1b[33m[CLIENT WARN]\x1b[0m ${data.toString()}`);
});

function cleanup() {
  console.log('\n\x1b[36m%s\x1b[0m', '🛑 Shutting down EcoPulseAI services...');
  serverProcess.kill('SIGTERM');
  clientProcess.kill('SIGTERM');
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);
