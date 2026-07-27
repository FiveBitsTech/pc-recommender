import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const MAX_TEXT_WIDTH = 180

/** Truncate long product names for table headers */
const truncateName = (name, maxLen = 40) => {
  if (!name || name.length <= maxLen) return name

  return name.slice(0, maxLen - 1) + '…'
}

const generateComparisonPdf = (result, selectedProducts) => {
  const doc = new jsPDF()

  const p1 = selectedProducts[0]?.product
  const p2 = selectedProducts[1]?.product
  const p3 = selectedProducts[2]?.product

  // Title
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('PC COTIZA-IA - Comparación de equipos', 14, 20)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100)
  doc.text(`Generado el ${new Date().toLocaleDateString('es-PE')}`, 14, 28)

  // Recommendation
  let currentY = 42

  if (result.recommendation) {
    doc.setTextColor(0)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Nuestra recomendación', 14, currentY)
    currentY += 10

    doc.setFontSize(11)
    const cleanName = (result.recommendation.productName || '').replace(/[\u{1F000}-\u{1FFFF}]/gu, '').trim()
    const recTitle = `${cleanName} (${result.recommendation.score}/100)`
    const recLines = doc.splitTextToSize(recTitle, 176)

    doc.text(recLines, 14, currentY)
    currentY += recLines.length * 6 + 4

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')

    result.recommendation.keyReasons?.forEach((r) => {
      const lines = doc.splitTextToSize(`- ${r}`, MAX_TEXT_WIDTH - 4)

      doc.text(lines, 18, currentY)
      currentY += lines.length * 5 + 1
    })

    if (result.recommendation.tradeoffs?.length > 0) {
      currentY += 4
      doc.setFont('helvetica', 'italic')
      doc.text('Lo que sacrificas:', 18, currentY)
      currentY += 6
      doc.setFont('helvetica', 'normal')
      result.recommendation.tradeoffs.forEach((t) => {
        const lines = doc.splitTextToSize(`• ${t}`, MAX_TEXT_WIDTH - 8)

        doc.text(lines, 22, currentY)
        currentY += lines.length * 5 + 1
      })
    }
  }

  // Summary
  if (result.summary?.length > 0) {
    currentY += 8
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('En pocas palabras', 14, currentY)
    currentY += 8

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    result.summary.forEach((s) => {
      // Strip emojis that jsPDF can't render/measure
      const cleanProduct = (s.bestProduct || '').replace(/[\u{1F000}-\u{1FFFF}]/gu, '').trim()
      const text = `[${s.useCase}] ${cleanProduct}`
      const lines = doc.splitTextToSize(text, 172)

      doc.text(lines, 18, currentY)
      currentY += lines.length * 5 + 2
    })
  }

  // Specs table
  if (result.specs_comparison?.length > 0) {
    const specsStartY = currentY + 10

    const head = p3
      ? [['Característica', truncateName(p1?.name, 35) || 'Producto 1', truncateName(p2?.name, 35) || 'Producto 2', truncateName(p3?.name, 35) || 'Producto 3']]
      : [['Característica', truncateName(p1?.name, 45) || 'Producto 1', truncateName(p2?.name, 45) || 'Producto 2']]

    const body = result.specs_comparison.map((s) => {
      const row = [s.category, s.product1, s.product2]

      if (p3) row.push(s.product3 || '-')

      return row
    })

    autoTable(doc, {
      startY: specsStartY,
      head,
      body,
      headStyles: { fillColor: [61, 149, 238], fontSize: 8, cellPadding: 3 },
      styles: { fontSize: 9, cellPadding: 2, overflow: 'linebreak' },
      columnStyles: p3
        ? { 0: { cellWidth: 28 }, 1: { cellWidth: 50 }, 2: { cellWidth: 50 }, 3: { cellWidth: 50 } }
        : { 0: { cellWidth: 35 }, 1: { cellWidth: 72 }, 2: { cellWidth: 72 } },
    })
  }

  // Ratings
  if (result.ratings?.length > 0) {
    const startY = (doc.lastAutoTable?.finalY || 200) + 15

    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0)
    doc.text('Puntuaciones', 14, startY)

    const head = p3
      ? [['Categoría', truncateName(p1?.name, 30) || 'P1', truncateName(p2?.name, 30) || 'P2', truncateName(p3?.name, 30) || 'P3']]
      : [['Categoría', truncateName(p1?.name, 40) || 'P1', truncateName(p2?.name, 40) || 'P2']]

    const body = result.ratings.map((r) => {
      const toStars = (score) => `${score}/5`

      const row = [r.category, toStars(r.product1Score), toStars(r.product2Score)]

      if (p3) row.push(toStars(r.product3Score || 0))

      return row
    })

    autoTable(doc, {
      startY: startY + 6,
      head,
      body,
      headStyles: { fillColor: [47, 186, 155], fontSize: 8, cellPadding: 3 },
      styles: { fontSize: 9, cellPadding: 2, overflow: 'linebreak' },
    })
  }

  // Footer
  const pageHeight = doc.internal.pageSize.height

  doc.setFontSize(8)
  doc.setTextColor(150)
  doc.text('PC COTIZA-IA | Asesor inteligente de tecnología | www.pc-cotiza.com', 14, pageHeight - 10)

  doc.save('comparacion-pc-cotiza.pdf')
}

export default generateComparisonPdf
