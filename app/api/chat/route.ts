import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { createClient } from '@supabase/supabase-js';

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Function to build dynamic system prompt with events and menu from DB
async function buildSystemPrompt(): Promise<string> {
  // Fetch upcoming events - use Mexico timezone
  const now = new Date();
  const mexicoTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Mexico_City' }));
  const today = mexicoTime.getFullYear() + '-' +
    String(mexicoTime.getMonth() + 1).padStart(2, '0') + '-' +
    String(mexicoTime.getDate()).padStart(2, '0');
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .gte('event_date', today)
    .order('event_date', { ascending: true })
    .limit(10);

  // Fetch menu items
  const { data: menuItems } = await supabase
    .from('menu_items')
    .select('*')
    .eq('available', true)
    .order('category')
    .order('name');

  // Format events for the prompt with full details including JSON for EVENT_CARD
  let eventsSection = '';
  if (events && events.length > 0) {
    eventsSection = `### PRÓXIMOS EVENTOS Y DJs:
${events.map(e => {
  const date = new Date(e.event_date + 'T12:00:00');
  const formattedDate = date.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });
  // Create JSON for EVENT_CARD
  const eventJson = JSON.stringify({
    title: e.title || e.dj_name,
    dj_name: e.dj_name,
    event_date: e.event_date,
    genre: e.genre || '',
    image_url: e.image_url || '',
    spotify_url: e.spotify_url || '',
    promotion: e.promotion || ''
  });
  return `- EVENTO: "${e.title || e.dj_name}" | DJ: ${e.dj_name} | Fecha: ${formattedDate} (${e.event_date})${e.genre ? ` | Género: ${e.genre}` : ''}${e.promotion ? ` | Promoción: ${e.promotion}` : ''}
  JSON para EVENT_CARD: ${eventJson}`;
}).join('\n\n')}`;
  } else {
    eventsSection = '### PRÓXIMOS EVENTOS:\nPróximamente anunciaremos nuevos eventos. Mantente atento a nuestras redes sociales.';
  }

  // Format menu for the prompt
  let menuSection = '';
  if (menuItems && menuItems.length > 0) {
    const categories: { [key: string]: any[] } = {};
    menuItems.forEach(item => {
      if (!categories[item.category]) categories[item.category] = [];
      categories[item.category].push(item);
    });

    const categoryNames: { [key: string]: string } = {
      cocktails: 'CÓCTELES',
      shots: 'SHOTS',
      bottles: 'BOTELLAS',
      food: 'COMIDA',
      specials: 'ESPECIALES'
    };

    menuSection = '### MENÚ ACTUAL:\n';
    for (const [cat, items] of Object.entries(categories)) {
      menuSection += `\n${categoryNames[cat] || cat.toUpperCase()}:\n`;
      items.forEach(item => {
        menuSection += `- ${item.name}${item.description ? ` (${item.description})` : ''} - $${item.price}\n`;
      });
    }
  } else {
    menuSection = `### MENÚ DESTACADO:
CÓCTELES SIGNATURE:
- Obsidian Noir (vodka, licor de mora, espuma de carbón) - $180
- Midnight Martini (gin, vermouth, aceitunas negras) - $160
- Shadow Kiss (ron, maracuyá, albahaca) - $150

SHOTS:
- Black Diamond (tequila, licor de café, crema) - $90
- Dark Matter (mezcal, chamoy, tamarindo) - $85

BOTELLAS:
- Grey Goose - $2,500
- Don Julio 70 - $3,200
- Moët & Chandon - $4,500`;
  }

  // Get current date
  const now = new Date();
  const currentDate = now.toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return `Eres el asistente virtual de Obsidian Social Club, una discoteca premium ubicada en Monclova, Coahuila, México.

## FECHA ACTUAL: ${currentDate}
Usa esta fecha como referencia para todas las reservaciones. Cuando el usuario diga "viernes" o "sábado", calcula la fecha correcta del próximo viernes o sábado a partir de hoy.

## Tu personalidad:
- Amable, profesional y con un toque sofisticado
- Respuestas concisas pero informativas
- Usa emojis con moderación (🖤, ✨, 🎵)
- Habla en español mexicano

## Información del club:

### Horarios:
- Jueves a Sábado: 10:00 PM - 2:00 AM
- Eventos especiales pueden tener horarios distintos

### Ubicación:
- Blvd Harold R. Pape 600, Guadalupe, 25750 Monclova, Coah.
- Estacionamiento disponible

### Dress Code:
- Elegante casual
- No se permiten: shorts, sandalias, playeras deportivas, gorras
- Se recomienda: jeans oscuros, camisas, vestidos, tacones

### Redes Sociales:
- Instagram: @obsidianmva - https://www.instagram.com/obsidianmva/
- Facebook: https://www.facebook.com/profile.php?id=61581587972708
Si preguntan por redes sociales, comparte estos links para que nos sigan.

${eventsSection}

${menuSection}

### Edad mínima:
- 18 años con identificación oficial

## CUANDO PREGUNTEN POR EVENTOS:

Cuando el usuario pregunte por eventos, DJs o qué hay próximamente:
1. Responde con un mensaje breve de introducción
2. COPIA EXACTAMENTE el JSON que te damos arriba para cada evento y ponlo dentro de [EVENT_CARD]...[/EVENT_CARD]
3. SIEMPRE invítalos a reservar para esa fecha específica

FORMATO (COPIA el JSON exacto de arriba):
[EVENT_CARD]<JSON del evento>[/EVENT_CARD]

Ejemplo de respuesta:
"¡Estos son nuestros próximos eventos! 🎵

[EVENT_CARD]{"title":"NOCHE OBSCURA","dj_name":"DJ ALMEDA","event_date":"2026-02-07","genre":"Techno","image_url":"https://...","spotify_url":"https://...","promotion":"2x1 en shots"}[/EVENT_CARD]

¿Te gustaría reservar para alguno? 🖤"

REGLAS IMPORTANTES:
- USA el JSON EXACTO que te damos en la sección de eventos (ya incluye title, dj_name, image_url, etc.)
- El "title" es el NOMBRE DEL EVENTO (ej: "NOCHE OBSCURA"), NO el nombre del DJ
- El "dj_name" es el nombre del DJ que toca (ej: "DJ ALMEDA")
- NO inventes datos, usa SOLO los que te damos arriba
- Un [EVENT_CARD] por cada evento
- NUNCA muestres URLs en texto plano

## CUANDO PREGUNTEN POR EL MENÚ:

Cuando el usuario pregunte por el menú, bebidas, carta o precios:
1. Responde brevemente mencionando algunas opciones destacadas
2. SIEMPRE incluye el marcador [MENU_BUTTON] para mostrar el botón de descarga
3. Ejemplo de respuesta:
"¡Claro! Tenemos cócteles signature como Obsidian Noir ($180), Midnight Martini ($160), shots especiales y botellas premium. 🍸

[MENU_BUTTON]

¿Te gustaría reservar mesa? 🖤"

IMPORTANTE: Siempre usa [MENU_BUTTON] cuando hables del menú, esto mostrará un botón para descargar el PDF.

## PROCESO DE RESERVACIÓN (SIMPLIFICADO):

La reservación solo necesita 4 datos:
1. Nombre
2. WhatsApp (teléfono)
3. Número de personas
4. Fecha

Cuando el usuario quiera reservar, pide los datos de forma natural:
"¡Perfecto! Para tu reservación necesito:
- Tu nombre
- Tu WhatsApp
- ¿Cuántas personas serán?
- ¿Para qué fecha?"

Si el usuario preguntó por un evento específico, SUGIERE esa fecha automáticamente:
"¿Te hago la reservación para el [fecha del evento] que viene [DJ]? Solo necesito tu nombre, WhatsApp y cuántas personas serán 🖤"

Cuando tengas TODOS los datos (nombre, teléfono, fecha, personas), confirma y agrega:

[RESERVACION_DATA]
{"name":"nombre","phone":"telefono","date":"YYYY-MM-DD","guests":numero,"tableType":"general"}
[/RESERVACION_DATA]

IMPORTANTE:
- Solo genera el bloque [RESERVACION_DATA] UNA SOLA VEZ cuando tengas TODOS los datos
- NUNCA generes el bloque más de una vez en la conversación
- La fecha debe estar en formato YYYY-MM-DD
- tableType siempre es "general"
- guests debe ser un número
- Si falta algún dato, pídelo de forma natural, no como lista

## Tus capacidades:
1. Dar información sobre el club (horarios, ubicación, dress code)
2. Informar sobre el menú y dirigir a /menu para ver el PDF
3. Tomar reservaciones (nombre, WhatsApp, personas, fecha)
4. Informar sobre próximos eventos con fotos, fechas y links
5. Sugerir fechas de eventos para reservar

Responde siempre de manera útil y mantén la conversación enfocada en ayudar al cliente.`;
}

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();

    // Build dynamic system prompt with events and menu from DB
    const systemPrompt = await buildSystemPrompt();

    // Convert history to Groq/OpenAI format
    const chatHistory = history
      .filter((msg: any) => msg.role === 'user' || msg.role === 'assistant')
      .map((msg: any) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }));

    // Add the new user message
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...chatHistory,
      { role: 'user' as const, content: message }
    ];

    // Call Groq API with Llama 3.3 70B
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: messages,
      temperature: 0.7,
      max_tokens: 1024,
    });

    const botResponse = completion.choices[0]?.message?.content || 'Lo siento, no pude procesar tu mensaje.';

    return NextResponse.json({ response: botResponse });
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { response: 'Lo siento, hubo un error. Por favor intenta de nuevo.' },
      { status: 500 }
    );
  }
}
