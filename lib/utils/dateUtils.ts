import { format, startOfDay, subDays, isToday, parseISO } from 'date-fns'
import { nl } from 'date-fns/locale'

export function formatDate(date: Date, formatStr: string = 'yyyy-MM-dd'): string {
  return format(date, formatStr)
}

export function formatDateDisplay(date: Date): string {
  if (isToday(date)) return 'Vandaag'
  return format(date, 'EEEE d MMMM', { locale: nl })
}

export function toDateString(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

export function getDayOfWeek(date: Date): number {
  return date.getDay() // 0=Sun, 1=Mon, ..., 6=Sat
}

export function getWeekNumber(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 1)
  const diff = date.getTime() - start.getTime()
  const oneWeek = 1000 * 60 * 60 * 24 * 7
  return Math.ceil(diff / oneWeek)
}

export function getWeeksFromDate(startDate: Date, currentDate: Date): number {
  const diffTime = currentDate.getTime() - startDate.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  return Math.floor(diffDays / 7) + 1 // 1-indexed week number
}

export function getLast7Days(): Date[] {
  const today = startOfDay(new Date())
  return Array.from({ length: 7 }, (_, i) => subDays(today, 6 - i))
}

export function getLast30Days(): Date[] {
  const today = startOfDay(new Date())
  return Array.from({ length: 30 }, (_, i) => subDays(today, 29 - i))
}

export function parseDate(dateStr: string): Date {
  return parseISO(dateStr)
}
