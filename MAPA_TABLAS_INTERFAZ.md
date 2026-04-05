# 🗺️ MAPA DE TABLAS VS INTERFAZ

## 📊 TABLAS EN SUPABASE Y SU ESTADO EN INTERFAZ:

### ✅ **TABLAS CON INTERFAZ COMPLETA:**
1. **trabajadores** → `/dashboard/trabajadores` ✅
2. **areas** → `/dashboard/configuracion` ✅  
3. **plantillas** → `/dashboard/configuracion` ✅
4. **evaluaciones** → `/dashboard/evaluaciones` ✅

### ⚠️ **TABLAS SIN INTERFAZ (FALTANTES):**
1. **ciclos_evaluacion** → ❌ **SIN INTERFAZ**
2. **secciones** → ❌ **SIN INTERFAZ**
3. **preguntas** → ❌ **SIN INTERFAZ**
4. **respuestas** → ❌ **SIN INTERFAZ**

## 🔗 **CÓMO ESTÁN CONECTADAS LAS TABLAS:**

### Relaciones Existentes:
```
trabajadores ←→ areas (trabajador.area_id)
trabajadores ←→ evaluaciones (evaluacion.trabajador_id)
areas ←→ plantillas ←→ secciones ←→ preguntas
evaluaciones ←→ respuestas ←→ preguntas
ciclos_evaluacion ←→ evaluaciones (evaluacion.ciclo_id)
```

### Flujo Actual:
1. **Áreas** → **Plantillas** → **Evaluaciones** → **Trabajadores**
2. **Faltan:** Ciclos, Secciones, Preguntas, Respuestas

## 🎯 **QUÉ FALTA POR IMPLEMENTAR:**

### 1. **Gestión de Ciclos de Evaluación**
- Crear página: `/dashboard/ciclos`
- CRUD para ciclos_evaluacion
- Conectar con evaluaciones

### 2. **Gestión de Plantillas Completa**
- Expandir `/dashboard/configuracion`
- Agregar gestión de **secciones** y **preguntas**
- Editor de plantillas con preguntas

### 3. **Realización de Evaluaciones**
- Crear página: `/dashboard/evaluaciones/[id]/realizar`
- Formulario con preguntas y respuestas
- Guardar en tabla **respuestas**

### 4. **Resultados de Evaluaciones**
- Crear página: `/dashboard/evaluaciones/[id]/resultados`
- Mostrar respuestas guardadas
- Calcular y mostrar resultados

## 🔄 **FLUJO COMPLETO DEBERÍA SER:**

```
1. Configurar Ciclos de Evaluación
2. Crear Plantillas con Secciones y Preguntas
3. Asignar Evaluaciones a Trabajadores
4. Realizar Evaluaciones (responder preguntas)
5. Ver Resultados y Reportes
```

## 🚀 **SOLUCIÓN PROPUESTA:**

Necesito crear las siguientes páginas/interfaces:

1. **Dashboard de Ciclos** - Gestión de ciclos_evaluacion
2. **Editor de Plantillas** - Gestión completa de plantillas/secciones/preguntas  
3. **Realizador de Evaluaciones** - Formulario para responder preguntas
4. **Visor de Resultados** - Mostrar respuestas y cálculos

¿Quieres que implemente estas interfaces faltantes?
