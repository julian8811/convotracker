# Hoja de Ruta: CRM-VP → Producción

## Estado Actual del Proyecto

**Stack tecnológico:**
- Frontend: React 19 + Vite
- Estado: Zustand con persistencia en localStorage
- UI: Componentes personalizados con inline styles
- Gráficos: Recharts
- Iconos: Lucide React
- Build tool: Vite

**Funcionalidades actuales:**
- Dashboard con métricas
- Gestión de clientes, leads, pipeline, productos
- Cotizaciones y pedidos (UI)
- Chat IA simulado
- Autenticación simulada (hardcoded)

---

## 🚨 Gap Analysis: Estado Actual vs 100% Funcional

| Componente | Estado Actual | Estado Requerido | Prioridad |
|------------|---------------|------------------|-----------|
| **Base de datos** | localStorage | PostgreSQL real | CRÍTICA |
| **Auth** | Hardcoded (admin/admin123) | JWT + Roles | CRÍTICA |
| **API** | No existe | REST/GraphQL | CRÍTICA |
| **Backend** | Solo frontend | Server Functions | CRÍTICA |
| **Multiusuario** | No | Sí ( equipo comercial) | ALTA |
| **Seguridad** | Nula | RBAC completo | ALTA |
| **Validaciones** | Mínimas | Robustas | MEDIA |
| **Persistencia** | localStorage | DB persistente | CRÍTICA |
| **Deploy** | No configurado | Vercel | CRÍTICA |

---

## 📋 Fase 1: Fundamentos (Semanas 1-2)

### 1.1 Backend + Base de Datos

**Opción recomendada: Supabase (PostgreSQL)**
- ✓ PostgreSQL real incluido
- ✓ Auth integrado (Google, Email, GitHub)
- ✓ Row Level Security (RLS)
- ✓ Edge Functions para API
- ✓ Tier gratuito generoso
- ✓ Despliegue en Vercel via Edge Functions

**Alternativa: Vercel Postgres + Vercel Server Functions**
- PostgreSQL managed
- Serverless functions
- Todo dentro del ecosistema Vercel

**Schema de base de datos propuesto:**

```sql
-- Users (extendidos de auth)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'sales', -- admin, sales, manager
    team TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customers
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id),
    name TEXT NOT NULL,
    company TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    city TEXT DEFAULT 'Medellín',
    customer_type TEXT DEFAULT 'corporate', -- sme, corporate
    score INT DEFAULT 50,
    lifetime_value DECIMAL(15,2) DEFAULT 0,
    purchase_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leads
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    company TEXT,
    source TEXT DEFAULT 'web',
    interest TEXT DEFAULT 'warm', -- hot, warm, cold
    score INT DEFAULT 50,
    budget DECIMAL(15,2),
    status TEXT DEFAULT 'new', -- new, contacted, qualified, converted, lost
    assigned_to UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pipeline (oportunidades)
CREATE TABLE opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id),
    name TEXT NOT NULL,
    customer_id UUID REFERENCES customers(id),
    stage TEXT DEFAULT 'lead', -- lead, contact, qualification, proposal, negotiation, closed_won, closed_lost
    value DECIMAL(15,2) DEFAULT 0,
    probability INT DEFAULT 50,
    days_in_stage INT DEFAULT 0,
    assignee_id UUID REFERENCES profiles(id),
    expected_close DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category TEXT DEFAULT 'Software',
    price DECIMAL(15,2) NOT NULL,
    discount_price DECIMAL(15,2),
    stock INT DEFAULT 0,
    margin INT DEFAULT 0,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quotations
CREATE TABLE quotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    number TEXT UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id),
    user_id UUID REFERENCES profiles(id),
    status TEXT DEFAULT 'draft', -- draft, sent, approved, reviewed, rejected
    subtotal DECIMAL(15,2) DEFAULT 0,
    tax DECIMAL(15,2) DEFAULT 0,
    total DECIMAL(15,2) DEFAULT 0,
    validity DATE,
    items JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    number TEXT UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id),
    user_id UUID REFERENCES profiles(id),
    quotation_id UUID REFERENCES quotations(id),
    status TEXT DEFAULT 'confirmed', -- confirmed, preparing, shipped, delivered, returned
    total DECIMAL(15,2) DEFAULT 0,
    carrier TEXT,
    delivery_date DATE,
    tracking_number TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity Log (auditoría)
CREATE TABLE activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id),
    entity_type TEXT NOT NULL, -- customer, lead, opportunity, etc
    entity_id UUID NOT NULL,
    action TEXT NOT NULL, -- created, updated, deleted, stage_changed
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index para rendimiento
CREATE INDEX idx_leads_user ON leads(user_id);
CREATE INDEX idx_opportunities_stage ON opportunities(stage);
CREATE INDEX idx_customers_user ON customers(user_id);
CREATE INDEX idx_activity_entity ON activity_log(entity_type, entity_id);
```

### 1.2 Autenticación Real

**Stack recomendado:**
- Supabase Auth (incluido en Supabase) O
- Clerk (más simple para React) O
- Auth.js (NextAuth) para Vercel

**Roles implementados:**
```javascript
const ROLES = {
  admin: ['*'], // acceso total
  manager: ['read', 'write', 'reports'], // gestión equipo
  sales: ['read', 'write_own'] // solo sus datos
};
```

**Protecciones necesarias:**
- Middleware de autenticación en todas las rutas protegidas
- Validación de sesión JWT en cada request
- Row Level Security (RLS) en Supabase para acceso a datos

---

## 📋 Fase 2: API + Integración Frontend (Semanas 2-3)

### 2.1 Server Functions (Vercel) / Edge Functions (Supabase)

```javascript
// Ejemplo: GET /api/customers
// /api/customers/index.ts (Vercel Server Function)

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY // server-only
);

export default async function handler(req, res) {
  // Verificar auth
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No autorizado' });
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: 'Token inválido' });
  
  // Obtener customers del usuario
  const { data, error: dbError } = await supabase
    .from('customers')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  
  if (dbError) return res.status(500).json({ error: dbError.message });
  
  res.json(data);
}
```

### 2.2 Migración del Store de Zustand

**Antes (localStorage):**
```javascript
// Estado actual - solo funciona en browser
export const useStore = create(persist((set) => ({ ... }), { name: 'crmvp-storage' }));
```

**Después (API + Cache):**
```javascript
// Nuevo store con API calls
export const useStore = create((set, get) => ({
  customers: [],
  loading: false,
  
  fetchCustomers: async () => {
    set({ loading: true });
    const res = await fetch('/api/customers');
    const data = await res.json();
    set({ customers: data, loading: false });
  },
  
  addCustomer: async (customer) => {
    const res = await fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customer)
    });
    const newCustomer = await res.json();
    set(state => ({ customers: [newCustomer, ...state.customers] }));
  },
  
  // ... más métodos
}));
```

### 2.3 Autenticación en Frontend

```javascript
// /lib/auth.ts
export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email, password
  });
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  await supabase.auth.signOut();
};

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
  }, []);
  
  return { user, loading };
};
```

---

## 📋 Fase 3: Funcionalidades Avanzadas (Semanas 3-4)

### 3.1 Dashboard Real

- Métricas calculadas desde DB (no hardcoded)
- Gráficos con datos reales de oportunidades
- Filtros por fecha, vendedor, equipo
- Export a Excel/PDF

### 3.2 Pipeline Kanban con Drag & Drop

- Integración con API real
- Notificaciones en tiempo real (opcional: Supabase Realtime)
- Historial de cambios en stage

### 3.3 Cotizaciones → Pedidos

- Crear cotización con línea de items
- Convertir cotización aprobada a pedido
- Cálculo automático de impuestos
- PDF generation (react-pdf o @react-pdf/renderer)

### 3.4 AI Features (Reales)

- OpenAI API para chat
- Scoring predictivo (modelo entrenado o API)
- Pronósticos con datos históricos

---

## 📋 Fase 4: Seguridad + Deploy (Semanas 4-5)

### 4.1 Configuración de Seguridad

```javascript
// RLS Policies (Supabase)
-- Solo admins ven todos los datos
CREATE POLICY "Admins can view all" ON customers
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Vendedores solo ven sus datos
CREATE POLICY "Sales can view own" ON customers
  FOR SELECT USING (user_id = auth.uid());
```

### 4.2 Environment Variables

```env
# .env.local
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key  # solo server
OPENAI_API_KEY=sk-...
```

### 4.3 Configuración Vercel

```javascript
// vercel.json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" }
  ],
  "env": {
    "VITE_SUPABASE_URL": "@supabase-url",
    "VITE_SUPABASE_ANON_KEY": "@supabase-anon-key"
  }
}
```

```javascript
// vite.config.js actualizado
export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' ? '/' : '/',
  server: {
    proxy: {
      '/api': 'http://localhost:3000'
    }
  }
});
```

---

## 📋 Fase 5: Polish + Lanzamiento (Semana 5)

### 5.1 Optimizaciones
- Loading states skeleton
- Error boundaries
- Optimistic updates
- Code splitting por rutas

### 5.2 SEO (si es públicos las landing)
- Meta tags
- Sitemap
- Open Graph

### 5.3 Testing
- Unit tests de componentes críticos
- E2E con Playwright
- Test de autenticación

---

## 🎯 Checklist de Producción

| # | Item | Prioridad |
|---|------|----------|
| 1 | [ ] Crear proyecto Supabase | 🔴 |
| 2 | [ ] Ejecutar schema SQL | 🔴 |
| 3 | [ ] Configurar RLS | 🔴 |
| 4 | [ ] Implementar auth | 🔴 |
| 5 | [ ] Crear API routes | 🔴 |
| 6 | [ ] Migrar store a API | 🔴 |
| 7 | [ ] Actualizar componentes | 🔴 |
| 8 | [ ] Configurar env vars | 🔴 |
| 9 | [ ] Probar en staging | 🟡 |
| 10 | [ ] Deploy a Vercel | 🔴 |
| 11 | [ ] Validar SSL y dominios | 🟢 |

---

## 💰 Estimación de Costos

| Servicio | Tier | Costo mensual |
|----------|------|---------------|
| **Supabase** | Free (proyecto) | $0 |
| **Vercel** | Pro (para team) | $20/mes |
| **OpenAI** | Pay-as-you-go | ~$10/mes (si usa IA) |
| **Dominio** | .com | $12/año |

**Total estimado: $20-30/mes** (Starting)

---

## 🚀 Próximos Pasos Inmediatos

1. **Crear cuenta en Supabase** (gratis)
2. **Ejecutar schema** en SQL Editor
3. **Instalar dependencias:**
   ```bash
   npm install @supabase/supabase-js @supabase/ssr
   npm install jwt-decode
   # opcional:
   npm install @react-pdf/renderer
   npm install react-hook-form zod
   ```
4. **Configurar variables de entorno**
5. **Implementar auth flows**
6. **Migrar datos de mock a API**
7. **Deploy**

---

## 📚 Recursos Recomendados

- [Supabase Docs](https://supabase.com/docs)
- [Vercel Server Functions](https://vercel.com/docs/functions)
- [Clerk Auth](https://clerk.com/docs)
- [React Hook Form](https://react-hook-form.com/)
- [Zod Validation](https://zod.dev/)

---

*Documento generado: Abril 2026*
*Proyecto: CRM-VP (crm-vp-app)*
