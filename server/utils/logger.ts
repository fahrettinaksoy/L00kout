/**
 * Structured server logger. Wraps consola with a JSON-friendly schema so
 * production logs can be ingested by anything that reads NDJSON.
 *
 * In dev: human-readable, colourised.
 * In prod: NDJSON to stdout, suitable for Sentry/Datadog/Loki shippers.
 */

import { consola, createConsola, LogLevels } from 'consola'

const isProd = process.env.NODE_ENV === 'production'

export const logger = isProd
  ? createConsola({
      level: LogLevels.info,
      formatOptions: { colors: false, date: true, compact: true },
      reporters: [
        {
          log(entry) {
            const payload = {
              ts: new Date().toISOString(),
              level: entry.level,
              type: entry.type,
              tag: entry.tag,
              message: typeof entry.args[0] === 'string' ? entry.args[0] : undefined,
              data:
                typeof entry.args[0] === 'object'
                  ? entry.args[0]
                  : entry.args.length > 1
                    ? entry.args.slice(1)
                    : undefined,
            }
            process.stdout.write(JSON.stringify(payload) + '\n')
          },
        },
      ],
    })
  : consola.withTag('l00kout')

export type Logger = typeof logger
