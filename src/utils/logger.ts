export function logInfo(event: string, meta: Record<string, unknown> = {}) {
  console.log(JSON.stringify({ level: 'info', event, timestamp: new Date().toISOString(), ...meta }));
}

export function logError(event: string, meta: Record<string, unknown> = {}) {
  console.error(JSON.stringify({ level: 'error', event, timestamp: new Date().toISOString(), ...meta }));
}
