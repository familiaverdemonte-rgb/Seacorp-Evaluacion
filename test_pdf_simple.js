// Test simple para verificar generación de PDF
// Copia y pega este código en la consola del navegador para probar

async function testPDFSimple() {
  try {
    console.log('🧪 Iniciando prueba de PDF simple...')
    
    // Importar jsPDF
    const { jsPDF } = window.jspdf || await import('jspdf')
    
    // Crear PDF simple
    const pdf = new jsPDF('p', 'mm', 'a4')
    
    // Agregar contenido
    pdf.setFontSize(20)
    pdf.text('SEACORP PERÚ', 105, 30, { align: 'center' })
    
    pdf.setFontSize(16)
    pdf.text('Reporte de Evaluación de Desempeño', 105, 40, { align: 'center' })
    
    pdf.setFontSize(12)
    pdf.text('Fecha: ' + new Date().toLocaleDateString('es-PE'), 20, 60)
    pdf.text('Trabajador: Juan Pérez', 20, 70)
    pdf.text('Área: IT', 20, 80)
    pdf.text('Puesto: Desarrollador Senior', 20, 90)
    
    pdf.setFontSize(14)
    pdf.text('Resultados:', 20, 110)
    pdf.setFontSize(12)
    pdf.text('Puntaje Final: 4.25', 30, 125)
    pdf.text('Clasificación: Buen desempeño', 30, 135)
    
    // Guardar PDF
    pdf.save('test_simple_reporte.pdf')
    
    console.log('✅ Test simple completado - PDF descargado')
    return true
  } catch (error) {
    console.error('❌ Error en test simple:', error)
    return false
  }
}

// Ejecutar test
testPDFSimple()
