"use client"

import { useState, useEffect, useRef } from "react"
import { initializeApp, getApps, FirebaseApp } from "firebase/app"
import { getFirestore, doc, getDoc, setDoc, onSnapshot, Firestore } from "firebase/firestore"

// ============================================================
// FIREBASE
// ============================================================
const FIREBASE_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

let db: Firestore | null = null
function initFirebase(): Firestore | null {
  if (db) return db
  try {
    const app: FirebaseApp = getApps().length ? getApps()[0] : initializeApp(FIREBASE_CONFIG as object)
    db = getFirestore(app)
    return db
  } catch (e) { console.error(e); return null }
}

type Checks = Record<string, boolean>
type TaskStatus = "nao_iniciado" | "em_andamento" | "aguardando" | "concluido"
type TaskImpact = "alto" | "medio" | "baixo"

interface Task {
  id: string
  title: string
  category: "estrategia" | "comercial" | "producao" | "marketing"
  status: TaskStatus
  impact: TaskImpact
  deadline?: string
  responsible?: string
}

interface Phase {
  id: number
  emoji: string
  name: string
  month: string
  color: string
  goal: string
  weeks?: { label: string; tasks: string[] }[]
  summary?: string[]
  tasks: Task[]
}

// ============================================================
// DADOS
// ============================================================
const EVENT_DATE = new Date("2026-09-12T08:00:00")

const PHASES: Phase[] = [
  {
    id: 1, emoji: "🔵", name: "Março — Fundação", month: "Março 2026",
    color: "#4285F4", goal: "Deixar TODA a base pronta antes de começar a gerar desejo.",
    summary: ["Conceito definido", "Página quase pronta", "Regulamento pronto", "Parcerias em negociação", "Estratégia de conteúdo estruturada"],
    weeks: [
      { label: "Semana 1 (04–08/03)", tasks: ["Definir conceito final e posicionamento", "Definir identidade visual base", "Estruturar narrativa macro (tema + propósito)", "Definir estrutura de ingressos (109/129/149)", "Criar estrutura detalhada no dashboard"] },
      { label: "Semana 2 (11–15/03)", tasks: ["Criar página do evento no Bevi (rascunho)", "Escrever regulamento do evento (v1)", "Definir modelo do troféu 3D", "Mapear lista de empresas alvo para parceria", "Definir layout preliminar do espaço"] },
      { label: "Semana 3 (18–22/03)", tasks: ["Iniciar contato com empresas (parcerias e apoio)", "Definir formato dos meetups preparatórios", "Planejar coffee break/refeições (orçamento base)", "Briefing de materiais para redes sociais"] },
      { label: "Semana 4 (25–29/03)", tasks: ["Ajustar regulamento final", "Aprovar layout do espaço", "Aprovar modelo do troféu 3D", "Estruturar plano de divulgação detalhado", "Definir cronograma de vídeos teaser"] },
    ],
    tasks: [
      { id: "m1t1", title: "Definir conceito final e posicionamento", category: "estrategia", status: "nao_iniciado", impact: "alto", deadline: "08/03", responsible: "" },
      { id: "m1t2", title: "Definir identidade visual base", category: "estrategia", status: "nao_iniciado", impact: "alto", deadline: "08/03", responsible: "" },
      { id: "m1t3", title: "Estruturar narrativa macro (tema + propósito)", category: "estrategia", status: "nao_iniciado", impact: "alto", deadline: "08/03", responsible: "" },
      { id: "m1t4", title: "Definir estrutura de ingressos (109/129/149)", category: "comercial", status: "nao_iniciado", impact: "alto", deadline: "08/03", responsible: "" },
      { id: "m1t5", title: "Criar estrutura detalhada no dashboard", category: "estrategia", status: "nao_iniciado", impact: "medio", deadline: "08/03", responsible: "" },
      { id: "m1t6", title: "Criar página do evento no Bevi (rascunho)", category: "producao", status: "nao_iniciado", impact: "alto", deadline: "15/03", responsible: "" },
      { id: "m1t7", title: "Escrever regulamento do evento (v1)", category: "estrategia", status: "nao_iniciado", impact: "alto", deadline: "15/03", responsible: "" },
      { id: "m1t8", title: "Definir modelo do troféu 3D", category: "producao", status: "nao_iniciado", impact: "medio", deadline: "15/03", responsible: "" },
      { id: "m1t9", title: "Mapear lista de empresas alvo para parceria", category: "comercial", status: "nao_iniciado", impact: "alto", deadline: "15/03", responsible: "" },
      { id: "m1t10", title: "Definir layout preliminar do espaço", category: "producao", status: "nao_iniciado", impact: "medio", deadline: "15/03", responsible: "" },
      { id: "m1t11", title: "Iniciar contato com empresas (parcerias e apoio)", category: "comercial", status: "nao_iniciado", impact: "alto", deadline: "22/03", responsible: "" },
      { id: "m1t12", title: "Definir formato dos meetups preparatórios", category: "estrategia", status: "nao_iniciado", impact: "medio", deadline: "22/03", responsible: "" },
      { id: "m1t13", title: "Planejar coffee break/refeições (orçamento base)", category: "producao", status: "nao_iniciado", impact: "medio", deadline: "22/03", responsible: "" },
      { id: "m1t14", title: "Briefing de materiais para redes sociais", category: "marketing", status: "nao_iniciado", impact: "medio", deadline: "22/03", responsible: "" },
      { id: "m1t15", title: "Ajustar regulamento final", category: "estrategia", status: "nao_iniciado", impact: "alto", deadline: "29/03", responsible: "" },
      { id: "m1t16", title: "Aprovar layout do espaço", category: "producao", status: "nao_iniciado", impact: "medio", deadline: "29/03", responsible: "" },
      { id: "m1t17", title: "Aprovar modelo do troféu 3D", category: "producao", status: "nao_iniciado", impact: "medio", deadline: "29/03", responsible: "" },
      { id: "m1t18", title: "Estruturar plano de divulgação detalhado", category: "marketing", status: "nao_iniciado", impact: "alto", deadline: "29/03", responsible: "" },
      { id: "m1t19", title: "Definir cronograma de vídeos teaser", category: "marketing", status: "nao_iniciado", impact: "medio", deadline: "29/03", responsible: "" },
    ],
  },
  {
    id: 2, emoji: "🟣", name: "Abril — Estrutura", month: "Abril 2026",
    color: "#9C27B0", goal: "Ter tudo pronto para ativar curiosidade em maio.",
    summary: ["Estrutura pronta", "Material de divulgação pronto", "Eventos criados", "Primeiras parcerias encaminhadas"],
    weeks: [
      { label: "Semana 1 (01–05/04)", tasks: ["Finalizar página Bevi", "Finalizar layout do espaço", "Iniciar produção do troféu 3D", "Fechar fornecedores de alimentação"] },
      { label: "Semana 2 (08–12/04)", tasks: ["Criar evento no LinkedIn", "Criar evento no Instagram", "Criar lista de e-mails", "Gravar primeiro teaser (sem revelar tudo)"] },
      { label: "Semana 3 (15–19/04)", tasks: ["Criar materiais gráficos oficiais", "Criar templates de posts", "Produzir 3 vídeos curtos para maio", "Formalizar pelo menos 1 parceria"] },
      { label: "Semana 4 (22–26/04)", tasks: ["Planejar calendário fechado de maio", "Ativar mentores para gerarem expectativa", "Estruturar anúncios em grupos tech", "Preparar disparo de newsletter teaser"] },
    ],
    tasks: [
      { id: "m2t1", title: "Finalizar página Bevi", category: "producao", status: "nao_iniciado", impact: "alto", deadline: "05/04", responsible: "" },
      { id: "m2t2", title: "Finalizar layout do espaço", category: "producao", status: "nao_iniciado", impact: "medio", deadline: "05/04", responsible: "" },
      { id: "m2t3", title: "Iniciar produção do troféu 3D", category: "producao", status: "nao_iniciado", impact: "medio", deadline: "05/04", responsible: "" },
      { id: "m2t4", title: "Fechar fornecedores de alimentação", category: "producao", status: "nao_iniciado", impact: "alto", deadline: "05/04", responsible: "" },
      { id: "m2t5", title: "Criar evento no LinkedIn", category: "marketing", status: "nao_iniciado", impact: "alto", deadline: "12/04", responsible: "" },
      { id: "m2t6", title: "Criar evento no Instagram", category: "marketing", status: "nao_iniciado", impact: "alto", deadline: "12/04", responsible: "" },
      { id: "m2t7", title: "Criar lista de e-mails", category: "marketing", status: "nao_iniciado", impact: "alto", deadline: "12/04", responsible: "" },
      { id: "m2t8", title: "Gravar primeiro teaser (sem revelar tudo)", category: "marketing", status: "nao_iniciado", impact: "alto", deadline: "12/04", responsible: "" },
      { id: "m2t9", title: "Criar materiais gráficos oficiais", category: "marketing", status: "nao_iniciado", impact: "alto", deadline: "19/04", responsible: "" },
      { id: "m2t10", title: "Criar templates de posts", category: "marketing", status: "nao_iniciado", impact: "medio", deadline: "19/04", responsible: "" },
      { id: "m2t11", title: "Produzir 3 vídeos curtos para maio", category: "marketing", status: "nao_iniciado", impact: "alto", deadline: "19/04", responsible: "" },
      { id: "m2t12", title: "Formalizar pelo menos 1 parceria", category: "comercial", status: "nao_iniciado", impact: "alto", deadline: "19/04", responsible: "" },
      { id: "m2t13", title: "Planejar calendário fechado de maio", category: "marketing", status: "nao_iniciado", impact: "alto", deadline: "26/04", responsible: "" },
      { id: "m2t14", title: "Ativar mentores para gerarem expectativa", category: "comercial", status: "nao_iniciado", impact: "medio", deadline: "26/04", responsible: "" },
      { id: "m2t15", title: "Estruturar anúncios em grupos tech", category: "marketing", status: "nao_iniciado", impact: "medio", deadline: "26/04", responsible: "" },
      { id: "m2t16", title: "Preparar disparo de newsletter teaser", category: "marketing", status: "nao_iniciado", impact: "alto", deadline: "26/04", responsible: "" },
    ],
  },
  {
    id: 3, emoji: "🟢", name: "Maio — Geração de Desejo", month: "Maio 2026",
    color: "#34A853", goal: "Criar necessidade real. Meta: 200–300 pessoas interessadas antes da abertura.",
    tasks: [
      { id: "m3t1", title: "Publicar teaser enigmático", category: "marketing", status: "nao_iniciado", impact: "alto", deadline: "05/05", responsible: "" },
      { id: "m3t2", title: "Lançar enigma/desafio público", category: "marketing", status: "nao_iniciado", impact: "alto", deadline: "10/05", responsible: "" },
      { id: "m3t3", title: "Abrir lista de interesse (waitlist)", category: "comercial", status: "nao_iniciado", impact: "alto", deadline: "10/05", responsible: "" },
      { id: "m3t4", title: "Divulgar propósito do evento", category: "marketing", status: "nao_iniciado", impact: "alto", deadline: "15/05", responsible: "" },
      { id: "m3t5", title: "Mostrar bastidores da organização", category: "marketing", status: "nao_iniciado", impact: "medio", deadline: "20/05", responsible: "" },
      { id: "m3t6", title: "Criar senso de urgência futura", category: "marketing", status: "nao_iniciado", impact: "alto", deadline: "25/05", responsible: "" },
      { id: "m3t7", title: "Atingir 200+ pessoas interessadas", category: "comercial", status: "nao_iniciado", impact: "alto", deadline: "31/05", responsible: "" },
    ],
  },
  {
    id: 4, emoji: "🟡", name: "Junho — Abertura de Vendas", month: "Junho 2026",
    color: "#FBBC05", goal: "Vender 40% até final do mês. Early Bird: R$ 109.",
    tasks: [
      { id: "m4t1", title: "Abertura oficial das vendas", category: "comercial", status: "nao_iniciado", impact: "alto", deadline: "01/06", responsible: "" },
      { id: "m4t2", title: "Lançar Early Bird (R$ 109)", category: "comercial", status: "nao_iniciado", impact: "alto", deadline: "01/06", responsible: "" },
      { id: "m4t3", title: "Disparar e-mail marketing forte", category: "marketing", status: "nao_iniciado", impact: "alto", deadline: "02/06", responsible: "" },
      { id: "m4t4", title: "Divulgação intensa em redes sociais", category: "marketing", status: "nao_iniciado", impact: "alto", deadline: "05/06", responsible: "" },
      { id: "m4t5", title: "Incentivar mentores a divulgarem", category: "comercial", status: "nao_iniciado", impact: "medio", deadline: "10/06", responsible: "" },
      { id: "m4t6", title: "Atingir 40% das vagas vendidas", category: "comercial", status: "nao_iniciado", impact: "alto", deadline: "30/06", responsible: "" },
    ],
  },
  {
    id: 5, emoji: "🔴", name: "Julho — Fechamento de Vagas", month: "Julho 2026",
    color: "#EA4335", goal: "100% vendido até 31/07. Último lote: R$ 149.",
    tasks: [
      { id: "m5t1", title: "Lançar último lote (R$ 149)", category: "comercial", status: "nao_iniciado", impact: "alto", deadline: "01/07", responsible: "" },
      { id: "m5t2", title: "Ativar contagem regressiva de vagas", category: "marketing", status: "nao_iniciado", impact: "alto", deadline: "10/07", responsible: "" },
      { id: "m5t3", title: "Publicar prova social (depoimentos)", category: "marketing", status: "nao_iniciado", impact: "alto", deadline: "15/07", responsible: "" },
      { id: "m5t4", title: "Campanha de pressão estratégica", category: "marketing", status: "nao_iniciado", impact: "alto", deadline: "20/07", responsible: "" },
      { id: "m5t5", title: "SOLD OUT — 100% vendido", category: "comercial", status: "nao_iniciado", impact: "alto", deadline: "31/07", responsible: "" },
    ],
  },
  {
    id: 6, emoji: "🧠", name: "Agosto — Produção Final", month: "Agosto 2026",
    color: "#00BCD4", goal: "Fechar todos os detalhes operacionais até 15/08.",
    tasks: [
      { id: "m6t1", title: "Fechar personalizações dos kits", category: "producao", status: "nao_iniciado", impact: "alto", deadline: "05/08", responsible: "" },
      { id: "m6t2", title: "Confirmar lista final de participantes", category: "producao", status: "nao_iniciado", impact: "alto", deadline: "08/08", responsible: "" },
      { id: "m6t3", title: "Definir times por senioridade", category: "estrategia", status: "nao_iniciado", impact: "alto", deadline: "10/08", responsible: "" },
      { id: "m6t4", title: "Finalizar kits dos participantes", category: "producao", status: "nao_iniciado", impact: "alto", deadline: "12/08", responsible: "" },
      { id: "m6t5", title: "Validar todos os fornecedores", category: "producao", status: "nao_iniciado", impact: "alto", deadline: "12/08", responsible: "" },
      { id: "m6t6", title: "Ajustar layout final do espaço", category: "producao", status: "nao_iniciado", impact: "medio", deadline: "15/08", responsible: "" },
    ],
  },
  {
    id: 7, emoji: "⚡", name: "Setembro — Evento", month: "Setembro 2026",
    color: "#FF5722", goal: "Executar o melhor hackathon do Sul do Brasil.",
    tasks: [
      { id: "m7t1", title: "Workshop técnico online (11/09)", category: "producao", status: "nao_iniciado", impact: "alto", deadline: "11/09", responsible: "" },
      { id: "m7t2", title: "Abertura online (11/09 — sexta)", category: "producao", status: "nao_iniciado", impact: "alto", deadline: "11/09", responsible: "" },
      { id: "m7t3", title: "Check-in participantes (12/09 — 08h)", category: "producao", status: "nao_iniciado", impact: "alto", deadline: "12/09", responsible: "" },
      { id: "m7t4", title: "8 horas de desenvolvimento", category: "producao", status: "nao_iniciado", impact: "alto", deadline: "12/09", responsible: "" },
      { id: "m7t5", title: "Rodadas de mentoria estruturadas", category: "producao", status: "nao_iniciado", impact: "alto", deadline: "12/09", responsible: "" },
      { id: "m7t6", title: "Pitches e avaliação da banca", category: "producao", status: "nao_iniciado", impact: "alto", deadline: "12/09", responsible: "" },
      { id: "m7t7", title: "Premiação e encerramento", category: "producao", status: "nao_iniciado", impact: "alto", deadline: "12/09", responsible: "" },
    ],
  },
]

const CATEGORIES = [
  { id: "estrategia", label: "Estratégia & Conceito", color: "#4285F4" },
  { id: "comercial", label: "Comercial & Parcerias", color: "#34A853" },
  { id: "producao", label: "Produção & Logística", color: "#EA4335" },
  { id: "marketing", label: "Marketing & Vendas", color: "#FBBC05" },
]

const STATUS_OPTIONS: { id: TaskStatus; label: string; color: string }[] = [
  { id: "nao_iniciado", label: "Não iniciado", color: "#9e9e9e" },
  { id: "em_andamento", label: "Em andamento", color: "#4285F4" },
  { id: "aguardando", label: "Aguardando", color: "#FBBC05" },
  { id: "concluido", label: "Concluído", color: "#34A853" },
]

const IMPACT_OPTIONS: { id: TaskImpact; label: string; color: string }[] = [
  { id: "alto", label: "Alto", color: "#EA4335" },
  { id: "medio", label: "Médio", color: "#FBBC05" },
  { id: "baixo", label: "Baixo", color: "#34A853" },
]

// ============================================================
// FIREBASE HELPERS
// ============================================================
type AppData = {
  checks: Checks
  taskUpdates: Record<string, Partial<Task>>
  caixa: number
}

async function loadData(): Promise<AppData> {
  const database = initFirebase()
  if (!database) return { checks: {}, taskUpdates: {}, caixa: 0 }
  try {
    const ref = doc(database, "hacka2026", "appdata")
    const snap = await getDoc(ref)
    return snap.exists() ? (snap.data() as AppData) : { checks: {}, taskUpdates: {}, caixa: 0 }
  } catch { return { checks: {}, taskUpdates: {}, caixa: 0 } }
}

async function saveData(data: AppData): Promise<void> {
  const database = initFirebase()
  if (!database) return
  try {
    await setDoc(doc(database, "hacka2026", "appdata"), data)
  } catch (e) { console.error(e) }
}

function subscribeData(callback: (data: AppData) => void): () => void {
  const database = initFirebase()
  if (!database) return () => {}
  const ref = doc(database, "hacka2026", "appdata")
  return onSnapshot(ref, (snap) => {
    callback(snap.exists() ? (snap.data() as AppData) : { checks: {}, taskUpdates: {}, caixa: 0 })
  })
}

// ============================================================
// COMPONENTES
// ============================================================
function CountdownUnit({ value, label, color = "#4285F4" }: { value: number; label: string; color?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ background: `${color}12`, border: `1px solid ${color}30`, borderRadius: 14, padding: "12px 16px", minWidth: 62, textAlign: "center", fontSize: "clamp(1.4rem, 3vw, 2.2rem)", fontWeight: 900, color, letterSpacing: "-0.03em", lineHeight: 1, fontFamily: "monospace" }}>
        {String(value).padStart(2, "0")}
      </div>
      <span style={{ fontSize: 10, color: "rgba(0,0,0,0.38)", marginTop: 5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</span>
    </div>
  )
}

function SyncDot({ synced }: { synced: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ width: 7, height: 7, borderRadius: "50%", background: synced ? "#34A853" : "#FBBC05", boxShadow: synced ? "0 0 6px #34A85388" : "0 0 6px #FBBC0588" }} />
      <span style={{ fontSize: 11, color: "rgba(0,0,0,0.4)", fontWeight: 600 }}>{synced ? "Sincronizado" : "Salvando..."}</span>
    </div>
  )
}

// ============================================================
// APP
// ============================================================
export default function HackaDashboard() {
  const [appData, setAppData] = useState<AppData>({ checks: {}, taskUpdates: {}, caixa: 0 })
  const [synced, setSynced] = useState(false)
  const [now, setNow] = useState(new Date())
  const [activeTab, setActiveTab] = useState<"overview" | "kanban" | "fases">("overview")
  const [openPhase, setOpenPhase] = useState<number | null>(null)
  const [editingCaixa, setEditingCaixa] = useState(false)
  const [caixaInput, setCaixaInput] = useState("")
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    loadData().then(d => { setAppData(d); setSynced(true) })
    return subscribeData(d => { setAppData(d); setSynced(true) })
  }, [])

  const persist = (next: AppData) => {
    setAppData(next)
    setSynced(false)
    if (saveTimeout.current) clearTimeout(saveTimeout.current)
    saveTimeout.current = setTimeout(() => saveData(next).then(() => setSynced(true)), 600)
  }

  const toggleCheck = (taskId: string) => {
    const next = { ...appData, checks: { ...appData.checks, [taskId]: !appData.checks[taskId] } }
    persist(next)
  }

  const updateTask = (taskId: string, field: keyof Task, value: string) => {
    const next = { ...appData, taskUpdates: { ...appData.taskUpdates, [taskId]: { ...appData.taskUpdates[taskId], [field]: value } } }
    persist(next)
  }

  const getTask = (task: Task): Task => ({ ...task, ...appData.taskUpdates[task.id] })

  const diff = Math.max(0, EVENT_DATE.getTime() - now.getTime())
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  const seconds = Math.floor((diff % 60000) / 1000)

  const allTasks = PHASES.flatMap(p => p.tasks.map(t => getTask(t)))
  const totalTasks = allTasks.length
  const doneTasks = allTasks.filter(t => t.status === "concluido" || appData.checks[t.id]).length

  const currentPhase = PHASES.find(p => now < new Date(p.tasks[0]?.deadline?.split("/").reverse().join("-") || "2026-12-31")) || PHASES[PHASES.length - 1]

  const card: React.CSSProperties = { background: "#fff", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 20, boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }

  const tabs = [
    { id: "overview", label: "📊 Visão Geral" },
    { id: "fases", label: "📅 Fases & Checklist" },
    { id: "kanban", label: "🗂 Kanban de Tarefas" },
  ]

  return (
    <div style={{ fontFamily: "'Google Sans', 'Segoe UI', sans-serif", background: "#F8F9FA", minHeight: "100vh", paddingBottom: 80 }}>

      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid rgba(0,0,0,0.08)", padding: "14px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#4285F4,#34A853)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontWeight: 900, fontSize: 15 }}>H</span>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, lineHeight: 1 }}>Hacka GDGs Sul 2026</div>
            <div style={{ fontSize: 11, color: "rgba(0,0,0,0.4)", marginTop: 2 }}>Dashboard Estratégico · Cloud & Impacto</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as typeof activeTab)}
              style={{ fontSize: 13, fontWeight: activeTab === tab.id ? 700 : 500, color: activeTab === tab.id ? "#4285F4" : "rgba(0,0,0,0.45)", background: "none", border: "none", cursor: "pointer", borderBottom: activeTab === tab.id ? "2px solid #4285F4" : "2px solid transparent", paddingBottom: 4, transition: "all 0.15s" }}>
              {tab.label}
            </button>
          ))}
          <SyncDot synced={synced} />
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px 0" }}>

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <>
            {/* Top row */}
            <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr 0.9fr 0.8fr", gap: 16, marginBottom: 20 }}>

              {/* Countdown */}
              <div style={{ ...card, padding: "24px 28px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.09em", color: "#4285F4", marginBottom: 4 }}>⏱ Contagem Regressiva</div>
                <div style={{ fontSize: 11, color: "rgba(0,0,0,0.4)", marginBottom: 16 }}>Evento presencial · 12/09/2026</div>
                {diff <= 0 ? <div style={{ fontSize: 20, fontWeight: 900, color: "#34A853" }}>🎉 Evento iniciado!</div> : (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <CountdownUnit value={days} label="dias" />
                    <CountdownUnit value={hours} label="hrs" />
                    <CountdownUnit value={minutes} label="min" />
                    <CountdownUnit value={seconds} label="seg" color="#EA4335" />
                  </div>
                )}
                <div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid rgba(0,0,0,0.06)", fontSize: 11, color: "rgba(0,0,0,0.4)", display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <span>🌐 Online: 11/09</span><span>🏛 Presencial: 12/09</span><span>👥 48 vagas</span>
                </div>
              </div>

              {/* Fase atual */}
              <div style={{ ...card, padding: "24px 24px", borderLeft: `4px solid ${currentPhase.color}` }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.09em", color: currentPhase.color, marginBottom: 8 }}>Fase Atual</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 22 }}>{currentPhase.emoji}</span>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14 }}>{currentPhase.name}</div>
                    <div style={{ fontSize: 11, color: "rgba(0,0,0,0.4)" }}>Fase {currentPhase.id} de {PHASES.length}</div>
                  </div>
                </div>
                <div style={{ fontSize: 11, color: "rgba(0,0,0,0.5)", lineHeight: 1.5, marginBottom: 12 }}>{currentPhase.goal}</div>
                <div style={{ display: "flex", gap: 4 }}>
                  {PHASES.map(p => (
                    <div key={p.id} style={{ height: 6, width: p.id === currentPhase.id ? 20 : 6, borderRadius: 999, background: p.id <= currentPhase.id ? p.color : "rgba(0,0,0,0.1)", transition: "all 0.3s" }} />
                  ))}
                </div>
              </div>

              {/* Progresso */}
              <div style={{ ...card, padding: "24px 20px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.09em", color: "rgba(0,0,0,0.38)", marginBottom: 8 }}>📋 Progresso Total</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 4 }}>
                  <span style={{ fontSize: 40, fontWeight: 900, color: "#4285F4", lineHeight: 1 }}>{doneTasks}</span>
                  <span style={{ fontSize: 16, color: "rgba(0,0,0,0.25)", fontWeight: 600 }}>/{totalTasks}</span>
                </div>
                <div style={{ fontSize: 11, color: "rgba(0,0,0,0.4)", marginBottom: 12 }}>tarefas concluídas</div>
                <div style={{ height: 7, background: "rgba(0,0,0,0.07)", borderRadius: 999, overflow: "hidden", marginBottom: 6 }}>
                  <div style={{ height: "100%", borderRadius: 999, background: "linear-gradient(90deg,#4285F4,#34A853)", width: `${totalTasks ? (doneTasks / totalTasks) * 100 : 0}%`, transition: "width 0.5s" }} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#4285F4" }}>{totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0}%</div>
              </div>

              {/* Caixa */}
              <div style={{ ...card, padding: "24px 20px", borderTop: "3px solid #34A853" }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.09em", color: "#34A853", marginBottom: 8 }}>💰 Caixa Atual</div>
                {editingCaixa ? (
                  <div>
                    <input
                      type="number"
                      value={caixaInput}
                      onChange={e => setCaixaInput(e.target.value)}
                      style={{ width: "100%", fontSize: 20, fontWeight: 900, color: "#34A853", border: "1px solid #34A853", borderRadius: 8, padding: "4px 8px", outline: "none" }}
                      autoFocus
                    />
                    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                      <button onClick={() => { persist({ ...appData, caixa: parseFloat(caixaInput) || 0 }); setEditingCaixa(false) }}
                        style={{ flex: 1, background: "#34A853", color: "#fff", border: "none", borderRadius: 8, padding: "6px 0", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Salvar</button>
                      <button onClick={() => setEditingCaixa(false)}
                        style={{ flex: 1, background: "rgba(0,0,0,0.07)", color: "#111", border: "none", borderRadius: 8, padding: "6px 0", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Cancelar</button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: 28, fontWeight: 900, color: "#34A853", lineHeight: 1, marginBottom: 4 }}>
                      R$ {appData.caixa.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(0,0,0,0.4)", marginBottom: 12 }}>em patrocínios fechados</div>
                    <button onClick={() => { setCaixaInput(String(appData.caixa)); setEditingCaixa(true) }}
                      style={{ fontSize: 12, fontWeight: 600, color: "#34A853", background: "rgba(52,168,83,0.08)", border: "1px solid rgba(52,168,83,0.2)", borderRadius: 8, padding: "6px 12px", cursor: "pointer" }}>
                      + Atualizar valor
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={{ ...card, padding: "20px 24px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.09em", color: "#4285F4", marginBottom: 14 }}>📊 Meta de Vendas</div>
                {[
                  { date: "Jun", pct: 40, label: "Early Bird · R$ 109" },
                  { date: "Jul", pct: 100, label: "Lote Final · R$ 149" },
                  { date: "Ago", pct: 100, label: "SOLD OUT" },
                ].map(m => (
                  <div key={m.date} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <span style={{ fontSize: 11, color: "rgba(0,0,0,0.38)", width: 28, flexShrink: 0 }}>{m.date}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ height: 6, background: "rgba(0,0,0,0.07)", borderRadius: 999, overflow: "hidden" }}>
                        <div style={{ height: "100%", borderRadius: 999, background: m.pct === 100 ? "#34A853" : "#4285F4", width: `${m.pct}%` }} />
                      </div>
                      <div style={{ fontSize: 10, color: "rgba(0,0,0,0.3)", marginTop: 2 }}>{m.label}</div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: m.pct === 100 ? "#34A853" : "#4285F4", width: 32, textAlign: "right" }}>{m.pct}%</span>
                  </div>
                ))}
              </div>
              <div style={{ ...card, padding: "20px 24px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.09em", color: "rgba(0,0,0,0.38)", marginBottom: 14 }}>🎯 Informações</div>
                {[
                  { label: "Early Bird", value: "R$ 109", color: "#34A853" },
                  { label: "Lote Regular", value: "R$ 129", color: "#FBBC05" },
                  { label: "Lote Final", value: "R$ 149", color: "#EA4335" },
                  { label: "Total de vagas", value: "48 participantes", color: "#4285F4" },
                  { label: "Abertura online", value: "11/09/2026 (sexta)", color: "#9C27B0" },
                  { label: "Evento presencial", value: "12/09/2026 (sábado)", color: "#4285F4" },
                  { label: "Local", value: "Faculdade Dom Bosco, POA", color: "#34A853" },
                  { label: "Patrocinador", value: "Magalu Cloud", color: "#00BCD4" },
                ].map(m => (
                  <div key={m.label} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                    <span style={{ fontSize: 12, color: "rgba(0,0,0,0.45)" }}>{m.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: m.color }}>{m.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* FASES TAB */}
        {activeTab === "fases" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {PHASES.map(phase => {
              const isOpen = openPhase === phase.id
              const phaseTasks = phase.tasks.map(t => getTask(t))
              const phaseDone = phaseTasks.filter(t => t.status === "concluido" || appData.checks[t.id]).length
              const phasePct = Math.round((phaseDone / phaseTasks.length) * 100)

              return (
                <div key={phase.id} style={{ ...card, padding: 0, overflow: "hidden", borderLeft: `4px solid ${phase.color}` }}>
                  <div onClick={() => setOpenPhase(isOpen ? null : phase.id)}
                    style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 24px", cursor: "pointer", background: isOpen ? "rgba(0,0,0,0.015)" : "transparent" }}>
                    <span style={{ fontSize: 20 }}>{phase.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "#111" }}>{phase.name}</div>
                      <div style={{ fontSize: 11, color: "rgba(0,0,0,0.45)", marginTop: 2 }}>{phase.goal}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: phasePct === 100 ? "#34A853" : phase.color }}>{phaseDone}/{phaseTasks.length}</div>
                        <div style={{ fontSize: 10, color: "rgba(0,0,0,0.3)" }}>tarefas</div>
                      </div>
                      <svg width="36" height="36" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="13" fill="none" stroke="rgba(0,0,0,0.07)" strokeWidth="4" />
                        <circle cx="18" cy="18" r="13" fill="none" stroke={phasePct === 100 ? "#34A853" : phase.color} strokeWidth="4"
                          strokeDasharray={`${phasePct * 0.816} 81.6`} strokeLinecap="round" transform="rotate(-90 18 18)" style={{ transition: "stroke-dasharray 0.5s" }} />
                        <text x="18" y="22" textAnchor="middle" fontSize="8" fontWeight="800" fill={phasePct === 100 ? "#34A853" : phase.color}>{phasePct}%</text>
                      </svg>
                      <span style={{ fontSize: 16, color: "rgba(0,0,0,0.2)", transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▾</span>
                    </div>
                  </div>

                  {isOpen && (
                    <div style={{ borderTop: "1px solid rgba(0,0,0,0.06)", padding: "16px 24px 20px" }}>
                      {/* Summary */}
                      {phase.summary && (
                        <div style={{ marginBottom: 16, padding: "12px 16px", background: `${phase.color}08`, borderRadius: 12, border: `1px solid ${phase.color}20` }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: phase.color, marginBottom: 8 }}>✅ Março termina com:</div>
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            {phase.summary.map((s, i) => (
                              <span key={i} style={{ fontSize: 11, background: "#fff", border: `1px solid ${phase.color}30`, borderRadius: 999, padding: "3px 10px", color: "rgba(0,0,0,0.6)" }}>{s}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Weeks */}
                      {phase.weeks && (
                        <div style={{ marginBottom: 16 }}>
                          {phase.weeks.map((week, wi) => (
                            <div key={wi} style={{ marginBottom: 12 }}>
                              <div style={{ fontSize: 11, fontWeight: 700, color: phase.color, marginBottom: 6 }}>{week.label}</div>
                              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                {week.tasks.map((task, ti) => {
                                  const taskObj = phase.tasks.find(t => t.title === task)
                                  const isDone = taskObj ? (appData.checks[taskObj.id] || getTask(taskObj).status === "concluido") : false
                                  return (
                                    <div key={ti} onClick={() => taskObj && toggleCheck(taskObj.id)}
                                      style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 8, cursor: "pointer", background: isDone ? `${phase.color}08` : "rgba(0,0,0,0.02)", border: `1px solid ${isDone ? phase.color + "28" : "transparent"}` }}>
                                      <div style={{ width: 18, height: 18, borderRadius: 5, flexShrink: 0, border: isDone ? `2px solid ${phase.color}` : "2px solid rgba(0,0,0,0.18)", background: isDone ? phase.color : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        {isDone && <span style={{ color: "#fff", fontSize: 10, fontWeight: 900 }}>✓</span>}
                                      </div>
                                      <span style={{ fontSize: 13, color: isDone ? "rgba(0,0,0,0.35)" : "#111", textDecoration: isDone ? "line-through" : "none" }}>{task}</span>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Tasks sem semanas */}
                      {!phase.weeks && (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 8 }}>
                          {phase.tasks.map(t => {
                            const task = getTask(t)
                            const isDone = appData.checks[t.id] || task.status === "concluido"
                            return (
                              <div key={t.id} onClick={() => toggleCheck(t.id)}
                                style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 14px", borderRadius: 10, cursor: "pointer", background: isDone ? `${phase.color}08` : "rgba(0,0,0,0.02)", border: `1px solid ${isDone ? phase.color + "28" : "transparent"}` }}>
                                <div style={{ width: 18, height: 18, borderRadius: 5, flexShrink: 0, marginTop: 1, border: isDone ? `2px solid ${phase.color}` : "2px solid rgba(0,0,0,0.18)", background: isDone ? phase.color : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                  {isDone && <span style={{ color: "#fff", fontSize: 10, fontWeight: 900 }}>✓</span>}
                                </div>
                                <div style={{ flex: 1 }}>
                                  <span style={{ fontSize: 13, color: isDone ? "rgba(0,0,0,0.35)" : "#111", textDecoration: isDone ? "line-through" : "none" }}>{task.title}</span>
                                  {task.deadline && <div style={{ fontSize: 10, color: "rgba(0,0,0,0.35)", marginTop: 2 }}>📅 {task.deadline}</div>}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* KANBAN TAB */}
        {activeTab === "kanban" && (
          <div>
            {PHASES.map(phase => (
              <div key={phase.id} style={{ marginBottom: 32 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <span style={{ fontSize: 18 }}>{phase.emoji}</span>
                  <span style={{ fontWeight: 700, fontSize: 15, color: phase.color }}>{phase.name}</span>
                  <div style={{ flex: 1, height: 1, background: `${phase.color}20` }} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                  {CATEGORIES.map(cat => {
                    const catTasks = phase.tasks.filter(t => t.category === cat.id).map(t => getTask(t))
                    return (
                      <div key={cat.id} style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 16, overflow: "hidden" }}>
                        <div style={{ padding: "10px 14px", borderBottom: "1px solid rgba(0,0,0,0.06)", background: `${cat.color}08` }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: cat.color }}>{cat.label}</div>
                          <div style={{ fontSize: 10, color: "rgba(0,0,0,0.38)", marginTop: 1 }}>{catTasks.length} tarefas</div>
                        </div>
                        <div style={{ padding: "8px", display: "flex", flexDirection: "column", gap: 6 }}>
                          {catTasks.length === 0 && (
                            <div style={{ padding: "12px 8px", fontSize: 11, color: "rgba(0,0,0,0.25)", textAlign: "center" }}>Nenhuma tarefa</div>
                          )}
                          {catTasks.map(task => {
                            const statusObj = STATUS_OPTIONS.find(s => s.id === task.status) || STATUS_OPTIONS[0]
                            const impactObj = IMPACT_OPTIONS.find(i => i.id === task.impact) || IMPACT_OPTIONS[0]
                            return (
                              <div key={task.id} style={{ background: "rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.07)", borderRadius: 10, padding: "10px 12px" }}>
                                <div style={{ fontSize: 12, fontWeight: 600, color: "#111", marginBottom: 8, lineHeight: 1.4 }}>{task.title}</div>
                                <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 8 }}>
                                  <span style={{ fontSize: 10, background: `${statusObj.color}15`, color: statusObj.color, border: `1px solid ${statusObj.color}30`, borderRadius: 999, padding: "2px 7px", fontWeight: 600 }}>{statusObj.label}</span>
                                  <span style={{ fontSize: 10, background: `${impactObj.color}15`, color: impactObj.color, border: `1px solid ${impactObj.color}30`, borderRadius: 999, padding: "2px 7px", fontWeight: 600 }}>⚡ {impactObj.label}</span>
                                </div>
                                {task.deadline && <div style={{ fontSize: 10, color: "rgba(0,0,0,0.38)", marginBottom: 6 }}>📅 {task.deadline}</div>}

                                {/* Status selector */}
                                <select
                                  value={task.status}
                                  onChange={e => updateTask(task.id, "status", e.target.value)}
                                  onClick={e => e.stopPropagation()}
                                  style={{ width: "100%", fontSize: 11, border: "1px solid rgba(0,0,0,0.12)", borderRadius: 6, padding: "4px 6px", background: "#fff", cursor: "pointer", marginBottom: 4 }}
                                >
                                  {STATUS_OPTIONS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                                </select>

                                {/* Responsible */}
                                <input
                                  type="text"
                                  placeholder="Responsável..."
                                  value={task.responsible || ""}
                                  onChange={e => updateTask(task.id, "responsible", e.target.value)}
                                  onClick={e => e.stopPropagation()}
                                  style={{ width: "100%", fontSize: 11, border: "1px solid rgba(0,0,0,0.12)", borderRadius: 6, padding: "4px 6px", background: "#fff", outline: "none", boxSizing: "border-box" }}
                                />
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: 32, textAlign: "center", fontSize: 11, color: "rgba(0,0,0,0.25)", paddingBottom: 20 }}>
          Hacka GDGs Sul 2026 · Cloud & Impacto · Powered by Magalu Cloud
        </div>
      </div>
    </div>
  )
}
