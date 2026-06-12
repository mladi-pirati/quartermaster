import type { Order } from '@/db/schema'

type EmailType = 'order_shipped' | 'order_ready_for_pickup'

interface Props {
  order: Order
  type: EmailType
}

const BG = '#000000'
const PANEL = '#111111'
const BORDER = '#222222'
const TEXT = '#ffffff'
const MUTED = 'rgba(255,255,255,0.65)'
const ACCENT = '#f0a000'
const BODY_FONT = '"Monda", Arial, sans-serif'
const MONO_FONT = '"JetBrains Mono", "Courier New", monospace'

function getContent(order: Order, type: EmailType) {
  if (type === 'order_shipped') {
    return {
      eyebrow: 'Naročilo je na poti',
      heading: 'Vaše naročilo je odposlano!',
      body: `Spoštovani/-a ${order.fullName},\nvaše naročilo ${order.invoiceNumber ?? ''} je bilo odposlano. Kmalu vam bo dostavljeno na navedeni naslov.`,
    }
  }
  return {
    eyebrow: 'Naročilo je pripravljeno',
    heading: 'Naročilo čaka na prevzem!',
    body: `Spoštovani/-a ${order.fullName},\nvaše naročilo ${order.invoiceNumber ?? ''} je pripravljeno za prevzem. Obiščite nas na dogovorjeni lokaciji.`,
  }
}

export function OrderStatusUpdateEmail({ order, type }: Props) {
  const { eyebrow, heading, body } = getContent(order, type)

  return (
    <html lang="sl">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta name="color-scheme" content="dark" />
        <meta name="supported-color-schemes" content="dark" />
        <title>{heading}</title>
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
            .status-badge { padding: 14px 16px !important; }
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

                        {/* Eyebrow */}
                        <p style={{
                          fontFamily: MONO_FONT,
                          fontSize: '11px',
                          letterSpacing: '2px',
                          textTransform: 'uppercase',
                          color: ACCENT,
                          margin: '0 0 10px',
                        }}>
                          {eyebrow}
                        </p>

                        {/* Heading */}
                        <h1 style={{
                          fontFamily: MONO_FONT,
                          fontSize: '26px',
                          fontWeight: 'normal',
                          color: TEXT,
                          margin: '0 0 24px',
                          lineHeight: '1.3',
                        }}>
                          {heading}
                        </h1>

                        {/* Body text */}
                        <p style={{
                          fontSize: '16px',
                          color: MUTED,
                          margin: '0 0 32px',
                          lineHeight: '1.7',
                          whiteSpace: 'pre-line',
                        }}>
                          {body}
                        </p>

                        {/* Status badge */}
                        {order.invoiceNumber && (
                          <table width="100%" cellPadding="0" cellSpacing="0" role="presentation"
                            className="dark-panel"
                            style={{
                              backgroundColor: PANEL,
                              border: `1px solid ${BORDER}`,
                            }}>
                            <tbody>
                              <tr>
                                <td className="status-badge" style={{ padding: '18px 24px' }}>
                                  <table cellPadding="0" cellSpacing="0" role="presentation">
                                    <tbody>
                                      <tr>
                                        <td className="dark-label" style={{
                                          padding: '0 20px 0 0',
                                          fontSize: '13px',
                                          color: MUTED,
                                          fontFamily: MONO_FONT,
                                          whiteSpace: 'nowrap',
                                        }}>
                                          Referenca naročila
                                        </td>
                                        <td className="dark-value" style={{
                                          fontSize: '15px',
                                          color: TEXT,
                                          fontFamily: MONO_FONT,
                                          fontWeight: 'bold',
                                        }}>
                                          {order.invoiceNumber}
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        )}
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
