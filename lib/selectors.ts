import { canSeePatient } from "./permissions"
import type { Database, Organization, User } from "./types"

export function visiblePatients(db: Database, user: User, orgId: string | null, org: Organization | undefined) {
  if (!orgId) return []
  return db.patients.filter((p) => p.orgId === orgId && canSeePatient(user, p, org))
}

export function patientNotes(db: Database, patientId: string) {
  return db.notes.filter((n) => n.patientId === patientId).sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))
}
