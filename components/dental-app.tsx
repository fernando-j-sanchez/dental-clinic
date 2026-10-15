"use client"

import { useEffect, useState } from "react"
import { AppShell, type View } from "@/components/app-shell"
import { LoginScreen } from "@/components/login-screen"
import { Tooth } from "@/components/tooth"
import { AuditView, OrganizationsView, SettingsView, ValidationsView } from "@/components/views/admin-views"
import { AgendaView } from "@/components/views/agenda-view"
import { DashboardView } from "@/components/views/dashboard-view"
import { PatientPortal } from "@/components/views/patient-portal"
import { PatientRecord } from "@/components/views/patient-record"
import { PatientsView } from "@/components/views/patients-view"
import { MyScheduleView } from "@/components/views/schedule-editor"
import { UsersView } from "@/components/views/users-view"
import { StoreProvider, useStore } from "@/lib/store"

export function DentalApp() {
  return (
    <StoreProvider>
      <Router />
    </StoreProvider>
  )
}

function Router() {
  const { loaded, currentUser, orgId } = useStore()
  const [view, setView] = useState<View>("dashboard")
  const [patientId, setPatientId] = useState<string | null>(null)

  // Al cambiar de usuario u organización se vuelve al inicio
  useEffect(() => {
    setView("dashboard")
    setPatientId(null)
  }, [currentUser?.id, orgId])

  if (!loaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sky-50">
        <div className="tooth-hop">
          <Tooth size={72} mood="happy" />
        </div>
      </div>
    )
  }

  if (!currentUser) return <LoginScreen />
  if (currentUser.role === "patient") return <PatientPortal />

  const openPatient = (id: string) => {
    setPatientId(id)
    setView("patients")
  }

  const navigate = (v: View) => {
    setView(v)
    setPatientId(null)
  }

  let content
  if (patientId) content = <PatientRecord patientId={patientId} onBack={() => setPatientId(null)} />
  else if (view === "dashboard") content = <DashboardView onOpenPatient={openPatient} />
  else if (view === "patients") content = <PatientsView onOpenPatient={openPatient} />
  else if (view === "validations") content = <ValidationsView onOpenPatient={openPatient} />
  else if (view === "agenda") content = <AgendaView onOpenPatient={openPatient} />
  else if (view === "schedule") content = <MyScheduleView />
  else if (view === "users") content = <UsersView />
  else if (view === "organizations") content = <OrganizationsView />
  else if (view === "audit") content = <AuditView />
  else content = <SettingsView />

  return (
    <AppShell view={view} onNavigate={navigate}>
      <div key={`${view}-${patientId}`} className="fade-up">
        {content}
      </div>
    </AppShell>
  )
}
