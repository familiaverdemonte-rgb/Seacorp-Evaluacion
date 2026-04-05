import { supabase } from '@/lib/supabase'
import { Trabajador, Area, ExcelImportResult } from '@/types'
import * as XLSX from 'xlsx'

export class TrabajadoresService {
  static async getAll(): Promise<Trabajador[]> {
    const { data, error } = await supabase
      .from('trabajadores')
      .select(`
        *,
        area:areas(*)
      `)
      .order('nombre')

    if (error) throw new Error(error.message)
    return data || []
  }

  static async getById(id: number): Promise<Trabajador | null> {
    const { data, error } = await supabase
      .from('trabajadores')
      .select(`
        *,
        area:areas(*)
      `)
      .eq('id', id)
      .single()

    if (error) throw new Error(error.message)
    return data
  }

  static async getByCodigo(codigo: string): Promise<Trabajador | null> {
    const { data, error } = await supabase
      .from('trabajadores')
      .select(`
        *,
        area:areas(*)
      `)
      .eq('codigo', codigo)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw new Error(error.message)
    }
    return data
  }

  static async create(trabajador: Omit<Trabajador, 'id' | 'area'>): Promise<Trabajador> {
    const { data, error } = await supabase
      .from('trabajadores')
      .insert(trabajador)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  }

  static async update(id: number, trabajador: Partial<Trabajador>): Promise<Trabajador> {
    const { data, error } = await supabase
      .from('trabajadores')
      .update(trabajador)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  }

  static async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from('trabajadores')
      .delete()
      .eq('id', id)

    if (error) throw new Error(error.message)
  }

  static async search(query: string): Promise<Trabajador[]> {
    const { data, error } = await supabase
      .from('trabajadores')
      .select(`
        *,
        area:areas(*)
      `)
      .or(`nombre.ilike.%${query}%,codigo.ilike.%${query}%,puesto.ilike.%${query}%`)
      .order('nombre')

    if (error) throw new Error(error.message)
    return data || []
  }

  static async getByArea(areaId: number): Promise<Trabajador[]> {
    const { data, error } = await supabase
      .from('trabajadores')
      .select(`
        *,
        area:areas(*)
      `)
      .eq('area_id', areaId)
      .order('nombre')

    if (error) throw new Error(error.message)
    return data || []
  }

  static async importFromExcel(file: File): Promise<ExcelImportResult> {
    const result: ExcelImportResult = {
      exitosos: 0,
      errores: 0,
      trabajadoresCreados: [],
      erroresDetallados: []
    }

    // Función para normalizar texto (quitar tildes y caracteres especiales)
    const normalizeText = (text: string): string => {
      return text
        .toString()
        .toLowerCase()
        .trim()
        .normalize('NFD') // Descomponer caracteres acentuados
        .replace(/[\u0300-\u036f]/g, '') // Quitar diacríticos (tildes)
        .replace(/\s+/g, ' ') // Unificar espacios
    }

    try {
      // Leer el archivo Excel
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data, { type: 'array' })
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(worksheet)

      // Obtener áreas existentes
      const { data: areas, error: areasError } = await supabase
        .from('areas')
        .select('*')

      if (areasError) throw new Error(areasError.message)

      // Crear mapa con nombres normalizados para comparación flexible
      const areaMap = new Map<string, { id: number; nombre: string }>()
      areas?.forEach(area => {
        const normalizedName = normalizeText(area.nombre)
        areaMap.set(normalizedName, { id: area.id, nombre: area.nombre })
      })

      // Obtener trabajadores existentes para verificar códigos duplicados
      const { data: existingTrabajadores, error: trabajadoresError } = await supabase
        .from('trabajadores')
        .select('codigo, nombre')

      if (trabajadoresError) throw new Error(trabajadoresError.message)

      // Crear mapa de códigos normalizados para comparación flexible
      const codigoMap = new Map<string, { codigo: string; nombre: string }>()
      existingTrabajadores?.forEach(trabajador => {
        const normalizedCodigo = normalizeText(trabajador.codigo)
        codigoMap.set(normalizedCodigo, { 
          codigo: trabajador.codigo, 
          nombre: trabajador.nombre 
        })
      })

      // Procesar cada fila
      for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i] as any
        const rowNum = i + 2 // Excel rows start at 2 (1 is header)

        try {
          // Validar campos requeridos
          if (!row.codigo || !row.nombre || !row.area || !row.puesto || !row.residencia || !row.service) {
            result.erroresDetallados.push({
              fila: rowNum,
              error: 'Faltan campos requeridos (codigo, nombre, area, puesto, residencia, service)',
              datos: row
            })
            result.errores++
            continue
          }

          // Verificar si el trabajador ya existe (con normalización flexible)
          const normalizedCodigo = normalizeText(row.codigo.toString())
          const existingCodigo = codigoMap.get(normalizedCodigo)
          
          if (existingCodigo) {
            result.erroresDetallados.push({
              fila: rowNum,
              error: `El código "${row.codigo}" ya existe (similar a: "${existingCodigo.codigo}" de ${existingCodigo.nombre})`,
              datos: row
            })
            result.errores++
            continue
          }

          // Buscar área con nombre normalizado
          const normalizedAreaName = normalizeText(row.area.toString())
          let areaInfo = areaMap.get(normalizedAreaName)
          
          if (!areaInfo) {
            // Crear nueva área con el nombre original del Excel
            const { data: newArea, error: areaError } = await supabase
              .from('areas')
              .insert({ nombre: row.area.toString().trim() })
              .select()
              .single()

            if (areaError) {
              result.erroresDetallados.push({
                fila: rowNum,
                error: `Error al crear área: ${areaError.message}`,
                datos: row
              })
              result.errores++
              continue
            }

            areaInfo = { id: newArea.id, nombre: newArea.nombre }
            areaMap.set(normalizedAreaName, areaInfo)
          }

          // Crear trabajador
          const trabajador = await this.create({
            codigo: row.codigo.toString(),
            nombre: row.nombre.toString(),
            area_id: areaInfo.id,
            puesto: row.puesto.toString(),
            residencia: row.residencia.toString(),
            service: row.service.toString()
          })

          result.trabajadoresCreados.push(trabajador)
          result.exitosos++

        } catch (error) {
          result.erroresDetallados.push({
            fila: rowNum,
            error: error instanceof Error ? error.message : 'Error desconocido',
            datos: row
          })
          result.errores++
        }
      }

    } catch (error) {
      throw new Error(`Error al procesar el archivo Excel: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    }

    return result
  }

  static async exportToExcel(trabajadores: Trabajador[]): Promise<void> {
    try {
      console.log('🚀 Iniciando exportación de trabajadores a Excel...')
      
      // Preparar datos para exportación (formato compatible con importación)
      const exportData = trabajadores.map(trabajador => ({
        codigo: trabajador.codigo,
        nombre: trabajador.nombre,
        area: trabajador.area?.nombre || '',
        puesto: trabajador.puesto,
        residencia: trabajador.residencia,
        service: trabajador.service
      }))

      console.log('📊 Datos preparados:', exportData.length, 'trabajadores')

      // Crear workbook
      const worksheet = XLSX.utils.json_to_sheet(exportData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Trabajadores')

      // Generar blob
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })

      // Descargar archivo automáticamente
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `trabajadores_${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      console.log('✅ Excel descargado correctamente')
    } catch (error) {
      console.error('❌ Error en exportToExcel:', error)
      throw new Error(`Error exportando a Excel: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    }
  }

  static async downloadPlantillaImportacion(): Promise<void> {
    try {
      console.log('📋 Generando plantilla de importación...')
      
      // Crear datos de ejemplo con el formato exacto que espera la importación
      const plantillaData = [
        {
          codigo: 'EJEMPLO001',
          nombre: 'Juan Pérez Ejemplo',
          area: 'Tecnología',
          puesto: 'Desarrollador Senior',
          residencia: 'Lima',
          service: 'TI'
        },
        {
          codigo: 'EJEMPLO002', 
          nombre: 'María García Ejemplo',
          area: 'Recursos Humanos',
          puesto: 'Analista de RRHH',
          residencia: 'Arequipa',
          service: 'RRHH'
        }
      ]

      // Crear workbook
      const worksheet = XLSX.utils.json_to_sheet(plantillaData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Trabajadores')

      // Generar blob
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })

      // Descargar archivo automáticamente
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `plantilla_importacion_trabajadores.xlsx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      console.log('✅ Plantilla de importación descargada correctamente')
    } catch (error) {
      console.error('❌ Error generando plantilla:', error)
      throw new Error(`Error generando plantilla: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    }
  }

  static async getTrabajadoresAsignadosACiclo(cicloId: number): Promise<Trabajador[]> {
    try {
      // Obtener trabajadores únicos que tienen evaluaciones asignadas a este ciclo
      const { data, error } = await supabase
        .from('evaluaciones')
        .select(`
          trabajador_id,
          trabajador:trabajadores(
            *,
            area:areas(*)
          )
        `)
        .eq('ciclo_id', cicloId)
        .not('trabajador_id', 'is', null)

      if (error) throw new Error(error.message)

      // Eliminar duplicados y extraer datos de trabajadores
      const trabajadoresUnicos = new Map()
      
      data?.forEach(evaluacion => {
        if (evaluacion.trabajador && !trabajadoresUnicos.has(evaluacion.trabajador_id)) {
          trabajadoresUnicos.set(evaluacion.trabajador_id, evaluacion.trabajador)
        }
      })

      // Obtener conteo de evaluaciones para cada trabajador
      const trabajadoresConEvaluaciones = await Promise.all(
        Array.from(trabajadoresUnicos.values()).map(async (trabajador) => {
          const { data: evaluaciones, error: errorEvaluaciones } = await supabase
            .from('evaluaciones')
            .select('*')
            .eq('trabajador_id', trabajador.id)
            .eq('ciclo_id', cicloId)

          if (errorEvaluaciones) throw new Error(errorEvaluaciones.message)

          return {
            ...trabajador,
            evaluaciones: evaluaciones || [],
            evaluacionesCount: evaluaciones?.length || 0
          }
        })
      )

      return trabajadoresConEvaluaciones
    } catch (error) {
      console.error('Error obteniendo trabajadores asignados al ciclo:', error)
      throw new Error(`Error obteniendo trabajadores asignados: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    }
  }
}
