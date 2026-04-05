# SEACORP PERÚ - Sistema de Evaluación de Desempeño

Sistema empresarial de evaluación de desempeño 360° construido con Next.js, TypeScript, Tailwind CSS y Supabase.

## 🚀 Características Principales

- **Evaluación 360°**: Sistema multi-evaluador (RRHH, Jefe, Pares)
- **Gestión Dinámica**: Plantillas, secciones y preguntas configurables
- **Dashboard Analytics**: KPIs en tiempo real y reportes
- **Importación Masiva**: Carga de trabajadores desde Excel
- **Exportación de Reportes**: Excel y PDF
- **Autenticación Segura**: Basada en Supabase Auth
- **Interfaz Moderna**: UI/UX profesional con Tailwind CSS

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 14 (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (Base de datos + Auth)
- **Procesamiento Excel**: xlsx
- **Generación PDF**: jsPDF + html2canvas

## 📋 Requisitos Previos

1. **Node.js** 18+ instalado
2. **Cuenta de Supabase** activa
3. **Git** para control de versiones

## 🚀 Configuración Inicial

### 1. Clonar el Proyecto

```bash
git clone <repository-url>
cd seacorp-evaluacion
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Supabase

1. Crear un nuevo proyecto en [Supabase](https://supabase.com)
2. Ejecutar el script SQL del archivo `database/schema.sql`
3. Copiar las credenciales del proyecto

### 4. Configurar Variables de Entorno

Crear archivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

### 5. Ejecutar la Aplicación

```bash
npm run dev
```

Visitar `http://localhost:3000`

## 📁 Estructura del Proyecto

```
seacorp-evaluacion/
├── src/
│   ├── app/
│   │   ├── (auth)/           # Rutas de autenticación
│   │   └── (dashboard)/      # Dashboard principal
│   ├── components/
│   │   └── ui/               # Componentes UI reutilizables
│   ├── services/             # Lógica de negocio
│   ├── lib/                  # Utilidades y configuración
│   ├── types/                # Tipos TypeScript
│   └── utils/                # Funciones helper
├── database/
│   └── schema.sql            # Esquema de base de datos
└── README.md
```

## 🗄️ Esquema de Base de Datos

El sistema utiliza 8 tablas principales:

1. **areas** - Departamentos de la empresa
2. **trabajadores** - Información de empleados
3. **ciclos_evaluacion** - Períodos de evaluación
4. **plantillas** - Plantillas de evaluación
5. **secciones** - Secciones dentro de plantillas
6. **preguntas** - Preguntas de evaluación
7. **evaluaciones** - Evaluaciones asignadas
8. **respuestas** - Respuestas a las preguntas

## 👥 Roles del Sistema

### Admin
- Configurar todo el sistema
- Ver reportes y analytics
- Gestionar usuarios y permisos

### Evaluador (RRHH/Jefe/Par)
- Realizar evaluaciones asignadas
- Ver historial de evaluaciones
- Generar reportes individuales

## 📊 Funcionalidades Principales

### 1. Gestión de Trabajadores
- Importación masiva desde Excel
- Búsqueda por código
- Gestión por áreas

### 2. Sistema de Evaluación
- Evaluación 360° con múltiples evaluadores
- Navegación por secciones
- Guardado automático (autosave)
- Cálculo automático de puntajes

### 3. Dashboard y Reportes
- KPIs en tiempo real
- Rankings por trabajador y área
- Distribución de desempeño
- Exportación a Excel/PDF

### 4. Configuración Dinámica
- Plantillas personalizables
- Preguntas generales y por área
- Pesos configurables
- Ciclos de evaluación

## 🔧 Desarrollo

### Scripts Disponibles

```bash
npm run dev          # Iniciar servidor de desarrollo
npm run build        # Construir para producción
npm run start        # Iniciar servidor de producción
npm run lint         # Ejecutar ESLint
npm run type-check   # Verificación de tipos
```

### Convenciones de Código

- **TypeScript** estricto
- **Componentes** reutilizables
- **Services** para lógica de negocio
- **Types** para interfaces
- **Utils** para funciones helper

## 📝 Notas Importantes

- El sistema está diseñado para ~500 trabajadores
- Evaluación 360° con pesos: RRHH(40%), Jefe(40%), Par(20%)
- Clasificación automática: Alto(4.5-5), Bueno(3.5-4.49), Regular(2.5-3.49), Bajo(<2.5)
- Soporte completo para español

## 🤝 Contribución

1. Fork del proyecto
2. Crear feature branch
3. Commit con cambios
4. Push al branch
5. Crear Pull Request

## 📄 Licencia

Proyecto propiedad de SEACORP PERÚ - Todos los derechos reservados.

## 📞 Soporte

Para soporte técnico, contactar al equipo de desarrollo de SEACORP PERÚ.
