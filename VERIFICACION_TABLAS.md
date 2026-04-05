# 🔍 VERIFICACIÓN DE TABLAS SUPABASE

## 📊 **TABLAS ACTUALES EN SUPABASE:**

### 1. **ciclos_evaluacion**
```sql
- id (bigint, primary key)
- nombre (text)
- fecha_inicio (date)
- fecha_fin (date)
- estado (text: 'abierto' | 'cerrado')
- created_at (timestamp)
```

### 2. **plantillas**
```sql
- id (bigint, primary key)
- nombre (text)
- created_at (timestamp)
```

### 3. **secciones**
```sql
- id (bigint, primary key)
- plantilla_id (bigint, foreign key → plantillas.id)
- nombre (text)
- peso (numeric)
- created_at (timestamp)
```

### 4. **preguntas**
```sql
- id (bigint, primary key)
- seccion_id (bigint, foreign key → secciones.id)
- texto (text)
- tipo (text: 'escala_1_5')
- peso (numeric)
- es_general (boolean)
- area_id (bigint, foreign key → areas.id)
- created_at (timestamp)
```

### 5. **evaluaciones**
```sql
- id (bigint, primary key)
- trabajador_id (bigint, foreign key → trabajadores.id)
- evaluador_id (text)
- tipo_evaluador (text: 'rrhh' | 'jefe' | 'par')
- ciclo_id (bigint, foreign key → ciclos_evaluacion.id)
- estado (text: 'pendiente' | 'en_progreso' | 'completada')
- puntaje_ponderado (numeric)
- clasificacion (text)
- created_at (timestamp)
```

### 6. **respuestas**
```sql
- id (bigint, primary key)
- evaluacion_id (bigint, foreign key → evaluaciones.id)
- pregunta_id (bigint, foreign key → preguntas.id)
- puntaje (numeric)
- comentario (text)
- created_at (timestamp)
```

## 🎯 **PROBLEMAS IDENTIFICADOS:**

### ❌ **1. Ciclos - Falta botón Guardar/Editar**
- No hay funcionalidad de edición
- Falta botón de guardar cambios

### ❌ **2. Plantillas - Agregar Sección no funciona**
- El botón no tiene funcionalidad
- No hay conexión real con la tabla secciones

### ❌ **3. Evaluaciones - No hay asignación masiva**
- Solo se puede crear una evaluación a la vez
- No hay opción de asignación múltiple

### ❌ **4. Trabajadores - Falta botón eliminar**
- No hay opción de eliminar trabajadores
- No hay confirmación de eliminación

## 🔧 **SOLUCIONES REQUERIDAS:**

### 1. **Corregir Ciclos**
- Agregar botón de guardar edición
- Implementar funcionalidad de edición completa

### 2. **Corregir Plantillas**
- Implementar funcionalidad real de agregar secciones
- Conectar con tabla secciones
- Agregar gestión de preguntas

### 3. **Mejorar Evaluaciones**
- Agregar opción de asignación masiva
- Selector múltiple de trabajadores

### 4. **Mejorar Trabajadores**
- Agregar botón eliminar
- Implementar confirmación de eliminación

## 🎯 **PLAN DE ACCIÓN:**

1. ✅ Corregir página de ciclos
2. ✅ Implementar secciones y preguntas en plantillas
3. ✅ Agregar asignación masiva en evaluaciones
4. ✅ Agregar eliminación en trabajadores
5. ✅ Verificar todas las conexiones con Supabase
