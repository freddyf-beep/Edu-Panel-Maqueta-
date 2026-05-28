import { NextRequest, NextResponse } from "next/server"
import { verifyAllowedUser } from "@/lib/auth/verify-token"
import { getFeatureFlags } from "@/lib/feature-flags"
import { GoogleGenAI } from "@google/genai"

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" })

const RATE_LIMIT_PER_HOUR = 20
const rateBuckets = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(uid: string): { ok: boolean; retryAfter?: number } {
  const now = Date.now()
  const bucket = rateBuckets.get(uid)
  if (!bucket || bucket.resetAt < now) {
    rateBuckets.set(uid, { count: 1, resetAt: now + 60 * 60 * 1000 })
    return { ok: true }
  }
  if (bucket.count >= RATE_LIMIT_PER_HOUR) {
    return { ok: false, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) }
  }
  bucket.count++
  return { ok: true }
}

export async function POST(req: NextRequest) {
  try {
    const authCheck = await verifyAllowedUser(req)
    if (!authCheck.ok) return authCheck.response
    const authUser = authCheck.auth

    // Rate Limiting
    const rl = checkRateLimit(authUser.uid)
    if (!rl.ok) {
      return NextResponse.json(
        { error: `Demasiadas solicitudes. Intente de nuevo en ${rl.retryAfter} segundos.` },
        { status: 429, headers: rl.retryAfter ? { "Retry-After": String(rl.retryAfter) } : {} }
      )
    }

    // Comprobar feature flag
    const flags = await getFeatureFlags()
    if (!flags["rubricas-sello"]?.active) {
      return NextResponse.json(
        { error: "Función Premium inactiva. Habilítela en el panel de administración." },
        { status: 403 }
      )
    }

    const { objetivo, sello, niveles, curso, asignatura } = await req.json()

    if (!objetivo || !sello) {
      return NextResponse.json({ error: "Faltan parámetros requeridos: objetivo o sello." }, { status: 400 })
    }

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "AIzaSyBz38YG9F7_P4JP8MYtWrQtqQd7ytglWwM" || objetivo.toLowerCase().includes("simul")) {
      // Mock de respuesta para la maqueta
      return NextResponse.json({
        titulo: `Rúbrica con Sello ${sello}: ${objetivo.slice(0, 25)}...`,
        selloIntegrado: sello,
        criterios: [
          {
            nombre: "Dominio del Contenido Curricular",
            descripcion: `Evalúa la comprensión del objetivo pedagógico: ${objetivo}`,
            desempenos: [
              { "nivel": "Destacado", "puntaje": 4, "descriptor": "Demuestra comprensión excepcional del contenido, explicando conceptos y resolviendo dudas con fluidez." },
              { "nivel": "Competente", "puntaje": 3, "descriptor": "Demuestra buena comprensión de los conceptos clave y puede aplicarlos a situaciones comunes." },
              { "nivel": "Básico", "puntaje": 2, "descriptor": "Muestra comprensión parcial; comete errores conceptuales menores pero capta la idea general." },
              { "nivel": "Insatisfactorio", "puntaje": 1, "descriptor": "No logra demostrar comprensión de los temas fundamentales evaluados." }
            ]
          },
          {
            nombre: `Integración del Sello: ${sello}`,
            descripcion: `Evidencia la incorporación y aplicación del sello valórico ${sello} en el desarrollo del trabajo.`,
            desempenos: [
              { "nivel": "Destacado", "puntaje": 4, "descriptor": `Integra de forma activa y explícita el sello ${sello}, proponiendo ideas transformadoras y liderando la conciencia valórica del grupo.` },
              { "nivel": "Competente", "puntaje": 3, "descriptor": `Evidencia coherencia con el sello ${sello} de manera consistente y respetuosa durante el desarrollo de la actividad.` },
              { "nivel": "Básico", "puntaje": 2, "descriptor": `Muestra indicios o menciones del sello ${sello} pero de forma esporádica o con baja profundidad reflexiva.` },
              { "nivel": "Insatisfactorio", "puntaje": 1, "descriptor": `No se observa evidencia de la incorporación del sello ${sello} en su desempeño o fundamentación.` }
            ]
          },
          {
            nombre: "Calidad y Rigor de la Presentación",
            descripcion: "Calidad formal de la entrega o exposición, incluyendo estructura y claridad de ideas.",
            desempenos: [
              { "nivel": "Destacado", "puntaje": 4, "descriptor": "Estructura impecable, presentación atractiva y uso de vocabulario técnico sobresaliente." },
              { "nivel": "Competente", "puntaje": 3, "descriptor": "Estructura clara y comprensible. Sigue las instrucciones principales y expone con orden." },
              { "nivel": "Básico", "puntaje": 2, "descriptor": "Presentación con desorganizaciones menores. Vocabulario limitado y fallas en la pauta formal." },
              { "nivel": "Insatisfactorio", "puntaje": 1, "descriptor": "Estructura confusa e incompleta. No sigue las pautas ni demuestra preparación formal." }
            ]
          }
        ]
      })
    }

    const prompt = `
      Eres un consultor de diseño curricular experto. Diseña una rúbrica de evaluación analítica que integre de forma transversal el sello educativo "${sello}" junto con el siguiente objetivo/contenido pedagógico: "${objetivo}".
      
      Detalles del contexto:
      Curso: ${curso || "No especificado"}
      Asignatura: ${asignatura || "No especificada"}
      Niveles de desempeño requeridos: ${niveles || 4} (ej: Insatisfactorio, Básico, Competente, Destacado)
      
      Genera exactamente de 3 a 5 criterios de evaluación. Al menos uno de los criterios debe evaluar explícitamente cómo se manifiesta el sello institucional "${sello}" (ej: si el sello es ecológico, evaluar conciencia ambiental; si es artístico, evaluar creatividad y expresión estética, etc.) en el desempeño del estudiante.

      Responde únicamente con un objeto JSON estructurado de la siguiente forma (sin envoltorios markdown, sin explicaciones adicionales):
      {
        "titulo": "Rúbrica con Sello: [Nombre descriptivo]",
        "selloIntegrado": "${sello}",
        "criterios": [
          {
            "nombre": "[Nombre del criterio]",
            "descripcion": "[Qué evalúa este criterio]",
            "desempenos": [
              { "nivel": "[Nombre del nivel, ej: Destacado]", "puntaje": 4, "descriptor": "[Qué hace el alumno para obtener este puntaje]" },
              ...
            ]
          },
          ...
        ]
      }
    `

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2
      }
    })

    const text = response.text?.trim() || "{}"
    const resultJson = JSON.parse(text)

    return NextResponse.json(resultJson)
  } catch (error: any) {
    console.warn("Error en Rúbricas Sello API, usando fallback:", error)
    return NextResponse.json({
      titulo: `Rúbrica con Sello: ${objetivo.slice(0, 20)}...`,
      selloIntegrado: sello,
      criterios: [
        {
          nombre: "Desempeño Curricular General",
          descripcion: `Mapeado bajo el objetivo curricular ${objetivo}`,
          desempenos: [
            { "nivel": "Logrado", "puntaje": 4, "descriptor": "Cumple con todos los indicadores de evaluación correspondientes." },
            { "nivel": "Por lograr", "puntaje": 1, "descriptor": "No cumple con los indicadores de logro mínimos." }
          ]
        },
        {
          nombre: `Enfoque Transversal: ${sello}`,
          descripcion: "Aplicación y actitud acorde al perfil del sello institucional.",
          desempenos: [
            { "nivel": "Logrado", "puntaje": 4, "descriptor": `Refleja en su entrega los ideales y prácticas del sello ${sello}.` },
            { "nivel": "Por lograr", "puntaje": 1, "descriptor": `No refleja valores o directrices del sello ${sello}.` }
          ]
        }
      ]
    })
  }
}
