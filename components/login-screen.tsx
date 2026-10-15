"use client"

import { useEffect, useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, GraduationCap, LogIn, Stethoscope, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooth, ToothLogo } from "@/components/tooth"
import { ORG_TYPE_LABELS, ROLE_COLORS, ROLE_LABELS } from "@/lib/permissions"
import { DEMO_ACCOUNTS } from "@/lib/seed"
import { useStore } from "@/lib/store"
import type { OrgType } from "@/lib/types"

// Dos versiones del producto con el mismo código: clínicas y universidades
const THEMES: Record<OrgType, { gradient: string; button: string; title: string; subtitle: string; chips: string[] }> = {
  clinic: {
    gradient: "from-sky-500 via-cyan-500 to-teal-400",
    button: "from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600",
    title: "Sonrisas organizadas, pacientes felices",
    subtitle: "Expedientes, agenda y portal del paciente para tu clínica dental.",
    chips: ["🦷 Expediente clínico", "📅 Agenda en línea", "💬 Portal del paciente"],
  },
  school: {
    gradient: "from-indigo-500 via-violet-500 to-fuchsia-400",
    button: "from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600",
    title: "Formando a los dentistas del mañana",
    subtitle: "Prácticas clínicas, validación docente y seguimiento de pacientes para facultades de odontología.",
    chips: ["🎓 Validación docente", "📋 Expediente por alumno", "🔁 Transferencia de pacientes"],
  },
}

const MODE_KEY = "dc_login_mode"

const FLOATING_TEETH = [
  { top: "8%", left: "8%", size: 70, duration: "7s", delay: "0s", tilt: "-8deg", mood: "happy" as const },
  { top: "18%", left: "72%", size: 52, duration: "6s", delay: "1.2s", tilt: "10deg", mood: "wink" as const },
  { top: "62%", left: "12%", size: 48, duration: "8s", delay: "0.6s", tilt: "6deg", mood: "sparkle" as const },
  { top: "74%", left: "68%", size: 64, duration: "6.5s", delay: "2s", tilt: "-6deg", mood: "happy" as const },
  { top: "42%", left: "84%", size: 38, duration: "5.5s", delay: "0.3s", tilt: "12deg", mood: "wink" as const },
]

const BUBBLES = Array.from({ length: 12 }, (_, i) => ({
  left: `${(i * 37) % 100}%`,
  size: 8 + ((i * 7) % 18),
  duration: `${10 + (i % 5) * 2}s`,
  delay: `${(i * 1.3) % 9}s`,
}))

export function LoginScreen() {
  const { db, actions } = useStore()
  const [tab, setTab] = useState("login")
  const [mode, setModeState] = useState<OrgType>("clinic")
  const theme = THEMES[mode]
  const isSchool = mode === "school"

  // Recordar la versión elegida en este navegador
  useEffect(() => {
    try {
      const saved = localStorage.getItem(MODE_KEY)
      if (saved === "clinic" || saved === "school") setModeState(saved)
    } catch {
      // sin acceso a localStorage: se queda en clínicas
    }
  }, [])

  const setMode = (m: OrgType) => {
    setModeState(m)
    setTab("login")
    try {
      localStorage.setItem(MODE_KEY, m)
    } catch {
      // no pasa nada si no se puede guardar
    }
  }

  // Soporte entra directo a la primera organización de la versión elegida
  const login = (email: string, password: string) => {
    const result = actions.login(email, password)
    const org = db.organizations.find((o) => o.type === mode)
    if (result.ok && org) actions.setActiveOrg(org.id)
    return result
  }

  return (
    <div className={`relative min-h-screen overflow-hidden bg-gradient-to-br lg:grid lg:grid-cols-2 ${isSchool ? "from-violet-50 via-white to-fuchsia-50" : "from-sky-50 via-white to-cyan-50"}`}>
      <ModeToggle mode={mode} onChange={setMode} />

      {/* Panel animado */}
      <section className={`relative hidden overflow-hidden bg-gradient-to-br lg:flex lg:flex-col lg:justify-between lg:p-12 ${theme.gradient}`}>
        {BUBBLES.map((b, i) => (
          <span
            key={i}
            className="bubble absolute bottom-[-40px] rounded-full bg-white/30"
            style={{ left: b.left, width: b.size, height: b.size, ["--duration" as string]: b.duration, ["--delay" as string]: b.delay }}
          />
        ))}
        {FLOATING_TEETH.map((t, i) => (
          <div
            key={i}
            className="tooth-float absolute drop-shadow-xl"
            style={{ top: t.top, left: t.left, ["--duration" as string]: t.duration, ["--delay" as string]: t.delay, ["--tilt" as string]: t.tilt }}
          >
            <Tooth size={t.size} mood={t.mood} cap={isSchool && i % 2 === 0} />
          </div>
        ))}

        <div className="relative flex items-center gap-3 text-white">
          <ToothLogo size={44} />
          <span className="text-2xl font-bold tracking-tight">DentalCare</span>
        </div>

        <div key={mode} className="fade-up relative mx-auto flex flex-col items-center text-center text-white">
          <div className="tooth-hop drop-shadow-2xl">
            <Tooth size={150} mood="sparkle" cap={isSchool} />
          </div>
          <div className="mt-3 h-3 w-28 rounded-full bg-slate-900/20 blur-sm" />
          <h2 className="mt-8 text-4xl font-bold leading-tight text-balance">{theme.title}</h2>
          <p className="mt-4 max-w-md text-lg text-white/90 text-pretty">{theme.subtitle}</p>
        </div>

        <div className="relative flex gap-6 text-sm text-white/90">
          {theme.chips.map((c) => (
            <span key={c}>{c}</span>
          ))}
        </div>
      </section>

      {/* Formulario */}
      <section className="relative flex min-h-screen items-center justify-center p-4 sm:p-8">
        <div className="pointer-events-none absolute bottom-6 right-4 opacity-80 lg:hidden">
          <div className="tooth-float" style={{ ["--tilt" as string]: "8deg" }}>
            <Tooth size={70} mood="wink" cap={isSchool} />
          </div>
        </div>

        <div className="fade-up w-full max-w-md">
          <div className="mb-8 mt-12 flex items-center gap-3 lg:mt-0 lg:hidden">
            <ToothLogo size={40} />
            <span className="text-2xl font-bold text-slate-900">DentalCare</span>
          </div>

          <h1 className="text-3xl font-bold text-slate-900">{isSchool ? "¡Bienvenido a la facultad! 🎓" : "¡Hola de nuevo! 👋"}</h1>
          <p className="mt-1 text-slate-500">{isSchool ? "Maestros, alumnos y administración" : "Entra a tu cuenta para continuar"}</p>

          <Tabs value={tab} onValueChange={setTab} className="mt-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Iniciar sesión</TabsTrigger>
              <TabsTrigger value="register">Soy paciente nuevo</TabsTrigger>
            </TabsList>
            <TabsContent value="login" className="mt-6">
              <LoginForm onLogin={login} buttonClass={theme.button} />
            </TabsContent>
            <TabsContent value="register" className="mt-6">
              <RegisterForm
                organizations={db.organizations.filter((o) => o.type === mode)}
                onRegister={actions.registerPatient}
                onDone={() => setTab("login")}
              />
            </TabsContent>
          </Tabs>

          {isSchool && <JoinWithCode />}

          <DemoAccounts mode={mode} onPick={(email, password) => login(email, password)} />

          <button
            type="button"
            onClick={() => confirm("¿Borrar todos los cambios y volver a los datos de ejemplo?") && actions.resetDemo()}
            className="mt-4 w-full text-center text-xs text-slate-400 hover:text-slate-600"
          >
            Restablecer datos de la demo
          </button>
        </div>
      </section>
    </div>
  )
}

// Alumnos: entrar con el código que les dio su maestro (como unirse a un equipo de Teams)
function JoinWithCode() {
  const router = useRouter()
  const [code, setCode] = useState("")
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (code.trim()) router.push(`/unirse/${code.trim().toUpperCase()}`)
      }}
      className="mt-6 rounded-xl border border-violet-200 bg-violet-50/70 p-4"
    >
      <p className="text-sm font-medium text-violet-900">🎓 ¿Eres alumno y tu maestro te dio un código?</p>
      <div className="mt-2 flex gap-2">
        <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="PERIO-7A-K4X9" className="bg-white font-mono uppercase" />
        <Button type="submit" className="bg-violet-600 text-white hover:bg-violet-700">
          Unirme
        </Button>
      </div>
    </form>
  )
}

function ModeToggle({ mode, onChange }: { mode: OrgType; onChange: (m: OrgType) => void }) {
  const options: { id: OrgType; label: string; icon: typeof Stethoscope; active: string }[] = [
    { id: "clinic", label: "Clínicas", icon: Stethoscope, active: "bg-sky-500 text-white shadow" },
    { id: "school", label: "Universidades", icon: GraduationCap, active: "bg-violet-500 text-white shadow" },
  ]
  return (
    <div className="absolute right-4 top-4 z-20 flex rounded-full border border-slate-200 bg-white/90 p-1 shadow-sm backdrop-blur sm:right-6 sm:top-6">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          aria-pressed={mode === o.id}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition ${mode === o.id ? o.active : "text-slate-500 hover:text-slate-800"}`}
        >
          <o.icon className="h-4 w-4" />
          {o.label}
        </button>
      ))}
    </div>
  )
}

function LoginForm({ onLogin, buttonClass }: { onLogin: (email: string, password: string) => { ok: boolean; error?: string }; buttonClass: string }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [shakeKey, setShakeKey] = useState(0)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const result = onLogin(email, password)
    if (!result.ok) {
      setError(result.error ?? "No se pudo iniciar sesión")
      setShakeKey((k) => k + 1)
    }
  }

  return (
    <form key={shakeKey} onSubmit={submit} className={`space-y-4 ${shakeKey ? "shake" : ""}`}>
      <div className="space-y-2">
        <Label htmlFor="login-email">Email</Label>
        <Input id="login-email" type="email" autoComplete="email" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-11" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="login-password">Contraseña</Label>
        <div className="relative">
          <Input
            id="login-password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="h-11 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <Button type="submit" className={`h-11 w-full bg-gradient-to-r text-base text-white ${buttonClass}`}>
        <LogIn className="mr-2 h-4 w-4" />
        Entrar
      </Button>
    </form>
  )
}

function RegisterForm({
  organizations,
  onRegister,
  onDone,
}: {
  organizations: { id: string; name: string; type: "clinic" | "school" }[]
  onRegister: (data: { orgId: string; firstName: string; lastName: string; email: string; phone: string; password: string }) => string | null
  onDone: () => void
}) {
  const [form, setForm] = useState({ orgId: "", firstName: "", lastName: "", email: "", phone: "", password: "", confirm: "" })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const set = (key: keyof typeof form) => (value: string) => setForm((f) => ({ ...f, [key]: value }))

  const submit = (e: FormEvent) => {
    e.preventDefault()
    setError("")
    if (!form.orgId) return setError("Elige tu clínica o escuela")
    if (form.password.length < 6) return setError("La contraseña debe tener al menos 6 caracteres")
    if (form.password !== form.confirm) return setError("Las contraseñas no coinciden")
    const err = onRegister(form)
    if (err) return setError(err)
    setSuccess(true)
    setTimeout(onDone, 1800)
  }

  if (success) {
    return (
      <div className="fade-up flex flex-col items-center py-6 text-center">
        <div className="tooth-hop">
          <Tooth size={80} mood="sparkle" />
        </div>
        <p className="mt-4 text-lg font-semibold text-slate-900">¡Cuenta creada!</p>
        <p className="text-sm text-slate-500">Ya puedes iniciar sesión con tu email.</p>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="space-y-2">
        <Label>Clínica o escuela</Label>
        <Select value={form.orgId} onValueChange={set("orgId")}>
          <SelectTrigger className="h-11">
            <SelectValue placeholder={organizations.length ? "¿Dónde te atiendes?" : "No hay organizaciones registradas"} />
          </SelectTrigger>
          <SelectContent>
            {organizations.map((o) => (
              <SelectItem key={o.id} value={o.id}>
                {o.name} · {ORG_TYPE_LABELS[o.type]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="reg-first">Nombre</Label>
          <Input id="reg-first" value={form.firstName} onChange={(e) => set("firstName")(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="reg-last">Apellidos</Label>
          <Input id="reg-last" value={form.lastName} onChange={(e) => set("lastName")(e.target.value)} required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="reg-email">Email</Label>
          <Input id="reg-email" type="email" value={form.email} onChange={(e) => set("email")(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="reg-phone">Teléfono</Label>
          <Input id="reg-phone" type="tel" value={form.phone} onChange={(e) => set("phone")(e.target.value)} required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="reg-pass">Contraseña</Label>
          <Input id="reg-pass" type="password" autoComplete="new-password" value={form.password} onChange={(e) => set("password")(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="reg-confirm">Confirmar</Label>
          <Input id="reg-confirm" type="password" autoComplete="new-password" value={form.confirm} onChange={(e) => set("confirm")(e.target.value)} required />
        </div>
      </div>
      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <Button type="submit" className="h-11 w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600">
        <UserPlus className="mr-2 h-4 w-4" />
        Crear mi cuenta
      </Button>
      <p className="text-center text-xs text-slate-400">El personal de la clínica recibe su acceso de la administración.</p>
    </form>
  )
}

function DemoAccounts({ mode, onPick }: { mode: OrgType; onPick: (email: string, password: string) => void }) {
  const { db } = useStore()
  return (
    <div className="mt-8 rounded-xl border border-dashed border-sky-200 bg-white/70 p-4">
      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500">Probar como… (cuentas demo)</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {DEMO_ACCOUNTS.filter((acc) => acc.mode === mode || acc.mode === "both").map((acc) => {
          const user = db.users.find((u) => u.email === acc.email)
          if (!user) return null
          return (
            <button
              key={acc.email}
              type="button"
              onClick={() => onPick(acc.email, acc.password)}
              className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-sm transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-sm"
            >
              <span className="min-w-0">
                <span className="block truncate font-medium text-slate-800">
                  {user.firstName} {user.lastName}
                </span>
                <span className="block truncate text-xs text-slate-400">{acc.hint}</span>
              </span>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${ROLE_COLORS[user.role]}`}>
                {ROLE_LABELS[user.role]}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
