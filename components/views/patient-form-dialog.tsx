"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { isProvider } from "@/lib/permissions"
import { providerTitle, useStore } from "@/lib/store"
import type { Patient } from "@/lib/types"

type FormState = Omit<Patient, "id" | "orgId" | "createdAt" | "status">

const EMPTY: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  address: "",
  allergies: "",
  medicalHistory: "",
  emergencyContact: "",
  emergencyPhone: "",
  providerId: "",
}

export function PatientFormDialog({ open, onOpenChange, patient }: { open: boolean; onOpenChange: (open: boolean) => void; patient?: Patient }) {
  const { currentUser, providers, actions } = useStore()
  const [form, setForm] = useState<FormState>(EMPTY)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!open) return
    setError("")
    if (patient) {
      const { id: _id, orgId: _org, createdAt: _c, status: _s, ...rest } = patient
      setForm(rest)
    } else {
      setForm({ ...EMPTY, providerId: currentUser && isProvider(currentUser.role) ? currentUser.id : "" })
    }
  }, [open, patient, currentUser])

  const set = (key: keyof FormState) => (value: string) => setForm((f) => ({ ...f, [key]: value }))

  // Dentistas y alumnos se asignan sus propios pacientes; admin y maestros eligen responsable
  const canChooseProvider = currentUser && !(currentUser.role === "dentist" || currentUser.role === "student")
  const editingProvider = !!patient // el cambio de responsable se hace con "Transferir", que deja historial

  const save = () => {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.phone.trim()) {
      setError("Nombre, apellidos y teléfono son obligatorios")
      return
    }
    if (patient) actions.updatePatient(patient.id, form)
    else actions.addPatient(form)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{patient ? "Editar paciente" : "Nuevo paciente"}</DialogTitle>
          <DialogDescription>Datos generales y antecedentes importantes</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2 sm:grid-cols-2">
          <TextField label="Nombre *" value={form.firstName} onChange={set("firstName")} />
          <TextField label="Apellidos *" value={form.lastName} onChange={set("lastName")} />
          <TextField label="Teléfono *" value={form.phone} onChange={set("phone")} type="tel" />
          <TextField label="Email" value={form.email} onChange={set("email")} type="email" />
          <TextField label="Fecha de nacimiento" value={form.dateOfBirth} onChange={set("dateOfBirth")} type="date" />
          <TextField label="Dirección" value={form.address} onChange={set("address")} />
          <TextField label="Contacto de emergencia" value={form.emergencyContact} onChange={set("emergencyContact")} />
          <TextField label="Teléfono de emergencia" value={form.emergencyPhone} onChange={set("emergencyPhone")} type="tel" />
          <div className="space-y-2 sm:col-span-2">
            <Label>⚠ Alergias</Label>
            <Input value={form.allergies} onChange={(e) => set("allergies")(e.target.value)} placeholder="Penicilina, látex, anestésicos…" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Antecedentes médicos</Label>
            <Textarea value={form.medicalHistory} onChange={(e) => set("medicalHistory")(e.target.value)} rows={3} />
          </div>
          {canChooseProvider && !editingProvider && (
            <div className="space-y-2 sm:col-span-2">
              <Label>Responsable del expediente</Label>
              <Select value={form.providerId || "none"} onValueChange={(v) => set("providerId")(v === "none" ? "" : v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin asignar</SelectItem>
                  {providers.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {providerTitle(p)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={save} className="bg-sky-600 hover:bg-sky-700">
            {patient ? "Guardar cambios" : "Agregar paciente"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function TextField({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}
