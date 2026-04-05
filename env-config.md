# Configuración de Supabase para SEACORP PERÚ

## Pasos para configurar la conexión a Supabase:

### 1. Crear archivo .env.local
Crea un archivo llamado `.env.local` en la raíz del proyecto con el siguiente contenido:

```env
# Variables de entorno para Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anonima-publica-aqui
```

### 2. Obtener las credenciales desde Supabase

1. Inicia sesión en [supabase.com](https://supabase.com)
2. Selecciona tu proyecto
3. Ve a **Settings** > **API**
4. Copia los siguientes valores:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Formato correcto del archivo .env.local

```env
# Ejemplo:
NEXT_PUBLIC_SUPABASE_URL=https://seacorp-peru.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlYWNvcnBlcnUiLCJpYXQiOjE2ODA4NzIwMDAsImV4cCI6MTk5NjQ0ODAwMH0.abc123def456
```

### 4. Validar configuración

El sistema ahora validará que las variables estén configuradas y mostrará un error si faltan.

### 5. Reiniciar el servidor

Después de crear/modificar el archivo .env.local, reinicia el servidor:

```bash
npm run dev
```

## Estructura de la base de datos

El sistema espera la siguiente estructura de tablas:

- `areas` - Áreas de la empresa
- `trabajadores` - Trabajadores y empleados
- `ciclos_evaluacion` - Ciclos de evaluación
- `plantillas` - Plantillas de evaluación
- `secciones` - Secciones de plantillas
- `preguntas` - Preguntas de evaluación
- `evaluaciones` - Evaluaciones asignadas
- `respuestas` - Respuestas a las evaluaciones

## Notas importantes

- Las variables deben comenzar con `NEXT_PUBLIC_` para estar disponibles en el cliente
- El archivo `.env.local` está protegido por `.gitignore` y no se subirá al repositorio
- Mantén tus credenciales seguras y no las compartas públicamente
