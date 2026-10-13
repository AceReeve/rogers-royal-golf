'use client'

import {
  COUNTRY_DIAL_CODES,
  DEFAULT_COUNTRY_CODE,
  getCountryByCode,
  sanitizeLocalPhoneInput,
} from '@/lib/phone'
import { Input } from '@/components/ui/input'

type PhoneCountryInputProps = {
  countryCode: string
  localNumber: string
  onCountryChange: (code: string) => void
  onLocalChange: (local: string) => void
  disabled?: boolean
  required?: boolean
}

export function PhoneCountryInput({
  countryCode,
  localNumber,
  onCountryChange,
  onLocalChange,
  disabled,
  required,
}: PhoneCountryInputProps) {
  const country = getCountryByCode(countryCode)

  return (
    <div className="space-y-1">
      <div className="flex gap-2">
        <select
          aria-label="Country code"
          value={countryCode}
          disabled={disabled}
          onChange={(e) => onCountryChange(e.target.value)}
          className="h-9 w-[9.5rem] shrink-0 rounded-md border border-primary/20 bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {COUNTRY_DIAL_CODES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.flag} {c.dial} {c.code}
            </option>
          ))}
        </select>
        <Input
          type="tel"
          required={required}
          inputMode="numeric"
          maxLength={15}
          placeholder={country.code === 'PH' ? '912 345 6789' : 'Mobile number'}
          value={localNumber}
          onChange={(e) => onLocalChange(sanitizeLocalPhoneInput(e.target.value))}
          className="border-primary/20 flex-1"
          disabled={disabled}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        {country.flag} {country.name} ({country.dial}) — enter number without country code
      </p>
    </div>
  )
}

export { DEFAULT_COUNTRY_CODE }
