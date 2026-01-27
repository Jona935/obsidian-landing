import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Function to build dynamic system prompt with events and menu from DB
async function buildSystemPrompt(): Promise<string> {
  // Fetch upcoming events
  const today = new Date().toISOString().split('T')[0];
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

  // Format events for the prompt
  let eventsSection = '';
  if (events && events.length > 0) {
    eventsSection = `### PRÓXIMOS EVENTOS Y DJs:
${events.map(e => {
  const date = new Date(e.event_date);
  const formattedDate = date.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });
  return `- ${e.dj_name} - ${formattedDate}${e.genre ? ` (${e.genre})` : ''}${e.spotify_url ? ` - Spotify: ${e.spotify_url}` : ''}`;
}).join('\n')}`;
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
- Viernes y Sábado: 10:00 PM - 4:00 AM
- Eventos especiales pueden tener horarios distintos

### Ubicación:
- Av. Principal #123, Centro, Monclova, Coahuila
- Estacionamiento disponible

### Dress Code:
- Elegante casual
- No se permiten: shorts, sandalias, playeras deportivas, gorras
- Se recomienda: jeans oscuros, camisas, vestidos, tacones

### Reservaciones:
- Mesa General: Sin consumo mínimo
- Mesa VIP: Consumo mínimo $3,000 MXN
- Booth Privado: Consumo mínimo $8,000 MXN
- Se requiere reservación con anticipación los fines de semana

${eventsSection}

${menuSection}

### Edad mínima:
- 18 años con identificación oficial

## PROCESO DE RESERVACIÓN:

Cuando el usuario quiera reservar, pide TODOS los datos en UN SOLO mensaje:
"Para tu reservación necesito:
1. Nombre completo
2. Teléfono (con WhatsApp de preferencia)
3. Fecha (viernes o sábado)
4. Número de personas
5. Tipo de mesa: General, VIP ($3,000 min) o Booth ($8,000 min)"

Cuando el usuario proporcione los datos (pueden venir en uno o varios mensajes), extrae la información. NO preguntes dato por dato, espera a que el usuario te dé la información.

Cuando tengas TODOS los datos necesarios (nombre, teléfono, fecha, personas, tipo de mesa), confirma los datos Y agrega al FINAL de tu mensaje este bloque JSON exacto:

[RESERVACION_DATA]
{"name":"nombre","phone":"telefono","date":"YYYY-MM-DD","guests":numero,"tableType":"general|vip|booth"}
[/RESERVACION_DATA]

IMPORTANTE:
- Solo genera el bloque [RESERVACION_DATA] UNA SOLA VEZ cuando tengas TODOS los datos completos
- NUNCA generes el bloque [RESERVACION_DATA] más de una vez en la conversación
- Si ya generaste el bloque y el usuario confirma o agradece, solo responde amablemente SIN el bloque
- La fecha debe estar en formato YYYY-MM-DD
- tableType debe ser exactamente: "general", "vip" o "booth"
- guests debe ser un número
- Si falta algún dato, pide los faltantes en un solo mensaje, no uno por uno
- NO repitas la solicitud de datos si el usuario ya los proporcionó

## Tus capacidades:
1. Dar información sobre el club (horarios, ubicación, dress code)
2. Informar sobre el menú y precios actualizados
3. Tomar reservaciones completas
4. Informar sobre próximos eventos y DJs con fechas específicas
5. Resolver dudas generales

Responde siempre de manera útil y mantén la conversación enfocada en ayudar al cliente.`;
}

// Models to try in order (fallback)
const MODELS = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-pro'];

async function tryWithRetry(
  genAI: GoogleGenerativeAI,
  message: string,
  chatHistory: any[],
  systemPrompt: string,
  maxRetries = 3
): Promise<string> {
  for (const modelName of MODELS) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: systemPrompt,
        });

        const chat = model.startChat({ history: chatHistory });
        const result = await chat.sendMessage(message);
        return result.response.text();
      } catch (error: any) {
        const isOverloaded = error?.status === 503 || error?.message?.includes('overloaded');
        const isNotFound = error?.status === 404;

        if (isNotFound) {
          console.log(`Model ${modelName} not found, trying next...`);
          break; // Try next model
        }

        if (isOverloaded && attempt < maxRetries) {
          const waitTime = attempt * 1000; // 1s, 2s, 3s
          console.log(`Model ${modelName} overloaded, retry ${attempt}/${maxRetries} in ${waitTime}ms...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }

        if (attempt === maxRetries) {
          console.log(`Model ${modelName} failed after ${maxRetries} attempts, trying next model...`);
          break; // Try next model
        }
      }
    }
  }
  throw new Error('All models failed');
}

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();

    // Build dynamic system prompt with events and menu from DB
    const systemPrompt = await buildSystemPrompt();

    // Convert history to Gemini format - skip initial assistant messages
    let chatHistory = history
      .filter((msg: any) => msg.role === 'user' || msg.role === 'assistant')
      .map((msg: any) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));

    // Gemini requires first message to be from user, skip assistant messages at start
    while (chatHistory.length > 0 && chatHistory[0].role === 'model') {
      chatHistory = chatHistory.slice(1);
    }

    // Try to get response with retries and fallback models
    const botResponse = await tryWithRetry(genAI, message, chatHistory, systemPrompt);

    return NextResponse.json({ response: botResponse });
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { response: 'Lo siento, el servicio está ocupado. Por favor intenta en unos segundos.' },
      { status: 500 }
    );
  }
}
