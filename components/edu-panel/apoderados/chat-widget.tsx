"use client"

import { useEffect, useState, useRef } from "react"
import { MessageSquare, X, Send, Bot, User, Sparkles } from "lucide-react"
import { getFeatureFlags } from "@/lib/feature-flags"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  text: string
  sender: "bot" | "user"
  ts: Date
}

export function ParentChatWidget() {
  const [active, setActive] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      text: "¡Hola! Soy el Asistente Escolar 24/7 de EduPanel. Estoy entrenado con el Reglamento Interno, Manual de Convivencia y FAQs de la institución escolar. ¿En qué te puedo ayudar hoy?",
      sender: "bot",
      ts: new Date()
    }
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Cargar feature flag para ver si mostramos el widget
    getFeatureFlags().then(flags => {
      if (flags["bot-apoderados"]?.active) {
        setActive(true)
      }
    }).catch(console.error)
  }, [])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  if (!active) return null

  const getBotResponse = (userMsg: string): string => {
    const text = userMsg.toLowerCase()
    if (text.includes("horario") || text.includes("hora")) {
      return "El horario de clases general de la jornada escolar es de lunes a viernes desde las 08:00 hrs. Los bloques y salidas detalladas varían según el nivel académico del alumno (Básica o Media)."
    }
    if (text.includes("justific") || text.includes("inasistencia") || text.includes("enfermo") || text.includes("falta")) {
      return "Según el Artículo 24 del Reglamento de Convivencia, toda inasistencia debe ser justificada en la libreta física o de forma digital por el apoderado dentro de las 24 horas siguientes. En caso de inasistencia a pruebas sumativas, se exige certificado médico para reagendar."
    }
    if (text.includes("uniforme") || text.includes("vestimenta") || text.includes("ropa")) {
      return "El uso del uniforme escolar oficial es obligatorio. Para las clases de Educación Física y Salud, los estudiantes deben portar obligatoriamente su vestimenta deportiva del colegio y ropa de cambio para higiene."
    }
    if (text.includes("contacto") || text.includes("profesor") || text.includes("reunion")) {
      return "Puedes solicitar reuniones de apoderados directamente en la pestaña de contacto del portal docente, o enviando una solicitud firmada. El horario establecido de atención a apoderados es los martes y jueves entre las 15:30 y 16:30 hrs."
    }
    if (text.includes("nota") || text.includes("promedio") || text.includes("prueba")) {
      return "Las notas parciales se actualizan semanalmente en el registro curricular. Los apoderados pueden ver las calificaciones oficiales al final de cada unidad temática. Si notas algún error, puedes contactar al profesor de la asignatura."
    }
    return "Entiendo tu duda. Actualmente este Chatbot está simulando estar conectado a Vertex AI Search & Conversation utilizando el reglamento escolar. Con la API real, puedo buscar en documentos PDF, circulares y dar respuestas precisas."
  }

  const handleSend = () => {
    if (!input.trim()) return

    const userMsg: Message = {
      id: `u_${Date.now()}`,
      text: input,
      sender: "user",
      ts: new Date()
    }

    setMessages(prev => [...prev, userMsg])
    setInput("")
    setIsTyping(true)

    // Simular respuesta del Bot
    setTimeout(() => {
      const botReply: Message = {
        id: `b_${Date.now()}`,
        text: getBotResponse(userMsg.text),
        sender: "bot",
        ts: new Date()
      }
      setMessages(prev => [...prev, botReply])
      setIsTyping(false)
    }, 1200)
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans">
      {/* Botón flotante */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-pink-600 to-indigo-600 text-white shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 group relative"
          title="Chatbot de Apoderados 24/7"
        >
          <MessageSquare className="h-6 w-6" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-pink-500 text-[8px] font-bold text-white items-center justify-center">AI</span>
          </span>
        </button>
      )}

      {/* Ventana de chat */}
      {isOpen && (
        <div className="w-[360px] h-[480px] bg-card border border-border rounded-[20px] shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-pink-600 to-indigo-600 p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="h-4.5 w-4.5 text-white" />
              </div>
              <div>
                <h4 className="text-[13px] font-extrabold flex items-center gap-1">
                  Portal Apoderados AI
                  <span className="text-[8px] font-bold bg-white/20 px-1.5 py-0.5 rounded-full uppercase tracking-wider">MOCK</span>
                </h4>
                <p className="text-[10px] text-white/80">Reglamento Escolar Indexado</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white hover:bg-white/10 rounded-full p-1 transition-colors"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Mensajes */}
          <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50 dark:bg-slate-900/10">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={cn(
                  "flex items-start gap-2 max-w-[85%] text-[12.5px] leading-relaxed",
                  msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                )}
              >
                <div
                  className={cn(
                    "h-6 w-6 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold",
                    msg.sender === "user" ? "bg-indigo-600 text-white" : "bg-muted text-muted-foreground border border-border"
                  )}
                >
                  {msg.sender === "user" ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
                </div>
                <div
                  className={cn(
                    "rounded-[14px] px-3.5 py-2",
                    msg.sender === "user"
                      ? "bg-indigo-600 text-white rounded-tr-none"
                      : "bg-card text-foreground border border-border rounded-tl-none"
                  )}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex items-start gap-2 max-w-[85%] text-[12.5px] mr-auto">
                <div className="h-6 w-6 rounded-full flex-shrink-0 flex items-center justify-center bg-muted text-muted-foreground border border-border">
                  <Bot className="h-3 w-3" />
                </div>
                <div className="bg-card border border-border rounded-[14px] rounded-tl-none px-3.5 py-2 flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                  <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                  <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                </div>
              </div>
            )}
          </div>

          {/* Footer de información / demo */}
          <div className="px-4 py-1.5 bg-indigo-50 dark:bg-indigo-950/20 text-[9.5px] text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5 border-t border-border">
            <Sparkles className="h-3 w-3 animate-pulse shrink-0" />
            <span>Alimentado por <strong>Vertex AI Agent Builder</strong> ($300 GCP Alfa)</span>
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border bg-card flex gap-2">
            <input
              type="text"
              placeholder="Preguntar sobre horarios, inasistencias..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleSend() }}
              className="flex-1 bg-background border border-border rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="h-8 w-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all shrink-0"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
