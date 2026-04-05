import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import * as XLSX from 'xlsx'
import { Evaluacion, Trabajador, Area, ReporteConfig } from '@/types'
import { EvaluacionesService } from './evaluaciones'
import { TrabajadoresService } from './trabajadores'
import { AreasService } from './areas'

export class ReportesService {
  static async generarReporteIndividual(trabajadorId: number, cicloId: number): Promise<void> {
    try {
      // Obtener datos del trabajador
      const trabajador = await TrabajadoresService.getById(trabajadorId)
      if (!trabajador) throw new Error('Trabajador no encontrado')

      // Obtener resultados 360°
      const resultados = await EvaluacionesService.getResultados360(trabajadorId, cicloId)

      // Generar HTML del reporte
      const html = await this.generateReporteIndividualHTML(trabajador, resultados)

      // Convertir a PDF
      const pdf = await this.htmlToPDF(html)
      
      // Descargar PDF
      pdf.save(`reporte_individual_${trabajador.codigo}_${new Date().toISOString().split('T')[0]}.pdf`)
    } catch (error) {
      throw new Error(`Error generando reporte individual: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    }
  }

  static async generarReportePorArea(areaId: number, cicloId: number): Promise<void> {
    try {
      // Obtener datos del área
      const area = await AreasService.getById(areaId)
      if (!area) throw new Error('Área no encontrada')

      // Obtener trabajadores del área
      const trabajadores = await TrabajadoresService.getByArea(areaId)

      // Generar reporte para cada trabajador
      const reportesTrabajadores = await Promise.all(
        trabajadores.map(async (trabajador) => {
          const resultados = await EvaluacionesService.getResultados360(trabajador.id, cicloId)
          return {
            trabajador,
            resultados
          }
        })
      )

      // Generar HTML del reporte
      const html = await this.generateReporteAreaHTML(area, reportesTrabajadores)

      // Convertir a PDF
      const pdf = await this.htmlToPDF(html)
      
      // Descargar PDF
      pdf.save(`reporte_area_${area.nombre}_${new Date().toISOString().split('T')[0]}.pdf`)
    } catch (error) {
      throw new Error(`Error generando reporte de área: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    }
  }

  static async generarReporteGeneral(cicloId: number): Promise<void> {
    try {
      // Obtener estadísticas del ciclo
      const estadisticas = await EvaluacionesService.getEstadisticasCiclo(cicloId)

      // Obtener todas las áreas
      const areas = await AreasService.getAll()

      // Generar reportes por área
      const reportesAreas = await Promise.all(
        areas.map(async (area) => {
          const trabajadores = await TrabajadoresService.getByArea(area.id)
          const reportesTrabajadores = await Promise.all(
            trabajadores.map(async (trabajador) => {
              const resultados = await EvaluacionesService.getResultados360(trabajador.id, cicloId)
              return {
                trabajador,
                resultados
              }
            })
          )

          return {
            area,
            trabajadores: reportesTrabajadores
          }
        })
      )

      // Generar HTML del reporte
      const html = await this.generateReporteGeneralHTML(estadisticas, reportesAreas)

      // Convertir a PDF
      const pdf = await this.htmlToPDF(html)
      
      // Descargar PDF
      pdf.save(`reporte_general_ciclo_${cicloId}_${new Date().toISOString().split('T')[0]}.pdf`)
    } catch (error) {
      throw new Error(`Error generando reporte general: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    }
  }

  static async exportarEvaluacionesExcel(cicloId: number): Promise<void> {
    try {
      // Obtener evaluaciones del ciclo
      const evaluaciones = await EvaluacionesService.getByCiclo(cicloId)

      // Preparar datos para Excel
      const exportData = evaluaciones.map(evaluacion => ({
        'Trabajador Código': evaluacion.trabajador?.codigo || '',
        'Trabajador Nombre': evaluacion.trabajador?.nombre || '',
        'Área': evaluacion.trabajador?.area?.nombre || '',
        'Puesto': evaluacion.trabajador?.puesto || '',
        'Tipo Evaluador': evaluacion.tipo_evaluador,
        'Estado': evaluacion.estado,
        'Puntaje Ponderado': evaluacion.puntaje_ponderado || '',
        'Clasificación': evaluacion.clasificacion || '',
        'Fecha Creación': new Date(evaluacion.created_at).toLocaleDateString('es-PE')
      }))

      // Crear workbook
      const worksheet = XLSX.utils.json_to_sheet(exportData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Evaluaciones')

      // Generar blob
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })

      // Descargar archivo
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `evaluaciones_ciclo_${cicloId}_${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      throw new Error(`Error exportando evaluaciones a Excel: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    }
  }

  static async exportarResultadosExcel(cicloId: number): Promise<void> {
    try {
      // Obtener todas las áreas y trabajadores
      const areas = await AreasService.getAll()
      const exportData: any[] = []

      // Para cada área, obtener resultados de trabajadores
      for (const area of areas) {
        const trabajadores = await TrabajadoresService.getByArea(area.id)

        for (const trabajador of trabajadores) {
          try {
            const resultados = await EvaluacionesService.getResultados360(trabajador.id, cicloId)

            exportData.push({
              'Área': area.nombre,
              'Trabajador Código': trabajador.codigo,
              'Trabajador Nombre': trabajador.nombre,
              'Puesto': trabajador.puesto,
              'Residencia': trabajador.residencia,
              'Service': trabajador.service,
              'Puntaje Final 360°': resultados.puntajeFinal.toFixed(2),
              'Clasificación Final': resultados.clasificacionFinal,
              'Evaluaciones RRHH': resultados.detallePorTipo.rrhh.cantidad,
              'Promedio RRHH': resultados.detallePorTipo.rrhh.promedio.toFixed(2),
              'Evaluaciones Jefe': resultados.detallePorTipo.jefe.cantidad,
              'Promedio Jefe': resultados.detallePorTipo.jefe.promedio.toFixed(2),
              'Evaluaciones Par': resultados.detallePorTipo.par.cantidad,
              'Promedio Par': resultados.detallePorTipo.par.promedio.toFixed(2)
            })
          } catch (error) {
            // Trabajador sin evaluaciones completadas
            exportData.push({
              'Área': area.nombre,
              'Trabajador Código': trabajador.codigo,
              'Trabajador Nombre': trabajador.nombre,
              'Puesto': trabajador.puesto,
              'Residencia': trabajador.residencia,
              'Service': trabajador.service,
              'Puntaje Final 360°': 'N/A',
              'Clasificación Final': 'Sin evaluaciones',
              'Evaluaciones RRHH': 0,
              'Promedio RRHH': 0,
              'Evaluaciones Jefe': 0,
              'Promedio Jefe': 0,
              'Evaluaciones Par': 0,
              'Promedio Par': 0
            })
          }
        }
      }

      // Crear workbook
      const worksheet = XLSX.utils.json_to_sheet(exportData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Resultados')

      // Generar blob
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })

      // Descargar archivo
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `resultados_ciclo_${cicloId}_${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      throw new Error(`Error exportando resultados a Excel: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    }
  }

  private static async generateReporteIndividualHTML(trabajador: Trabajador, resultados: any): Promise<string> {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Reporte Individual - ${trabajador.nombre}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .info-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .info-table th, .info-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .info-table th { background-color: #f2f2f2; }
          .resultados { margin-top: 20px; }
          .puntaje-final { font-size: 24px; font-weight: bold; text-align: center; margin: 20px 0; }
          .alto { color: #10b981; }
          .bueno { color: #3b82f6; }
          .regular { color: #f59e0b; }
          .bajo { color: #ef4444; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>SEACORP PERÚ</h1>
          <h2>Reporte de Evaluación de Desempeño</h2>
          <h3>${trabajador.nombre}</h3>
        </div>

        <table class="info-table">
          <tr>
            <th>Código</th>
            <td>${trabajador.codigo}</td>
            <th>Área</th>
            <td>${trabajador.area?.nombre || 'N/A'}</td>
          </tr>
          <tr>
            <th>Puesto</th>
            <td>${trabajador.puesto}</td>
            <th>Residencia</th>
            <td>${trabajador.residencia}</td>
          </tr>
          <tr>
            <th>Service</th>
            <td>${trabajador.service}</td>
            <th>Fecha Reporte</th>
            <td>${new Date().toLocaleDateString('es-PE')}</td>
          </tr>
        </table>

        <div class="resultados">
          <h3>Resultados de Evaluación 360°</h3>
          
          <div class="puntaje-final ${resultados.clasificacionFinal.toLowerCase()}">
            Puntaje Final: ${resultados.puntajeFinal.toFixed(2)}<br>
            Clasificación: ${resultados.clasificacionFinal}
          </div>

          <table class="info-table">
            <tr>
              <th>Tipo Evaluador</th>
              <th>Cantidad</th>
              <th>Promedio</th>
            </tr>
            <tr>
              <td>RRHH</td>
              <td>${resultados.detallePorTipo.rrhh.cantidad}</td>
              <td>${resultados.detallePorTipo.rrhh.cantidad > 0 ? resultados.detallePorTipo.rrhh.promedio.toFixed(2) : 'No evaluado'}</td>
            </tr>
            <tr>
              <td>Jefe</td>
              <td>${resultados.detallePorTipo.jefe.cantidad}</td>
              <td>${resultados.detallePorTipo.jefe.cantidad > 0 ? resultados.detallePorTipo.jefe.promedio.toFixed(2) : 'No evaluado'}</td>
            </tr>
            <tr>
              <td>Par</td>
              <td>${resultados.detallePorTipo.par.cantidad}</td>
              <td>${resultados.detallePorTipo.par.cantidad > 0 ? resultados.detallePorTipo.par.promedio.toFixed(2) : 'No evaluado'}</td>
            </tr>
          </table>
        </div>
      </body>
      </html>
    `
  }

  private static async generateReporteAreaHTML(area: Area, reportesTrabajadores: any[]): Promise<string> {
    const trabajadoresHTML = reportesTrabajadores.map(({ trabajador, resultados }) => `
      <tr>
        <td>${trabajador.codigo}</td>
        <td>${trabajador.nombre}</td>
        <td>${trabajador.puesto}</td>
        <td>${resultados.puntajeFinal.toFixed(2)}</td>
        <td class="${resultados.clasificacionFinal.toLowerCase()}">${resultados.clasificacionFinal}</td>
        <td>${resultados.detallePorTipo.rrhh.cantidad}</td>
        <td>${resultados.detallePorTipo.rrhh.cantidad > 0 ? resultados.detallePorTipo.rrhh.promedio.toFixed(2) : 'No evaluado'}</td>
        <td>${resultados.detallePorTipo.jefe.cantidad}</td>
        <td>${resultados.detallePorTipo.jefe.cantidad > 0 ? resultados.detallePorTipo.jefe.promedio.toFixed(2) : 'No evaluado'}</td>
        <td>${resultados.detallePorTipo.par.cantidad}</td>
        <td>${resultados.detallePorTipo.par.cantidad > 0 ? resultados.detallePorTipo.par.promedio.toFixed(2) : 'No evaluado'}</td>
      </tr>
    `).join('')

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Reporte Área - ${area.nombre}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .alto { color: #10b981; }
          .bueno { color: #3b82f6; }
          .regular { color: #f59e0b; }
          .bajo { color: #ef4444; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>SEACORP PERÚ</h1>
          <h2>Reporte de Evaluación por Área</h2>
          <h3>${area.nombre}</h3>
          <p>Fecha: ${new Date().toLocaleDateString('es-PE')}</p>
        </div>

        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th>Puesto</th>
              <th>Puntaje Final</th>
              <th>Clasificación</th>
              <th colspan="2">RRHH</th>
              <th colspan="2">Jefe</th>
              <th colspan="2">Par</th>
            </tr>
            <tr>
              <th colspan="4"></th>
              <th>Cant</th>
              <th>Prom</th>
              <th>Cant</th>
              <th>Prom</th>
              <th>Cant</th>
              <th>Prom</th>
            </tr>
          </thead>
          <tbody>
            ${trabajadoresHTML}
          </tbody>
        </table>
      </body>
      </html>
    `
  }

  private static async generateReporteGeneralHTML(estadisticas: any, reportesAreas: any[]): Promise<string> {
    const areasHTML = reportesAreas.map(({ area, trabajadores }) => {
      const promedioArea = trabajadores.reduce((sum: number, t: any) => sum + t.resultados.puntajeFinal, 0) / trabajadores.length
      return `
        <tr>
          <td>${area.nombre}</td>
          <td>${trabajadores.length}</td>
          <td>${promedioArea.toFixed(2)}</td>
          <td>${trabajadores.filter((t: any) => t.resultados.clasificacionFinal.includes('Alto')).length}</td>
          <td>${trabajadores.filter((t: any) => t.resultados.clasificacionFinal.includes('Bueno')).length}</td>
          <td>${trabajadores.filter((t: any) => t.resultados.clasificacionFinal.includes('Regular')).length}</td>
          <td>${trabajadores.filter((t: any) => t.resultados.clasificacionFinal.includes('Bajo')).length}</td>
        </tr>
      `
    }).join('')

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Reporte General</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .estadisticas { display: flex; justify-content: space-around; margin-bottom: 30px; }
          .stat-box { text-align: center; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
          .stat-number { font-size: 24px; font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>SEACORP PERÚ</h1>
          <h2>Reporte General de Evaluación de Desempeño</h2>
          <p>Fecha: ${new Date().toLocaleDateString('es-PE')}</p>
        </div>

        <div class="estadisticas">
          <div class="stat-box">
            <div class="stat-number">${estadisticas.totalEvaluaciones}</div>
            <div>Total Evaluaciones</div>
          </div>
          <div class="stat-box">
            <div class="stat-number">${estadisticas.evaluacionesCompletadas}</div>
            <div>Completadas</div>
          </div>
          <div class="stat-box">
            <div class="stat-number">${estadisticas.promedioGeneral.toFixed(2)}</div>
            <div>Promedio General</div>
          </div>
          <div class="stat-box">
            <div class="stat-number">${estadisticas.evaluacionesPendientes}</div>
            <div>Pendientes</div>
          </div>
        </div>

        <h3>Resumen por Áreas</h3>
        <table>
          <thead>
            <tr>
              <th>Área</th>
              <th>Trabajadores</th>
              <th>Promedio</th>
              <th>Alto</th>
              <th>Bueno</th>
              <th>Regular</th>
              <th>Bajo</th>
            </tr>
          </thead>
          <tbody>
            ${areasHTML}
          </tbody>
        </table>
      </body>
      </html>
    `
  }

  private static async htmlToPDF(html: string): Promise<jsPDF> {
    try {
      console.log('🔄 Generando PDF desde HTML...')
      
      // EXTRAER DATOS DEL HTML Y CREAR PDF DIRECTAMENTE SIN HTML2CANVAS
      const trabajadorMatch = html.match(/<h3>([^<]+)<\/h3>/)
      const codigoMatch = html.match(/Código<\/th>\s*<td>([^<]+)<\/td>/)
      const areaMatch = html.match(/Área<\/th>\s*<td>([^<]+)<\/td>/)
      const puestoMatch = html.match(/Puesto<\/th>\s*<td>([^<]+)<\/td>/)
      
      const trabajadorNombre = trabajadorMatch ? trabajadorMatch[1] : 'Trabajador'
      const trabajadorCodigo = codigoMatch ? codigoMatch[1] : 'N/A'
      const trabajadorArea = areaMatch ? areaMatch[1] : 'N/A'
      const trabajadorPuesto = puestoMatch ? puestoMatch[1] : 'N/A'
      
      console.log('📊 Datos extraídos:', { trabajadorNombre, trabajadorCodigo, trabajadorArea, trabajadorPuesto })
      
      // CREAR PDF DIRECTAMENTE CON JSPDF (SIN HTML2CANVAS)
      const pdf = new jsPDF('p', 'mm', 'a4')
      
      // ENCABEZADO
      pdf.setFontSize(20)
      pdf.text('SEACORP PERÚ', 105, 20, { align: 'center' })
      
      pdf.setFontSize(16)
      pdf.text('Reporte de Evaluación de Desempeño', 105, 30, { align: 'center' })
      
      pdf.setFontSize(14)
      pdf.text(trabajadorNombre, 105, 40, { align: 'center' })
      
      // LÍNEA SEPARADORA
      pdf.setLineWidth(0.5)
      pdf.line(20, 45, 190, 45)
      
      // INFORMACIÓN DEL TRABAJADOR
      pdf.setFontSize(12)
      pdf.text('Información del Trabajador:', 20, 55)
      
      pdf.setFontSize(10)
      const infoData = [
        ['Código:', trabajadorCodigo],
        ['Área:', trabajadorArea],
        ['Puesto:', trabajadorPuesto],
        ['Fecha Reporte:', new Date().toLocaleDateString('es-PE')]
      ]
      
      let yPos = 65
      infoData.forEach(([label, value]) => {
        pdf.text(label, 25, yPos)
        pdf.text(value, 60, yPos)
        yPos += 8
      })
      
      // EXTRAER DATOS DE RESULTADOS DEL HTML
      console.log('🔍 HTML generado (fragmento de tabla):', html.substring(html.indexOf('<table class="info-table">'), html.indexOf('</table>') + 8))
      
      const puntajeFinalMatch = html.match(/Puntaje Final: ([\d.]+)/)
      const clasificacionMatch = html.match(/Clasificación: ([^<]+)/)
      
      // Regex más flexibles para encontrar los datos
      const rrhhMatch = html.match(/RRHH<\/td>\s*<td>(\d+)<\/td>\s*<td>([^<]+)<\/td>/) ||
                        html.match(/RRHH<\/td>.*?<td>(\d+)<\/td>.*?<td>([^<]+)<\/td>/)
      const jefeMatch = html.match(/Jefe<\/td>\s*<td>(\d+)<\/td>\s*<td>([^<]+)<\/td>/) ||
                        html.match(/Jefe<\/td>.*?<td>(\d+)<\/td>.*?<td>([^<]+)<\/td>/)
      const parMatch = html.match(/Par<\/td>\s*<td>(\d+)<\/td>\s*<td>([^<]+)<\/td>/) ||
                       html.match(/Par<\/td>.*?<td>(\d+)<\/td>.*?<td>([^<]+)<\/td>/)
      
      console.log('🔍 Matches encontrados:', { rrhhMatch, jefeMatch, parMatch })
      
      const puntajeFinal = puntajeFinalMatch ? puntajeFinalMatch[1] : 'N/A'
      const clasificacion = clasificacionMatch ? clasificacionMatch[1] : 'N/A'
      const rrhhCantidad = rrhhMatch ? rrhhMatch[1] : '0'
      const rrhhPromedio = rrhhMatch ? rrhhMatch[2] : 'No evaluado'
      const jefeCantidad = jefeMatch ? jefeMatch[1] : '0'
      const jefePromedio = jefeMatch ? jefeMatch[2] : 'No evaluado'
      const parCantidad = parMatch ? parMatch[1] : '0'
      const parPromedio = parMatch ? parMatch[2] : 'No evaluado'
      
      console.log('📊 Datos de resultados extraídos:', { 
        puntajeFinal, clasificacion, 
        rrhhCantidad, rrhhPromedio, 
        jefeCantidad, jefePromedio, 
        parCantidad, parPromedio 
      })
      
      // RESULTADOS
      yPos += 10
      pdf.setFontSize(12)
      pdf.text('Resultados de Evaluación:', 20, yPos)
      
      yPos += 10
      pdf.setFontSize(10)
      const resultadosData = [
        ['Evaluación 360°:', puntajeFinal],
        ['Clasificación:', clasificacion],
        ['Evaluador RRHH:', `${rrhhCantidad} - ${rrhhPromedio}`],
        ['Evaluador Jefe:', `${jefeCantidad} - ${jefePromedio}`],
        ['Evaluador Par:', `${parCantidad} - ${parPromedio}`]
      ]
      
      resultadosData.forEach(([label, value]) => {
        pdf.text(label, 25, yPos)
        pdf.text(value, 80, yPos)
        yPos += 8
      })
      
      // PIE DE PÁGINA
      yPos = 270
      pdf.setFontSize(8)
      pdf.text('Generado el: ' + new Date().toLocaleString('es-PE'), 105, yPos, { align: 'center' })
      pdf.text('Sistema de Evaluación de Desempeño - SEACORP PERÚ', 105, yPos + 5, { align: 'center' })
      
      console.log('✅ PDF generado correctamente (método directo)')
      return pdf
      
    } catch (error) {
      console.error('❌ Error en htmlToPDF:', error)
      throw new Error(`Error generando PDF: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    }
  }
}
