import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

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
  if (result.recommendation) {
    doc.setTextColor(0)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Nuestra recomendación', 14, 42)

    doc.setFontSize(12)
    doc.text(`${result.recommendation.productName} (${result.recommendation.score}/100)`, 14, 50)

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')

    let y = 58

    result.recommendation.keyReasons?.forEach((r) => {
      doc.text(`- ${r}`, 18, y)
      y += 6
    })

    if (result.recommendation.tradeoffs?.length > 0) {
      y += 4
      doc.setFont('helvetica', 'italic')
      doc.text('Lo que sacrificas:', 18, y)
      y += 6
      doc.setFont('helvetica', 'normal')
      result.recommendation.tradeoffs.forEach((t) => {
        doc.text(`• ${t}`, 22, y)
        y += 6
      })
    }
  }

  // Summary
  if (result.summary?.length > 0) {
    let y = doc.lastAutoTable?.finalY || 90

    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('En pocas palabras', 14, y + 10)

    y += 18

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    result.summary.forEach((s) => {
      doc.text(`[${s.useCase}] ${s.bestProduct}`, 18, y)
      y += 7
    })
  }

  // Specs table
  if (result.specs_comparison?.length > 0) {
    const head = p3
      ? [['Característica', p1?.name || 'Producto 1', p2?.name || 'Producto 2', p3?.name || 'Producto 3']]
      : [['Característica', p1?.name || 'Producto 1', p2?.name || 'Producto 2']]

    const body = result.specs_comparison.map((s) => {
      const row = [s.category, s.product1, s.product2]

      if (p3) row.push(s.product3 || '-')

      return row
    })

    autoTable(doc, {
      startY: 130,
      head,
      body,
      headStyles: { fillColor: [61, 149, 238] },
      styles: { fontSize: 9 },
    })
  }

  // Ratings
  if (result.ratings?.length > 0) {
    const startY = doc.lastAutoTable?.finalY + 15 || 200

    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Puntuaciones', 14, startY)

    const head = p3
      ? [['Categoría', p1?.name || 'P1', p2?.name || 'P2', p3?.name || 'P3']]
      : [['Categoría', p1?.name || 'P1', p2?.name || 'P2']]

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
      headStyles: { fillColor: [47, 186, 155] },
      styles: { fontSize: 9 },
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
