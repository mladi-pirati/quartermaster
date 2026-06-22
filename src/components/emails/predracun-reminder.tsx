import { format } from 'date-fns'
import type { Order, OrderItem, ShippingOption } from '@/db/schema'

interface Props {
  order: Order
  lineItems: OrderItem[]
  shippingOption: ShippingOption | null
  invoiceNumber: string
  issueDate: Date
  dueDate: Date
  customBody: string
}

const BG = '#000000'
const PANEL = '#111111'
const BORDER = '#222222'
const TEXT = '#ffffff'
const MUTED = 'rgba(255,255,255,0.65)'
const ACCENT = '#f0a000'
const BODY_FONT = '"Monda", Arial, sans-serif'
const MONO_FONT = '"JetBrains Mono", "Courier New", monospace'

export function PredracunReminderEmail({
  order,
  invoiceNumber,
  issueDate,
  dueDate,
  customBody,
}: Props) {
  const paymentRows: [string, string][] = [
    ['Predračun', invoiceNumber],
    ['Datum izdaje', format(issueDate, 'd. M. yyyy')],
    ['Rok plačila', format(dueDate, 'd. M. yyyy')],
    ['IBAN', 'SI56 0400 1004 6962 927'],
    ['Sklic', `SI00 ${invoiceNumber.replace(/\D/g, '')}`],
  ]

  return (
    <html lang="sl">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta name="color-scheme" content="dark" />
        <meta name="supported-color-schemes" content="dark" />
        <title>Popravljen predračun {invoiceNumber}</title>
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
            .payment-box { padding: 16px !important; }
          }
        `}</style>
      </head>
      <body style={{ margin: 0, padding: 0, backgroundColor: BG, fontFamily: BODY_FONT }}>

        <table width="100%" cellPadding="0" cellSpacing="0" role="presentation"
          style={{ backgroundColor: BG, minWidth: '100%' }}>
          <tbody>
            <tr>
              <td className="outer-cell" align="center" style={{ padding: '0 24px' }}>

                <table width="100%" cellPadding="0" cellSpacing="0" role="presentation"
                  style={{ maxWidth: '600px', margin: '0 auto' }}>
                  <tbody>

                    {/* ── Header ── */}
                    <tr>
                      <td style={{ padding: '32px 0 24px', borderBottom: `1px solid ${BORDER}` }}>
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

                    {/* ── Body ── */}
                    <tr>
                      <td className="section" style={{ padding: '36px 0' }}>

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

                        <h1 style={{
                          fontFamily: MONO_FONT,
                          fontSize: '22px',
                          fontWeight: 'normal',
                          color: TEXT,
                          margin: '0 0 24px',
                          lineHeight: '1.3',
                        }}>
                          Popravljen predračun
                        </h1>

                        <p style={{
                          fontSize: '16px',
                          color: TEXT,
                          margin: '0 0 8px',
                          lineHeight: '1.7',
                          fontWeight: 'bold',
                        }}>
                          Zdravo {order.fullName},
                        </p>

                        <p style={{
                          fontSize: '15px',
                          color: MUTED,
                          margin: '0 0 36px',
                          lineHeight: '1.7',
                          whiteSpace: 'pre-line',
                        }}>
                          {customBody}
                        </p>

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
                          Popravljen predračun je priložen temu sporočilu. Ob morebitnih vprašanjih nam pišite.
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
