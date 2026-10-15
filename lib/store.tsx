"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { formatTime, newId, toMinutes } from "./dates"
import { initialNoteStatus, isProvider } from "./permissions"
import { DB_VERSION, createSeed } from "./seed"
import type {
  Appointment,
  Attachment,
  ClinicalNote,
  Database,
  Group,
  Organization,
  Patient,
  Transfer,
  User,
} from "./types"

// "Base de datos" local guardada en el navegador. Cada acción de aquí corresponde a una
// consulta que después se hará contra Supabase; la interfaz no tendría que cambiar.

const DB_KEY = "dc_v2_db"
const SESSION_KEY = "dc_v2_session"

interface Session {
  userId: string | null
  activeOrgId: string | null // para soporte: qué organización está viendo
}

export const fullName = (u?: { firstName: string; lastName: string } | null) =>
  u ? `${u.firstName} ${u.lastName}` : "—"

export const providerTitle = (u?: User | null) => {
  if (!u) return "Sin asignar"
  if (u.role === "dentist") return `Dr(a). ${fullName(u)}`
  if (u.role === "teacher") return `Mtro(a). ${fullName(u)}`
  return fullName(u)
}

// Código legible tipo "PERIO-7A-K4X9" (sin letras confusas como O/0 o I/1)
function generateGroupCode(section: string, name: string, existing: string[]) {
  const clean = (text: string, max: number) =>
    text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, max)
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let code = ""
  do {
    const suffix = Array.from({ length: 4 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("")
    code = [clean(section, 5) || "GRUPO", clean(name, 4), suffix].filter(Boolean).join("-")
  } while (existing.includes(code))
  return code
}

export interface Reassignment {
  patientId: string
  toProviderId: string
  summary: string
  pendingItems: string
}

function useStoreValue() {
  const [db, setDb] = useState<Database>(createSeed)
  const [session, setSession] = useState<Session>({ userId: null, activeOrgId: null })
  const [loaded, setLoaded] = useState(false)

  // Se lee después de montar para que el HTML del servidor y del cliente coincidan
  useEffect(() => {
    try {
      const storedDb = localStorage.getItem(DB_KEY)
      if (storedDb) {
        const parsed = JSON.parse(storedDb) as Database
        if (parsed.version === DB_VERSION) setDb(parsed)
      }
      const storedSession = localStorage.getItem(SESSION_KEY)
      if (storedSession) setSession(JSON.parse(storedSession))
    } catch {
      // datos corruptos o localStorage bloqueado: se usan los datos de ejemplo
    }
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (!loaded) return
    try {
      localStorage.setItem(DB_KEY, JSON.stringify(db))
      localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    } catch {
      // sin espacio (fotos muy grandes) o bloqueado: los datos siguen en memoria
    }
  }, [db, session, loaded])

  const mutate = useCallback((fn: (draft: Database) => void) => {
    setDb((prev) => {
      const draft = structuredClone(prev)
      fn(draft)
      return draft
    })
  }, [])

  const currentUser = db.users.find((u) => u.id === session.userId && u.active) ?? null
  const orgId = currentUser?.role === "support" ? session.activeOrgId : (currentUser?.orgId ?? null)
  const currentOrg = db.organizations.find((o) => o.id === orgId)

  const now = () => new Date().toISOString()

  const pushNotification = (draft: Database, userId: string, title: string, body: string) => {
    draft.notifications.unshift({ id: newId(), userId, title, body, at: now(), read: false })
  }

  const pushAudit = (draft: Database, action: string, detail: string, auditOrgId: string | null = orgId) => {
    if (!currentUser) return
    draft.audit.unshift({ id: newId(), orgId: auditOrgId, userId: currentUser.id, action, detail, at: now() })
  }

  const usersOf = (targetOrgId: string | null) => db.users.filter((u) => u.orgId === targetOrgId)

  const actions = {
    login(email: string, password: string): { ok: true } | { ok: false; error: string } {
      const user = db.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase())
      if (!user || user.password !== password) return { ok: false, error: "Email o contraseña incorrectos" }
      if (!user.active) return { ok: false, error: "Esta cuenta fue dada de baja. Contacta a la administración." }
      setSession({ userId: user.id, activeOrgId: user.orgId ?? db.organizations[0]?.id ?? null })
      return { ok: true }
    },

    logout() {
      setSession({ userId: null, activeOrgId: null })
    },

    setActiveOrg(id: string) {
      setSession((s) => ({ ...s, activeOrgId: id }))
    },

    // Registro público: solo pacientes. El personal lo da de alta la administración.
    registerPatient(data: { orgId: string; firstName: string; lastName: string; email: string; phone: string; password: string }) {
      const email = data.email.trim().toLowerCase()
      if (db.users.some((u) => u.email.toLowerCase() === email)) return "Este email ya está registrado"
      const userId = newId()
      mutate((draft) => {
        draft.users.push({ id: userId, orgId: data.orgId, email, password: data.password, firstName: data.firstName, lastName: data.lastName, role: "patient", active: true, phone: data.phone, createdAt: now() })
        draft.patients.push({ id: newId(), orgId: data.orgId, userId, firstName: data.firstName, lastName: data.lastName, email, phone: data.phone, dateOfBirth: "", address: "", allergies: "", medicalHistory: "", emergencyContact: "", emergencyPhone: "", providerId: "", status: "active", createdAt: now() })
        draft.users
          .filter((u) => u.orgId === data.orgId && u.role === "admin" && u.active)
          .forEach((admin) => pushNotification(draft, admin.id, "Nuevo paciente registrado", `${data.firstName} ${data.lastName} creó su cuenta y necesita un responsable asignado.`))
      })
      return null
    },

    addPatient(data: Omit<Patient, "id" | "orgId" | "createdAt" | "status">) {
      if (!orgId) return
      mutate((draft) => {
        draft.patients.push({ ...data, id: newId(), orgId, status: "active", createdAt: now() })
        if (data.providerId && data.providerId !== currentUser?.id) {
          pushNotification(draft, data.providerId, "Nuevo paciente asignado", `${data.firstName} ${data.lastName} ahora está a tu cargo.`)
        }
      })
    },

    updatePatient(id: string, data: Partial<Patient>) {
      mutate((draft) => {
        const p = draft.patients.find((x) => x.id === id)
        if (p) Object.assign(p, data)
      })
    },

    addNote(data: Omit<ClinicalNote, "id" | "orgId" | "authorId" | "status" | "createdAt" | "updatedAt">) {
      if (!currentUser || !orgId) return
      const status = initialNoteStatus(currentUser)
      mutate((draft) => {
        draft.notes.push({ ...data, id: newId(), orgId, authorId: currentUser.id, status, createdAt: now(), updatedAt: now() })
        const patient = draft.patients.find((p) => p.id === data.patientId)
        if (status === "pending_review" && currentUser.supervisorId) {
          pushNotification(draft, currentUser.supervisorId, "Nota por validar", `${fullName(currentUser)} envió “${data.title}” de ${fullName(patient)}.`)
        }
        if (data.visibleToPatient && status === "final" && patient?.userId) {
          pushNotification(draft, patient.userId, "Nueva información de tu tratamiento", data.title)
        }
      })
    },

    // El alumno corrige una nota rechazada y la vuelve a enviar
    resubmitNote(id: string, data: Partial<ClinicalNote>) {
      if (!currentUser) return
      mutate((draft) => {
        const n = draft.notes.find((x) => x.id === id)
        if (!n) return
        Object.assign(n, data, { status: "pending_review", updatedAt: now() })
        if (currentUser.supervisorId) {
          pushNotification(draft, currentUser.supervisorId, "Nota corregida", `${fullName(currentUser)} corrigió “${n.title}”.`)
        }
      })
    },

    reviewNote(id: string, approved: boolean, comment: string) {
      if (!currentUser) return
      mutate((draft) => {
        const n = draft.notes.find((x) => x.id === id)
        if (!n) return
        n.status = approved ? "validated" : "rejected"
        n.review = { by: currentUser.id, at: now(), comment }
        n.updatedAt = now()
        pushNotification(
          draft,
          n.authorId,
          approved ? "Nota validada ✅" : "Tu nota necesita correcciones",
          `“${n.title}”${comment ? `: ${comment}` : ""}`,
        )
        const patient = draft.patients.find((p) => p.id === n.patientId)
        if (approved && n.visibleToPatient && patient?.userId) {
          pushNotification(draft, patient.userId, "Nueva información de tu tratamiento", n.title)
        }
        pushAudit(draft, approved ? "Validó nota" : "Pidió correcciones", `${n.title} · ${fullName(patient)}`)
      })
    },

    // El expediente no se borra: se anula con motivo
    voidNote(id: string, reason: string) {
      if (!currentUser) return
      mutate((draft) => {
        const n = draft.notes.find((x) => x.id === id)
        if (!n) return
        n.status = "voided"
        n.voided = { by: currentUser.id, at: now(), reason }
        pushAudit(draft, "Anuló nota", `${n.title}: ${reason}`)
      })
    },

    addAttachment(noteId: string, attachment: Omit<Attachment, "id" | "uploadedBy" | "uploadedAt">) {
      if (!currentUser) return
      mutate((draft) => {
        const n = draft.notes.find((x) => x.id === noteId)
        n?.attachments.push({ ...attachment, id: newId(), uploadedBy: currentUser.id, uploadedAt: now() })
      })
    },

    findConflict(providerId: string, date: string, time: string, duration: number, ignoreId?: string) {
      const start = toMinutes(time)
      const end = start + duration
      return db.appointments.find(
        (a) =>
          a.id !== ignoreId &&
          a.providerId === providerId &&
          a.date === date &&
          a.status !== "cancelled" &&
          start < toMinutes(a.time) + a.duration &&
          toMinutes(a.time) < end,
      )
    },

    addAppointment(data: Omit<Appointment, "id" | "orgId" | "createdBy" | "createdAt" | "status">) {
      if (!currentUser || !orgId) return "Sin organización seleccionada"
      const conflict = actions.findConflict(data.providerId, data.date, data.time, data.duration)
      if (conflict) return `Ese horario choca con otra cita de ${formatTime(conflict.time)} (${conflict.duration} min).`
      const fromPatient = currentUser.role === "patient"
      const status = fromPatient && !currentOrg?.autoConfirmPatientBookings ? "requested" : "confirmed"
      mutate((draft) => {
        draft.appointments.push({ ...data, id: newId(), orgId, status, createdBy: currentUser.id, createdAt: now() })
        const patient = draft.patients.find((p) => p.id === data.patientId)
        const when = `${data.date} ${formatTime(data.time)}`
        if (fromPatient) {
          pushNotification(draft, data.providerId, status === "requested" ? "Nueva solicitud de cita" : "Nueva cita agendada", `${fullName(patient)} · ${when}`)
          draft.users
            .filter((u) => u.orgId === orgId && u.role === "admin" && u.active)
            .forEach((admin) => pushNotification(draft, admin.id, "Nueva solicitud de cita", `${fullName(patient)} · ${when}`))
        } else if (patient?.userId) {
          pushNotification(draft, patient.userId, "Tienes una nueva cita", when)
        }
      })
      return null
    },

    setAppointmentStatus(id: string, status: Appointment["status"]) {
      mutate((draft) => {
        const a = draft.appointments.find((x) => x.id === id)
        if (!a) return
        a.status = status
        const patient = draft.patients.find((p) => p.id === a.patientId)
        if (patient?.userId && (status === "confirmed" || status === "cancelled")) {
          pushNotification(
            draft,
            patient.userId,
            status === "confirmed" ? "Tu cita fue confirmada ✅" : "Tu cita fue cancelada",
            `${a.date} ${formatTime(a.time)}`,
          )
        }
      })
    },

    transferPatient(patientId: string, toProviderId: string, reason: string, summary: string, pendingItems: string) {
      if (!currentUser) return
      mutate((draft) => applyTransfer(draft, { patientId, toProviderId, summary, pendingItems }, reason))
    },

    addUser(data: Omit<User, "id" | "createdAt" | "active">) {
      const email = data.email.trim().toLowerCase()
      if (db.users.some((u) => u.email.toLowerCase() === email)) return "Ya existe un usuario con ese email"
      mutate((draft) => {
        draft.users.push({ ...data, email, id: newId(), active: true, createdAt: now() })
        pushAudit(draft, "Alta de usuario", `${data.firstName} ${data.lastName} (${data.role})`, data.orgId)
      })
      return null
    },

    updateUser(id: string, data: Partial<User>) {
      mutate((draft) => {
        const u = draft.users.find((x) => x.id === id)
        if (u) Object.assign(u, data)
      })
    },

    // Baja de un dentista/alumno: sus expedientes pasan a otra persona con resumen
    deactivateUser(userId: string, reason: string, reassignments: Reassignment[]) {
      mutate((draft) => {
        const u = draft.users.find((x) => x.id === userId)
        if (!u) return
        u.active = false
        reassignments.forEach((r) => applyTransfer(draft, r, reason))
        // Citas futuras de quien se va: pasan al nuevo responsable de cada paciente
        draft.appointments
          .filter((a) => a.providerId === userId && (a.status === "confirmed" || a.status === "requested"))
          .forEach((a) => {
            const r = reassignments.find((x) => x.patientId === a.patientId)
            if (r) a.providerId = r.toProviderId
            else a.status = "cancelled"
          })
        pushAudit(draft, "Baja de usuario", `${fullName(u)}: ${reason}`, u.orgId)
      })
    },

    reactivateUser(userId: string) {
      mutate((draft) => {
        const u = draft.users.find((x) => x.id === userId)
        if (u) u.active = true
      })
    },

    addOrganization(data: Omit<Organization, "id" | "createdAt">) {
      const id = newId()
      mutate((draft) => {
        draft.organizations.push({ ...data, id, createdAt: now() })
        pushAudit(draft, "Alta de organización", data.name, id)
      })
      return id
    },

    updateOrganization(id: string, data: Partial<Organization>) {
      mutate((draft) => {
        const o = draft.organizations.find((x) => x.id === id)
        if (o) Object.assign(o, data)
      })
    },

    // ---------- Grupos (tipo Teams) ----------

    findGroupByCode(code: string) {
      const normalized = code.trim().toUpperCase()
      return db.groups.find((g) => g.code === normalized)
    },

    createGroup(data: Pick<Group, "name" | "section" | "term" | "shift" | "requireApproval" | "maxMembers"> & { teacherId?: string }) {
      if (!currentUser || !orgId) return null
      const teacherId = data.teacherId ?? currentUser.id
      const code = generateGroupCode(data.section, data.name, db.groups.map((g) => g.code))
      mutate((draft) => {
        draft.groups.push({ ...data, id: newId(), orgId, teacherId, code, codeActive: true, archived: false, createdAt: now() })
        pushAudit(draft, "Creó grupo", `${data.section} · ${data.name} (${code})`)
      })
      return code
    },

    updateGroup(id: string, data: Partial<Group>) {
      mutate((draft) => {
        const g = draft.groups.find((x) => x.id === id)
        if (g) Object.assign(g, data)
      })
    },

    // Si el código se filtró, se genera uno nuevo y el anterior deja de funcionar
    regenerateGroupCode(id: string) {
      const group = db.groups.find((g) => g.id === id)
      if (!group) return
      const code = generateGroupCode(group.section, group.name, db.groups.map((g) => g.code))
      mutate((draft) => {
        const g = draft.groups.find((x) => x.id === id)
        if (g) Object.assign(g, { code, codeActive: true })
      })
    },

    // Unirse con código. Si `register` viene, se crea la cuenta del alumno en el momento.
    joinGroup(
      code: string,
      register?: { firstName: string; lastName: string; enrollment: string; email: string; password: string },
    ): { ok: true; pending: boolean } | { ok: false; error: string } {
      const group = actions.findGroupByCode(code)
      if (!group || group.archived) return { ok: false, error: "Ese código no existe. Pídele a tu maestro el código actualizado." }
      if (!group.codeActive) return { ok: false, error: "El maestro pausó las inscripciones a este grupo." }
      const org = db.organizations.find((o) => o.id === group.orgId)
      const taken = db.members.filter((m) => m.groupId === group.id).length
      if (group.maxMembers && taken >= group.maxMembers) return { ok: false, error: "El grupo ya está lleno." }

      let userId: string
      let email: string
      if (register) {
        email = register.email.trim().toLowerCase()
        if (db.users.some((u) => u.email.toLowerCase() === email)) return { ok: false, error: "Ese correo ya tiene cuenta. Inicia sesión para unirte." }
        userId = newId()
      } else {
        if (!currentUser) return { ok: false, error: "Inicia sesión primero" }
        if (currentUser.role !== "student" || currentUser.orgId !== group.orgId) {
          return { ok: false, error: "Este código es para alumnos de esta facultad." }
        }
        if (db.members.some((m) => m.groupId === group.id && m.userId === currentUser.id)) return { ok: false, error: "Ya estás en este grupo." }
        userId = currentUser.id
        email = currentUser.email
      }

      // Restricción opcional por correo institucional (no todas las escuelas lo tienen)
      const domain = org?.emailDomain?.trim().replace(/^@/, "").toLowerCase()
      if (domain && !email.endsWith(`@${domain}`)) return { ok: false, error: `Usa tu correo institucional (@${domain}).` }

      const pending = group.requireApproval
      const teacher = db.users.find((u) => u.id === group.teacherId)
      mutate((draft) => {
        if (register) {
          draft.users.push({
            id: userId,
            orgId: group.orgId,
            email,
            password: register.password,
            firstName: register.firstName,
            lastName: register.lastName,
            enrollment: register.enrollment,
            role: "student",
            active: true,
            supervisorId: pending ? undefined : group.teacherId,
            schedule: [null, ...Array(5).fill({ start: "08:00", end: "13:00" }), null],
            createdAt: now(),
          })
        } else if (!pending) {
          const u = draft.users.find((x) => x.id === userId)
          if (u) u.supervisorId = group.teacherId
        }
        draft.members.push({ id: newId(), groupId: group.id, userId, status: pending ? "pending" : "approved", joinedAt: now() })
        const name = register ? `${register.firstName} ${register.lastName}` : fullName(currentUser)
        if (teacher) {
          pushNotification(
            draft,
            teacher.id,
            pending ? `Solicitud para unirse a ${group.name}` : `Nuevo alumno en ${group.name}`,
            `${name} · ${group.section}`,
          )
        }
      })
      if (register) setSession({ userId, activeOrgId: group.orgId })
      return { ok: true, pending }
    },

    approveMembers(memberIds: string[]) {
      mutate((draft) => {
        memberIds.forEach((id) => {
          const m = draft.members.find((x) => x.id === id)
          const g = draft.groups.find((x) => x.id === m?.groupId)
          const u = draft.users.find((x) => x.id === m?.userId)
          if (!m || !g || !u) return
          m.status = "approved"
          u.supervisorId = g.teacherId
          pushNotification(draft, u.id, "¡Ya estás dentro! 🎉", `Te aceptaron en ${g.section} · ${g.name}`)
        })
      })
    },

    removeMember(memberId: string) {
      mutate((draft) => {
        const m = draft.members.find((x) => x.id === memberId)
        const g = draft.groups.find((x) => x.id === m?.groupId)
        draft.members = draft.members.filter((x) => x.id !== memberId)
        if (m && g && m.status === "pending") pushNotification(draft, m.userId, "Solicitud no aceptada", `${g.section} · ${g.name}`)
      })
    },

    logAudit(action: string, detail: string) {
      mutate((draft) => pushAudit(draft, action, detail))
    },

    markNotificationsRead() {
      if (!currentUser) return
      mutate((draft) => {
        draft.notifications.filter((n) => n.userId === currentUser.id).forEach((n) => (n.read = true))
      })
    },

    resetDemo() {
      localStorage.removeItem(DB_KEY)
      localStorage.removeItem(SESSION_KEY)
      setDb(createSeed())
      setSession({ userId: null, activeOrgId: null })
    },
  }

  function applyTransfer(draft: Database, r: Reassignment, reason: string) {
    const p = draft.patients.find((x) => x.id === r.patientId)
    if (!p || !currentUser) return
    const transfer: Transfer = {
      id: newId(),
      orgId: p.orgId,
      patientId: p.id,
      fromProviderId: p.providerId,
      toProviderId: r.toProviderId,
      reason,
      summary: r.summary,
      pendingItems: r.pendingItems,
      byUserId: currentUser.id,
      at: now(),
    }
    draft.transfers.unshift(transfer)
    p.providerId = r.toProviderId
    pushNotification(draft, r.toProviderId, "Expediente transferido a ti", `${fullName(p)}. Revisa el resumen de entrega antes de la siguiente cita.`)
    pushAudit(draft, "Transfirió expediente", `${fullName(p)} → ${fullName(draft.users.find((u) => u.id === r.toProviderId))}`, p.orgId)
  }

  const providers = usersOf(orgId).filter((u) => isProvider(u.role) && u.active)

  return { db, loaded, session, currentUser, currentOrg, orgId, providers, actions }
}

type Store = ReturnType<typeof useStoreValue>

const StoreContext = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const value = useStoreValue()
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const store = useContext(StoreContext)
  if (!store) throw new Error("useStore debe usarse dentro de StoreProvider")
  return store
}

export function useUserLookup() {
  const { db } = useStore()
  return useMemo(() => {
    const map = new Map(db.users.map((u) => [u.id, u]))
    return (id?: string) => (id ? map.get(id) : undefined)
  }, [db.users])
}
