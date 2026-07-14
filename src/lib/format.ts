export function formatPrice(eurocents: number): string {
  return new Intl.NumberFormat('sl-SI', {
    style: 'currency',
    currency: 'EUR',
  }).format(eurocents / 100)
}

export function formatPaymentReference(invoiceNumber: string): string {
  return `SI00 ${invoiceNumber.replace(/\D/g, '')}`
}

export function parsePriceInput(value: string): number {
  const parsed = parseFloat(value.replace(',', '.'))
  if (isNaN(parsed) || parsed < 0) return 0
  return Math.round(parsed * 100)
}
