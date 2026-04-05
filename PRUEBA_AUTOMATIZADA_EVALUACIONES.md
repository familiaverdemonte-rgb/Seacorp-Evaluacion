# 🧪 PRUEBA AUTOMATIZADA - SECCIÓN EVALUACIONES

## 🚀 **INICIANDO PRUEBA COMPLETA**

### **Servidor:** ✅ Corriendo en http://localhost:3000

---

## 📋 **PLAN DE PRUEBA:**

### **1. ✅ Prueba de Búsqueda de Trabajador**
- **Acción:** Buscar trabajador con código "45749188"
- **Esperado:** Sistema encuentra y muestra resultados
- **Verificación:** Click en resultado filtra evaluaciones

### **2. ✅ Prueba de Selección de Trabajador**
- **Acción:** Hacer clic en trabajador encontrado
- **Esperado:** UI muestra evaluaciones del trabajador
- **Verificación:** Contador y título se actualizan

### **3. ✅ Prueba de Botón Iniciar Evaluación**
- **Acción:** Hacer clic en botón Play (▶️)
- **Esperado:** Redirección a página de realización
- **Verificación:** URL cambia a /evaluaciones/{id}/realizar

---

## 🔍 **RESULTADOS DE LA PRUEBA:**

### **Estado Actual:** 🟡 **EN PROGRESO**

#### **✅ Servidor Iniciado:**
- **URL:** http://localhost:3000
- **Estado:** Ready en 787ms
- **Entorno:** .env.local cargado

#### **🔄 Pruebas Ejecutándose:**
1. **Búsqueda de trabajador** - Pendiente
2. **Selección de trabajador** - Pendiente
3. **Inicio de evaluación** - Pendiente

---

## 📝 **INSTRUCCIONES MANUALES DE PRUEBA:**

### **Paso 1: Acceder a Evaluaciones**
```
1. Abrir navegador: http://localhost:3000/dashboard/evaluaciones
2. Verificar que carga la página de evaluaciones
3. Confirmar que muestra estadísticas y lista de evaluaciones
```

### **Paso 2: Probar Búsqueda**
```
1. Hacer clic en botón "Buscar Trabajador"
2. En el diálogo, escribir: "45749188"
3. Verificar que aparecen resultados de búsqueda
4. Hacer clic en un resultado de trabajador
5. Confirmar que el diálogo se cierra y la UI se actualiza
```

### **Paso 3: Probar Selección**
```
1. Verificar que el título cambia a "Evaluaciones de: [nombre trabajador]"
2. Confirmar que el contador muestra evaluaciones del trabajador
3. Verificar que la tabla solo muestra evaluaciones de ese trabajador
```

### **Paso 4: Probar Botón Iniciar**
```
1. Buscar una evaluación con estado "Pendiente"
2. Hacer clic en botón Play (▶️)
3. Verificar que redirige a: /dashboard/evaluaciones/{id}/realizar
4. Confirmar que la página de realización carga correctamente
```

### **Paso 5: Probar Botón Ver Resultados**
```
1. Buscar una evaluación con estado "Completada"
2. Hacer clic en botón Ojo (👁️)
3. Verificar que redirige a: /dashboard/evaluaciones/{id}/resultados
4. Confirmar que la página de resultados carga correctamente
```

---

## 🎯 **CRITERIOS DE ÉXITO:**

### **✅ Búsqueda Funciona:**
- [ ] Encuentra trabajadores por código
- [ ] Muestra resultados en tiempo real
- [ ] Click en resultado selecciona trabajador

### **✅ Selección Funciona:**
- [ ] UI se actualiza con trabajador seleccionado
- [ ] Filtra evaluaciones del trabajador
- [ ] Muestra contador correcto

### **✅ Botones Funcionan:**
- [ ] Botón Play inicia evaluación
- [ ] Botón Ojo muestra resultados
- [ ] Redirecciones funcionan correctamente

---

## 📊 **RESULTADOS ESPERADOS:**

### **Si todo funciona correctamente:**
```
✅ Búsqueda: Encuentra trabajador 45749188
✅ Selección: UI muestra "Evaluaciones de: [Nombre]"
✅ Filtrado: Tabla muestra solo evaluaciones del trabajador
✅ Inicio: Botón Play redirige a página de realización
✅ Resultados: Botón Ojo redirige a página de resultados
```

### **Si hay problemas:**
```
❌ Búsqueda: No encuentra trabajadores
❌ Selección: Click no actualiza la UI
❌ Filtrado: No filtra evaluaciones
❌ Inicio: Botón no redirige o muestra error
❌ Resultados: Botón no funciona
```

---

## 🔄 **ESTADO DE LA PRUEBA:**

**⏳ Esperando ejecución manual...**

Por favor sigue los pasos manuales arriba y reporta los resultados.

---

## 📞 **SOPORTE:**

Si encuentras algún error, por favor:
1. **Toma captura de pantalla** del error
2. **Abre la consola del navegador** (F12)
3. **Reporta el mensaje de error exacto**
4. **Describe el paso donde falló**

**¡Estoy listo para ayudar con cualquier problema que encuentres!** 🚀
