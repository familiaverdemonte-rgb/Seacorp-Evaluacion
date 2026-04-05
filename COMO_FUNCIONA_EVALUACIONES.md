# 🎯 ¿CÓMO FUNCIONA EL SISTEMA DE EVALUACIONES?

## 📋 **EXPLICACIÓN DEL FLUJO:**

### **🔍 Problema Actual:**
- ✅ **Trabajador 45749188 existe** (lo agregaste en Finanzas)
- ✅ **Búsqueda funciona** (aparece en evaluaciones)
- ❌ **No hay evaluaciones disponibles** (porque no están creadas)

### **🤔 ¿Por qué no hay evaluaciones?**

**Las evaluaciones no se crean automáticamente**. Necesitan seguir este flujo:

```
1. 📁 Crear Ciclo de Evaluación
2. 📋 Asignar Trabajadores al Ciclo  
3. 🎯 Crear Evaluaciones 360°
4. ▶️ Iniciar Evaluaciones
```

---

## 🔄 **FLUJO COMPLETO DE EVALUACIONES:**

### **Paso 1: Crear Ciclo de Evaluación**
```
🌐 Ve a: http://localhost:3000/dashboard/ciclos
➕ Haz clic en "Nuevo Ciclo"
📝 Nombre: "Evaluación 2024-01"
📅 Fecha inicio: 2024-01-01
📅 Fecha fin: 2024-12-31
✅ Estado: "Abierto"
💾 Guardar
```

### **Paso 2: Asignar Trabajadores al Ciclo**
```
📋 En el ciclo creado, haz clic en "Asignar Trabajadores"
🔍 Busca al trabajador: 45749188
✅ Selecciona al trabajador
👥 Asigna evaluadores (RRHH, Jefe, Pares)
💾 Guardar asignaciones
```

### **Paso 3: Crear Evaluaciones 360°**
```
🎯 El sistema crea automáticamente:
   - Evaluación de RRHH para el trabajador
   - Evaluación de Jefe para el trabajador  
   - Evaluación de Pares para el trabajador
📊 Cada evaluación tendrá estado "Pendiente"
```

### **Paso 4: Iniciar Evaluaciones**
```
▶️ Ve a: http://localhost:3000/dashboard/evaluaciones
🔍 Busca trabajador: 45749188
📋 Verás sus evaluaciones (RRHH, Jefe, Pares)
🎯 Haz clic en Play (▶️) para iniciar cada evaluación
```

---

## 🎯 **¿CÓMO ESTÁN ENLAZADAS LAS EVALUACIONES?**

### **📊 Estructura de Datos:**
```
Ciclo de Evaluación
├── Trabajadores Asignados
│   ├── Trabajador 45749188
│   │   ├── Evaluación RRHH (Pendiente)
│   │   ├── Evaluación Jefe (Pendiente)
│   │   └── Evaluación Pares (Pendiente)
│   └── Otros trabajadores...
└── Plantillas de Evaluación
    ├── Secciones
    │   ├── Competencias Técnicas
    │   ├── Competencias Comportamentales
    │   └── Metas y Objetivos
    └── Preguntas por sección
```

### **🔗 Relaciones:**
- **Ciclo** → **Trabajadores** (muchos a muchos)
- **Trabajador** → **Evaluaciones** (uno a muchos)
- **Evaluación** → **Plantilla** (muchos a uno)
- **Evaluación** → **Evaluador** (RRHH, Jefe, Par)

---

## 🚀 **SOLUCIÓN INMEDIATA:**

### **Opción 1: Crear Ciclo y Asignar (Recomendado)**
```
1. 🌐 http://localhost:3000/dashboard/ciclos
2. ➕ "Nuevo Ciclo" → "Evaluación 2024"
3. 📋 Asigna trabajador 45749188
4. 🎯 El sistema creará las evaluaciones automáticamente
```

### **Opción 2: Crear Evaluación Manual (Para Prueba)**
```
1. 🌐 http://localhost:3000/dashboard/ciclos
2. ➕ Crea un ciclo básico
3. 👥 Asigna solo al trabajador 45749188
4. ✅ Listo para probar
```

---

## 📝 **PASOS PARA PROBAR AHORA:**

### **Paso 1: Crear Ciclo**
```
🌐 Ve a: http://localhost:3000/dashboard/ciclos
➕ "Nuevo Ciclo"
📝 Nombre: "Prueba Evaluación"
📅 Inicio: 2024-01-01
📅 Fin: 2024-12-31
✅ Estado: Abierto
💾 "Crear"
```

### **Paso 2: Asignar Trabajador**
```
📋 En el ciclo creado, busca opción "Asignar"
🔍 Busca: 45749188
✅ Selecciona y asigna
💾 Guardar
```

### **Paso 3: Ver Evaluaciones**
```
🌐 Ve a: http://localhost:3000/dashboard/evaluaciones
🔍 Busca: 45749188
✅ Ahora deberías ver sus evaluaciones
▶️ Podrás iniciarlas
```

---

## 🎯 **RESUMEN:**

**El trabajador existe pero no tiene evaluaciones porque:**
1. ❌ No hay ciclo de evaluación activo
2. ❌ No está asignado a ningún ciclo
3. ❌ No se han creado evaluaciones 360° para él

**Solución:**
1. ✅ Crear ciclo de evaluación
2. ✅ Asignar trabajador al ciclo
3. ✅ Sistema crea evaluaciones automáticamente
4. ✅ Podrás iniciar evaluaciones

---

## 🚀 **¿LISTO PARA PROBAR?**

**Sigue los pasos arriba y luego regresa a evaluaciones para probar el botón de iniciar evaluación!** 🎯
