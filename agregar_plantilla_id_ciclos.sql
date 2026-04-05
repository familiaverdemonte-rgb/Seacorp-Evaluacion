-- Agregar columna plantilla_id a la tabla ciclos_evaluacion
-- Esto permitirá que cada ciclo tenga una plantilla específica

ALTER TABLE ciclos_evaluacion 
ADD COLUMN plantilla_id INTEGER REFERENCES plantillas(id);

-- Actualizar ciclos existentes para que usen la plantilla por defecto (ID: 1)
UPDATE ciclos_evaluacion 
SET plantilla_id = 1 
WHERE plantilla_id IS NULL;

-- Opcional: Crear un índice para mejorar el rendimiento
CREATE INDEX idx_ciclos_evaluacion_plantilla_id ON ciclos_evaluacion(plantilla_id);

-- Verificar los cambios
SELECT * FROM ciclos_evaluacion LIMIT 5;
