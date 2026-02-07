import pc from 'picocolors'
import type { UsageData } from './usage.js'

function colorize(pct: number, text: string): string {
  if (pct >= 80) {
    return pc.red(text)
  }
  if (pct >= 50) {
    return pc.yellow(text)
  }
  return pc.green(text)
}

export function renderProgressBar(pct: number, width = 20): string {
  const clamped = Math.max(0, Math.min(100, pct))
  const filled = Math.round((clamped / 100) * width)
  const empty = width - filled
  const bar = `[${'█'.repeat(filled)}${'░'.repeat(empty)}]`
  const label = `${clamped.toFixed(1)}%`
  return colorize(clamped, `${bar} ${label}`)
}

export function renderCredits(used: number, limit: number): string {
  const formatted = `${used.toLocaleString()} / ${limit.toLocaleString()} credits`
  const pct = limit > 0 ? (used / limit) * 100 : 0
  return colorize(pct, formatted)
}

export function renderInlineUsage(data: UsageData): string {
  const bar5h = renderProgressBar(data.five_hour.utilization, 10)
  const bar7d = renderProgressBar(data.seven_day.utilization, 10)
  return `5h ${bar5h}  7d ${bar7d}`
}

export function renderFullUsage(data: UsageData): string {
  const fiveH = data.five_hour.utilization
  const sevenD = data.seven_day.utilization
  const sevenDSonnet = data.seven_day_sonnet.utilization
  const lines = [
    `  5-hour:         ${renderProgressBar(fiveH)}`,
    `  7-day:          ${renderProgressBar(sevenD)}`,
    `  7-day (sonnet): ${renderProgressBar(sevenDSonnet)}`
  ]
  if (data.extra_usage.is_enabled && data.extra_usage.monthly_limit != null && data.extra_usage.used_credits != null) {
    lines.push(`  Extra credits:  ${renderCredits(data.extra_usage.used_credits, data.extra_usage.monthly_limit)}`)
  }
  return lines.join('\n')
}
