import { spawn } from 'node:child_process'
import fs from 'node:fs'
import net from 'node:net'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const API_PORT = 3001
const MERN_PORT = 5001
const SQL_PORT = Number(process.env.SQL_PORT ?? 5000)

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
  // Lab 8: the Express + SQLite server (npm run sql). The client calls /sql-api/api/..., which becomes /api/...
  '/sql-api': {
    target: `http://localhost:${SQL_PORT}`,
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/sql-api/, ''),
  },
}

function portInUse(port) {
  return new Promise((resolve) => {
    const socket = net.connect(port, 'localhost')
    socket.once('connect', () => { socket.end(); resolve(true) })
    socket.once('error', () => resolve(false))
  })
}

// Starts a helper server together with `npm run dev` / `npm run preview`, unless its port is
// already taken (e.g. you started it yourself) or its files are not there.
function devServer({ name, port, args, requires }) {
  let child
  async function start(server) {
    if (requires && !fs.existsSync(requires)) {
      console.warn(`[${name}] not started: ${requires} is missing (run npm run sql:install first)`)
      return
    }
    if (await portInUse(port)) return
    child = spawn(process.execPath, args, { stdio: 'inherit' })
    const stop = () => child?.kill()
    server.httpServer?.once('close', stop)
    process.once('exit', stop)
  }
  return {
    name,
    configureServer: start,
    configurePreviewServer: start,
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Labs 5 & 6: JSON Server on db.json
    devServer({
      name: 'uniai-json-server',
      port: API_PORT,
      args: ['node_modules/json-server/lib/bin.js', 'db.json', '--port', String(API_PORT)],
    }),
    // Lab 8: Express + SQLite
    devServer({
      name: 'uniai-sql-server',
      port: SQL_PORT,
      args: ['lab-8/server/server.js'],
      requires: 'lab-8/server/node_modules',
    }),
  ],
  server: { proxy: apiProxy },
  preview: { proxy: apiProxy },
})
