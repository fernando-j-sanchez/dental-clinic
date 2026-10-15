"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Clock, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooth } from "@/components/tooth"
import { brandOf } from "@/lib/branding"
import { fullName, providerTitle, useStore } from "@/lib/store"
import type { Organization } from "@/lib/types"

function OrgBadge({ org, size = 64 }: { org?: Organization; size?: number }) {
  if (org?.logoUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={org.logoUrl} alt={org.name} style={{ width: size, height: size }} className="rounded-2xl bg-white object-contain p-1.5 shadow" />
  }
  return (
    <div className="tooth-hop">
      <Tooth size={size} mood="sparkle" cap />
    </div>
  )
}

// Pantalla a la que llega el alumno desde /unirse/CODIGO
export function JoinScreen({ code }: { code: string }) {
  const router = useRouter()
  const { db, currentUser, actions } = useStore()
  const group = actions.findGroupByCode(code)
  const org = db.organizations.find((o) => o.id === group?.orgId)
  const teacher = db.users.find((u) => u.id === group?.teacherId)
  const brand = brandOf(org)
  const [error, setError] = useState("")
  const [result, setResult] = useState<"pending" | "approved" | null>(null)

  const finish = (r: { ok: true; pending: boolean } | { ok: false; error: string }) => {
    if (!r.ok) return setError(r.error)
    setResult(r.pending ? "pending" : "approved")
  }

  const goHome = () => router.push("/")

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-violet-50 p-4">
      <div className="fade-up w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
        <div className={`flex flex-col items-center bg-gradient-to-br px-6 py-8 text-center text-white ${brand.hero}`}>
          <OrgBadge org={org} size={72} />
          {group ? (
            <>
              <p className="mt-4 text-sm text-white/80">{org?.name}</p>
              <h1 className="text-2xl font-bold">
                {group.section} · {group.name}
              </h1>
              <p className="text-sm text-white/80">
                {providerTitle(teacher)} · {group.term}
              </p>
            </>
          ) : (
            <h1 className="mt-4 text-2xl font-bold">Código no encontrado</h1>
          )}
        </div>

        <div className="p-6">
          {!group ? (
            <div className="space-y-4 text-center">
              <p className="text-slate-600">
                No encontramos el código <span className="font-mono font-semibold">{code.toUpperCase()}</span>. Revisa que esté bien escrito o pídele a tu
                maestro el código actualizado.
              </p>
              <Button variant="outline" onClick={goHome}>
                Ir al inicio
              </Button>
            </div>
          ) : result ? (
            <div className="space-y-4 text-center">
              {result === "pending" ? (
                <>
                  <p className="text-lg font-semibold text-slate-900">¡Solicitud enviada! ⏳</p>
                  <p className="text-slate-600">{providerTitle(teacher)} te va a aceptar en el grupo. Te llegará una notificación.</p>
                </>
              ) : (
                <>
                  <p className="text-lg font-semibold text-slate-900">¡Ya estás dentro! 🎉</p>
                  <p className="text-slate-600">Bienvenido a {group.section} · {group.name}.</p>
                </>
              )}
              <Button onClick={goHome} className={brand.solid}>
                Continuar
              </Button>
            </div>
          ) : currentUser ? (
            <div className="space-y-4 text-center">
              {currentUser.role === "student" && currentUser.orgId === group.orgId ? (
                <>
                  <p className="text-slate-600">
                    Entraste como <span className="font-medium text-slate-900">{fullName(currentUser)}</span>
                  </p>
                  <Button onClick={() => finish(actions.joinGroup(code))} className={`w-full ${brand.solid}`}>
                    Unirme al grupo
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-slate-600">Este código es para alumnos. Cierra tu sesión actual para unirte con tu cuenta de alumno.</p>
                  <Button variant="outline" onClick={actions.logout}>
                    <LogOut className="mr-2 h-4 w-4" /> Cerrar sesión
                  </Button>
                </>
              )}
              {error && <p className="text-sm text-red-600">{error}</p>}
            </div>
          ) : (
            <Tabs defaultValue="new">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="new">Soy nuevo</TabsTrigger>
                <TabsTrigger value="existing">Ya tengo cuenta</TabsTrigger>
              </TabsList>
              <TabsContent value="new" className="mt-4">
                <RegisterStudent
                  domain={org?.emailDomain}
                  buttonClass={brand.solid}
                  onSubmit={(data) => {
                    setError("")
                    finish(actions.joinGroup(code, data))
                  }}
                />
              </TabsContent>
              <TabsContent value="existing" className="mt-4">
                <ExistingStudent
                  buttonClass={brand.solid}
                  onSubmit={(email, password) => {
                    setError("")
                    const login = actions.login(email, password)
                    if (!login.ok) setError(login.error)
                    // Al iniciar sesión, la pantalla muestra el botón "Unirme al grupo"
                  }}
                />
              </TabsContent>
              {error && <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            </Tabs>
          )}
        </div>
      </div>
    </div>
  )
}

function RegisterStudent({
  domain,
  buttonClass,
  onSubmit,
}: {
  domain?: string
  buttonClass: string
  onSubmit: (data: { firstName: string; lastName: string; enrollment: string; email: string; password: string }) => void
}) {
  const [form, setForm] = useState({ firstName: "", lastName: "", enrollment: "", email: "", password: "", confirm: "" })
  const [error, setError] = useState("")
  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }))
  const cleanDomain = domain?.trim().replace(/^@/, "")

  const submit = (e: FormEvent) => {
    e.preventDefault()
    setError("")
    if (form.password.length < 6) return setError("La contraseña debe tener al menos 6 caracteres")
    if (form.password !== form.confirm) return setError("Las contraseñas no coinciden")
    onSubmit(form)
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Nombre</Label>
          <Input value={form.firstName} onChange={(e) => set("firstName")(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label>Apellidos</Label>
          <Input value={form.lastName} onChange={(e) => set("lastName")(e.target.value)} required />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Matrícula</Label>
        <Input value={form.enrollment} onChange={(e) => set("enrollment")(e.target.value)} required />
      </div>
      <div className="space-y-1.5">
        <Label>Correo {cleanDomain ? "institucional" : ""}</Label>
        <Input type="email" value={form.email} onChange={(e) => set("email")(e.target.value)} placeholder={cleanDomain ? `tu.nombre@${cleanDomain}` : "tu@correo.com"} required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Contraseña</Label>
          <Input type="password" autoComplete="new-password" value={form.password} onChange={(e) => set("password")(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label>Confirmar</Label>
          <Input type="password" autoComplete="new-password" value={form.confirm} onChange={(e) => set("confirm")(e.target.value)} required />
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" className={`h-11 w-full ${buttonClass}`}>
        Crear cuenta y unirme
      </Button>
    </form>
  )
}

function ExistingStudent({ buttonClass, onSubmit }: { buttonClass: string; onSubmit: (email: string, password: string) => void }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit(email, password)
      }}
      className="space-y-3"
    >
      <div className="space-y-1.5">
        <Label>Correo</Label>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div className="space-y-1.5">
        <Label>Contraseña</Label>
        <Input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      <Button type="submit" className={`h-11 w-full ${buttonClass}`}>
        Entrar
      </Button>
    </form>
  )
}

// Alumno registrado que todavía no está aprobado en ningún grupo
export function WaitingScreen() {
  const router = useRouter()
  const { db, currentUser, currentOrg, actions } = useStore()
  const [code, setCode] = useState("")
  if (!currentUser) return null
  const pending = db.members.filter((m) => m.userId === currentUser.id && m.status === "pending")
  const brand = brandOf(currentOrg)

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-violet-50 p-4">
      <div className="fade-up w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl">
        <div className="flex justify-center">
          <OrgBadge org={currentOrg} size={80} />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">Hola, {currentUser.firstName} 👋</h1>
        {pending.length ? (
          <div className="mt-4 space-y-2">
            <p className="text-slate-600">Tu maestro aún no te acepta en:</p>
            {pending.map((m) => {
              const g = db.groups.find((x) => x.id === m.groupId)
              return (
                <div key={m.id} className="flex items-center justify-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-sm font-medium text-amber-900">
                  <Clock className="h-4 w-4" /> {g?.section} · {g?.name}
                </div>
              )
            })}
            <p className="text-sm text-slate-400">Te llegará una notificación en cuanto te acepten.</p>
          </div>
        ) : (
          <p className="mt-2 text-slate-600">Todavía no estás en ningún grupo. Escribe el código que te dio tu maestro.</p>
        )}

        <form
          className="mt-6 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            if (code.trim()) router.push(`/unirse/${code.trim().toUpperCase()}`)
          }}
        >
          <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="PERIO-7A-K4X9" className="font-mono uppercase" />
          <Button type="submit" className={brand.solid}>
            Unirme
          </Button>
        </form>

        <Button variant="ghost" onClick={actions.logout} className="mt-6 text-slate-500">
          <LogOut className="mr-2 h-4 w-4" /> Cerrar sesión
        </Button>
      </div>
    </div>
  )
}
