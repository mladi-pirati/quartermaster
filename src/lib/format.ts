export function formatPrice(eurocents: number): string {
  return new Intl.NumberFormat('sl-SI', {
    style: 'currency',
    currency: 'EUR',
  }).format(eurocents / 100)
}

export function parsePriceInput(value: string): number {
  const parsed = parseFloat(value.replace(',', '.'))
  if (isNaN(parsed) || parsed < 0) return 0
  return Math.round(parsed * 100)
}
