import jsPDF from 'jspdf';
import autoTable, { UserOptions } from 'jspdf-autotable';
import notoSansUrl from '../assets/Fonts/NotoSans-VariableFont_wdth,wght.ttf?url';

type PeriodData = {
  period: string;
  occupancyRate: number | null;
  operatingDays: number | null;
  rooms: number | null;
  floorArea: number | null;
};

type EnergyByPeriod = Record<string, number>;

interface PdfData {
  language: 'cs' | 'en';
  coverTitle?: string;
  coverColor?: [number, number, number];
  accommodationProfileLabel?: string;
  years: string[];
  operationalData: PeriodData[];
  energySourceOrder: string[];
  energySourceLabels: Record<string, string>;
  energyKwh: EnergyByPeriod[];
  energyEmissionsTons: EnergyByPeriod[];
  energyGj: EnergyByPeriod[];
  totalsByPeriod: { totalEnergy: number; totalEmissions: number }[];
  perPeriodIndicators: { roomNights: number | null; floorAreaM2: number | null }[];
  energyManagementTables: Array<{
    title: string;
    rows: Array<{ label: string; expected: string; value: string; evaluation: string; recommendation: string; status: string }>;
  }>;
  renewablesSummary: Array<{ year: string; renewableKwh: number; renewablePct: number; nonRenewableKwh: number; nonRenewablePct: number }>;
  benchmarks: {
    title: string;
    headers: string[];
    rows: Array<Array<string>>;
    totals: Array<string>;
    bands: Array<string>;
    yearSummaries: Array<{ year: string; rating: string; meaning: string; typical: string; next: string }>;
  };
}

const fmtInt = (v: number | null) => (v === null ? '—' : Math.round(v).toLocaleString('cs-CZ').replace(/\\u00A0/g, ' '));
const fmt2 = (v: number | null) => (v === null ? '—' : v.toLocaleString('cs-CZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/\\u00A0/g, ' '));

let fontBase64Promise: Promise<string> | null = null;
const loadNotoSansBase64 = async () => {
  if (!fontBase64Promise) {
    fontBase64Promise = fetch(notoSansUrl)
      .then((res) => res.arrayBuffer())
      .then((buf) => {
        const bytes = new Uint8Array(buf);
        let binary = '';
        for (let i = 0; i < bytes.length; i += 1) {
          binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
      });
  }
  return fontBase64Promise;
};

export async function generateVectorPdf(data: PdfData) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const lang = data.language;
  const marginX = 14;
  let cursorY = 14;

  const fontBase64 = await loadNotoSansBase64();
  doc.addFileToVFS('NotoSans.ttf', fontBase64);
  doc.addFont('NotoSans.ttf', 'NotoSans', 'normal');
  doc.setFont('NotoSans', 'normal');

  const addTitle = (text: string) => {
    doc.setFont('NotoSans', 'normal');
    doc.setFontSize(14);
    doc.text(text, marginX, cursorY);
    cursorY += 6;
  };

  const addTable = (options: UserOptions) => {
    autoTable(doc, {
      margin: { left: marginX, right: marginX },
      styles: { font: 'NotoSans', fontSize: 10 },
      headStyles: { fillColor: [245, 245, 244], textColor: [120, 113, 108], fontStyle: 'bold' },
      ...options,
      startY: cursorY,
    });
    cursorY = (doc as any).lastAutoTable.finalY + 8;
  };

  if (data.coverColor && data.coverTitle) {
    doc.setFillColor(data.coverColor[0], data.coverColor[1], data.coverColor[2]);
    doc.rect(0, 0, 210, 297, 'F');
    doc.setTextColor(28, 25, 23);
    doc.setFont('NotoSans', 'normal');
    doc.setFontSize(20);
    doc.text(data.coverTitle, marginX, 40);
    if (data.accommodationProfileLabel) {
      doc.setFontSize(12);
      const label = lang === 'cs' ? 'Profil ubytování' : 'Accommodation profile';
      doc.text(`${label}: ${data.accommodationProfileLabel}`, marginX, 52);
    }
    doc.addPage();
    doc.setTextColor(0, 0, 0);
  }

  // Operational Data
  addTitle(lang === 'cs' ? 'Provozní údaje' : 'Operational Data');
  addTable({
    head: [[lang === 'cs' ? 'Ukazatel' : 'Metric', ...data.years]],
    body: [
      [lang === 'cs' ? 'Období' : 'Period', ...data.operationalData.map((p) => p.period || '—')],
      [lang === 'cs' ? 'Obsazenost (%)' : 'Occupancy rate (%)', ...data.operationalData.map((p) => fmt2(p.occupancyRate))],
      [lang === 'cs' ? 'Provozní dny' : 'Operating days', ...data.operationalData.map((p) => fmtInt(p.operatingDays))],
      [lang === 'cs' ? 'Počet pokojů' : 'Number of rooms', ...data.operationalData.map((p) => fmtInt(p.rooms))],
      [lang === 'cs' ? 'Podlahová plocha (m²)' : 'Floor area (m²)', ...data.operationalData.map((p) => fmtInt(p.floorArea))],
      [lang === 'cs' ? 'Pokojonoci' : 'Room nights', ...data.perPeriodIndicators.map((p) => fmtInt(p.roomNights))],
    ],
  });

  // Energy (kWh)
  addTitle(lang === 'cs' ? 'ENERGIE (kWh)' : 'ENERGY (kWh)');
  const energySources = data.energySourceOrder.length ? data.energySourceOrder : Object.keys(data.energyKwh[0] || {});
  addTable({
    head: [[lang === 'cs' ? 'Zdroj energie' : 'Energy source', ...data.years]],
    body: [
      ...energySources.map((key) => [
        data.energySourceLabels[key] ?? key,
        ...data.energyKwh.map((p) => fmtInt(p[key] ?? 0)),
      ]),
    ],
  });

  // Emissions
  addTitle(lang === 'cs' ? 'EMISE (t CO₂e)' : 'EMISSIONS (t CO₂e)');
  addTable({
    head: [[lang === 'cs' ? 'Zdroj energie' : 'Energy source', ...data.years]],
    body: [
      ...energySources.map((key) => [
        data.energySourceLabels[key] ?? key,
        ...data.energyEmissionsTons.map((p) => fmt2(p[key] ?? 0)),
      ]),
    ],
  });

  // Energy GJ
  addTitle(lang === 'cs' ? 'ENERGIE (GJ)' : 'ENERGY (GJ)');
  addTable({
    head: [[lang === 'cs' ? 'Zdroj energie' : 'Energy source', ...data.years]],
    body: [
      ...energySources.map((key) => [
        data.energySourceLabels[key] ?? key,
        ...data.energyGj.map((p) => fmt2(p[key] ?? 0)),
      ]),
    ],
  });

  // Renewables summary
  addTitle(lang === 'cs' ? 'Obnovitelné zdroje' : 'Renewable sources');
  addTable({
    head: [[lang === 'cs' ? 'Rok' : 'Year', lang === 'cs' ? 'Obnovitelné (kWh)' : 'Renewable (kWh)', lang === 'cs' ? 'Neobnovitelné (kWh)' : 'Non-renewable (kWh)']],
    body: data.renewablesSummary.map((r) => [
      r.year,
      `${fmtInt(r.renewableKwh)} (${r.renewablePct.toFixed(1).replace('.', ',')}%)`,
      `${fmtInt(r.nonRenewableKwh)} (${r.nonRenewablePct.toFixed(1).replace('.', ',')}%)`,
    ]),
  });

  // Benchmarks
  addTitle(data.benchmarks.title);
  addTable({
    head: [data.benchmarks.headers],
    body: data.benchmarks.rows,
  });
  addTable({
    head: [[lang === 'cs' ? 'Celkové vážené skóre' : 'Total weighted score', ...data.years]],
    body: [data.benchmarks.totals],
  });
  addTable({
    head: [[lang === 'cs' ? 'Hodnocení' : 'Rating', ...data.years]],
    body: [data.benchmarks.bands],
  });

  data.benchmarks.yearSummaries.forEach((y) => {
    addTitle(`${lang === 'cs' ? 'Rok' : 'Year'} ${y.year}`);
    addTable({
      head: [[data.benchmarks.headers[0], data.benchmarks.headers[1], data.benchmarks.headers[2], data.benchmarks.headers[3]]],
      body: [[y.rating, y.meaning, y.typical, y.next]],
    });
  });

  if (data.energyManagementTables.length) {
    const statusStyles: Record<string, { fill?: [number, number, number]; text?: [number, number, number] }> = {
      within: { fill: [209, 250, 229], text: [6, 95, 70] },
      lowEmissions: { fill: [209, 250, 229], text: [6, 95, 70] },
      slightly: { fill: [254, 243, 199], text: [146, 64, 14] },
      aboveAverage: { fill: [254, 243, 199], text: [146, 64, 14] },
      high: { fill: [254, 226, 226], text: [153, 27, 27] },
      unknown: { fill: undefined, text: [31, 41, 55] },
    };

    data.energyManagementTables.forEach((table) => {
      doc.addPage();
      cursorY = 14;
      addTitle(table.title);

      const headers = [
        lang === 'cs' ? 'Metrika' : 'Metric',
        lang === 'cs' ? 'Očekávaná hodnota' : 'Expected value',
        lang === 'cs' ? 'Výsledek' : 'Results',
        lang === 'cs' ? 'Doporučení' : 'Recommendation',
      ];

      addTable({
        head: [headers],
        body: table.rows.map((row) => [row.label, row.expected, row.value, row.recommendation]),
        didParseCell: (dataCell) => {
          if (dataCell.section !== 'body') return;
          const row = table.rows[dataCell.row.index];
          const style = statusStyles[row.status] || statusStyles.unknown;
          if (style.fill) {
            dataCell.cell.styles.fillColor = style.fill;
          }
          if (style.text) {
            dataCell.cell.styles.textColor = style.text;
          }
        },
      });
    });
  }

  doc.save('greenpack-report.pdf');
}

