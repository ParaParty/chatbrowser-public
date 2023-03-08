import {
  formatRelative as formatRelativeFn,
} from 'date-fns'
import { zhCN } from 'date-fns/locale'

export function formatRelative(date: Date) {
  return formatRelativeFn(date, new Date(), { locale: zhCN })
}
