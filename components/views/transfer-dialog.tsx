"use client"

import { useEffect, useState } from "react"
import { ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { providerTitle, useStore, useUserLookup } from "@/lib/store"
import { buildHandoffSummary } from "@/lib/summary"
import type { Patient } from "@/lib/types"

export function TransferDialog({ open, onOpenChange, patient }: { open: boolean; onOpenChange: (open: boolean) => void; patient: Patient }) {
  const { db, providers, actions } = useStore()
  const userById = useUserLookup()
  const [toProviderId, setToProviderId] = useState("")
  const [reason, setReason] = useState("")
  const [summary, setSummary] = useState("")
  const [pendingItems, setPendingItems] = useState("")
  const [error, setError] = useState("")
  const isFirstAssignment = !patient.providerId

  useEffect(() => {
    if (!open) return
    const draft = buildHandoffSummary(db, patient)
    setToProviderId("")
    setReason(isFirstAssignment ? "Asignación inicial" : "")
    setSummary(draft.summary)
    setPendingItems(draft.pendingItems)
    setError("")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const save = () => {
    if (!toProviderId) return setError("Elige quién recibe el expediente")
    if (!reason.trim()) return setError("Indica el motivo")
    if (!isFirstAssignment && summary.trim().length < 20) return setError("El resumen de entrega es muy corto")
    actions.transferPatient(patient.id, toProviderId, reason, summary, pendingItems)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isFirstAssignment ? "Asignar responsable" : "Transferir expediente"}</DialogTitle>
          <DialogDescription>
            {isFirstAssignment
              ? "Elige quién va a atender a este paciente."
              : "El nuevo responsable recibe el expediente completo y un resumen de entrega para dar seguimiento sin perder información."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 text-sm">
            <span className="font-medium text-slate-700">{providerTitle(userById(patient.providerId))}</span>
            <ArrowRight className="h-4 w-4 text-slate-400" />
            <Select value={toProviderId} onValueChange={setToProviderId}>
              <SelectTrigger className="flex-1 bg-white">
                <SelectValue placeholder="Nuevo responsable…" />
              </SelectTrigger>
              <SelectContent>
                {providers
                  .filter((p) => p.id !== patient.providerId)
                  .map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {providerTitle(p)}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Motivo</Label>
            <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Baja del alumno, cambio de turno, especialidad…" />
          </div>

          {!isFirstAssignment && (
            <>
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  Resumen de entrega
                  <span className="flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-normal text-sky-700">
                    <Sparkles className="h-3 w-3" /> borrador automático, revísalo
                  </span>
                </Label>
                <Textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={8} className="font-mono text-xs" />
              </div>
              <div className="space-y-2">
                <Label>Pendientes para el nuevo responsable</Label>
                <Textarea value={pendingItems} onChange={(e) => setPendingItems(e.target.value)} rows={4} placeholder="Nada pendiente" />
              </div>
            </>
          )}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={save} className="bg-sky-600 hover:bg-sky-700">
            {isFirstAssignment ? "Asignar" : "Transferir expediente"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
