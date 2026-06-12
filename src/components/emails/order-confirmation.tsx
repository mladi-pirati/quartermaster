import { format } from 'date-fns'
import { formatPrice } from '@/lib/format'
import type { Order, OrderItem, ShippingOption } from '@/db/schema'

interface Props {
  order: Order
  lineItems: OrderItem[]
  shippingOption: ShippingOption | null
  invoiceNumber: string
  issueDate: Date
  dueDate: Date
}

const BG = '#000000'
const PANEL = '#111111'
const BORDER = '#222222'
const TEXT = '#ffffff'
const MUTED = 'rgba(255,255,255,0.65)'
const ACCENT = '#f0a000'
const BODY_FONT = '"Monda", Arial, sans-serif'
const MONO_FONT = '"JetBrains Mono", "Courier New", monospace'

export function OrderConfirmationEmail({
  order,
  lineItems,
  shippingOption,
  invoiceNumber,
  issueDate,
  dueDate,
}: Props) {
  const itemsTotal = lineItems.reduce(
    (sum, l) => sum + l.itemPriceSnapshot * l.quantity,
    0,
  )
  const shippingTotal = shippingOption?.price ?? 0
  const grandTotal = itemsTotal + shippingTotal

  const paymentRows: [string, string][] = [
    ['Predračun', invoiceNumber],
    ['Datum izdaje', format(issueDate, 'd. M. yyyy')],
    ['Rok plačila', format(dueDate, 'd. M. yyyy')],
    ['IBAN', 'SI56 0400 1004 6962 927'],
    ['Sklic', `SI00 ${invoiceNumber}`],
  ]

  return (
    <html lang="sl">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta name="color-scheme" content="dark" />
        <meta name="supported-color-schemes" content="dark" />
        <title>Potrditev naročila {invoiceNumber}</title>
        <style>{`
          :root { color-scheme: dark; }
          body { margin: 0; padding: 0; background-color: ${BG} !important; color: ${TEXT} !important; }
          * { box-sizing: border-box; }
          .dark-panel { background-color: #111111 !important; border-color: #222222 !important; }
          .dark-label { color: rgba(255,255,255,0.65) !important; }
          .dark-value { color: #ffffff !important; }
          @media (max-width: 600px) {
            .outer-cell { padding-left: 16px !important; padding-right: 16px !important; }
            .section { padding-left: 20px !important; padding-right: 20px !important; }
            .items-th, .items-td { padding: 10px 6px !important; font-size: 13px !important; }
            .total-amount { font-size: 20px !important; }
            .payment-box { padding: 16px !important; }
          }
        `}</style>
      </head>
      <body style={{ margin: 0, padding: 0, backgroundColor: BG, fontFamily: BODY_FONT }}>

        {/* Outer wrapper */}
        <table width="100%" cellPadding="0" cellSpacing="0" role="presentation"
          style={{ backgroundColor: BG, minWidth: '100%' }}>
          <tbody>
            <tr>
              <td className="outer-cell" align="center"
                style={{ padding: '0 24px' }}>

                {/* Content column */}
                <table width="100%" cellPadding="0" cellSpacing="0" role="presentation"
                  style={{ maxWidth: '600px', margin: '0 auto' }}>
                  <tbody>

                    {/* ── Header ── */}
                    <tr>
                      <td style={{ padding: '32px 0 24px', borderBottom: `1px solid ${BORDER}` }}>
                        <table cellPadding="0" cellSpacing="0" role="presentation">
                          <tbody>
                            <tr>
                              <td>
                                <span style={{
                                  fontFamily: MONO_FONT,
                                  color: ACCENT,
                                  fontSize: '16px',
                                  letterSpacing: '3px',
                                  textTransform: 'uppercase',
                                  fontWeight: 'bold',
                                }}>
                                  Mladi Pirati
                                </span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>

                    {/* ── Body ── */}
                    <tr>
                      <td className="section" style={{ padding: '36px 0' }}>

                        {/* Eyebrow */}
                        <p style={{
                          fontFamily: MONO_FONT,
                          fontSize: '11px',
                          letterSpacing: '2px',
                          textTransform: 'uppercase',
                          color: ACCENT,
                          margin: '0 0 10px',
                        }}>
                          Naročilo {invoiceNumber}
                        </p>

                        {/* Heading */}
                        <h1 style={{
                          fontFamily: MONO_FONT,
                          fontSize: '26px',
                          fontWeight: 'normal',
                          color: TEXT,
                          margin: '0 0 20px',
                          lineHeight: '1.3',
                        }}>
                          Hvala za naročilo!
                        </h1>

                        {/* Intro text */}
                        <p style={{
                          fontSize: '16px',
                          color: MUTED,
                          margin: '0 0 36px',
                          lineHeight: '1.7',
                        }}>
                          Spoštovani/-a {order.fullName},<br />
                          vaše naročilo smo prejeli in ga pripravljamo. V priponki najdete predračun. Prosimo, da ga poravnate v roku 8 dni.
                        </p>

                        {/* ── Items table ── */}
                        <table width="100%" cellPadding="0" cellSpacing="0" role="presentation"
                          style={{ borderCollapse: 'collapse', marginBottom: '8px' }}>
                          <thead>
                            <tr>
                              <th className="items-th" style={{
                                fontFamily: MONO_FONT,
                                fontSize: '10px',
                                letterSpacing: '1.5px',
                                textTransform: 'uppercase',
                                color: MUTED,
                                padding: '0 0 12px',
                                textAlign: 'left',
                                fontWeight: 'normal',
                                borderBottom: `1px solid ${BORDER}`,
                              }}>
                                Artikel
                              </th>
                              <th className="items-th" style={{
                                fontFamily: MONO_FONT,
                                fontSize: '10px',
                                letterSpacing: '1.5px',
                                textTransform: 'uppercase',
                                color: MUTED,
                                padding: '0 12px 12px',
                                textAlign: 'center',
                                fontWeight: 'normal',
                                borderBottom: `1px solid ${BORDER}`,
                                whiteSpace: 'nowrap',
                              }}>
                                Kol.
                              </th>
                              <th className="items-th" style={{
                                fontFamily: MONO_FONT,
                                fontSize: '10px',
                                letterSpacing: '1.5px',
                                textTransform: 'uppercase',
                                color: MUTED,
                                padding: '0 0 12px',
                                textAlign: 'right',
                                fontWeight: 'normal',
                                borderBottom: `1px solid ${BORDER}`,
                                whiteSpace: 'nowrap',
                              }}>
                                Cena
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {lineItems.map((item, i) => (
                              <tr key={i}>
                                <td className="items-td" style={{
                                  padding: '14px 0',
                                  fontSize: '15px',
                                  color: TEXT,
                                  borderBottom: `1px solid ${BORDER}`,
                                  lineHeight: '1.4',
                                }}>
                                  {item.itemNameSnapshot}
                                  <br />
                                  <span style={{ fontSize: '13px', color: MUTED }}>
                                    {item.size}
                                  </span>
                                </td>
                                <td className="items-td" style={{
                                  padding: '14px 12px',
                                  fontSize: '15px',
                                  color: MUTED,
                                  textAlign: 'center',
                                  borderBottom: `1px solid ${BORDER}`,
                                }}>
                                  {item.quantity}×
                                </td>
                                <td className="items-td" style={{
                                  padding: '14px 0',
                                  fontSize: '15px',
                                  color: TEXT,
                                  textAlign: 'right',
                                  whiteSpace: 'nowrap',
                                  borderBottom: `1px solid ${BORDER}`,
                                }}>
                                  {formatPrice(item.itemPriceSnapshot * item.quantity)}
                                </td>
                              </tr>
                            ))}

                            {shippingOption && (
                              <tr>
                                <td className="items-td" style={{
                                  padding: '14px 0',
                                  fontSize: '15px',
                                  color: MUTED,
                                  borderBottom: `1px solid ${BORDER}`,
                                }}>
                                  Dostava – {shippingOption.name}
                                </td>
                                <td style={{ borderBottom: `1px solid ${BORDER}` }} />
                                <td className="items-td" style={{
                                  padding: '14px 0',
                                  fontSize: '15px',
                                  color: MUTED,
                                  textAlign: 'right',
                                  whiteSpace: 'nowrap',
                                  borderBottom: `1px solid ${BORDER}`,
                                }}>
                                  {formatPrice(shippingOption.price)}
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>

                        {/* Total row */}
                        <table width="100%" cellPadding="0" cellSpacing="0" role="presentation"
                          style={{ marginBottom: '36px' }}>
                          <tbody>
                            <tr>
                              <td style={{
                                padding: '16px 0 0',
                                fontFamily: MONO_FONT,
                                fontSize: '12px',
                                letterSpacing: '2px',
                                textTransform: 'uppercase',
                                color: MUTED,
                                fontWeight: 'bold',
                              }}>
                                Skupaj
                              </td>
                              <td className="total-amount" style={{
                                padding: '16px 0 0',
                                fontFamily: MONO_FONT,
                                fontSize: '22px',
                                color: ACCENT,
                                textAlign: 'right',
                                fontWeight: 'bold',
                                whiteSpace: 'nowrap',
                              }}>
                                {formatPrice(grandTotal)}
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        {/* Payment info box */}
                        <table width="100%" cellPadding="0" cellSpacing="0" role="presentation"
                          className="dark-panel"
                          style={{
                            backgroundColor: PANEL,
                            border: `1px solid ${BORDER}`,
                            marginBottom: '36px',
                          }}>
                          <tbody>
                            <tr>
                              <td className="payment-box" style={{ padding: '20px 24px' }}>
                                <p style={{
                                  fontFamily: MONO_FONT,
                                  fontSize: '10px',
                                  letterSpacing: '2px',
                                  textTransform: 'uppercase',
                                  color: ACCENT,
                                  margin: '0 0 14px',
                                }}>
                                  Podatki za plačilo
                                </p>
                                <table cellPadding="0" cellSpacing="0" role="presentation"
                                  style={{ width: '100%', borderCollapse: 'collapse' }}>
                                  <tbody>
                                    {paymentRows.map(([label, value]) => (
                                      <tr key={label}>
                                        <td className="dark-label" style={{
                                          padding: '5px 16px 5px 0',
                                          fontSize: '14px',
                                          color: MUTED,
                                          whiteSpace: 'nowrap',
                                          verticalAlign: 'top',
                                        }}>
                                          {label}
                                        </td>
                                        <td className="dark-value" style={{
                                          padding: '5px 0',
                                          fontSize: '14px',
                                          color: TEXT,
                                          fontFamily:
                                            label === 'IBAN' || label === 'Sklic'
                                              ? MONO_FONT
                                              : BODY_FONT,
                                          wordBreak: 'break-all',
                                        }}>
                                          {value}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        <p style={{
                          fontSize: '14px',
                          color: MUTED,
                          margin: '0',
                          lineHeight: '1.6',
                        }}>
                          Predračun je priložen temu sporočilu. Ob morebitnih vprašanjih nam pišite.
                        </p>
                      </td>
                    </tr>

                    {/* ── Footer ── */}
                    <tr>
                      <td style={{
                        borderTop: `1px solid ${BORDER}`,
                        padding: '24px 0 32px',
                        textAlign: 'center',
                      }}>
                        <p style={{
                          fontFamily: MONO_FONT,
                          fontSize: '10px',
                          color: 'rgba(255,255,255,0.30)',
                          margin: '0',
                          letterSpacing: '1px',
                          textTransform: 'uppercase',
                          lineHeight: '1.8',
                        }}>
                          Politično društvo Mladi Pirati<br />
                          Podmladek Piratske stranke Slovenije
                        </p>
                      </td>
                    </tr>

                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>

      </body>
    </html>
  )
}
