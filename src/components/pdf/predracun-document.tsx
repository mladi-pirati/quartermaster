import {
  Document,
  Font,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer'
import { format } from 'date-fns'
import type { Order, OrderItem, ShippingOption } from '@/db/schema'

// Full TTF (all glyphs, not subset-split) so č/š/ž render correctly
const CDN = 'https://cdn.jsdelivr.net/gh/googlefonts/RobotoMono@main/fonts/ttf'
Font.register({
  family: 'RobotoMono',
  fonts: [
    { src: `${CDN}/RobotoMono-Regular.ttf`, fontWeight: 'normal' },
    { src: `${CDN}/RobotoMono-Bold.ttf`, fontWeight: 'bold' },
    { src: `${CDN}/RobotoMono-Italic.ttf`, fontStyle: 'italic' },
  ],
})

const ORANGE = '#F59E0B'
const DARK = '#1A1A2E'
const GREY = '#6B7280'
const LIGHT_GREY = '#F3F4F6'
const WHITE = '#FFFFFF'

const styles = StyleSheet.create({
  page: {
    fontFamily: 'RobotoMono',
    fontSize: 9,
    color: DARK,
    paddingTop: 24,
    paddingBottom: 36,
    paddingHorizontal: 28,
  },

  // ── Header ──────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  logo: { width: 72, height: 72, objectFit: 'contain' },

  // ── Info columns ────────────────────────────────────────────────────
  infoRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  infoCol: { flex: 1 },
  infoLabel: { fontSize: 7, color: GREY, marginBottom: 2, textTransform: 'uppercase' },
  infoValue: { fontSize: 9 },
  infoBold: { fontSize: 9, fontWeight: 'bold' },

  // ── Dates column ────────────────────────────────────────────────────
  datesCol: { flex: 1, alignItems: 'flex-end' },
  dateRow: { flexDirection: 'row', gap: 4, marginBottom: 2 },
  dateLabel: { fontSize: 8, color: GREY },
  dateValue: { fontSize: 8, fontWeight: 'bold' },

  // ── Invoice number ───────────────────────────────────────────────────
  invoiceNumber: {
    fontSize: 12,
    color: ORANGE,
    fontWeight: 'bold',
    marginBottom: 12,
  },

  // ── Table ────────────────────────────────────────────────────────────
  table: { marginBottom: 12 },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: DARK,
    paddingBottom: 4,
    marginBottom: 2,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: LIGHT_GREY,
    paddingVertical: 4,
  },
  cellStoritev: { flex: 3, fontSize: 8 },
  cellEnota: { flex: 1, fontSize: 8, textAlign: 'center' },
  cellKol: { width: 28, fontSize: 8, textAlign: 'center' },
  cellCena: { flex: 1.2, fontSize: 8, textAlign: 'right' },
  cellNeto: { flex: 1.2, fontSize: 8, textAlign: 'right' },
  cellDdvPct: { width: 36, fontSize: 8, textAlign: 'right' },
  cellSkupaj: { flex: 1.2, fontSize: 8, textAlign: 'right', fontWeight: 'bold' },
  tableHeaderText: { fontSize: 7, color: GREY, fontStyle: 'italic' },

  // ── Totals ───────────────────────────────────────────────────────────
  totalsBlock: { alignItems: 'flex-end', marginBottom: 14 },
  totalRow: { flexDirection: 'row', gap: 16, marginBottom: 2 },
  totalLabel: { fontSize: 8, color: GREY, textAlign: 'right', width: 110 },
  totalValue: { fontSize: 8, textAlign: 'right', width: 60 },
  totalGrandLabel: { fontSize: 10, fontWeight: 'bold', textAlign: 'right', width: 110 },
  totalGrandValue: { fontSize: 10, fontWeight: 'bold', textAlign: 'right', width: 60 },

  // ── Notes ────────────────────────────────────────────────────────────
  vatNote: { fontSize: 7, color: GREY, marginBottom: 14, fontStyle: 'italic' },

  // ── Payment info (text) ───────────────────────────────────────────────
  paymentLabel: { fontSize: 7, color: GREY, textTransform: 'uppercase', marginBottom: 4 },
  paymentLine: { fontSize: 8, marginBottom: 2 },
  paymentBold: { fontSize: 8, fontWeight: 'bold' },

  // ── QR CTA section ───────────────────────────────────────────────────
  qrSection: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: LIGHT_GREY,
    borderRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: ORANGE,
    paddingVertical: 12,
    paddingRight: 16,
    paddingLeft: 12,
    gap: 16,
  },
  qrImageLarge: { width: 148, height: 148 },
  qrCtaBlock: { flex: 1 },
  qrCtaTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: DARK,
    marginBottom: 2,
  },
  qrCtaSubtitle: {
    fontSize: 8,
    color: GREY,
    marginBottom: 10,
  },
  qrDetailRow: {
    flexDirection: 'row',
    marginBottom: 4,
    gap: 6,
  },
  qrDetailLabel: {
    fontSize: 7,
    color: GREY,
    width: 72,
  },
  qrDetailValue: {
    fontSize: 8,
    fontWeight: 'bold',
    flex: 1,
  },

  // ── Footer ───────────────────────────────────────────────────────────
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: DARK,
    paddingVertical: 6,
    paddingHorizontal: 28,
  },
  footerText: { fontSize: 7, color: WHITE },
})

function formatEur(eurocents: number): string {
  return (eurocents / 100).toLocaleString('sl-SI', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + ' €'
}

export interface PredracunDocumentProps {
  invoiceNumber: string
  issueDate: Date
  dueDate: Date
  order: Order
  lineItems: OrderItem[]
  shippingOption?: ShippingOption | null
  qrDataUrl: string
  logoDataUrl: string
}

export function PredracunDocument({
  invoiceNumber,
  issueDate,
  dueDate,
  order,
  lineItems,
  shippingOption,
  qrDataUrl,
  logoDataUrl,
}: PredracunDocumentProps) {
  const itemsTotal = lineItems.reduce(
    (sum, l) => sum + l.itemPriceSnapshot * l.quantity,
    0,
  )
  const shippingTotal = shippingOption?.price ?? 0
  const grandTotal = itemsTotal + shippingTotal

  const buyerAddress =
    order.deliveryType === 'shipping' && order.address
      ? `${order.address}\n${order.postalCode} ${order.city}\n${order.country}`
      : ''

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* Header: logo only */}
        <View style={styles.header}>
          <Image src={logoDataUrl} style={styles.logo} />
        </View>

        {/* Info row: seller | buyer | dates */}
        <View style={styles.infoRow}>
          {/* Seller */}
          <View style={styles.infoCol}>
            <Text style={styles.infoBold}>Politično društvo Mladi Pirati</Text>
            <Text style={styles.infoValue}>Petkova ulica 7</Text>
            <Text style={styles.infoValue}>1231 Ljubljana - Črnuče</Text>
            <Text style={styles.infoValue}>MŠ: 4106113000</Text>
            <Text style={styles.infoValue}>DŠ: 76769348</Text>
          </View>

          {/* Buyer */}
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Prejemnik</Text>
            <Text style={styles.infoBold}>{order.fullName}</Text>
            {buyerAddress
              ? buyerAddress.split('\n').map((line, i) => (
                  <Text key={i} style={styles.infoValue}>{line}</Text>
                ))
              : null}
          </View>

          {/* Dates */}
          <View style={styles.datesCol}>
            <View style={styles.dateRow}>
              <Text style={styles.dateLabel}>Datum izdaje predračuna:</Text>
              <Text style={styles.dateValue}>{format(issueDate, 'dd.MM.yyyy')}</Text>
            </View>
            <View style={styles.dateRow}>
              <Text style={styles.dateLabel}>Rok plačila:</Text>
              <Text style={styles.dateValue}>{format(dueDate, 'dd.MM.yyyy')}</Text>
            </View>
            <View style={styles.dateRow}>
              <Text style={styles.dateLabel}>Kraj izdaje:</Text>
              <Text style={styles.dateValue}>Ljubljana</Text>
            </View>
          </View>
        </View>

        {/* Invoice number */}
        <Text style={styles.invoiceNumber}>Predračun št.: {invoiceNumber}</Text>

        {/* Items table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.cellStoritev, styles.tableHeaderText]}>Storitev</Text>
            <Text style={[styles.cellEnota, styles.tableHeaderText]}>Enota</Text>
            <Text style={[styles.cellKol, styles.tableHeaderText]}>Kol</Text>
            <Text style={[styles.cellCena, styles.tableHeaderText]}>Cena na enoto</Text>
            <Text style={[styles.cellNeto, styles.tableHeaderText]}>Neto</Text>
            <Text style={[styles.cellDdvPct, styles.tableHeaderText]}>DDV (%)</Text>
            <Text style={[styles.cellSkupaj, styles.tableHeaderText]}>Skupaj</Text>
          </View>

          {lineItems.map((line) => (
            <View key={line.id} style={styles.tableRow}>
              <Text style={styles.cellStoritev}>{line.itemNameSnapshot}{line.size ? ` – ${line.size}` : ''}</Text>
              <Text style={styles.cellEnota}>kos</Text>
              <Text style={styles.cellKol}>{line.quantity}</Text>
              <Text style={styles.cellCena}>{formatEur(line.itemPriceSnapshot)}</Text>
              <Text style={styles.cellNeto}>{formatEur(line.itemPriceSnapshot * line.quantity)}</Text>
              <Text style={styles.cellDdvPct}>0 %</Text>
              <Text style={styles.cellSkupaj}>{formatEur(line.itemPriceSnapshot * line.quantity)}</Text>
            </View>
          ))}

          {shippingOption && (
            <View style={styles.tableRow}>
              <Text style={styles.cellStoritev}>Poštnina – {shippingOption.name}</Text>
              <Text style={styles.cellEnota}>kos</Text>
              <Text style={styles.cellKol}>1</Text>
              <Text style={styles.cellCena}>{formatEur(shippingOption.price)}</Text>
              <Text style={styles.cellNeto}>{formatEur(shippingOption.price)}</Text>
              <Text style={styles.cellDdvPct}>0 %</Text>
              <Text style={styles.cellSkupaj}>{formatEur(shippingOption.price)}</Text>
            </View>
          )}
        </View>

        {/* Totals */}
        <View style={styles.totalsBlock}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Skupaj neto</Text>
            <Text style={styles.totalValue}>{formatEur(grandTotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>DDV (stopnja 0,00)</Text>
            <Text style={styles.totalValue}>0,00 €</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalGrandLabel}>Skupaj</Text>
            <Text style={styles.totalGrandValue}>{formatEur(grandTotal)}</Text>
          </View>
        </View>

        {/* VAT note */}
        <Text style={styles.vatNote}>Oproščeno po 42. členu ZDDV-1</Text>

        {/* Payment info */}
        <Text style={styles.paymentLabel}>Informacije za plačilo</Text>
        <Text style={styles.paymentLine}>
          Sklic: <Text style={styles.paymentBold}>SI00 {invoiceNumber}</Text>
        </Text>
        <Text style={styles.paymentLine}>
          IBAN: <Text style={styles.paymentBold}>SI56 0400 1004 6962 927</Text>{'  '}(OTP banka d.d.)
        </Text>
        <Text style={styles.paymentLine}>
          Koda namena: <Text style={styles.paymentBold}>GDDS</Text>
        </Text>

        {/* QR CTA */}
        <View style={styles.qrSection}>
          <Image src={qrDataUrl} style={styles.qrImageLarge} />
          <View style={styles.qrCtaBlock}>
            <Text style={styles.qrCtaTitle}>Skeniraj in plačaj</Text>
            <Text style={styles.qrCtaSubtitle}>Skenirajte kodo z mobilno banko za takojšnje plačilo.</Text>
            <View style={styles.qrDetailRow}>
              <Text style={styles.qrDetailLabel}>Prejemnik</Text>
              <Text style={styles.qrDetailValue}>Društvo Mladi Pirati</Text>
            </View>
            <View style={styles.qrDetailRow}>
              <Text style={styles.qrDetailLabel}>IBAN</Text>
              <Text style={styles.qrDetailValue}>SI56 0400 1004 6962 927</Text>
            </View>
            <View style={styles.qrDetailRow}>
              <Text style={styles.qrDetailLabel}>Znesek</Text>
              <Text style={styles.qrDetailValue}>{formatEur(grandTotal)}</Text>
            </View>
            <View style={styles.qrDetailRow}>
              <Text style={styles.qrDetailLabel}>Sklic</Text>
              <Text style={styles.qrDetailValue}>SI00 {invoiceNumber}</Text>
            </View>
            <View style={styles.qrDetailRow}>
              <Text style={styles.qrDetailLabel}>Rok plačila</Text>
              <Text style={styles.qrDetailValue}>{format(dueDate, 'dd.MM.yyyy')}</Text>
            </View>
            <View style={styles.qrDetailRow}>
              <Text style={styles.qrDetailLabel}>Koda namena</Text>
              <Text style={styles.qrDetailValue}>GDDS</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            Politično društvo Mladi Pirati  |  Petkova ulica 7, 1231 Ljubljana - Črnuče  |  MŠ: 4106113000  |  DŠ: 76769348
          </Text>
        </View>

      </Page>
    </Document>
  )
}
