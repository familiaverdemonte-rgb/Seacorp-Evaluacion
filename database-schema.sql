-- ========================================
-- SEACORP PERÚ - Sistema de Evaluación
-- Esquema de Base de Datos
-- ========================================

-- Tabla de Áreas
CREATE TABLE IF NOT EXISTS areas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Trabajadores
CREATE TABLE IF NOT EXISTS trabajadores (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    nombre VARCHAR(200) NOT NULL,
    area_id INTEGER NOT NULL REFERENCES areas(id),
    puesto VARCHAR(100) NOT NULL,
    residencia VARCHAR(200),
    service VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Ciclos de Evaluación
CREATE TABLE IF NOT EXISTS ciclos_evaluacion (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    estado VARCHAR(20) DEFAULT 'abierto' CHECK (estado IN ('abierto', 'cerrado')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Plantillas de Evaluación
CREATE TABLE IF NOT EXISTS plantillas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Secciones de Plantillas
CREATE TABLE IF NOT EXISTS secciones (
    id SERIAL PRIMARY KEY,
    plantilla_id INTEGER NOT NULL REFERENCES plantillas(id),
    nombre VARCHAR(100) NOT NULL,
    peso DECIMAL(3,2) DEFAULT 1.00 CHECK (peso > 0),
    orden INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Preguntas
CREATE TABLE IF NOT EXISTS preguntas (
    id SERIAL PRIMARY KEY,
    seccion_id INTEGER NOT NULL REFERENCES secciones(id),
    texto TEXT NOT NULL,
    tipo VARCHAR(20) DEFAULT 'escala_1_5' CHECK (tipo IN ('escala_1_5')),
    peso DECIMAL(3,2) DEFAULT 1.00 CHECK (peso > 0),
    es_general BOOLEAN DEFAULT false,
    area_id INTEGER REFERENCES areas(id),
    orden INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Evaluaciones
CREATE TABLE IF NOT EXISTS evaluaciones (
    id SERIAL PRIMARY KEY,
    trabajador_id INTEGER NOT NULL REFERENCES trabajadores(id),
    evaluador_id VARCHAR(50) NOT NULL, -- ID del evaluador (puede ser RRHH, jefe, o par)
    tipo_evaluador VARCHAR(10) NOT NULL CHECK (tipo_evaluador IN ('rrhh', 'jefe', 'par')),
    ciclo_id INTEGER NOT NULL REFERENCES ciclos_evaluacion(id),
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_progreso', 'completada')),
    puntaje_ponderado DECIMAL(5,2),
    clasificacion VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(trabajador_id, evaluador_id, ciclo_id, tipo_evaluador)
);

-- Tabla de Respuestas
CREATE TABLE IF NOT EXISTS respuestas (
    id SERIAL PRIMARY KEY,
    evaluacion_id INTEGER NOT NULL REFERENCES evaluaciones(id),
    pregunta_id INTEGER NOT NULL REFERENCES preguntas(id),
    puntaje INTEGER CHECK (puntaje >= 1 AND puntaje <= 5),
    comentario TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(evaluacion_id, pregunta_id)
);

-- ========================================
-- ÍNDICES para mejor rendimiento
-- ========================================

CREATE INDEX IF NOT EXISTS idx_trabajadores_area_id ON trabajadores(area_id);
CREATE INDEX IF NOT EXISTS idx_trabajadores_codigo ON trabajadores(codigo);
CREATE INDEX IF NOT EXISTS idx_ciclos_evaluacion_estado ON ciclos_evaluacion(estado);
CREATE INDEX IF NOT EXISTS idx_preguntas_seccion_id ON preguntas(seccion_id);
CREATE INDEX IF NOT EXISTS idx_preguntas_area_id ON preguntas(area_id);
CREATE INDEX IF NOT EXISTS idx_evaluaciones_trabajador_id ON evaluaciones(trabajador_id);
CREATE INDEX IF NOT EXISTS idx_evaluaciones_evaluador_id ON evaluaciones(evaluador_id);
CREATE INDEX IF NOT EXISTS idx_evaluaciones_ciclo_id ON evaluaciones(ciclo_id);
CREATE INDEX IF NOT EXISTS idx_evaluaciones_estado ON evaluaciones(estado);
CREATE INDEX IF NOT EXISTS idx_respuestas_evaluacion_id ON respuestas(evaluacion_id);
CREATE INDEX IF NOT EXISTS idx_respuestas_pregunta_id ON respuestas(pregunta_id);

-- ========================================
-- TRIGGERS para updated_at automático
-- ========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger a todas las tablas
CREATE TRIGGER update_areas_updated_at BEFORE UPDATE ON areas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_trabajadores_updated_at BEFORE UPDATE ON trabajadores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ciclos_evaluacion_updated_at BEFORE UPDATE ON ciclos_evaluacion FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_plantillas_updated_at BEFORE UPDATE ON plantillas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_secciones_updated_at BEFORE UPDATE ON secciones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_preguntas_updated_at BEFORE UPDATE ON preguntas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_evaluaciones_updated_at BEFORE UPDATE ON evaluaciones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_respuestas_updated_at BEFORE UPDATE ON respuestas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- DATOS DE EJEMPLO (opcional)
-- ========================================

-- Insertar áreas de ejemplo
INSERT INTO areas (nombre) VALUES 
('Recursos Humanos'),
('Operaciones'),
('Tecnología'),
('Finanzas'),
('Marketing')
ON CONFLICT (nombre) DO NOTHING;

-- Insertar ciclo de evaluación de ejemplo
INSERT INTO ciclos_evaluacion (nombre, fecha_inicio, fecha_fin, estado) VALUES 
('Ciclo 2025-Q1', '2025-01-01', '2025-03-31', 'abierto')
ON CONFLICT DO NOTHING;

-- Insertar plantilla de ejemplo
INSERT INTO plantillas (nombre, descripcion) VALUES 
('Evaluación de Desempeño 360°', 'Plantilla estándar para evaluación de desempeño con feedback 360°')
ON CONFLICT DO NOTHING;

-- ========================================
-- POLÍTICAS DE SEGURIDAD (RLS)
-- ========================================

-- Habilitar Row Level Security
ALTER TABLE areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE trabajadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE ciclos_evaluacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE plantillas ENABLE ROW LEVEL SECURITY;
ALTER TABLE secciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE preguntas ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE respuestas ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (ajustar según necesidades)
CREATE POLICY "Allow read access to authenticated users" ON areas FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow read access to authenticated users" ON trabajadores FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow read access to authenticated users" ON ciclos_evaluacion FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow read access to authenticated users" ON plantillas FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow read access to authenticated users" ON secciones FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow read access to authenticated users" ON preguntas FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow read access to authenticated users" ON evaluaciones FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow read access to authenticated users" ON respuestas FOR SELECT USING (auth.role() = 'authenticated');

-- Políticas de inserción (ajustar según necesidades)
CREATE POLICY "Allow insert to authenticated users" ON evaluaciones FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow insert to authenticated users" ON respuestas FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow insert to authenticated users" ON areas FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow insert to authenticated users" ON trabajadores FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow insert to authenticated users" ON ciclos_evaluacion FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow insert to authenticated users" ON plantillas FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow insert to authenticated users" ON secciones FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow insert to authenticated users" ON preguntas FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Políticas de actualización (ajustar según necesidades)
CREATE POLICY "Allow update to authenticated users" ON evaluaciones FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow update to authenticated users" ON respuestas FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow update to authenticated users" ON areas FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow update to authenticated users" ON trabajadores FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow update to authenticated users" ON ciclos_evaluacion FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow update to authenticated users" ON plantillas FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow update to authenticated users" ON secciones FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow update to authenticated users" ON preguntas FOR UPDATE USING (auth.role() = 'authenticated');
