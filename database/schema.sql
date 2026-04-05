-- ========================================
-- ESQUEMA DE BASE DE DATOS - SEACORP PERÚ
-- SISTEMA DE EVALUACIÓN DE DESEMPEÑO
-- ========================================

-- 1. TABLA DE ÁREAS
CREATE TABLE areas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABLA DE TRABAJADORES
CREATE TABLE trabajadores (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    nombre VARCHAR(200) NOT NULL,
    area_id INTEGER NOT NULL REFERENCES areas(id) ON DELETE RESTRICT,
    puesto VARCHAR(100) NOT NULL,
    residencia VARCHAR(100) NOT NULL,
    service VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABLA DE CICLOS DE EVALUACIÓN
CREATE TABLE ciclos_evaluacion (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'abierto' CHECK (estado IN ('abierto', 'cerrado')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABLA DE PLANTILLAS
CREATE TABLE plantillas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TABLA DE SECCIONES
CREATE TABLE secciones (
    id SERIAL PRIMARY KEY,
    plantilla_id INTEGER NOT NULL REFERENCES plantillas(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    peso DECIMAL(5,2) NOT NULL DEFAULT 1.00 CHECK (peso > 0),
    orden INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. TABLA DE PREGUNTAS
CREATE TABLE preguntas (
    id SERIAL PRIMARY KEY,
    seccion_id INTEGER NOT NULL REFERENCES secciones(id) ON DELETE CASCADE,
    texto TEXT NOT NULL,
    tipo VARCHAR(20) NOT NULL DEFAULT 'escala_1_5' CHECK (tipo IN ('escala_1_5')),
    peso DECIMAL(5,2) NOT NULL DEFAULT 1.00 CHECK (peso > 0),
    es_general BOOLEAN NOT NULL DEFAULT true,
    area_id INTEGER REFERENCES areas(id) ON DELETE SET NULL,
    orden INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. TABLA DE EVALUACIONES
CREATE TABLE evaluaciones (
    id SERIAL PRIMARY KEY,
    trabajador_id INTEGER NOT NULL REFERENCES trabajadores(id) ON DELETE CASCADE,
    evaluador_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tipo_evaluador VARCHAR(20) NOT NULL CHECK (tipo_evaluador IN ('rrhh', 'jefe', 'par')),
    ciclo_id INTEGER NOT NULL REFERENCES ciclos_evaluacion(id) ON DELETE RESTRICT,
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_progreso', 'completada')),
    puntaje_ponderado DECIMAL(5,2),
    clasificacion VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(trabajador_id, evaluador_id, ciclo_id, tipo_evaluador)
);

-- 8. TABLA DE RESPUESTAS
CREATE TABLE respuestas (
    id SERIAL PRIMARY KEY,
    evaluacion_id INTEGER NOT NULL REFERENCES evaluaciones(id) ON DELETE CASCADE,
    pregunta_id INTEGER NOT NULL REFERENCES preguntas(id) ON DELETE CASCADE,
    puntaje INTEGER NOT NULL CHECK (puntaje >= 1 AND puntaje <= 5),
    comentario TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(evaluacion_id, pregunta_id)
);

-- ========================================
-- ÍNDICES PARA MEJORAR RENDIMIENTO
-- ========================================

-- Índices para búsquedas frecuentes
CREATE INDEX idx_trabajadores_codigo ON trabajadores(codigo);
CREATE INDEX idx_trabajadores_area_id ON trabajadores(area_id);
CREATE INDEX idx_evaluaciones_trabajador_id ON evaluaciones(trabajador_id);
CREATE INDEX idx_evaluaciones_evaluador_id ON evaluaciones(evaluador_id);
CREATE INDEX idx_evaluaciones_ciclo_id ON evaluaciones(ciclo_id);
CREATE INDEX idx_evaluaciones_estado ON evaluaciones(estado);
CREATE INDEX idx_evaluaciones_tipo_evaluador ON evaluaciones(tipo_evaluador);
CREATE INDEX idx_respuestas_evaluacion_id ON respuestas(evaluacion_id);
CREATE INDEX idx_respuestas_pregunta_id ON respuestas(pregunta_id);
CREATE INDEX idx_preguntas_seccion_id ON preguntas(seccion_id);
CREATE INDEX idx_preguntas_area_id ON preguntas(area_id);
CREATE INDEX idx_preguntas_es_general ON preguntas(es_general);
CREATE INDEX idx_secciones_plantilla_id ON secciones(plantilla_id);
CREATE INDEX idx_ciclos_evaluacion_estado ON ciclos_evaluacion(estado);

-- ========================================
-- TRIGGERS PARA ACTUALIZAR TIMESTAMP
-- ========================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para cada tabla
CREATE TRIGGER update_areas_updated_at BEFORE UPDATE ON areas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_trabajadores_updated_at BEFORE UPDATE ON trabajadores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ciclos_evaluacion_updated_at BEFORE UPDATE ON ciclos_evaluacion FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_plantillas_updated_at BEFORE UPDATE ON plantillas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_secciones_updated_at BEFORE UPDATE ON secciones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_preguntas_updated_at BEFORE UPDATE ON preguntas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_evaluaciones_updated_at BEFORE UPDATE ON evaluaciones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_respuestas_updated_at BEFORE UPDATE ON respuestas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- POLÍTICAS DE SEGURIDAD (ROW LEVEL SECURITY)
-- ========================================

-- Habilitar RLS en todas las tablas
ALTER TABLE areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE trabajadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE ciclos_evaluacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE plantillas ENABLE ROW LEVEL SECURITY;
ALTER TABLE secciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE preguntas ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE respuestas ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (ajustar según roles específicos)
CREATE POLICY "Allow read access for authenticated users" ON areas FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow read access for authenticated users" ON trabajadores FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow read access for authenticated users" ON ciclos_evaluacion FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow read access for authenticated users" ON plantillas FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow read access for authenticated users" ON secciones FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow read access for authenticated users" ON preguntas FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow read access for authenticated users" ON evaluaciones FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow read access for authenticated users" ON respuestas FOR SELECT USING (auth.role() = 'authenticated');

-- ========================================
-- DATOS INICIALES (EJEMPLO)
-- ========================================

-- Insertar áreas de ejemplo
INSERT INTO areas (nombre) VALUES 
('Tecnología'),
('Recursos Humanos'),
('Ventas'),
('Operaciones'),
('Finanzas'),
('Marketing');

-- Insertar plantilla base
INSERT INTO plantillas (nombre, descripcion) VALUES 
('Plantilla de Evaluación 360°', 'Plantilla estándar para evaluación de desempeño con feedback de múltiples evaluadores');

-- Insertar ciclo de evaluación inicial
INSERT INTO ciclos_evaluacion (nombre, fecha_inicio, fecha_fin, estado) VALUES 
('Ciclo 2024-01', '2024-01-01', '2024-03-31', 'abierto');

-- ========================================
-- VISTAS ÚTILES
-- ========================================

-- Vista para evaluaciones con detalles
CREATE VIEW vista_evaluaciones_detalle AS
SELECT 
    e.*,
    t.nombre as trabajador_nombre,
    t.codigo as trabajador_codigo,
    a.nombre as area_nombre,
    c.nombre as ciclo_nombre,
    u.email as evaluador_email
FROM evaluaciones e
JOIN trabajadores t ON e.trabajador_id = t.id
JOIN areas a ON t.area_id = a.id
JOIN ciclos_evaluacion c ON e.ciclo_id = c.id
JOIN auth.users u ON e.evaluador_id = u.id;

-- Vista para resumen de desempeño por trabajador
CREATE VIEW vista_resumen_desempeño_trabajador AS
SELECT 
    t.id,
    t.codigo,
    t.nombre,
    a.nombre as area,
    t.puesto,
    COUNT(e.id) as total_evaluaciones,
    AVG(e.puntaje_ponderado) as promedio_general,
    MAX(e.puntaje_ponderado) as max_puntaje,
    MIN(e.puntaje_ponderado) as min_puntaje
FROM trabajadores t
JOIN areas a ON t.area_id = a.id
LEFT JOIN evaluaciones e ON t.id = e.trabajador_id AND e.estado = 'completada'
GROUP BY t.id, t.codigo, t.nombre, a.nombre, t.puesto;

-- Vista para resumen de desempeño por área
CREATE VIEW vista_resumen_desempeño_area AS
SELECT 
    a.id,
    a.nombre,
    COUNT(t.id) as total_trabajadores,
    COUNT(e.id) as total_evaluaciones,
    AVG(e.puntaje_ponderado) as promedio_general
FROM areas a
LEFT JOIN trabajadores t ON a.id = t.area_id
LEFT JOIN evaluaciones e ON t.id = e.trabajador_id AND e.estado = 'completada'
GROUP BY a.id, a.nombre;
