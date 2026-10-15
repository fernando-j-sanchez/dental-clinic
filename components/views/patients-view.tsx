"use client"

import { useState } from "react"
import { AlertTriangle, ChevronRight, Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, EmptyState, PageHeader, Pill } from "@/components/common"
import { PatientFormDialog } from "@/components/views/patient-form-dialog"
import { ageFrom, formatDate, formatTime, todayKey } from "@/lib/dates"
import { can } from "@/lib/permissions"
import { visiblePatients } from "@/lib/selectors"
import { fullName, providerTitle, useStore, useUserLookup } from "@/lib/store"

export function PatientsView({ onOpenPatient }: { onOpenPatient: (id: string) => void }) {
  const { db, currentUser, orgId, currentOrg } = useStore()
  const userById = useUserLookup()
  const [search, setSearch] = useState("")
  const [onlyUnassigned, setOnlyUnassigned] = useState(false)
  const [adding, setAdding] = useState(false)
  if (!currentUser) return null

  const today = todayKey()
  const q = search.trim().toLowerCase()
  const patients = visiblePatients(db, currentUser, orgId, currentOrg)
    .filter((p) => !onlyUnassigned || !p.providerId)
    .filter((p) => !q || fullName(p).toLowerCase().includes(q) || p.phone.includes(q) || p.email.toLowerCase().includes(q))
    .sort((a, b) => fullName(a).localeCompare(fullName(b)))
  const unassignedCount = visiblePatients(db, currentUser, orgId, currentOrg).filter((p) => !p.providerId).length

  const nextAppointment = (patientId: string) =>
    db.appointments
      .filter((a) => a.patientId === patientId && a.date >= today && (a.status === "confirmed" || a.status === "requested"))
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))[0]

  return (
    <>
      <PageHeader
        title={currentUser.role === "dentist" || currentUser.role === "student" ? "Mis pacientes" : "Pacientes"}
        description={`${patients.length} expediente${patients.length === 1 ? "" : "s"}`}
        actions={
          can.addPatients(currentUser) && (
            <Button onClick={() => setAdding(true)} className="bg-sky-600 hover:bg-sky-700">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo paciente
            </Button>
          )
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input placeholder="Buscar por nombre, teléfono o email…" value={search} onChange={(e) => setSearch(e.target.value)} className="bg-white pl-10" />
        </div>
        {unassignedCount > 0 && can.transferRecords(currentUser) && (
          <Button variant={onlyUnassigned ? "default" : "outline"} onClick={() => setOnlyUnassigned(!onlyUnassigned)} className={onlyUnassigned ? "bg-amber-500 hover:bg-amber-600" : "bg-white"}>
            Sin responsable ({unassignedCount})
          </Button>
        )}
      </div>

      {patients.length === 0 ? (
        <EmptyState
          title={q ? "No encontramos a nadie con esa búsqueda" : "Aún no hay pacientes"}
          description={q ? "Prueba con otro nombre o teléfono." : "Agrega el primer expediente para empezar."}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {patients.map((p) => {
            const next = nextAppointment(p.id)
            const age = ageFrom(p.dateOfBirth)
            const hasAllergy = p.allergies && !/ningun/i.test(p.allergies)
            return (
              <button
                key={p.id}
                onClick={() => onOpenPatient(p.id)}
                className="flex w-full items-center gap-4 border-b border-slate-100 px-4 py-3 text-left transition last:border-0 hover:bg-sky-50/50"
              >
                <Avatar name={fullName(p)} size={42} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-slate-900">{fullName(p)}</p>
                    {age !== null && <span className="text-sm text-slate-400">{age} años</span>}
                    {hasAllergy && (
                      <Pill className="bg-red-50 text-red-700">
                        <AlertTriangle className="mr-1 h-3 w-3" />
                        {p.allergies}
                      </Pill>
                    )}
                    {p.userId && <Pill className="bg-pink-50 text-pink-700">Portal activo</Pill>}
                  </div>
                  <p className="truncate text-sm text-slate-500">
                    {p.phone} · {p.providerId ? providerTitle(userById(p.providerId)) : <span className="font-medium text-amber-600">Sin responsable</span>}
                  </p>
                </div>
                <div className="hidden text-right text-sm sm:block">
                  {next ? (
                    <>
                      <p className="font-medium text-slate-700">{formatDate(next.date)}</p>
                      <p className="text-slate-400">{formatTime(next.time)}</p>
                    </>
                  ) : (
                    <p className="text-slate-400">Sin cita próxima</p>
                  )}
                </div>
                <ChevronRight className="h-4 w-4 text-slate-300" />
              </button>
            )
          })}
        </div>
      )}

      <PatientFormDialog open={adding} onOpenChange={setAdding} />
    </>
  )
}
