import { spawn } from 'node:child_process'
import net from 'node:net'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const API_PORT = 3001
const MERN_PORT = 5001

// Labs 5 & 6: the React app calls /api/*, which is forwarded to JSON Server
// on port 3001. Same-origin requests also work from a phone on the LAN when
// running `npm run dev -- --host`.
const apiProxy = {
  '/api': {
    target: `http://localhost:${API_PORT}`,
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, ''),
  },
  // Lab 7: the same React app, backed by the Express + MongoDB server (npm run mern).
  '/mern-api': {
    target: `http://localhost:${MERN_PORT}`,
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/mern-api/, ''),
  },
}

function portInUse(port) {
  return new Promise((resolve) => {
    const socket = net.connect(port, 'localhost')
    socket.once('connect', () => { socket.end(); resolve(true) })
    socket.once('error', () => resolve(false))
  })
}

// Starts JSON Server (db.json) together with `npm run dev` / `npm run preview`,
// unless it is already running (e.g. via `npm run server`).
function jsonServer() {
  let child
  async function start(server) {
    if (await portInUse(API_PORT)) return
    child = spawn(
      process.execPath,
      ['node_modules/json-server/lib/bin.js', 'db.json', '--port', String(API_PORT)],
      { stdio: 'inherit' },
    )
    const stop = () => child?.kill()
    server.httpServer?.once('close', stop)
    process.once('exit', stop)
  }
  return {
    name: 'uniai-json-server',
    configureServer: start,
    configurePreviewServer: start,
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), jsonServer()],
  server: { proxy: apiProxy },
  preview: { proxy: apiProxy },
})
