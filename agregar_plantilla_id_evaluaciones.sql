-- ========================================
-- Agregar columna plantilla_id a la tabla evaluaciones
-- ========================================

-- Agregar la columna plantilla_id a la tabla evaluaciones
ALTER TABLE evaluaciones 
ADD COLUMN plantilla_id INTEGER REFERENCES plantillas(id);

-- Crear índice para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_evaluaciones_plantilla_id ON evaluaciones(plantilla_id);

-- Actualizar las evaluaciones existentes para que usen la plantilla del ciclo
UPDATE evaluaciones 
SET plantilla_id = ciclos_evaluacion.plantilla_id
FROM ciclos_evaluacion 
WHERE evaluaciones.ciclo_id = ciclos_evaluacion.id 
AND ciclos_evaluacion.plantilla_id IS NOT NULL;

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE '✅ Columna plantilla_id agregada correctamente a la tabla evaluaciones';
    RAISE NOTICE '✅ Índice creado para plantilla_id';
    RAISE NOTICE '✅ Evaluaciones existentes actualizadas con la plantilla de su ciclo';
END $$;
