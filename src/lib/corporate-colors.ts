// Paleta de colores corporativa SEACORP PERÚ
export const corporateColors = {
  // Colores primarios
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554'
  },
  
  // Colores secundarios
  secondary: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617'
  },
  
  // Colores de éxito
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16'
  },
  
  // Colores de advertencia
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03'
  },
  
  // Colores de error
  destructive: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    950: '#450a0a'
  },
  
  // Colores informativos
  info: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
    950: '#082f49'
  }
}

// Clases CSS para colores corporativos
export const corporateClasses = {
  // Gradientes corporativos
  gradients: {
    primary: 'bg-gradient-to-r from-blue-500 to-blue-600',
    secondary: 'bg-gradient-to-r from-slate-500 to-slate-600',
    success: 'bg-gradient-to-r from-green-500 to-green-600',
    warning: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
    destructive: 'bg-gradient-to-r from-red-500 to-red-600',
    info: 'bg-gradient-to-r from-cyan-500 to-cyan-600'
  },
  
  // Sombras corporativas
  shadows: {
    primary: 'shadow-blue-100 shadow-lg',
    secondary: 'shadow-slate-100 shadow-lg',
    success: 'shadow-green-100 shadow-lg',
    warning: 'shadow-yellow-100 shadow-lg',
    destructive: 'shadow-red-100 shadow-lg',
    info: 'shadow-cyan-100 shadow-lg'
  },
  
  // Bordes corporativos
  borders: {
    primary: 'border-blue-200',
    secondary: 'border-slate-200',
    success: 'border-green-200',
    warning: 'border-yellow-200',
    destructive: 'border-red-200',
    info: 'border-cyan-200'
  }
}

// Estados de evaluación con colores corporativos
export const evaluacionStatusColors = {
  pendiente: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  en_progreso: 'bg-blue-100 text-blue-800 border-blue-200',
  completada: 'bg-green-100 text-green-800 border-green-200',
  cancelada: 'bg-red-100 text-red-800 border-red-200'
}

// Clasificación de desempeño con colores corporativos
export const desempenoColors = {
  alto: 'bg-green-100 text-green-800 border-green-200',
  bueno: 'bg-blue-100 text-blue-800 border-blue-200',
  regular: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  bajo: 'bg-red-100 text-red-800 border-red-200'
}

// Tipos de evaluador con colores corporativos
export const evaluadorTypeColors = {
  rrhh: 'bg-purple-100 text-purple-800 border-purple-200',
  jefe: 'bg-orange-100 text-orange-800 border-orange-200',
  par: 'bg-teal-100 text-teal-800 border-teal-200'
}
