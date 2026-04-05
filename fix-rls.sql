-- ========================================
-- CORRECCIÓN DE POLÍTICAS RLS PARA SEACORP PERÚ
-- ========================================

-- Deshabilitar RLS temporalmente para permitir inserciones iniciales
ALTER TABLE areas DISABLE ROW LEVEL SECURITY;
ALTER TABLE trabajadores DISABLE ROW LEVEL SECURITY;
ALTER TABLE ciclos_evaluacion DISABLE ROW LEVEL SECURITY;
ALTER TABLE plantillas DISABLE ROW LEVEL SECURITY;
ALTER TABLE secciones DISABLE ROW LEVEL SECURITY;
ALTER TABLE preguntas DISABLE ROW LEVEL SECURITY;
ALTER TABLE evaluaciones DISABLE ROW LEVEL SECURITY;
ALTER TABLE respuestas DISABLE ROW LEVEL SECURITY;

-- Insertar datos de ejemplo si no existen
INSERT INTO areas (nombre) VALUES 
('Recursos Humanos'),
('Operaciones'),
('Tecnología'),
('Finanzas'),
('Marketing')
ON CONFLICT (nombre) DO NOTHING;

-- Insertar ciclo de evaluación si no existe
INSERT INTO ciclos_evaluacion (nombre, fecha_inicio, fecha_fin, estado) VALUES 
('Ciclo 2025-Q1', '2025-01-01', '2025-03-31', 'abierto')
ON CONFLICT DO NOTHING;

-- Insertar plantilla si no existe
INSERT INTO plantillas (nombre, descripcion) VALUES 
('Evaluación de Desempeño 360°', 'Plantilla estándar para evaluación de desempeño con feedback 360°')
ON CONFLICT DO NOTHING;

-- Volver a habilitar RLS con políticas más permisivas
ALTER TABLE areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE trabajadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE ciclos_evaluacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE plantillas ENABLE ROW LEVEL SECURITY;
ALTER TABLE secciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE preguntas ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE respuestas ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas restrictivas
DROP POLICY IF EXISTS "Allow read access to authenticated users" ON areas;
DROP POLICY IF EXISTS "Allow insert to authenticated users" ON areas;
DROP POLICY IF EXISTS "Allow update to authenticated users" ON areas;

DROP POLICY IF EXISTS "Allow read access to authenticated users" ON trabajadores;
DROP POLICY IF EXISTS "Allow insert to authenticated users" ON trabajadores;
DROP POLICY IF EXISTS "Allow update to authenticated users" ON trabajadores;

DROP POLICY IF EXISTS "Allow read access to authenticated users" ON ciclos_evaluacion;
DROP POLICY IF EXISTS "Allow insert to authenticated users" ON ciclos_evaluacion;
DROP POLICY IF EXISTS "Allow update to authenticated users" ON ciclos_evaluacion;

DROP POLICY IF EXISTS "Allow read access to authenticated users" ON plantillas;
DROP POLICY IF EXISTS "Allow insert to authenticated users" ON plantillas;
DROP POLICY IF EXISTS "Allow update to authenticated users" ON plantillas;

DROP POLICY IF EXISTS "Allow read access to authenticated users" ON secciones;
DROP POLICY IF EXISTS "Allow insert to authenticated users" ON secciones;
DROP POLICY IF EXISTS "Allow update to authenticated users" ON secciones;

DROP POLICY IF EXISTS "Allow read access to authenticated users" ON preguntas;
DROP POLICY IF EXISTS "Allow insert to authenticated users" ON preguntas;
DROP POLICY IF EXISTS "Allow update to authenticated users" ON preguntas;

DROP POLICY IF EXISTS "Allow read access to authenticated users" ON evaluaciones;
DROP POLICY IF EXISTS "Allow insert to authenticated users" ON evaluaciones;
DROP POLICY IF EXISTS "Allow update to authenticated users" ON evaluaciones;

DROP POLICY IF EXISTS "Allow read access to authenticated users" ON respuestas;
DROP POLICY IF EXISTS "Allow insert to authenticated users" ON respuestas;
DROP POLICY IF EXISTS "Allow update to authenticated users" ON respuestas;

-- Crear políticas más permisivas para desarrollo
CREATE POLICY "Enable all operations for all users" ON areas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for all users" ON trabajadores FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for all users" ON ciclos_evaluacion FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for all users" ON plantillas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for all users" ON secciones FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for all users" ON preguntas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for all users" ON evaluaciones FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for all users" ON respuestas FOR ALL USING (true) WITH CHECK (true);

-- ========================================
-- VERIFICACIÓN
-- ========================================

-- Verificar que las políticas se aplicaron correctamente
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('areas', 'trabajadores', 'ciclos_evaluacion', 'plantillas', 'secciones', 'preguntas', 'evaluaciones', 'respuestas')
ORDER BY tablename;

-- Verificar políticas RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
