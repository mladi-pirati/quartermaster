import QRCode from 'qrcode'
import { format } from 'date-fns'

// Strip diacritics and replace non-ASCII with '?'
// Without ECI header support in the qrcode library, ASCII-only content is the
// safe choice: banking apps default to UTF-8 and would misread ISO-8859-2 bytes.
const TRANSLITERATE: Record<string, string> = {
  'č': 'c', 'Č': 'C', // č Č
  'š': 's', 'Š': 'S', // š Š
  'ž': 'z', 'Ž': 'Z', // ž Ž
  'ć': 'c', 'Ć': 'C', // ć Ć
  'đ': 'd', 'Đ': 'D', // đ Đ
  'ä': 'a', 'Ä': 'A', // ä Ä
  'ö': 'o', 'Ö': 'O', // ö Ö
  'ü': 'u', 'Ü': 'U', // ü Ü
  'é': 'e', 'É': 'E', // é É
  'è': 'e', 'È': 'E', // è È
  'à': 'a', 'À': 'A', // à À
}

function toAscii(text: string): string {
  return text
    .split('')
    .map((ch) => TRANSLITERATE[ch] ?? (ch.charCodeAt(0) > 127 ? '?' : ch))
    .join('')
}

// Receiver constants (ASCII)
const RECEIVER_NAME = 'POLITICNO DRUSTVO MLADI PIRATI'
const RECEIVER_STREET = 'Petkova ulica 7'
const RECEIVER_CITY = '1231 Ljubljana - Crnuce'
const RECEIVER_IBAN = 'SI56040010046962927'
const PURPOSE_CODE = 'GDDS'

export interface UpnQrInput {
  payerName: string
  payerStreet: string
  payerCity: string
  amountEurocents: number
  invoiceNumber: string
  dueDate: Date
}

export async function generateUpnQrDataUrl(input: UpnQrInput): Promise<string> {
  const { payerName, payerStreet, payerCity, amountEurocents, invoiceNumber, dueDate } = input

  const amountStr = amountEurocents.toString().padStart(11, '0')
  const dueDateStr = format(dueDate, 'dd.MM.yyyy')
  const reference = `SI00${invoiceNumber.replace(/\D/g, '')}`
  const purpose = `Predracun ${invoiceNumber}`

  // Fields 1–19 (each followed by \n in the final string)
  const fields = [
    'UPNQR',                       // 1  vodilni slog
    '',                            // 2  IBAN plačnika
    '',                            // 3  Polog
    '',                            // 4  Dvig
    '',                            // 5  Referenca plačnika
    toAscii(payerName),            // 6  Ime plačnika
    toAscii(payerStreet),          // 7  Ulica plačnika
    toAscii(payerCity),            // 8  Kraj plačnika
    amountStr,                     // 9  Znesek
    '',                            // 10 Datum plačila
    '',                            // 11 Nujno
    PURPOSE_CODE,                  // 12 Koda namena
    purpose,                       // 13 Namen plačila
    dueDateStr,                    // 14 Rok plačila
    RECEIVER_IBAN,                 // 15 IBAN prejemnika
    reference,                     // 16 Referenca prejemnika
    RECEIVER_NAME,                 // 17 Ime prejemnika
    RECEIVER_STREET,               // 18 Ulica prejemnika
    RECEIVER_CITY,                 // 19 Kraj prejemnika
  ]

  // Field 20: checksum = sum of all field lengths + 19 separators
  const checksum = fields.reduce((sum, f) => sum + f.length, 0) + 19
  const checksumStr = String(checksum).padStart(3, '0')

  // Build content through field 20
  const through20 = fields.map((f) => f + '\n').join('') + checksumStr + '\n'

  // Rezerva: spaces to pad to version-15 capacity (411 chars), no trailing LF
  const rezervaLength = Math.max(0, 411 - through20.length)
  const qrContent = through20 + ' '.repeat(rezervaLength)

  const dataUrl = await QRCode.toDataURL(qrContent, {
    errorCorrectionLevel: 'M',
    version: 15,
    type: 'image/png',
    margin: 4,
    scale: 4,
  })

  return dataUrl
}
