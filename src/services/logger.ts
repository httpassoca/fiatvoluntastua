export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
}

function nowIso() {
  return new Date().toISOString()
}

function normalizeLevel(x: any): LogLevel {
  const s = String(x || '').toLowerCase()
  if (s === 'debug' || s === 'info' || s === 'warn' || s === 'error') return s
  return 'info'
}

export function createLogger(opts: { name?: string; level?: LogLevel } = {}) {
  const name = opts.name || 'app'
  const level = opts.level ?? normalizeLevel(process.env.LOG_LEVEL)

  function enabled(l: LogLevel) {
    return LEVEL_ORDER[l] >= LEVEL_ORDER[level]
  }

  function fmt(l: LogLevel, msg: string, meta?: unknown) {
    const base = `[${nowIso()}] [${l.toUpperCase()}] [${name}] ${msg}`
    if (meta === undefined) return base
    try {
      return base + ' ' + JSON.stringify(meta)
    } catch {
      return base + ' ' + String(meta)
    }
  }

  return {
    debug(msg: string, meta?: unknown) {
      if (!enabled('debug')) return
      console.debug(fmt('debug', msg, meta))
    },
    info(msg: string, meta?: unknown) {
      if (!enabled('info')) return
      console.info(fmt('info', msg, meta))
    },
    warn(msg: string, meta?: unknown) {
      if (!enabled('warn')) return
      console.warn(fmt('warn', msg, meta))
    },
    error(msg: string, meta?: unknown) {
      if (!enabled('error')) return
      console.error(fmt('error', msg, meta))
    },
  }
}

export type Logger = ReturnType<typeof createLogger>

export const log = createLogger({ name: 'fiatvoluntastua' })
