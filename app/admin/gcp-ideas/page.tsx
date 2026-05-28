"use client"

import { useState } from "react"
import { 
  Cloud, Coins, Cpu, Layers, DollarSign, Calculator, 
  Calendar, Sparkles, Database, Users, HelpCircle, ArrowRight,
  TrendingUp, Activity, CheckCircle
} from "lucide-react"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from "recharts"

const COST_DATA = [
  { name: "Gemini 1.5 Flash", costInput: 0.075, costOutput: 0.30, tokensPerDollar: 13.33 },
  { name: "Gemini 1.5 Pro", costInput: 1.25, costOutput: 5.00, tokensPerDollar: 0.8 }
]

export default function GcpIdeasPage() {
  // Parámetros de la calculadora
  const [docentes, setDocentes] = useState(50)
  const [evaluacionesMes, setEvaluacionesMes] = useState(15)
  const [promedioTokens, setPromedioTokens] = useState(25000) // 25k tokens por examen (instrucciones + OAs + salida)
  const [selectedModel, setSelectedModel] = useState("flash") // "flash" o "pro"

  // Cálculos
  const totalQueriesMes = docentes * evaluacionesMes
  const tokensMes = totalQueriesMes * promedioTokens
  
  // Costos por 1M de tokens
  // Gemini 1.5 Flash: $0.075 / 1M input, $0.30 / 1M output. Asumimos 80% input, 20% output promedio.
  const costPerMillionFlash = (0.075 * 0.8) + (0.30 * 0.2)
  // Gemini 1.5 Pro: $1.25 input, $5.00 output.
  const costPerMillionPro = (1.25 * 0.8) + (5.00 * 0.2)

  const costPerMillion = selectedModel === "flash" ? costPerMillionFlash : costPerMillionPro
  const costoMensualUsd = (tokensMes / 1000000) * costPerMillion
  const mesesCredito = costoMensualUsd > 0 ? (300 / costoMensualUsd) : 100
  const totalGeneracionesConCredito = totalQueriesMes * (mesesCredito)

  // Datos para gráfico de consumo acumulado
  const chartAccumulatedData = Array.from({ length: 12 }, (_, i) => {
    const mes = i + 1
    const costoAcumulado = costoMensualUsd * mes
    return {
      name: `Mes ${mes}`,
      costo: parseFloat(costoAcumulado.toFixed(2)),
      limite: 300
    }
  })

  return (
    <div className="max-w-6xl mx-auto pb-16 space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 text-white border border-slate-800 shadow-xl">
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-widest">
              <Cloud className="w-4 h-4 animate-pulse" />
              Google Cloud Platform & Vertex AI
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Aprovechamiento del Crédito de $300 USD
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              Plan de optimización técnica y proyección de costos para escalar EduPanel utilizando modelos de lenguaje de última generación de Google Cloud.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-2xl p-5 border border-white/10 text-center shrink-0 min-w-[200px]">
            <div className="text-xs uppercase font-extrabold text-indigo-300">Fondo Inicial Asignado</div>
            <div className="text-4xl font-extrabold mt-1 text-emerald-400">$300.00 USD</div>
            <div className="text-[10px] text-slate-300 mt-1">Crédito Google Cloud Alfa</div>
          </div>
        </div>
      </div>

      {/* Grid de Estadísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard 
          icon={<DollarSign className="text-emerald-500" />}
          title="Costo Mensual Estimado"
          value={`$${costoMensualUsd.toFixed(2)} USD`}
          subtitle="Para todo el establecimiento"
        />
        <StatCard 
          icon={<Calendar className="text-indigo-500" />}
          title="Duración del Crédito"
          value={mesesCredito > 36 ? "36+ meses" : `${mesesCredito.toFixed(1)} meses`}
          subtitle="Con el uso proyectado actual"
        />
        <StatCard 
          icon={<Cpu className="text-pink-500" />}
          title="Total Consultas con $300"
          value={totalGeneracionesConCredito > 100000 ? "+100k" : Math.round(totalGeneracionesConCredito).toLocaleString("es-CL")}
          subtitle="Exámenes creados con IA"
        />
        <StatCard 
          icon={<Users className="text-amber-500" />}
          title="Eficiencia por Docente"
          value={`$${(costoMensualUsd / docentes).toFixed(3)} USD`}
          subtitle="Costo mensual promedio por profe"
        />
      </div>

      {/* Calculadora Interactiva y Gráfico */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Panel de Control de la Calculadora */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Calculator className="w-5 h-5 text-indigo-500" />
            <h2 className="font-extrabold text-base text-foreground">Calculadora de Escalamiento</h2>
          </div>

          <div className="space-y-4">
            {/* Docentes */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-muted-foreground">
                <span>Número de Profesores:</span>
                <span className="text-foreground">{docentes}</span>
              </div>
              <input
                type="range"
                min="5"
                max="200"
                value={docentes}
                onChange={e => setDocentes(parseInt(e.target.value))}
                className="w-full accent-indigo-600"
              />
              <div className="flex justify-between text-[9px] text-muted-foreground/60">
                <span>5 profes</span>
                <span>200 profes</span>
              </div>
            </div>

            {/* Evaluaciones por Mes */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-muted-foreground">
                <span>Evaluaciones/Guías por mes:</span>
                <span className="text-foreground">{evaluacionesMes}</span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                value={evaluacionesMes}
                onChange={e => setEvaluacionesMes(parseInt(e.target.value))}
                className="w-full accent-indigo-600"
              />
              <div className="flex justify-between text-[9px] text-muted-foreground/60">
                <span>1 por mes</span>
                <span>50 por mes</span>
              </div>
            </div>

            {/* Tamaño promedio de tokens */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase block">Tokens promedio por recurso:</label>
              <select
                value={promedioTokens}
                onChange={e => setPromedioTokens(parseInt(e.target.value))}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none"
              >
                <option value={10000}>10K tokens (~15 preguntas, sin contexto largo)</option>
                <option value={25000}>25K tokens (~30 preguntas, OAs y textos cortos)</option>
                <option value={50000}>50K tokens (Examen largo, textos extensos de comprensión)</option>
                <option value={100000}>100K tokens (Inyección de PEI completo + Planificación anual)</option>
              </select>
            </div>

            {/* Modelo Utilizado */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase block font-sans">Modelo de Gemini:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSelectedModel("flash")}
                  className={`rounded-xl border py-2.5 px-3 text-xs font-bold transition-all ${
                    selectedModel === "flash"
                      ? "border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  Gemini 1.5 Flash
                  <span className="block text-[8px] font-medium text-muted-foreground">Velocidad / Costo $0</span>
                </button>
                <button
                  onClick={() => setSelectedModel("pro")}
                  className={`rounded-xl border py-2.5 px-3 text-xs font-bold transition-all ${
                    selectedModel === "pro"
                      ? "border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  Gemini 1.5 Pro
                  <span className="block text-[8px] font-medium text-muted-foreground">Razonamiento Avanzado</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Gráfico de Proyección de Costos */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              <h2 className="font-extrabold text-base text-foreground">Proyección de Gasto Acumulado (12 Meses)</h2>
            </div>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold">
              Límite Crédito: $300 USD
            </span>
          </div>

          <div className="h-[260px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartAccumulatedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCosto" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#888888" opacity={0.1} />
                <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} />
                <YAxis stroke="#888888" fontSize={10} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="costo" name="Gasto Acumulado (USD)" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorCosto)" />
                {/* Línea de referencia del crédito */}
                <Legend verticalAlign="top" height={36} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <p className="text-[11px] text-muted-foreground leading-relaxed">
            *Gráfico estimado para un consumo sostenido de <strong>{tokensMes.toLocaleString("es-CL")}</strong> tokens al mes. Si el gasto mensual acumulado no supera los $300 USD en un año, la plataforma opera a costo marginal prácticamente cero en infraestructura de inferencia de IA.
          </p>
        </div>
      </div>

      {/* Propuesta de Arquitectura GCP en EduPanel */}
      <div className="bg-card border border-border rounded-2xl p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <Layers className="w-5 h-5 text-indigo-500" />
          <h2 className="font-extrabold text-base text-foreground">Arquitectura e Ideas Clave para los $300 USD</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ArchitectureCard 
            badge="MÓDULO PREMIUM 1"
            title="Vertex AI Vector Search"
            cost="Costo: ~$0.045 / hr por nodo de consulta indexado"
            desc="Sube los PDFs del currículum de música, ciencias, educación física y lenguaje a Google Cloud Storage, pásalos por textembedding-gecko y realiza búsquedas semánticas directas. Freddy puede sugerir recursos vinculando significados profundos."
            linkText="Ver Recomendador Semántico"
            linkUrl="/evaluaciones?tab=guias"
          />
          <ArchitectureCard 
            badge="MÓDULO PREMIUM 2"
            title="Vertex AI Agent Builder (Apoderados)"
            cost="Costo: ~$0.012 por conversación"
            desc="Crea un chatbot de Dialogflow CX conectado al manual de convivencia del colegio. Los apoderados chatean 24/7 en el portal institucional y resuelven dudas administrativas sin recargar al personal."
            linkText="Probar Widget de Chat"
            linkUrl="/"
          />
          <ArchitectureCard 
            badge="BACKUPS OPERATIVOS"
            title="Google Cloud Run + Storage backups"
            cost="Costo: ~$0.02 mensual por GB"
            desc="Automatiza copias de seguridad de las rúbricas y libros de clases en Firestore. Puedes agendar scripts usando Cloud Scheduler que llamen a Cloud Run para exportar colecciones automáticamente y resguardar el colegio."
            linkText="Ver Backups"
            linkUrl="/admin/mantenimiento"
          />
        </div>

        {/* Flujo de Arquitectura Visual */}
        <div className="bg-slate-50 dark:bg-slate-900/40 border border-border rounded-xl p-6 text-center space-y-6">
          <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Flujo de Datos en Google Cloud</h3>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-xs">
            <div className="bg-card p-4 rounded-xl border border-border shadow-sm max-w-[200px] w-full">
              <Database className="w-6 h-6 text-indigo-500 mx-auto mb-2" />
              <div className="font-bold">Firestore</div>
              <div className="text-[10px] text-muted-foreground mt-1">Guarda Rúbricas y Guías en tiempo real.</div>
            </div>

            <ArrowRight className="hidden md:block w-5 h-5 text-muted-foreground rotate-0" />
            <div className="md:hidden text-muted-foreground text-lg">↓</div>

            <div className="bg-card p-4 rounded-xl border border-border shadow-sm max-w-[200px] w-full">
              <Cpu className="w-6 h-6 text-emerald-500 mx-auto mb-2 animate-spin-slow" />
              <div className="font-bold">Cloud Functions</div>
              <div className="text-[10px] text-muted-foreground mt-1">Escucha cambios y genera embeddings con Vertex.</div>
            </div>

            <ArrowRight className="hidden md:block w-5 h-5 text-muted-foreground" />
            <div className="md:hidden text-muted-foreground text-lg">↓</div>

            <div className="bg-card p-4 rounded-xl border border-border shadow-sm max-w-[200px] w-full">
              <Cloud className="w-6 h-6 text-pink-500 mx-auto mb-2" />
              <div className="font-bold">Vertex AI Index</div>
              <div className="text-[10px] text-muted-foreground mt-1">Indexa y devuelve coincidencias en 100ms.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, title, value, subtitle }: any) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4 shadow-sm hover:scale-[1.01] transition-transform duration-200">
      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-lg shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{title}</h4>
        <div className="text-xl font-extrabold text-foreground mt-0.5">{value}</div>
        <p className="text-[10px] text-muted-foreground truncate mt-0.5">{subtitle}</p>
      </div>
    </div>
  )
}

function ArchitectureCard({ badge, title, cost, desc, linkText, linkUrl }: any) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
      <div className="space-y-2">
        <span className="text-[9px] font-extrabold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 dark:text-indigo-400 px-2 py-0.5 rounded-full uppercase tracking-wider">
          {badge}
        </span>
        <h3 className="font-bold text-base text-foreground">{title}</h3>
        <div className="text-xs font-bold text-emerald-600">{cost}</div>
        <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
      </div>
      
      <div>
        <a 
          href={linkUrl}
          className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline group"
        >
          {linkText}
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </a>
      </div>
    </div>
  )
}
