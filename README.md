# 🖤 Obsidian Social Club

Sitio web premium para discoteca con chatbot de IA, sistema de reservaciones y menú digital.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![Supabase](https://img.shields.io/badge/Supabase-Database-green)
![Claude](https://img.shields.io/badge/Claude-AI%20Chatbot-purple)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-blue)

## ✨ Características

- **Landing Page** - Diseño oscuro y elegante con animaciones
- **Chatbot IA** - Asistente virtual con Claude API para:
  - Reservaciones
  - Información de eventos/DJs
  - Menú y precios
  - Horarios y ubicación
- **Sistema de Reservaciones** - Formulario completo con integración a Supabase
- **Menú Digital** - Con opción de descarga en PDF
- **Galería** - Fotos del lugar y eventos
- **Line-up de DJs** - Próximos eventos

## 🚀 Setup Rápido

### 1. Clona e instala dependencias

```bash
git clone <tu-repo>
cd obsidian-social-club
npm install
```

### 2. Configura Supabase

1. Crea un proyecto en [Supabase](https://supabase.com)
2. Ve a **SQL Editor** y ejecuta el contenido de `database/schema.sql`
3. Ve a **Settings > API** y copia tus keys

### 3. Configura las variables de entorno

```bash
cp .env.example .env.local
```

Edita `.env.local` con tus valores:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
ANTHROPIC_API_KEY=sk-ant-api03-tu-key
```

### 4. Ejecuta el proyecto

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## 📁 Estructura del Proyecto

```
obsidian-social-club/
├── app/
│   ├── page.tsx              # Landing page principal
│   ├── menu/page.tsx         # Página del menú
│   ├── galeria/page.tsx      # Galería de fotos
│   └── api/
│       ├── chat/route.ts     # API del chatbot (Claude)
│       └── reservations/route.ts  # API de reservaciones
├── components/
│   ├── Chatbot.tsx           # Widget de chat
│   ├── Hero.tsx              # Sección principal
│   └── ...
├── lib/
│   └── supabase.ts           # Cliente y tipos de Supabase
├── database/
│   └── schema.sql            # Esquema de base de datos
├── public/
│   ├── logo.png              # Logo de Obsidian
│   └── menu.pdf              # Menú en PDF
└── ...
```

## 🗄️ Base de Datos

### Tablas principales:

| Tabla | Descripción |
|-------|-------------|
| `reservations` | Reservaciones de mesas |
| `menu_items` | Bebidas y comida |
| `events` | DJs y eventos |
| `gallery` | Fotos del lugar |
| `chat_logs` | Historial del chatbot |

### Vistas útiles:

- `upcoming_events` - Próximos eventos
- `todays_reservations` - Reservaciones del día
- `pending_reservations` - Reservaciones pendientes

## 🤖 Chatbot

El chatbot usa Claude (Sonnet 4) y puede:

1. **Tomar reservaciones** - Guía al usuario para reservar
2. **Informar sobre DJs** - Eventos próximos desde la DB
3. **Mostrar menú** - Precios y recomendaciones
4. **Responder FAQs** - Horarios, ubicación, dress code

### Personalizar el chatbot:

Edita el `SYSTEM_PROMPT` en `/api/chat/route.ts` para ajustar:
- Personalidad
- Información del club
- Menú y precios
- Políticas

## 🎨 Personalización

### Colores

Edita `tailwind.config.ts` para cambiar la paleta:

```ts
colors: {
  obsidian: {
    // Tus colores personalizados
  }
}
```

### Logo

Reemplaza `/public/logo.png` con tu logo

### Menú PDF

Reemplaza `/public/menu.pdf` con tu menú actualizado

## 📱 Responsive

El sitio está optimizado para:
- 📱 Mobile (320px+)
- 📱 Tablet (768px+)
- 💻 Desktop (1024px+)

## 🔒 Seguridad

- Row Level Security (RLS) habilitado en Supabase
- Service Role Key solo en servidor
- Validación de inputs en API routes

## 📈 Próximos pasos

- [ ] Panel de administración
- [ ] Notificaciones por email
- [ ] Integración con pagos
- [ ] Analytics de conversaciones

## 🆘 Soporte

¿Problemas? Revisa:
1. Variables de entorno correctas
2. Esquema SQL ejecutado
3. Consola del navegador para errores

---

Desarrollado con 🖤 para **Obsidian Social Club**
