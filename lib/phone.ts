/**
 * Phone helpers for checkout — country code dropdown + local number.
 * E.164 allows up to 15 digits (country code + subscriber number).
 */

const MIN_DIGITS = 7
const MAX_DIGITS = 15

export type CountryDialCode = {
  code: string
  name: string
  dial: string
  flag: string
}

/** Common dial codes; Philippines first as default for this store. */
export const COUNTRY_DIAL_CODES: CountryDialCode[] = [
  { code: 'PH', name: 'Philippines', dial: '+63', flag: '🇵🇭' },
  { code: 'US', name: 'United States', dial: '+1', flag: '🇺🇸' },
  { code: 'CA', name: 'Canada', dial: '+1', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', dial: '+61', flag: '🇦🇺' },
  { code: 'GB', name: 'United Kingdom', dial: '+44', flag: '🇬🇧' },
  { code: 'SG', name: 'Singapore', dial: '+65', flag: '🇸🇬' },
  { code: 'MY', name: 'Malaysia', dial: '+60', flag: '🇲🇾' },
  { code: 'ID', name: 'Indonesia', dial: '+62', flag: '🇮🇩' },
  { code: 'TH', name: 'Thailand', dial: '+66', flag: '🇹🇭' },
  { code: 'VN', name: 'Vietnam', dial: '+84', flag: '🇻🇳' },
  { code: 'JP', name: 'Japan', dial: '+81', flag: '🇯🇵' },
  { code: 'KR', name: 'South Korea', dial: '+82', flag: '🇰🇷' },
  { code: 'CN', name: 'China', dial: '+86', flag: '🇨🇳' },
  { code: 'HK', name: 'Hong Kong', dial: '+852', flag: '🇭🇰' },
  { code: 'TW', name: 'Taiwan', dial: '+886', flag: '🇹🇼' },
  { code: 'IN', name: 'India', dial: '+91', flag: '🇮🇳' },
  { code: 'AE', name: 'United Arab Emirates', dial: '+971', flag: '🇦🇪' },
  { code: 'SA', name: 'Saudi Arabia', dial: '+966', flag: '🇸🇦' },
  { code: 'QA', name: 'Qatar', dial: '+974', flag: '🇶🇦' },
  { code: 'DE', name: 'Germany', dial: '+49', flag: '🇩🇪' },
  { code: 'FR', name: 'France', dial: '+33', flag: '🇫🇷' },
  { code: 'IT', name: 'Italy', dial: '+39', flag: '🇮🇹' },
  { code: 'ES', name: 'Spain', dial: '+34', flag: '🇪🇸' },
  { code: 'NL', name: 'Netherlands', dial: '+31', flag: '🇳🇱' },
  { code: 'NZ', name: 'New Zealand', dial: '+64', flag: '🇳🇿' },
  { code: 'BR', name: 'Brazil', dial: '+55', flag: '🇧🇷' },
  { code: 'MX', name: 'Mexico', dial: '+52', flag: '🇲🇽' },
]

export const DEFAULT_COUNTRY_CODE = 'PH'

export function getCountryByCode(code: string): CountryDialCode {
  return COUNTRY_DIAL_CODES.find((c) => c.code === code) ?? COUNTRY_DIAL_CODES[0]
}

export function digitsOnly(value?: string | null): string {
  return (value ?? '').replace(/\D/g, '')
}

/** Local number field: digits only (no country code). */
export function sanitizeLocalPhoneInput(value: string, maxLength = 15): string {
  return digitsOnly(value).slice(0, maxLength)
}

/** Keep a usable full phone value: digits, leading +, spaces, dashes, parentheses. */
export function sanitizePhoneInput(value: string, maxLength = 20): string {
  const cleaned = value.replace(/[^\d+\s\-().]/g, '')
  const withoutExtraPlus = cleaned.replace(/(?!^)\+/g, '')
  return withoutExtraPlus.slice(0, maxLength)
}

/**
 * Build E.164-style phone from dropdown country + local number.
 * Strips a leading 0 from local numbers (common trunk prefix, e.g. PH 09…).
 */
export function combinePhoneWithCountry(countryCode: string, localNumber: string): string {
  const country = getCountryByCode(countryCode)
  let local = digitsOnly(localNumber)
  if (local.startsWith('0')) {
    local = local.replace(/^0+/, '')
  }
  if (!local) return ''
  return `${country.dial}${local}`
}

export function isValidPhone(value?: string | null): boolean {
  const digits = digitsOnly(value)
  return digits.length >= MIN_DIGITS && digits.length <= MAX_DIGITS
}

export function isValidLocalPhone(localNumber: string, countryCode: string): boolean {
  return isValidPhone(combinePhoneWithCountry(countryCode, localNumber))
}

/**
 * Normalize for payment gateways (Maya buyer.contact.phone).
 */
export function normalizePhoneForGateway(value?: string | null): string {
  const raw = (value ?? '').trim()
  const digits = digitsOnly(raw)
  if (!digits || digits.length < MIN_DIGITS || digits.length > MAX_DIGITS) {
    return ''
  }

  if (/^09\d{9}$/.test(digits)) return `+63${digits.slice(1)}`
  if (/^9\d{9}$/.test(digits)) return `+63${digits}`
  if (/^639\d{9}$/.test(digits)) return `+${digits}`

  if (raw.startsWith('+')) return `+${digits}`
  if (digits.length >= 11) return `+${digits}`
  return `+${digits}`
}

export const PHONE_HINT =
  'Select your country code, then enter your mobile number (with or without a leading 0).'
