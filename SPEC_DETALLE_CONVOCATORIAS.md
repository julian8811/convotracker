# ConvoTracker - Especificaciones de Detalle de Convocatorias

## Resumen
Agregar visualización de detalle completo de convocatorias con estado, fechas, montos y descarga de términos.

## Campos a agregar/mostrar

### Backend (Modelo Convocatoria)
- `fecha_cierre` - Fecha límite de postulación
- `monto_minimo` - Financiamiento mínimo
- `monto_maximo` - Financiamiento máximo  
- `moneda` - Tipo de moneda
- `url_terminos` - Link a términos de referencia/PDF
- `requisitos` - Requisitos de postulación
- `condiciones` - Condiciones generales
- `estado` - abierta/cerrada/proxima

### Frontend - Secciones

#### 1. Tabs de Convocatorias
```
[Activas (45)] [Vencidas (12)] [Todas]
```

#### 2. Tarjeta de Convocatoria
```
┌─────────────────────────────────────────────────┐
│ 🎓 SENA Fondo Emprender 2026-I                  │
│ 💰 $10.000.000 - $50.000.000 COP                │
│ 📅 Vence en: 15 días (25 Abril 2026)            │
│ 📍 Colombia | Entrepreneurship                    │
│                                                 │
│ [Ver Detalle] [Descargar Términos] [Postular]   │
└─────────────────────────────────────────────────┘
```

#### 3. Vista de Detalle (Modal/Página)
```
┌─────────────────────────────────────────────────┐
│ SENA Fondo Emprender 2026-I                     │
├─────────────────────────────────────────────────┤
│ Descripción                                    │
│ ────────────────────────────────                │
│ Programa de financiamiento para emprendedores... │
│                                                 │
│ 💰 Montos                                       │
│ ────────────────────────────────                │
│ $10.000.000 - $50.000.000 COP                  │
│                                                 │
│ 📅 Fechas Importantes                           │
│ ────────────────────────────────                │
│ Apertura: 1 Enero 2026                         │
│ Cierre: 25 Abril 2026                          │
│ Estado: 🔵 Activa (15 días restantes)           │
│                                                 │
│ 📋 Requisitos                                   │
│ ────────────────────────────────                │
│ • Ser colombiano                                │
│ • Tener negocio constituido                    │
│ • ...                                          │
│                                                 │
│ 📄 Términos de Referencia                       │
│ ────────────────────────────────                │
│ [📥 Descargar PDF]                              │
│                                                 │
│ 🔗 Links                                        │
│ ────────────────────────────────                │
│ [Ver convocatoria original]                      │
│ [Postular aquí]                                │
└─────────────────────────────────────────────────┘
```

## Implementación

### 1. Actualizar Scrapers
- Capturar `fecha_cierre` de las páginas
- Extraer `monto` cuando esté disponible
- Buscar links a PDF de términos
- Identificar `estado` basado en fecha_cierre

### 2. Endpoint API
- Agregar filtro `?estado=activa|cerrada`
- Incluir cálculo de días restantes
- Endpoint de detalle: `/api/v1/convocatorias/{id}`

### 3. Frontend
- Agregar tabs de estado
- Mostrar countdown/tiempo restante
- Modal de detalle completo
- Botón de descarga de términos
- Diseño responsive

## Prioridad
1. Campos en modelo ✅ (ya existen, faltan popularlos)
2. Lógica de estado (activa vs vencida)
3. UI de tabs
4. Vista de detalle con toda la info
5. Descarga de términos de referencia
