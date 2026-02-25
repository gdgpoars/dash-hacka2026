"use client"

import { useState, useEffect, useRef } from "react"
import { initializeApp, getApps, FirebaseApp } from "firebase/app"
import { getFirestore, doc, getDoc, setDoc, onSnapshot, Firestore } from "firebase/firestore"

// ============================================================
// CONFIGURAÇÃO FIREBASE
// ============================================================
const FIREBASE_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// ============================================================
// TIPOS
// ============================================================
type Checks = Record<string, boolean>

interface Phase {
  id: number
  emoji: string
  name: string
  label: string
  period: string
  deadline: Date
  color: string
  meta?: string
  valor?: string
  tasks: string[]
}

// ============================================================
// DADOS DO EVENTO
// ============================================================
const EVENT_DATE = new Date("2026-09-12T08:00:00")

const PHASES: Phase[] = [
  {
    id: 1, emoji: "🔵", name: "Fundação",
    label: "FASE 1 — FUNDAÇÃO E POSICIONAMENTO",
    period: "Março 2026", deadline: new Date("2026-03-31"),
    color: "#4285F4",
    tasks: [
      "Definir posicionamento oficial",
      "Validar objetivos com Magalu Cloud",
      "Definir macrotema e subcategorias",
      "Definir modelo de premiação",
      "Aprovar orçamento preliminar",
      "Definir valores oficiais dos ingressos",
      "Definir política de descontos",
      "Definir metas de leads para patrocinador",
    ],
  },
  {
    id: 2, emoji: "🟣", name: "Spoiler",
    label: "FASE 2 — SPOILER & AQUECIMENTO",
    period: "20/04/2026", deadline: new Date("2026-04-20"),
    color: "#9C27B0",
    tasks: [
      "Publicar post enigmático",
      "Criar frase conceitual sobre Cloud & Impacto",
      "Não revelar formato ainda",
      "CTA: 'Fique atento'",
    ],
  },
  {
    id: 3, emoji: "🔵", name: "Lançamento",
    label: "FASE 3 — PRONUNCIAMENTO OFICIAL",
    period: "05/05/2026", deadline: new Date("2026-05-05"),
    color: "#4285F4",
    tasks: [
      "Revelar nome oficial: Hacka GDGs Sul",
      "Revelar data: 12/09/2026",
      "Revelar local e formato híbrido",
      "Revelar patrocinador principal",
      "Revelar número limitado de vagas (48)",
      "Abrir lista de interesse (waitlist)",
      "Publicar página oficial (sem vendas ainda)",
      "Landing page publicada (10/05)",
      "Evento criado na plataforma de ingressos (15/05)",
      "Sistema de pagamento testado (18/05)",
    ],
  },
  {
    id: 4, emoji: "🟢", name: "Early Bird",
    label: "FASE 4 — EARLY BIRD",
    period: "20/05 → 05/06", deadline: new Date("2026-06-05"),
    color: "#34A853", meta: "40% das vagas (~20 ingressos)", valor: "R$ 89",
    tasks: [
      "Abrir vendas Early Bird (20/05)",
      "Post explicando o desafio (27/05)",
      "Post técnico sobre Magalu Cloud (30/05)",
      "Monitorar: se <30% até 30/05, intensificar comunicação",
      "Publicar regulamento (10/06)",
      "Fechar Early Bird (05/06)",
    ],
  },
  {
    id: 5, emoji: "🟡", name: "Lote Regular",
    label: "FASE 5 — LOTE REGULAR",
    period: "06/06 → 31/07", deadline: new Date("2026-07-31"),
    color: "#FBBC05", meta: "75% das vagas até 31/07", valor: "R$ 99",
    tasks: [
      "Virar lote regular (06/06)",
      "Post sobre premiação (15/06)",
      "Vídeo convite lideranças (25/06)",
      "Termos jurídicos finalizados (20/06)",
      "Post de marco: 50% das vagas (01/07)",
      "Apresentação mentores (10/07)",
      "Mentores confirmados (10/07)",
      "Jurados confirmados (20/07)",
      "Post benefícios para carreira (20/07)",
      "Coffee break orçado (30/07)",
      "Últimos dias lote regular (31/07)",
      "Se <65% até 15/07 → campanha de urgência",
    ],
  },
  {
    id: 6, emoji: "🔴", name: "Lote Final",
    label: "FASE 6 — LOTE FINAL",
    period: "01/08 → 05/09", deadline: new Date("2026-09-05"),
    color: "#EA4335", meta: "SOLD OUT até 05/09", valor: "R$ 119",
    tasks: [
      "Virar lote final — últimas 12 vagas (01/08)",
      "Kits fechados (05/08)",
      "Post: faltam 30 dias (12/08)",
      "Certificados configurados (10/08)",
      "Planilha de avaliação final (15/08)",
      "Divulgação workshop pré-hackathon (25/08)",
      "Infraestrutura validada na faculdade (25/08)",
      "Contagem regressiva oficial (01/09)",
      "Lista final de participantes (05/09)",
      "Meta 85% até 15/08",
      "Meta 95% até 01/09",
    ],
  },
  {
    id: 7, emoji: "🧠", name: "Formação Prévia",
    label: "FASE 7 — FORMAÇÃO PRÉ-HACKATHON",
    period: "26/08 → 30/08", deadline: new Date("2026-08-30"),
    color: "#00BCD4",
    tasks: [
      "Workshop técnico online (26/08)",
      "Envio do manual do participante (28/08)",
      "Montagem oficial das equipes (30/08)",
    ],
  },
  {
    id: 8, emoji: "⚡", name: "Semana do Evento",
    label: "FASE 8 — SEMANA DO EVENTO",
    period: "07/09 → 11/09", deadline: new Date("2026-09-11"),
    color: "#FF5722",
    tasks: [
      "Confirmação final de participantes",
      "Briefing com equipe de apoio",
      "Abertura online (11/09 — sexta)",
      "Apresentação do desafio e subcategorias",
      "Regras, critérios e orientação técnica",
      "Configuração da plataforma Magalu Cloud",
    ],
  },
  {
    id: 9, emoji: "🏆", name: "Evento",
    label: "FASE 9 — HACKATHON PRESENCIAL",
    period: "12/09/2026", deadline: new Date("2026-09-12"),
    color: "#34A853",
    tasks: [
      "Check-in participantes (08h)",
      "8 horas intensivas de desenvolvimento",
      "Rodadas estruturadas de mentoria",
      "Pitches avaliados por banca técnica",
      "Premiação e encerramento",
    ],
  },
]

// ============================================================
// FIREBASE
// ============================================================
let db: Firestore | null = null

function initFirebase(): Firestore | null {
  if (db) return db
  try {
    const app: FirebaseApp = getApps().length ? getApps()[0] : initializeApp(FIREBASE_CONFIG as object)
    db = getFirestore(app)
    return db
  } catch (e) {
    console.error("Firebase init error:", e)
    return null
  }
}

async function loadChecks(): Promise<Checks> {
  const database = initFirebase()
  if (!database) return {}
  try {
    const ref = doc(database, "hacka2026", "checks")
    const snap = await getDoc(ref)
    return snap.exists() ? (snap.data() as Checks) : {}
  } catch (e) {
    console.error("Load error:", e)
    return {}
  }
}

async function saveChecks(checks: Checks): Promise<void> {
  const database = initFirebase()
  if (!database) return
  try {
    const ref = doc(database, "hacka2026", "checks")
    await setDoc(ref, checks)
  } catch (e) {
    console.error("Save error:", e)
  }
}

function subscribeChecks(callback: (data: Checks) => void): () => void {
  const database = initFirebase()
  if (!database) return () => {}
  const ref = doc(database, "hacka2026", "checks")
  const unsub = onSnapshot(ref, (snap) => {
    callback(snap.exists() ? (snap.data() as Checks) : {})
  })
  return unsub
}

// ============================================================
// LÓGICA
// ============================================================
function getCurrentPhase(): Phase {
  const now = new Date()
  for (let i = 0; i < PHASES.length; i++) {
    if (now < PHASES[i].deadline) return PHASES[i]
  }
  return PHASES[PHASES.length - 1]
}

// ============================================================
// COMPONENTES
// ============================================================
function CountdownUnit({ value, label, color = "#4285F4" }: { value: number; label: string; color?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{
        background: `${color}12`,
        border: `1px solid ${color}30`,
        borderRadius: 16, padding: "14px 18px",
        minWidth: 68, textAlign: "center",
        fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
        fontWeight: 900, color,
        letterSpacing: "-0.03em", lineHeight: 1,
        fontFamily: "monospace",
      }}>
        {String(value).padStart(2, "0")}
      </div>
      <span style={{ fontSize: 11, color: "rgba(0,0,0,0.38)", marginTop: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
        {label}
      </span>
    </div>
  )
}

function SyncDot({ synced }: { synced: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{
        width: 8, height: 8, borderRadius: "50%",
        background: synced ? "#34A853" : "#FBBC05",
        boxShadow: synced ? "0 0 6px #34A85388" : "0 0 6px #FBBC0588",
      }} />
      <span style={{ fontSize: 11, color: "rgba(0,0,0,0.4)", fontWeight: 600 }}>
        {synced ? "Sincronizado" : "Sincronizando..."}
      </span>
    </div>
  )
}

// ============================================================
// APP PRINCIPAL
// ============================================================
export default function HackaDashboard() {
  const [checks, setChecks] = useState<Checks>({})
  const [synced, setSynced] = useState(false)
  const [openPhase, setOpenPhase] = useState<number | null>(null)
  const [now, setNow] = useState(new Date())
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    loadChecks().then((data) => {
      setChecks(data)
      setSynced(true)
    })
    const unsub = subscribeChecks((data) => {
      setChecks(data)
      setSynced(true)
    })
    return unsub
  }, [])

  const toggleCheck = (phaseId: number, taskIndex: number) => {
    const key = `p${phaseId}_t${taskIndex}`
    const next: Checks = { ...checks, [key]: !checks[key] }
    setChecks(next)
    setSynced(false)
    if (saveTimeout.current) clearTimeout(saveTimeout.current)
    saveTimeout.current = setTimeout(() => {
      saveChecks(next).then(() => setSynced(true))
    }, 600)
  }

  const diff = Math.max(0, EVENT_DATE.getTime() - now.getTime())
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  const seconds = Math.floor((diff % 60000) / 1000)

  const currentPhase = getCurrentPhase()
  const totalTasks = PHASES.reduce((a, p) => a + p.tasks.length, 0)
  const doneTasks = PHASES.reduce((a, p) =>
    a + p.tasks.filter((_, i) => checks[`p${p.id}_t${i}`]).length, 0)

  const card: React.CSSProperties = {
    background: "#fff",
    border: "1px solid rgba(0,0,0,0.08)",
    borderRadius: 20,
    boxShadow: "0 1px 8px rgba(0,0,0,0.05)",
  }

  return (
    <div style={{ fontFamily: "'Google Sans', 'Segoe UI', sans-serif", background: "#F8F9FA", minHeight: "100vh", paddingBottom: 80 }}>

      {/* Header */}
      <div style={{
        background: "#fff", borderBottom: "1px solid rgba(0,0,0,0.08)",
        padding: "16px 32px", display: "flex", alignItems: "center",
        justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50,
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: "linear-gradient(135deg,#4285F4,#34A853)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ color: "#fff", fontWeight: 900, fontSize: 16 }}>H</span>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, lineHeight: 1 }}>Hacka GDGs Sul 2026</div>
            <div style={{ fontSize: 12, color: "rgba(0,0,0,0.4)", marginTop: 2 }}>Dashboard Estratégico · Cloud & Impacto</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <SyncDot synced={synced} />
          <span style={{ fontSize: 12, color: "rgba(0,0,0,0.4)" }}>📍 Faculdade Dom Bosco, POA</span>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "36px 24px 0" }}>

        {/* TOP ROW */}
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr 0.9fr", gap: 20, marginBottom: 24 }}>

          {/* COUNTDOWN */}
          <div style={{ ...card, padding: "28px 32px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.09em", color: "#4285F4", marginBottom: 4 }}>
              ⏱ Contagem Regressiva
            </div>
            <div style={{ fontSize: 12, color: "rgba(0,0,0,0.4)", marginBottom: 20 }}>
              Evento presencial · 12/09/2026 (sáb)
            </div>
            {diff <= 0 ? (
              <div style={{ fontSize: 22, fontWeight: 900, color: "#34A853" }}>🎉 Evento iniciado!</div>
            ) : (
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <CountdownUnit value={days} label="dias" />
                <CountdownUnit value={hours} label="horas" />
                <CountdownUnit value={minutes} label="min" />
                <CountdownUnit value={seconds} label="seg" color="#EA4335" />
              </div>
            )}
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid rgba(0,0,0,0.06)", display: "flex", gap: 16, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, color: "rgba(0,0,0,0.4)" }}>🌐 Online: 11/09 (sex)</span>
              <span style={{ fontSize: 12, color: "rgba(0,0,0,0.4)" }}>🏛 Presencial: 12/09 (sáb)</span>
              <span style={{ fontSize: 12, color: "rgba(0,0,0,0.4)" }}>👥 48 vagas</span>
            </div>
          </div>

          {/* FASE ATUAL */}
          <div style={{ ...card, padding: "28px 28px", borderLeft: `4px solid ${currentPhase.color}` }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.09em", color: currentPhase.color, marginBottom: 10 }}>
              Fase Atual
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: 26 }}>{currentPhase.emoji}</span>
              <div>
                <div style={{ fontWeight: 800, fontSize: 16, lineHeight: 1.2 }}>{currentPhase.name}</div>
                <div style={{ fontSize: 12, color: "rgba(0,0,0,0.4)", marginTop: 2 }}>Fase {currentPhase.id} de {PHASES.length}</div>
              </div>
            </div>
            <div style={{ fontSize: 12, color: "rgba(0,0,0,0.5)", marginBottom: 8, lineHeight: 1.5 }}>{currentPhase.label}</div>
            <div style={{ fontSize: 12, color: "rgba(0,0,0,0.38)", marginBottom: 10 }}>📅 {currentPhase.period}</div>
            {currentPhase.valor && (
              <span style={{ fontSize: 12, background: `${currentPhase.color}15`, color: currentPhase.color, border: `1px solid ${currentPhase.color}30`, borderRadius: 999, padding: "3px 10px", fontWeight: 600 }}>
                💰 {currentPhase.valor} · {currentPhase.meta}
              </span>
            )}
            <div style={{ marginTop: 18, display: "flex", gap: 5, flexWrap: "wrap" }}>
              {PHASES.map(p => {
                const isDone = now >= p.deadline
                const isCur = p.id === currentPhase.id
                return (
                  <div key={p.id} title={`Fase ${p.id}: ${p.name}`} style={{
                    height: 8, width: isCur ? 28 : 8, borderRadius: 999,
                    background: isDone ? "#34A853" : isCur ? p.color : "rgba(0,0,0,0.1)",
                    transition: "all 0.3s",
                  }} />
                )
              })}
            </div>
          </div>

          {/* PROGRESSO GERAL */}
          <div style={{ ...card, padding: "28px 24px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.09em", color: "rgba(0,0,0,0.38)", marginBottom: 8 }}>
              📋 Progresso Total
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 4 }}>
              <span style={{ fontSize: 44, fontWeight: 900, color: "#4285F4", lineHeight: 1 }}>{doneTasks}</span>
              <span style={{ fontSize: 18, color: "rgba(0,0,0,0.25)", fontWeight: 600 }}>/{totalTasks}</span>
            </div>
            <div style={{ fontSize: 12, color: "rgba(0,0,0,0.4)", marginBottom: 16 }}>tarefas concluídas</div>
            <div style={{ height: 8, background: "rgba(0,0,0,0.07)", borderRadius: 999, overflow: "hidden", marginBottom: 8 }}>
              <div style={{
                height: "100%", borderRadius: 999,
                background: "linear-gradient(90deg, #4285F4, #34A853)",
                width: `${totalTasks ? (doneTasks / totalTasks) * 100 : 0}%`,
                transition: "width 0.5s ease",
              }} />
            </div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#4285F4", marginBottom: 18 }}>
              {totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0}% concluído
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {PHASES.map(p => {
                const d = p.tasks.filter((_, i) => checks[`p${p.id}_t${i}`]).length
                const pct = Math.round((d / p.tasks.length) * 100)
                return (
                  <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 10, width: 14, color: "rgba(0,0,0,0.35)", flexShrink: 0 }}>{p.id}</span>
                    <div style={{ flex: 1, height: 4, background: "rgba(0,0,0,0.07)", borderRadius: 999, overflow: "hidden" }}>
                      <div style={{ height: "100%", background: p.color, width: `${pct}%`, transition: "width 0.4s", borderRadius: 999 }} />
                    </div>
                    <span style={{ fontSize: 10, color: "rgba(0,0,0,0.35)", width: 28, textAlign: "right" }}>{pct}%</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* FASES */}
        <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.09em", color: "rgba(0,0,0,0.35)", marginBottom: 14 }}>
          Cronograma & Checklist por Fase
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {PHASES.map((phase) => {
            const isOpen = openPhase === phase.id
            const isCurrent = phase.id === currentPhase.id
            const isDone = now >= phase.deadline
            const phaseDone = phase.tasks.filter((_, i) => checks[`p${phase.id}_t${i}`]).length
            const phasePct = Math.round((phaseDone / phase.tasks.length) * 100)

            const statusBadge = isDone
              ? { label: "✔ Concluída", bg: "rgba(52,168,83,0.12)", color: "#34A853", border: "rgba(52,168,83,0.25)" }
              : isCurrent
              ? { label: "● Em andamento", bg: "rgba(66,133,244,0.12)", color: "#4285F4", border: "rgba(66,133,244,0.25)" }
              : { label: "○ Planejado", bg: "rgba(0,0,0,0.05)", color: "rgba(0,0,0,0.38)", border: "rgba(0,0,0,0.1)" }

            return (
              <div key={phase.id} style={{
                ...card, padding: 0, overflow: "hidden",
                border: isCurrent ? `2px solid ${phase.color}` : isDone ? "1px solid rgba(52,168,83,0.25)" : "1px solid rgba(0,0,0,0.08)",
                boxShadow: isCurrent ? `0 4px 20px ${phase.color}22` : "0 1px 8px rgba(0,0,0,0.05)",
              }}>
                <div
                  onClick={() => setOpenPhase(isOpen ? null : phase.id)}
                  style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 24px", cursor: "pointer", background: isOpen ? "rgba(0,0,0,0.015)" : "transparent", transition: "background 0.15s" }}
                >
                  <div style={{ width: 4, height: 36, borderRadius: 999, background: phase.color, flexShrink: 0, opacity: isDone ? 0.4 : 1 }} />
                  <span style={{ fontSize: 20, flexShrink: 0, opacity: isDone ? 0.5 : 1 }}>{phase.emoji}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 3 }}>
                      <span style={{ fontWeight: 700, fontSize: 13, color: isDone ? "rgba(0,0,0,0.45)" : "#111" }}>{phase.label}</span>
                      {isCurrent && <span style={{ fontSize: 10, fontWeight: 700, background: phase.color, color: "#fff", borderRadius: 999, padding: "2px 8px" }}>ATUAL</span>}
                      <span style={{ fontSize: 11, fontWeight: 600, background: statusBadge.bg, color: statusBadge.color, border: `1px solid ${statusBadge.border}`, borderRadius: 999, padding: "2px 9px" }}>{statusBadge.label}</span>
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(0,0,0,0.38)", display: "flex", gap: 12, flexWrap: "wrap" }}>
                      <span>📅 {phase.period}</span>
                      {phase.valor && <span>💰 {phase.valor}</span>}
                      {phase.meta && <span>🎯 {phase.meta}</span>}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: phasePct === 100 ? "#34A853" : phase.color }}>{phaseDone}/{phase.tasks.length}</div>
                      <div style={{ fontSize: 10, color: "rgba(0,0,0,0.3)" }}>tarefas</div>
                    </div>
                    <svg width="40" height="40" viewBox="0 0 40 40">
                      <circle cx="20" cy="20" r="15" fill="none" stroke="rgba(0,0,0,0.07)" strokeWidth="5" />
                      <circle cx="20" cy="20" r="15" fill="none"
                        stroke={phasePct === 100 ? "#34A853" : phase.color}
                        strokeWidth="5"
                        strokeDasharray={`${phasePct * 0.942} 94.2`}
                        strokeLinecap="round"
                        transform="rotate(-90 20 20)"
                        style={{ transition: "stroke-dasharray 0.5s" }}
                      />
                      <text x="20" y="24" textAnchor="middle" fontSize="9" fontWeight="800" fill={phasePct === 100 ? "#34A853" : phase.color}>{phasePct}%</text>
                    </svg>
                    <span style={{ fontSize: 18, color: "rgba(0,0,0,0.2)", transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s", userSelect: "none" }}>▾</span>
                  </div>
                </div>

                {isOpen && (
                  <div style={{ borderTop: "1px solid rgba(0,0,0,0.06)", padding: "16px 24px 20px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 8 }}>
                      {phase.tasks.map((task, i) => {
                        const key = `p${phase.id}_t${i}`
                        const done = !!checks[key]
                        return (
                          <div
                            key={i}
                            onClick={() => toggleCheck(phase.id, i)}
                            style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 14px", borderRadius: 12, cursor: "pointer", background: done ? `${phase.color}0a` : "rgba(0,0,0,0.02)", border: `1px solid ${done ? phase.color + "28" : "transparent"}`, transition: "all 0.15s" }}
                          >
                            <div style={{ width: 20, height: 20, borderRadius: 6, flexShrink: 0, marginTop: 1, border: done ? `2px solid ${phase.color}` : "2px solid rgba(0,0,0,0.18)", background: done ? phase.color : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}>
                              {done && <span style={{ color: "#fff", fontSize: 11, fontWeight: 900 }}>✓</span>}
                            </div>
                            <span style={{ fontSize: 13, lineHeight: 1.5, color: done ? "rgba(0,0,0,0.35)" : "#111", textDecoration: done ? "line-through" : "none", transition: "all 0.15s", userSelect: "none" }}>
                              {task}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* BOTTOM ROW */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 28 }}>
          <div style={{ ...card, padding: "24px 28px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.09em", color: "#4285F4", marginBottom: 16 }}>
              📊 Meta de Vendas por Data
            </div>
            {[
              { date: "20/05", pct: 0, label: "Abertura Early Bird" },
              { date: "05/06", pct: 40, label: "Fim Early Bird" },
              { date: "30/06", pct: 55, label: "Marco junho" },
              { date: "31/07", pct: 75, label: "Fim Lote Regular" },
              { date: "15/08", pct: 85, label: "Marco agosto" },
              { date: "01/09", pct: 95, label: "Contagem regressiva" },
              { date: "05/09", pct: 100, label: "🎯 SOLD OUT" },
            ].map(m => (
              <div key={m.date} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: 11, color: "rgba(0,0,0,0.38)", width: 40, flexShrink: 0 }}>{m.date}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ height: 6, background: "rgba(0,0,0,0.07)", borderRadius: 999, overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: 999, background: m.pct === 100 ? "#34A853" : "#4285F4", width: `${m.pct}%` }} />
                  </div>
                  <div style={{ fontSize: 10, color: "rgba(0,0,0,0.3)", marginTop: 2 }}>{m.label}</div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: m.pct === 100 ? "#34A853" : "#4285F4", width: 36, textAlign: "right" }}>{m.pct}%</span>
              </div>
            ))}
          </div>

          <div style={{ ...card, padding: "24px 28px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.09em", color: "rgba(0,0,0,0.38)", marginBottom: 16 }}>
              🎯 Informações do Evento
            </div>
            {[
              { label: "Total de vagas", value: "48 participantes", color: "#4285F4" },
              { label: "Early Bird", value: "R$ 89 · 20 vagas", color: "#34A853" },
              { label: "Lote Regular", value: "R$ 99 · 06/06–31/07", color: "#FBBC05" },
              { label: "Lote Final", value: "R$ 119 · últimas 12 vagas", color: "#EA4335" },
              { label: "Abertura online", value: "11/09/2026 (sexta)", color: "#9C27B0" },
              { label: "Evento presencial", value: "12/09/2026 (sábado)", color: "#4285F4" },
              { label: "Horário", value: "08h às 18h", color: "#4285F4" },
              { label: "Local", value: "Faculdade Dom Bosco, POA", color: "#34A853" },
              { label: "Patrocinador", value: "Magalu Cloud", color: "#00BCD4" },
            ].map(m => (
              <div key={m.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                <span style={{ fontSize: 13, color: "rgba(0,0,0,0.45)" }}>{m.label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: m.color }}>{m.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 32, textAlign: "center", fontSize: 11, color: "rgba(0,0,0,0.25)", paddingBottom: 20 }}>
          Hacka GDGs Sul 2026 · Cloud & Impacto · Powered by Magalu Cloud · GDG Porto Alegre
        </div>
      </div>
    </div>
  )
}