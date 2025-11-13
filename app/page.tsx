"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  Plus,
  User,
  Calendar,
  FileText,
  Users,
  Phone,
  Mail,
  MapPin,
  Edit,
  Trash2,
  UserCheck,
  Clock,
  Shield,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Stethoscope,
  Activity,
  LogOut,
  Eye,
  EyeOff,
} from "lucide-react"

interface Patient {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  dateOfBirth: string
  emergencyContact: string
  emergencyPhone: string
  medicalHistory: string
  allergies: string
  lastVisit?: string
  nextAppointment?: string
  status: "active" | "inactive"
}

interface Staff {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  role: "dentist" | "hygienist" | "receptionist" | "assistant" | "admin"
  licenseNumber?: string
  specialization?: string
  hireDate: string
  schedule: {
    monday: { start: string; end: string; available: boolean }
    tuesday: { start: string; end: string; available: boolean }
    wednesday: { start: string; end: string; available: boolean }
    thursday: { start: string; end: string; available: boolean }
    friday: { start: string; end: string; available: boolean }
    saturday: { start: ""; end: ""; available: false }
    sunday: { start: ""; end: ""; available: false }
  }
  permissions: {
    viewPatients: boolean
    editPatients: boolean
    viewAppointments: boolean
    editAppointments: boolean
    viewReports: boolean
    manageStaff: boolean
  }
  status: "active" | "inactive"
}

interface Appointment {
  id: string
  patientId: string
  staffId: string
  date: string
  time: string
  duration: number // in minutes
  type: "consultation" | "cleaning" | "treatment" | "emergency" | "followup"
  status: "scheduled" | "confirmed" | "completed" | "cancelled" | "no-show"
  notes?: string
  treatmentPlan?: string
}

interface ClinicalNote {
  id: string
  patientId: string
  staffId: string
  appointmentId?: string
  date: string
  type: "examination" | "treatment" | "diagnosis" | "progress" | "prescription" | "referral"
  title: string
  description: string
  diagnosis?: string
  treatment?: string
  medications?: string
  followUpDate?: string
  attachments?: string[]
  toothNumbers?: string[]
  severity?: "low" | "medium" | "high"
  status: "draft" | "completed" | "reviewed"
  createdAt: string
  updatedAt: string
}

interface TreatmentTemplate {
  id: string
  name: string
  category: "preventive" | "restorative" | "surgical" | "orthodontic" | "endodontic" | "periodontic"
  description: string
  estimatedDuration: number
  defaultNotes: string
  requiredFollowUp: boolean
}

// This interface was redeclared. The linter error "lint/suspicious/noRedeclare" indicated this.
// It has been removed to resolve the conflict.
// interface User {
//   id: string
//   email: string
//   firstName: string
//   lastName: string
//   role: "admin" | "dentist" | "staff"
//   password?: string
// }

export default function DentalClinicDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([
    {
      id: "1",
      email: "admin@dentalcare.com",
      firstName: "Admin",
      lastName: "Clínica",
      role: "admin",
      password: "admin123",
    },
    {
      id: "2",
      email: "dentist@dentalcare.com",
      firstName: "Dr. Test",
      lastName: "Dentist",
      role: "dentist",
      password: "dentist123",
    },
  ])

  const handleLogin = (email: string, password: string) => {
    const user = users.find((u) => u.email === email && u.password === password)
    if (user) {
      setCurrentUser({ ...user })
      setIsAuthenticated(true)
      localStorage.setItem("currentUser", JSON.stringify({ id: user.id, email: user.email, role: user.role }))
    }
  }

  const handleRegister = (email: string, password: string, firstName: string, lastName: string) => {
    if (users.find((u) => u.email === email)) {
      return false
    }
    const newUser: User = {
      id: String(users.length + 1),
      email,
      firstName,
      lastName,
      role: "staff",
      password,
    }
    setUsers([...users, newUser])
    return true
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setCurrentUser(null)
    localStorage.removeItem("currentUser")
  }

  const [currentView, setCurrentView] = useState<"patients" | "staff" | "appointments" | "clinical" | "reports">(
    "patients",
  )

  const [patients, setPatients] = useState<Patient[]>([
    {
      id: "1",
      firstName: "María",
      lastName: "González",
      email: "maria.gonzalez@email.com",
      phone: "+34 612 345 678",
      address: "Calle Mayor 123, Madrid",
      dateOfBirth: "1985-03-15",
      emergencyContact: "Juan González",
      emergencyPhone: "+34 612 345 679",
      medicalHistory: "Hipertensión controlada",
      allergies: "Penicilina",
      lastVisit: "2024-02-15",
      nextAppointment: "2024-03-20",
      status: "active",
    },
    {
      id: "2",
      firstName: "Carlos",
      lastName: "Rodríguez",
      email: "carlos.rodriguez@email.com",
      phone: "+34 623 456 789",
      address: "Avenida de la Paz 45, Barcelona",
      dateOfBirth: "1978-07-22",
      emergencyContact: "Ana Rodríguez",
      emergencyPhone: "+34 623 456 790",
      medicalHistory: "Diabetes tipo 2",
      allergies: "Ninguna conocida",
      lastVisit: "2024-01-28",
      status: "active",
    },
  ])

  const [staff, setStaff] = useState<Staff[]>([
    {
      id: "1",
      firstName: "Dr. Ana",
      lastName: "Martínez",
      email: "ana.martinez@dentalcare.com",
      phone: "+34 611 222 333",
      role: "dentist",
      licenseNumber: "COD-12345",
      specialization: "Endodoncia",
      hireDate: "2020-01-15",
      schedule: {
        monday: { start: "09:00", end: "17:00", available: true },
        tuesday: { start: "09:00", end: "17:00", available: true },
        wednesday: { start: "09:00", end: "17:00", available: true },
        thursday: { start: "09:00", end: "17:00", available: true },
        friday: { start: "09:00", end: "15:00", available: true },
        saturday: { start: "", end: "", available: false },
        sunday: { start: "", end: "", available: false },
      },
      permissions: {
        viewPatients: true,
        editPatients: true,
        viewAppointments: true,
        editAppointments: true,
        viewReports: true,
        manageStaff: false,
      },
      status: "active",
    },
    {
      id: "2",
      firstName: "Carmen",
      lastName: "López",
      email: "carmen.lopez@dentalcare.com",
      phone: "+34 622 333 444",
      role: "hygienist",
      licenseNumber: "HIG-67890",
      hireDate: "2021-03-10",
      schedule: {
        monday: { start: "08:00", end: "16:00", available: true },
        tuesday: { start: "08:00", end: "16:00", available: true },
        wednesday: { start: "08:00", end: "16:00", available: true },
        thursday: { start: "08:00", end: "16:00", available: true },
        friday: { start: "08:00", end: "14:00", available: true },
        saturday: { start: "", end: "", available: false },
        sunday: { start: "", end: "", available: false },
      },
      permissions: {
        viewPatients: true,
        editPatients: false,
        viewAppointments: true,
        editAppointments: false,
        viewReports: false,
        manageStaff: false,
      },
      status: "active",
    },
  ])

  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: "1",
      patientId: "1",
      staffId: "1",
      date: "2024-03-20",
      time: "10:00",
      duration: 60,
      type: "consultation",
      status: "scheduled",
      notes: "Revisión general y limpieza",
      treatmentPlan: "Evaluación de caries en molar superior derecho",
    },
    {
      id: "2",
      patientId: "2",
      staffId: "2",
      date: "2024-03-21",
      time: "14:30",
      duration: 45,
      type: "cleaning",
      status: "confirmed",
      notes: "Limpieza dental rutinaria",
    },
    {
      id: "3",
      patientId: "1",
      staffId: "1",
      date: "2024-03-22",
      time: "09:00",
      duration: 90,
      type: "treatment",
      status: "scheduled",
      notes: "Tratamiento de endodoncia",
      treatmentPlan: "Endodoncia en molar 16",
    },
  ])

  const [clinicalNotes, setClinicalNotes] = useState<ClinicalNote[]>([
    {
      id: "1",
      patientId: "1",
      staffId: "1",
      appointmentId: "1",
      date: "2024-03-20",
      type: "examination",
      title: "Examen Dental Rutinario",
      description:
        "Examen completo de la cavidad oral. Se observa caries en molar superior derecho (16). Encías en buen estado general.",
      diagnosis: "Caries dental en pieza 16",
      treatment: "Obturación con composite",
      toothNumbers: ["16"],
      severity: "medium",
      status: "completed",
      createdAt: "2024-03-20T10:00:00Z",
      updatedAt: "2024-03-20T10:30:00Z",
    },
    {
      id: "2",
      patientId: "2",
      staffId: "2",
      appointmentId: "2",
      date: "2024-03-21",
      type: "treatment",
      title: "Limpieza Dental Profunda",
      description: "Profilaxis dental completa. Eliminación de placa y sarro. Aplicación de flúor.",
      treatment: "Profilaxis + aplicación de flúor",
      followUpDate: "2024-09-21",
      severity: "low",
      status: "completed",
      createdAt: "2024-03-21T14:30:00Z",
      updatedAt: "2024-03-21T15:15:00Z",
    },
    {
      id: "3",
      patientId: "1",
      staffId: "1",
      date: "2024-03-22",
      type: "treatment",
      title: "Endodoncia Molar 16",
      description: "Tratamiento de conducto en molar superior derecho. Procedimiento realizado bajo anestesia local.",
      diagnosis: "Pulpitis irreversible",
      treatment: "Endodoncia + corona temporal",
      medications: "Ibuprofeno 600mg cada 8h por 3 días",
      followUpDate: "2024-04-05",
      toothNumbers: ["16"],
      severity: "high",
      status: "completed",
      createdAt: "2024-03-22T09:00:00Z",
      updatedAt: "2024-03-22T10:30:00Z",
    },
  ])

  const [treatmentTemplates] = useState<TreatmentTemplate[]>([
    {
      id: "1",
      name: "Limpieza Dental",
      category: "preventive",
      description: "Profilaxis dental rutinaria con eliminación de placa y sarro",
      estimatedDuration: 45,
      defaultNotes: "Limpieza dental completa. Eliminación de placa bacteriana y cálculo dental.",
      requiredFollowUp: true,
    },
    {
      id: "2",
      name: "Obturación Simple",
      category: "restorative",
      description: "Restauración dental con composite",
      estimatedDuration: 60,
      defaultNotes: "Preparación cavitaria y obturación con composite fotopolimerizable.",
      requiredFollowUp: false,
    },
    {
      id: "3",
      name: "Endodoncia",
      category: "endodontic",
      description: "Tratamiento de conducto radicular",
      estimatedDuration: 90,
      defaultNotes: "Tratamiento endodóntico. Instrumentación y obturación de conductos.",
      requiredFollowUp: true,
    },
  ])

  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [isAddingAppointment, setIsAddingAppointment] = useState(false)
  const [appointmentFormData, setAppointmentFormData] = useState<Partial<Appointment>>({})
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [isAddingPatient, setIsAddingPatient] = useState(false)
  const [formData, setFormData] = useState<Partial<Patient>>({})

  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null)
  const [isAddingStaff, setIsAddingStaff] = useState(false)
  const [staffFormData, setStaffFormData] = useState<Partial<Staff>>({})

  const [selectedClinicalNote, setSelectedClinicalNote] = useState<ClinicalNote | null>(null)
  const [isAddingClinicalNote, setIsAddingClinicalNote] = useState(false)
  const [clinicalNoteFormData, setClinicalNoteFormData] = useState<Partial<ClinicalNote>>({})
  const [selectedPatientForNotes, setSelectedPatientForNotes] = useState<string>("")

  const searchLower = searchTerm.toLowerCase()

  const filteredPatients = patients.filter(
    (patient) =>
      `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchLower) ||
      patient.email.toLowerCase().includes(searchLower) ||
      patient.phone.includes(searchTerm),
  )

  const filteredStaff = staff.filter(
    (member) =>
      `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchLower) ||
      member.email.toLowerCase().includes(searchLower) ||
      member.role.toLowerCase().includes(searchLower),
  )

  const filteredAppointments = appointments.filter((appointment) => {
    const patient = patients.find((p) => p.id === appointment.patientId)
    const appointmentStaff = staff.find((s) => s.id === appointment.staffId)

    return (
      patient &&
      appointmentStaff &&
      (`${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchLower) ||
        `${appointmentStaff.firstName} ${appointmentStaff.lastName}`.toLowerCase().includes(searchLower) ||
        appointment.type.toLowerCase().includes(searchLower) ||
        appointment.status.toLowerCase().includes(searchLower))
    )
  })

  const filteredClinicalNotes = clinicalNotes.filter((note) => {
    const patient = patients.find((p) => p.id === note.patientId)
    const staffMember = staff.find((s) => s.id === note.staffId)

    if (selectedPatientForNotes && selectedPatientForNotes !== "all" && note.patientId !== selectedPatientForNotes) {
      return false
    }

    return (
      patient &&
      staffMember &&
      (`${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchLower) ||
        note.title.toLowerCase().includes(searchLower) ||
        note.description.toLowerCase().includes(searchLower) ||
        note.type.toLowerCase().includes(searchLower) ||
        (note.diagnosis && note.diagnosis.toLowerCase().includes(searchLower)))
    )
  })

  const getCalendarDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    const days = []
    const current = new Date(startDate)

    for (let i = 0; i < 42; i++) {
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }

    return days
  }

  const getAppointmentsForDate = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0]
    return appointments.filter((apt) => apt.date === dateStr)
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":")
    const hour = Number.parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const handleAddPatient = () => {
    if (formData.firstName && formData.lastName && formData.email && formData.phone) {
      const newPatient: Patient = {
        id: Date.now().toString(),
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address || "",
        dateOfBirth: formData.dateOfBirth || "",
        emergencyContact: formData.emergencyContact || "",
        emergencyPhone: formData.emergencyPhone || "",
        medicalHistory: formData.medicalHistory || "",
        allergies: formData.allergies || "",
        status: "active",
      }
      setPatients([...patients, newPatient])
      setFormData({})
      setIsAddingPatient(false)
    }
  }

  const handleEditPatient = () => {
    if (selectedPatient && formData.firstName && formData.lastName) {
      setPatients(patients.map((p) => (p.id === selectedPatient.id ? { ...selectedPatient, ...formData } : p)))
      setSelectedPatient(null)
      setFormData({})
    }
  }

  const handleDeletePatient = (patientId: string) => {
    setPatients(patients.filter((p) => p.id !== patientId))
  }

  const handleAddStaff = () => {
    if (staffFormData.firstName && staffFormData.lastName && staffFormData.email && staffFormData.role) {
      const defaultSchedule = {
        monday: { start: "09:00", end: "17:00", available: true },
        tuesday: { start: "09:00", end: "17:00", available: true },
        wednesday: { start: "09:00", end: "17:00", available: true },
        thursday: { start: "09:00", end: "17:00", available: true },
        friday: { start: "09:00", end: "17:00", available: true },
        saturday: { start: "", end: "", available: false },
        sunday: { start: "", end: "", available: false },
      }

      const defaultPermissions = {
        viewPatients: staffFormData.role === "dentist" || staffFormData.role === "hygienist",
        editPatients: staffFormData.role === "dentist",
        viewAppointments: true,
        editAppointments: staffFormData.role === "dentist" || staffFormData.role === "receptionist",
        viewReports: staffFormData.role === "dentist" || staffFormData.role === "admin",
        manageStaff: staffFormData.role === "admin",
      }

      const newStaff: Staff = {
        id: Date.now().toString(),
        firstName: staffFormData.firstName,
        lastName: staffFormData.lastName,
        email: staffFormData.email,
        phone: staffFormData.phone || "",
        role: staffFormData.role,
        licenseNumber: staffFormData.licenseNumber || "",
        specialization: staffFormData.specialization || "",
        hireDate: staffFormData.hireDate || new Date().toISOString().split("T")[0],
        schedule: defaultSchedule,
        permissions: defaultPermissions,
        status: "active",
      }
      setStaff([...staff, newStaff])
      setStaffFormData({})
      setIsAddingStaff(false)
    }
  }

  const handleEditStaff = () => {
    if (selectedStaff && staffFormData.firstName && staffFormData.lastName) {
      setStaff(staff.map((s) => (s.id === selectedStaff.id ? { ...selectedStaff, ...staffFormData } : s)))
      setSelectedStaff(null)
      setStaffFormData({})
    }
  }

  const handleDeleteStaff = (staffId: string) => {
    setStaff(staff.filter((s) => s.id !== staffId))
  }

  const handleAddAppointment = () => {
    if (
      appointmentFormData.patientId &&
      appointmentFormData.staffId &&
      appointmentFormData.date &&
      appointmentFormData.time &&
      appointmentFormData.type
    ) {
      const newAppointment: Appointment = {
        id: Date.now().toString(),
        patientId: appointmentFormData.patientId,
        staffId: appointmentFormData.staffId,
        date: appointmentFormData.date,
        time: appointmentFormData.time,
        duration: appointmentFormData.duration || 60,
        type: appointmentFormData.type,
        status: "scheduled",
        notes: appointmentFormData.notes || "",
        treatmentPlan: appointmentFormData.treatmentPlan || "",
      }
      setAppointments([...appointments, newAppointment])
      setAppointmentFormData({})
      setIsAddingAppointment(false)
    }
  }

  const handleEditAppointment = () => {
    if (selectedAppointment && appointmentFormData.patientId && appointmentFormData.staffId) {
      setAppointments(
        appointments.map((apt) =>
          apt.id === selectedAppointment.id ? { ...selectedAppointment, ...appointmentFormData } : apt,
        ),
      )
      setSelectedAppointment(null)
      setAppointmentFormData({})
    }
  }

  const handleDeleteAppointment = (appointmentId: string) => {
    setAppointments(appointments.filter((apt) => apt.id !== appointmentId))
  }

  const handleAddClinicalNote = () => {
    if (
      clinicalNoteFormData.patientId &&
      clinicalNoteFormData.staffId &&
      clinicalNoteFormData.title &&
      clinicalNoteFormData.description &&
      clinicalNoteFormData.type
    ) {
      const newNote: ClinicalNote = {
        id: Date.now().toString(),
        patientId: clinicalNoteFormData.patientId,
        staffId: clinicalNoteFormData.staffId,
        appointmentId: clinicalNoteFormData.appointmentId,
        date: clinicalNoteFormData.date || new Date().toISOString().split("T")[0],
        type: clinicalNoteFormData.type,
        title: clinicalNoteFormData.title,
        description: clinicalNoteFormData.description,
        diagnosis: clinicalNoteFormData.diagnosis || "",
        treatment: clinicalNoteFormData.treatment || "",
        medications: clinicalNoteFormData.medications || "",
        followUpDate: clinicalNoteFormData.followUpDate || "",
        toothNumbers: clinicalNoteFormData.toothNumbers || [],
        severity: clinicalNoteFormData.severity || "low",
        status: "completed",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      setClinicalNotes([...clinicalNotes, newNote])
      setClinicalNoteFormData({})
      setIsAddingClinicalNote(false)
    }
  }

  const handleEditClinicalNote = () => {
    if (selectedClinicalNote && clinicalNoteFormData.title && clinicalNoteFormData.description) {
      setClinicalNotes(
        clinicalNotes.map((note) =>
          note.id === selectedClinicalNote.id
            ? { ...selectedClinicalNote, ...clinicalNoteFormData, updatedAt: new Date().toISOString() }
            : note,
        ),
      )
      setSelectedClinicalNote(null)
      setClinicalNoteFormData({})
    }
  }

  const handleDeleteClinicalNote = (noteId: string) => {
    setClinicalNotes(clinicalNotes.filter((note) => note.id !== noteId))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-gray-100 text-gray-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "no-show":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "consultation":
        return "bg-purple-100 text-purple-800"
      case "cleaning":
        return "bg-cyan-100 text-cyan-800"
      case "treatment":
        return "bg-orange-100 text-orange-800"
      case "emergency":
        return "bg-red-100 text-red-800"
      case "followup":
        return "bg-green-100 text-green-800"
      case "examination":
        return "bg-blue-100 text-blue-800"
      case "diagnosis":
        return "bg-purple-100 text-purple-800"
      case "progress":
        return "bg-orange-100 text-orange-800"
      case "prescription":
        return "bg-pink-100 text-pink-800"
      case "referral":
        return "bg-cyan-100 text-cyan-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "dentist":
        return "bg-blue-100 text-blue-800"
      case "hygienist":
        return "bg-green-100 text-green-800"
      case "receptionist":
        return "bg-purple-100 text-purple-800"
      case "assistant":
        return "bg-orange-100 text-orange-800"
      case "admin":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "dentist":
        return "Dentista"
      case "hygienist":
        return "Higienista"
      case "receptionist":
        return "Recepcionista"
      case "assistant":
        return "Asistente"
      case "admin":
        return "Administrador"
      default:
        return role
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "examination":
        return "Examen"
      case "treatment":
        return "Tratamiento"
      case "diagnosis":
        return "Diagnóstico"
      case "progress":
        return "Progreso"
      case "prescription":
        return "Prescripción"
      case "referral":
        return "Derivación"
      default:
        return type
    }
  }

  const getReportsData = () => {
    const totalPatients = patients.length
    const activePatients = patients.filter((p) => p.status === "active").length
    const totalStaff = staff.length
    const activeStaff = staff.filter((s) => s.status === "active").length
    const totalAppointments = appointments.length
    const completedAppointments = appointments.filter((a) => a.status === "completed").length
    const scheduledAppointments = appointments.filter(
      (a) => a.status === "scheduled" || a.status === "confirmed",
    ).length
    const totalClinicalNotes = clinicalNotes.length

    // Appointments by type
    const appointmentsByType = appointments.reduce(
      (acc, apt) => {
        acc[apt.type] = (acc[apt.type] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    // Clinical notes by type
    const notesByType = clinicalNotes.reduce(
      (acc, note) => {
        acc[note.type] = (acc[note.type] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    // Staff workload (appointments assigned)
    const staffWorkload = staff.map((member) => {
      const assignedAppointments = appointments.filter((apt) => apt.staffId === member.id).length
      return {
        name: `${member.firstName} ${member.lastName}`,
        role: member.role,
        appointments: assignedAppointments,
      }
    })

    // Recent activity (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentAppointments = appointments.filter((apt) => new Date(apt.date) >= thirtyDaysAgo).length

    const recentNotes = clinicalNotes.filter((note) => new Date(note.createdAt) >= thirtyDaysAgo).length

    return {
      totalPatients,
      activePatients,
      totalStaff,
      activeStaff,
      totalAppointments,
      completedAppointments,
      scheduledAppointments,
      totalClinicalNotes,
      appointmentsByType,
      notesByType,
      staffWorkload,
      recentAppointments,
      recentNotes,
    }
  }

  const reportsData = getReportsData()

  if (!isAuthenticated || !currentUser) {
    return <AuthForm onLogin={handleLogin} onRegister={handleRegister} />
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header with logout */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Dental Clinic Management</h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-slate-600" />
              <span className="text-sm text-slate-600">
                {currentUser.firstName} {currentUser.lastName}
              </span>
              <Badge className="bg-blue-100 text-blue-800">
                {currentUser.role === "admin"
                  ? "Administrador"
                  : currentUser.role === "dentist"
                    ? "Dentista"
                    : "Personal"}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-1" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8 border-b border-slate-200">
          <div className="flex gap-6">
            {["patients", "staff", "appointments", "clinical", "reports"].map((view) => (
              <button
                key={view}
                onClick={() => setCurrentView(view as typeof currentView)}
                className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
                  currentView === view
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-600 hover:text-slate-900"
                }`}
              >
                {view === "patients" && "Pacientes"}
                {view === "staff" && "Personal"}
                {view === "appointments" && "Citas"}
                {view === "clinical" && "Notas Clínicas"}
                {view === "reports" && "Reportes"}
              </button>
            ))}
          </div>
        </div>

        {currentView === "reports" ? (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Reportes y Estadísticas</h2>
              <p className="text-slate-600">Análisis completo de la actividad de la clínica dental</p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total Pacientes</CardDescription>
                  <CardTitle className="text-3xl text-blue-600">{reportsData.totalPatients}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600">
                    {reportsData.activePatients} activos (
                    {Math.round((reportsData.activePatients / reportsData.totalPatients) * 100)}%)
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Personal Médico</CardDescription>
                  <CardTitle className="text-3xl text-green-600">{reportsData.totalStaff}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600">
                    {reportsData.activeStaff} activos (
                    {Math.round((reportsData.activeStaff / reportsData.totalStaff) * 100)}%)
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total Citas</CardDescription>
                  <CardTitle className="text-3xl text-purple-600">{reportsData.totalAppointments}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600">
                    {reportsData.completedAppointments} completadas, {reportsData.scheduledAppointments} programadas
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Notas Clínicas</CardDescription>
                  <CardTitle className="text-3xl text-orange-600">{reportsData.totalClinicalNotes}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600">Registros médicos completos</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts and Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Appointments by Type */}
              <Card>
                <CardHeader>
                  <CardTitle>Citas por Tipo</CardTitle>
                  <CardDescription>Distribución de tipos de citas programadas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(reportsData.appointmentsByType).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge className={`text-xs ${getTypeColor(type)}`}>
                            {type === "consultation" && "Consulta"}
                            {type === "cleaning" && "Limpieza"}
                            {type === "treatment" && "Tratamiento"}
                            {type === "emergency" && "Emergencia"}
                            {type === "followup" && "Seguimiento"}
                          </Badge>
                          <span className="text-sm text-slate-600">{count} citas</span>
                        </div>
                        <div className="w-24 bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${(count / reportsData.totalAppointments) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Clinical Notes by Type */}
              <Card>
                <CardHeader>
                  <CardTitle>Notas Clínicas por Tipo</CardTitle>
                  <CardDescription>Distribución de registros médicos</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(reportsData.notesByType).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge className={`text-xs ${getTypeColor(type)}`}>{getTypeLabel(type)}</Badge>
                          <span className="text-sm text-slate-600">{count} notas</span>
                        </div>
                        <div className="w-24 bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${(count / reportsData.totalClinicalNotes) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Staff Workload and Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Staff Workload */}
              <Card>
                <CardHeader>
                  <CardTitle>Carga de Trabajo del Personal</CardTitle>
                  <CardDescription>Citas asignadas por miembro del equipo</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reportsData.staffWorkload.map((member, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium text-slate-900">{member.name}</p>
                          <p className="text-sm text-slate-600">{getRoleLabel(member.role)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-blue-600">{member.appointments}</p>
                          <p className="text-xs text-slate-500">citas asignadas</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Actividad Reciente</CardTitle>
                  <CardDescription>Últimos 30 días</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">Citas Programadas</p>
                          <p className="text-sm text-slate-600">En los últimos 30 días</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600">{reportsData.recentAppointments}</p>
                        <p className="text-xs text-slate-500">citas</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">Notas Clínicas</p>
                          <p className="text-sm text-slate-600">Registros creados</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">{reportsData.recentNotes}</p>
                        <p className="text-xs text-slate-500">notas</p>
                      </div>
                    </div>

                    <div className="p-4 border-2 border-dashed border-slate-200 rounded-lg text-center">
                      <p className="text-sm text-slate-500 mb-2">Tasa de Completación de Citas</p>
                      <p className="text-3xl font-bold text-slate-900">
                        {reportsData.totalAppointments > 0
                          ? Math.round((reportsData.completedAppointments / reportsData.totalAppointments) * 100)
                          : 0}
                        %
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Export and Actions */}
            <div className="mt-8 flex justify-end gap-4">
              <Button variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Exportar PDF
              </Button>
              <Button variant="outline">
                <Activity className="w-4 h-4 mr-2" />
                Generar Reporte Mensual
              </Button>
            </div>
          </>
        ) : currentView === "clinical" ? (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Historiales Clínicos</h2>
              <p className="text-slate-600">Gestiona las notas clínicas y el historial de tratamientos</p>
            </div>

            {/* Clinical Notes Search and Actions */}
            <div className="flex items-center justify-between mb-6 gap-4">
              <div className="flex items-center gap-4 flex-1">
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar en historiales..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedPatientForNotes} onValueChange={setSelectedPatientForNotes}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Filtrar por paciente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los pacientes</SelectItem>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.firstName} {patient.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Dialog open={isAddingClinicalNote} onOpenChange={setIsAddingClinicalNote}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva Nota Clínica
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Agregar Nota Clínica</DialogTitle>
                    <DialogDescription>Registra información clínica del paciente</DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="space-y-2">
                      <Label>Paciente *</Label>
                      <Select
                        value={clinicalNoteFormData.patientId || ""}
                        onValueChange={(value) =>
                          setClinicalNoteFormData({ ...clinicalNoteFormData, patientId: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar paciente" />
                        </SelectTrigger>
                        <SelectContent>
                          {patients.map((patient) => (
                            <SelectItem key={patient.id} value={patient.id}>
                              {patient.firstName} {patient.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Profesional *</Label>
                      <Select
                        value={clinicalNoteFormData.staffId || ""}
                        onValueChange={(value) => setClinicalNoteFormData({ ...clinicalNoteFormData, staffId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar profesional" />
                        </SelectTrigger>
                        <SelectContent>
                          {staff
                            .filter((s) => s.role === "dentist" || s.role === "hygienist")
                            .map((member) => (
                              <SelectItem key={member.id} value={member.id}>
                                {member.firstName} {member.lastName}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Tipo de Nota *</Label>
                      <Select
                        value={clinicalNoteFormData.type || ""}
                        onValueChange={(value) =>
                          setClinicalNoteFormData({ ...clinicalNoteFormData, type: value as ClinicalNote["type"] })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Tipo de nota" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="examination">Examen</SelectItem>
                          <SelectItem value="treatment">Tratamiento</SelectItem>
                          <SelectItem value="diagnosis">Diagnóstico</SelectItem>
                          <SelectItem value="progress">Progreso</SelectItem>
                          <SelectItem value="prescription">Prescripción</SelectItem>
                          <SelectItem value="referral">Derivación</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Fecha</Label>
                      <Input
                        type="date"
                        value={clinicalNoteFormData.date || ""}
                        onChange={(e) => setClinicalNoteFormData({ ...clinicalNoteFormData, date: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label>Título *</Label>
                      <Input
                        value={clinicalNoteFormData.title || ""}
                        onChange={(e) => setClinicalNoteFormData({ ...clinicalNoteFormData, title: e.target.value })}
                        placeholder="Título de la nota clínica"
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label>Descripción *</Label>
                      <Textarea
                        value={clinicalNoteFormData.description || ""}
                        onChange={(e) =>
                          setClinicalNoteFormData({ ...clinicalNoteFormData, description: e.target.value })
                        }
                        placeholder="Descripción detallada del procedimiento o examen..."
                        rows={4}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Diagnóstico</Label>
                      <Input
                        value={clinicalNoteFormData.diagnosis || ""}
                        onChange={(e) =>
                          setClinicalNoteFormData({ ...clinicalNoteFormData, diagnosis: e.target.value })
                        }
                        placeholder="Diagnóstico clínico"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Tratamiento</Label>
                      <Input
                        value={clinicalNoteFormData.treatment || ""}
                        onChange={(e) =>
                          setClinicalNoteFormData({ ...clinicalNoteFormData, treatment: e.target.value })
                        }
                        placeholder="Tratamiento realizado"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Medicamentos</Label>
                      <Input
                        value={clinicalNoteFormData.medications || ""}
                        onChange={(e) =>
                          setClinicalNoteFormData({ ...clinicalNoteFormData, medications: e.target.value })
                        }
                        placeholder="Medicamentos prescritos"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Fecha de Seguimiento</Label>
                      <Input
                        type="date"
                        value={clinicalNoteFormData.followUpDate || ""}
                        onChange={(e) =>
                          setClinicalNoteFormData({ ...clinicalNoteFormData, followUpDate: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Severidad</Label>
                      <Select
                        value={clinicalNoteFormData.severity || "low"}
                        onValueChange={(value) =>
                          setClinicalNoteFormData({
                            ...clinicalNoteFormData,
                            severity: value as ClinicalNote["severity"],
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              clinicalNoteFormData.severity
                                ? clinicalNoteFormData.severity === "low"
                                  ? "Baja"
                                  : clinicalNoteFormData.severity === "medium"
                                    ? "Media"
                                    : "Alta"
                                : "Severidad"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Baja</SelectItem>
                          <SelectItem value="medium">Media</SelectItem>
                          <SelectItem value="high">Alta</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Piezas Dentales</Label>
                      <Input
                        value={clinicalNoteFormData.toothNumbers?.join(", ") || ""}
                        onChange={(e) =>
                          setClinicalNoteFormData({
                            ...clinicalNoteFormData,
                            toothNumbers: e.target.value
                              .split(",")
                              .map((n) => n.trim())
                              .filter(Boolean),
                          })
                        }
                        placeholder="Ej: 16, 17, 26"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setIsAddingClinicalNote(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleAddClinicalNote} className="bg-blue-600 hover:bg-blue-700">
                      Guardar Nota
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Clinical Notes List */}
            <div className="grid gap-4">
              {filteredClinicalNotes.map((note) => {
                const patient = patients.find((p) => p.id === note.patientId)
                const staffMember = staff.find((s) => s.id === note.staffId)

                return (
                  <Card key={note.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <CardTitle className="text-lg text-slate-900">{note.title}</CardTitle>
                            <Badge className={`text-xs ${getTypeColor(note.type)}`}>{getTypeLabel(note.type)}</Badge>
                            {note.severity && (
                              <Badge className={`text-xs ${getSeverityColor(note.severity)}`}>
                                {note.severity === "high" && "Alta"}
                                {note.severity === "medium" && "Media"}
                                {note.severity === "low" && "Baja"}
                              </Badge>
                            )}
                          </div>
                          <CardDescription className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              {patient?.firstName} {patient?.lastName}
                            </span>
                            <span className="flex items-center gap-1">
                              <Stethoscope className="w-4 h-4" />
                              {staffMember?.firstName} {staffMember?.lastName}
                            </span>
                            <span className="flex items-center gap-1">
                              <CalendarDays className="w-4 h-4" />
                              {new Date(note.date).toLocaleDateString("es-ES")}
                            </span>
                          </CardDescription>
                        </div>
                        <div className="flex gap-1">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedClinicalNote(note)
                                  setClinicalNoteFormData(note)
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Editar Nota Clínica</DialogTitle>
                                <DialogDescription>Modifica la información de la nota clínica</DialogDescription>
                              </DialogHeader>
                              <div className="grid grid-cols-2 gap-4 py-4">
                                <div className="space-y-2 col-span-2">
                                  <Label>Título *</Label>
                                  <Input
                                    value={clinicalNoteFormData.title || ""}
                                    onChange={(e) =>
                                      setClinicalNoteFormData({ ...clinicalNoteFormData, title: e.target.value })
                                    }
                                  />
                                </div>
                                <div className="space-y-2 col-span-2">
                                  <Label>Descripción *</Label>
                                  <Textarea
                                    value={clinicalNoteFormData.description || ""}
                                    onChange={(e) =>
                                      setClinicalNoteFormData({ ...clinicalNoteFormData, description: e.target.value })
                                    }
                                    rows={4}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Diagnóstico</Label>
                                  <Input
                                    value={clinicalNoteFormData.diagnosis || ""}
                                    onChange={(e) =>
                                      setClinicalNoteFormData({ ...clinicalNoteFormData, diagnosis: e.target.value })
                                    }
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Tratamiento</Label>
                                  <Input
                                    value={clinicalNoteFormData.treatment || ""}
                                    onChange={(e) =>
                                      setClinicalNoteFormData({ ...clinicalNoteFormData, treatment: e.target.value })
                                    }
                                  />
                                </div>
                              </div>
                              <div className="flex justify-end gap-3">
                                <Button variant="outline" onClick={() => setSelectedClinicalNote(null)}>
                                  Cancelar
                                </Button>
                                <Button onClick={handleEditClinicalNote} className="bg-blue-600 hover:bg-blue-700">
                                  Guardar Cambios
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClinicalNote(note.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-slate-600">{note.description}</p>
                      {(note.diagnosis || note.treatment || note.medications) && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-slate-100">
                          {note.diagnosis && (
                            <div>
                              <p className="text-xs font-medium text-slate-500 mb-1">Diagnóstico</p>
                              <p className="text-sm text-slate-700">{note.diagnosis}</p>
                            </div>
                          )}
                          {note.treatment && (
                            <div>
                              <p className="text-xs font-medium text-slate-500 mb-1">Tratamiento</p>
                              <p className="text-sm text-slate-700">{note.treatment}</p>
                            </div>
                          )}
                          {note.medications && (
                            <div>
                              <p className="text-xs font-medium text-slate-500 mb-1">Medicamentos</p>
                              <p className="text-sm text-slate-700">{note.medications}</p>
                            </div>
                          )}
                        </div>
                      )}
                      {(note.toothNumbers?.length || note.followUpDate) && (
                        <div className="flex items-center gap-4 pt-2 text-xs text-slate-500">
                          {note.toothNumbers?.length && (
                            <span className="flex items-center gap-1">
                              <Activity className="w-3 h-3" />
                              Piezas: {note.toothNumbers.join(", ")}
                            </span>
                          )}
                          {note.followUpDate && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Seguimiento: {new Date(note.followUpDate).toLocaleDateString("es-ES")}
                            </span>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {filteredClinicalNotes.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No se encontraron notas clínicas</h3>
                <p className="text-slate-500 mb-4">
                  {searchTerm || selectedPatientForNotes
                    ? "Intenta con otros términos de búsqueda o filtros"
                    : "Comienza registrando la primera nota clínica"}
                </p>
                {!searchTerm && !selectedPatientForNotes && (
                  <Button onClick={() => setIsAddingClinicalNote(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Primera Nota
                  </Button>
                )}
              </div>
            )}
          </>
        ) : currentView === "patients" ? (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Gestión de Pacientes</h2>
              <p className="text-slate-600">Administra la información de tus pacientes de forma centralizada</p>
            </div>

            {/* Search and Actions */}
            <div className="flex items-center justify-between mb-6 gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Buscar pacientes por nombre, email o teléfono..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Dialog open={isAddingPatient} onOpenChange={setIsAddingPatient}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Paciente
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Agregar Nuevo Paciente</DialogTitle>
                    <DialogDescription>
                      Completa la información del paciente para agregarlo al sistema
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Nombre *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName || ""}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        placeholder="Nombre del paciente"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Apellidos *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName || ""}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        placeholder="Apellidos del paciente"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email || ""}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="email@ejemplo.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Teléfono *</Label>
                      <Input
                        id="phone"
                        value={formData.phone || ""}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+34 612 345 678"
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="address">Dirección</Label>
                      <Input
                        id="address"
                        value={formData.address || ""}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Dirección completa"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Fecha de Nacimiento</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth || ""}
                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContact">Contacto de Emergencia</Label>
                      <Input
                        id="emergencyContact"
                        value={formData.emergencyContact || ""}
                        onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                        placeholder="Nombre del contacto"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergencyPhone">Teléfono de Emergencia</Label>
                      <Input
                        id="emergencyPhone"
                        value={formData.emergencyPhone || ""}
                        onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                        placeholder="+34 612 345 678"
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="medicalHistory">Historial Médico</Label>
                      <Textarea
                        id="medicalHistory"
                        value={formData.medicalHistory || ""}
                        onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
                        placeholder="Condiciones médicas relevantes..."
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="allergies">Alergias</Label>
                      <Textarea
                        id="allergies"
                        value={formData.allergies || ""}
                        onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                        placeholder="Alergias conocidas..."
                        rows={2}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setIsAddingPatient(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleAddPatient} className="bg-blue-600 hover:bg-blue-700">
                      Agregar Paciente
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Patients Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPatients.map((patient) => (
                <Card key={patient.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg text-slate-900">
                          {patient.firstName} {patient.lastName}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <Badge variant={patient.status === "active" ? "default" : "secondary"} className="text-xs">
                            {patient.status === "active" ? "Activo" : "Inactivo"}
                          </Badge>
                        </CardDescription>
                      </div>
                      <div className="flex gap-1">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedPatient(patient)
                                setFormData(patient)
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Editar Paciente</DialogTitle>
                              <DialogDescription>Modifica la información del paciente</DialogDescription>
                            </DialogHeader>
                            <div className="grid grid-cols-2 gap-4 py-4">
                              <div className="space-y-2">
                                <Label htmlFor="editFirstName">Nombre *</Label>
                                <Input
                                  id="editFirstName"
                                  value={formData.firstName || ""}
                                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="editLastName">Apellidos *</Label>
                                <Input
                                  id="editLastName"
                                  value={formData.lastName || ""}
                                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="editEmail">Email *</Label>
                                <Input
                                  id="editEmail"
                                  type="email"
                                  value={formData.email || ""}
                                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="editPhone">Teléfono *</Label>
                                <Input
                                  id="editPhone"
                                  value={formData.phone || ""}
                                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                              </div>
                              <div className="space-y-2 col-span-2">
                                <Label htmlFor="editAddress">Dirección</Label>
                                <Input
                                  id="editAddress"
                                  value={formData.address || ""}
                                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                />
                              </div>
                              <div className="space-y-2 col-span-2">
                                <Label htmlFor="editMedicalHistory">Historial Médico</Label>
                                <Textarea
                                  id="editMedicalHistory"
                                  value={formData.medicalHistory || ""}
                                  onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
                                  rows={3}
                                />
                              </div>
                              <div className="space-y-2 col-span-2">
                                <Label htmlFor="editAllergies">Alergias</Label>
                                <Textarea
                                  id="editAllergies"
                                  value={formData.allergies || ""}
                                  onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                                  rows={2}
                                />
                              </div>
                            </div>
                            <div className="flex justify-end gap-3">
                              <Button variant="outline" onClick={() => setSelectedPatient(null)}>
                                Cancelar
                              </Button>
                              <Button onClick={handleEditPatient} className="bg-blue-600 hover:bg-blue-700">
                                Guardar Cambios
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeletePatient(patient.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{patient.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Phone className="w-4 h-4" />
                      <span>{patient.phone}</span>
                    </div>
                    {patient.address && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <MapPin className="w-4 h-4" />
                        <span className="truncate">{patient.address}</span>
                      </div>
                    )}
                    {patient.lastVisit && (
                      <div className="pt-2 border-t border-slate-100">
                        <p className="text-xs text-slate-500">Última visita: {patient.lastVisit}</p>
                        {patient.nextAppointment && (
                          <p className="text-xs text-blue-600">Próxima cita: {patient.nextAppointment}</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredPatients.length === 0 && (
              <div className="text-center py-12">
                <User className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No se encontraron pacientes</h3>
                <p className="text-slate-500 mb-4">
                  {searchTerm ? "Intenta con otros términos de búsqueda" : "Comienza agregando tu primer paciente"}
                </p>
                {!searchTerm && (
                  <Button onClick={() => setIsAddingPatient(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Primer Paciente
                  </Button>
                )}
              </div>
            )}
          </>
        ) : currentView === "appointments" ? (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Calendario de Citas</h2>
              <p className="text-slate-600">Gestiona las citas y horarios de la clínica</p>
            </div>

            <Tabs defaultValue="calendar" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="calendar">Vista Calendario</TabsTrigger>
                <TabsTrigger value="list">Lista de Citas</TabsTrigger>
              </TabsList>

              <TabsContent value="calendar" className="space-y-6">
                {/* Calendar Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newDate = new Date(currentDate)
                        newDate.setMonth(newDate.getMonth() - 1)
                        setCurrentDate(newDate)
                      }}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <h3 className="text-xl font-semibold text-slate-900">
                      {currentDate.toLocaleDateString("es-ES", { month: "long", year: "numeric" })}
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newDate = new Date(currentDate)
                        newDate.setMonth(newDate.getMonth() + 1)
                        setCurrentDate(newDate)
                      }}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                  <Dialog open={isAddingAppointment} onOpenChange={setIsAddingAppointment}>
                    <DialogTrigger asChild>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Nueva Cita
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Programar Nueva Cita</DialogTitle>
                        <DialogDescription>Completa los detalles de la cita</DialogDescription>
                      </DialogHeader>
                      <div className="grid grid-cols-2 gap-4 py-4">
                        <div className="space-y-2">
                          <Label>Paciente *</Label>
                          <Select
                            value={appointmentFormData.patientId || ""}
                            onValueChange={(value) =>
                              setAppointmentFormData({ ...appointmentFormData, patientId: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar paciente" />
                            </SelectTrigger>
                            <SelectContent>
                              {patients.map((patient) => (
                                <SelectItem key={patient.id} value={patient.id}>
                                  {patient.firstName} {patient.lastName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Profesional *</Label>
                          <Select
                            value={appointmentFormData.staffId || ""}
                            onValueChange={(value) =>
                              setAppointmentFormData({ ...appointmentFormData, staffId: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar profesional" />
                            </SelectTrigger>
                            <SelectContent>
                              {staff
                                .filter((s) => s.role === "dentist" || s.role === "hygienist")
                                .map((member) => (
                                  <SelectItem key={member.id} value={member.id}>
                                    {member.firstName} {member.lastName} - {getRoleLabel(member.role)}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Fecha *</Label>
                          <Input
                            type="date"
                            value={appointmentFormData.date || ""}
                            onChange={(e) => setAppointmentFormData({ ...appointmentFormData, date: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Hora *</Label>
                          <Input
                            type="time"
                            value={appointmentFormData.time || ""}
                            onChange={(e) => setAppointmentFormData({ ...appointmentFormData, time: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Tipo de Cita *</Label>
                          <Select
                            value={appointmentFormData.type || ""}
                            onValueChange={(value) =>
                              setAppointmentFormData({ ...appointmentFormData, type: value as Appointment["type"] })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Tipo de cita" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="consultation">Consulta</SelectItem>
                              <SelectItem value="cleaning">Limpieza</SelectItem>
                              <SelectItem value="treatment">Tratamiento</SelectItem>
                              <SelectItem value="emergency">Emergencia</SelectItem>
                              <SelectItem value="followup">Seguimiento</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Duración (minutos)</Label>
                          <Input
                            type="number"
                            value={appointmentFormData.duration || 60}
                            onChange={(e) =>
                              setAppointmentFormData({
                                ...appointmentFormData,
                                duration: Number.parseInt(e.target.value),
                              })
                            }
                            placeholder="60"
                          />
                        </div>
                        <div className="space-y-2 col-span-2">
                          <Label>Notas</Label>
                          <Textarea
                            value={appointmentFormData.notes || ""}
                            onChange={(e) => setAppointmentFormData({ ...appointmentFormData, notes: e.target.value })}
                            placeholder="Notas adicionales sobre la cita..."
                            rows={3}
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setIsAddingAppointment(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={handleAddAppointment} className="bg-blue-600 hover:bg-blue-700">
                          Programar Cita
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Calendar Grid */}
                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                  <div className="grid grid-cols-7 border-b border-slate-200">
                    {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
                      <div key={day} className="p-3 text-center text-sm font-medium text-slate-600 bg-slate-50">
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7">
                    {getCalendarDays().map((day, index) => {
                      const dayAppointments = getAppointmentsForDate(day)
                      const isCurrentMonth = day.getMonth() === currentDate.getMonth()
                      const isToday = day.toDateString() === new Date().toDateString()

                      return (
                        <div
                          key={index}
                          className={`min-h-[120px] p-2 border-r border-b border-slate-100 ${
                            !isCurrentMonth ? "bg-slate-50 text-slate-400" : "bg-white"
                          } ${isToday ? "bg-blue-50" : ""}`}
                        >
                          <div className={`text-sm font-medium mb-2 ${isToday ? "text-blue-600" : ""}`}>
                            {day.getDate()}
                          </div>
                          <div className="space-y-1">
                            {dayAppointments.slice(0, 3).map((appointment) => {
                              const patient = patients.find((p) => p.id === appointment.patientId)
                              const assignedStaff = staff.find((s) => s.id === appointment.staffId)

                              return (
                                <div
                                  key={appointment.id}
                                  className="text-xs p-1 rounded bg-blue-100 text-blue-800 truncate cursor-pointer hover:bg-blue-200"
                                  onClick={() => {
                                    setSelectedAppointment(appointment)
                                    setAppointmentFormData(appointment)
                                  }}
                                >
                                  {formatTime(appointment.time)} - {patient?.firstName}
                                </div>
                              )
                            })}
                            {dayAppointments.length > 3 && (
                              <div className="text-xs text-slate-500">+{dayAppointments.length - 3} más</div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="list" className="space-y-6">
                {/* Search and Actions */}
                <div className="flex items-center justify-between gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      placeholder="Buscar citas por paciente, profesional o tipo..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Dialog open={isAddingAppointment} onOpenChange={setIsAddingAppointment}>
                    <DialogTrigger asChild>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Nueva Cita
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </div>

                {/* Appointments List */}
                <div className="grid gap-4">
                  {filteredAppointments.map((appointment) => {
                    const patient = patients.find((p) => p.id === appointment.patientId)
                    const staffMember = staff.find((s) => s.id === appointment.staffId)

                    return (
                      <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center gap-3">
                                <CardTitle className="text-lg text-slate-900">
                                  {patient?.firstName} {patient?.lastName}
                                </CardTitle>
                                <Badge className={`text-xs ${getStatusColor(appointment.status)}`}>
                                  {appointment.status === "scheduled" && "Programada"}
                                  {appointment.status === "confirmed" && "Confirmada"}
                                  {appointment.status === "completed" && "Completada"}
                                  {appointment.status === "cancelled" && "Cancelada"}
                                  {appointment.status === "no-show" && "No asistió"}
                                </Badge>
                                <Badge className={`text-xs ${getTypeColor(appointment.type)}`}>
                                  {appointment.type === "consultation" && "Consulta"}
                                  {appointment.type === "cleaning" && "Limpieza"}
                                  {appointment.type === "treatment" && "Tratamiento"}
                                  {appointment.type === "emergency" && "Emergencia"}
                                  {appointment.type === "followup" && "Seguimiento"}
                                </Badge>
                              </div>
                              <CardDescription className="flex items-center gap-4 text-sm">
                                <span className="flex items-center gap-1">
                                  <CalendarDays className="w-4 h-4" />
                                  {new Date(appointment.date).toLocaleDateString("es-ES")}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {formatTime(appointment.time)} ({appointment.duration} min)
                                </span>
                                <span className="flex items-center gap-1">
                                  <UserCheck className="w-4 h-4" />
                                  {staffMember?.firstName} {staffMember?.lastName}
                                </span>
                              </CardDescription>
                            </div>
                            <div className="flex gap-1">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedAppointment(appointment)
                                      setAppointmentFormData(appointment)
                                    }}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>Editar Cita</DialogTitle>
                                    <DialogDescription>Modifica los detalles de la cita</DialogDescription>
                                  </DialogHeader>
                                  <div className="grid grid-cols-2 gap-4 py-4">
                                    <div className="space-y-2">
                                      <Label>Paciente *</Label>
                                      <Select
                                        value={appointmentFormData.patientId || ""}
                                        onValueChange={(value) =>
                                          setAppointmentFormData({ ...appointmentFormData, patientId: value })
                                        }
                                      >
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {patients.map((patient) => (
                                            <SelectItem key={patient.id} value={patient.id}>
                                              {patient.firstName} {patient.lastName}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="space-y-2">
                                      <Label>Estado</Label>
                                      <Select
                                        value={appointmentFormData.status || ""}
                                        onValueChange={(value) =>
                                          setAppointmentFormData({
                                            ...appointmentFormData,
                                            status: value as Appointment["status"],
                                          })
                                        }
                                      >
                                        <SelectTrigger>
                                          <SelectValue
                                            placeholder={
                                              appointmentFormData.status
                                                ? appointmentFormData.status === "scheduled"
                                                  ? "Programada"
                                                  : appointmentFormData.status === "confirmed"
                                                    ? "Confirmada"
                                                    : appointmentFormData.status === "completed"
                                                      ? "Completada"
                                                      : appointmentFormData.status === "cancelled"
                                                        ? "Cancelada"
                                                        : "No asistió"
                                                : "Estado"
                                            }
                                          />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="scheduled">Programada</SelectItem>
                                          <SelectItem value="confirmed">Confirmada</SelectItem>
                                          <SelectItem value="completed">Completada</SelectItem>
                                          <SelectItem value="cancelled">Cancelada</SelectItem>
                                          <SelectItem value="no-show">No asistió</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="space-y-2 col-span-2">
                                      <Label>Notas</Label>
                                      <Textarea
                                        value={appointmentFormData.notes || ""}
                                        onChange={(e) =>
                                          setAppointmentFormData({ ...appointmentFormData, notes: e.target.value })
                                        }
                                        rows={3}
                                      />
                                    </div>
                                  </div>
                                  <div className="flex justify-end gap-3">
                                    <Button variant="outline" onClick={() => setSelectedAppointment(null)}>
                                      Cancelar
                                    </Button>
                                    <Button onClick={handleEditAppointment} className="bg-blue-600 hover:bg-blue-700">
                                      Guardar Cambios
                                    </Button>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteAppointment(appointment.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        {appointment.notes && (
                          <CardContent>
                            <p className="text-sm text-slate-600">{appointment.notes}</p>
                          </CardContent>
                        )}
                      </Card>
                    )
                  })}
                </div>

                {filteredAppointments.length === 0 && (
                  <div className="text-center py-12">
                    <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">No se encontraron citas</h3>
                    <p className="text-slate-500 mb-4">
                      {searchTerm ? "Intenta con otros términos de búsqueda" : "Comienza programando tu primera cita"}
                    </p>
                    {!searchTerm && (
                      <Button onClick={() => setIsAddingAppointment(true)} className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Programar Primera Cita
                      </Button>
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Gestión de Personal</h2>
              <p className="text-slate-600">Administra el equipo médico y sus permisos de acceso</p>
            </div>

            {/* Staff Search and Actions */}
            <div className="flex items-center justify-between mb-6 gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Buscar personal por nombre, email o rol..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Dialog open={isAddingStaff} onOpenChange={setIsAddingStaff}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Miembro
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Agregar Nuevo Miembro del Personal</DialogTitle>
                    <DialogDescription>Completa la información del nuevo miembro del equipo</DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="staffFirstName">Nombre *</Label>
                      <Input
                        id="staffFirstName"
                        value={staffFormData.firstName || ""}
                        onChange={(e) => setStaffFormData({ ...staffFormData, firstName: e.target.value })}
                        placeholder="Nombre"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="staffLastName">Apellidos *</Label>
                      <Input
                        id="staffLastName"
                        value={staffFormData.lastName || ""}
                        onChange={(e) => setStaffFormData({ ...staffFormData, lastName: e.target.value })}
                        placeholder="Apellidos"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="staffEmail">Email *</Label>
                      <Input
                        id="staffEmail"
                        type="email"
                        value={staffFormData.email || ""}
                        onChange={(e) => setStaffFormData({ ...staffFormData, email: e.target.value })}
                        placeholder="email@dentalcare.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="staffPhone">Teléfono</Label>
                      <Input
                        id="staffPhone"
                        value={staffFormData.phone || ""}
                        onChange={(e) => setStaffFormData({ ...staffFormData, phone: e.target.value })}
                        placeholder="+34 612 345 678"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="staffRole">Rol *</Label>
                      <Select
                        value={staffFormData.role || ""}
                        onValueChange={(value) => setStaffFormData({ ...staffFormData, role: value as Staff["role"] })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar rol" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dentist">Dentista</SelectItem>
                          <SelectItem value="hygienist">Higienista</SelectItem>
                          <SelectItem value="receptionist">Recepcionista</SelectItem>
                          <SelectItem value="assistant">Asistente</SelectItem>
                          <SelectItem value="admin">Administrador</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="staffHireDate">Fecha de Contratación</Label>
                      <Input
                        id="staffHireDate"
                        type="date"
                        value={staffFormData.hireDate || ""}
                        onChange={(e) => setStaffFormData({ ...staffFormData, hireDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="staffLicense">Número de Licencia</Label>
                      <Input
                        id="staffLicense"
                        value={staffFormData.licenseNumber || ""}
                        onChange={(e) => setStaffFormData({ ...staffFormData, licenseNumber: e.target.value })}
                        placeholder="COD-12345"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="staffSpecialization">Especialización</Label>
                      <Input
                        id="staffSpecialization"
                        value={staffFormData.specialization || ""}
                        onChange={(e) => setStaffFormData({ ...staffFormData, specialization: e.target.value })}
                        placeholder="Ej: Endodoncia, Ortodoncia"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setIsAddingStaff(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleAddStaff} className="bg-blue-600 hover:bg-blue-700">
                      Agregar Miembro
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Staff Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStaff.map((member) => (
                <Card key={member.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg text-slate-900">
                          {member.firstName} {member.lastName}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <Badge className={`text-xs ${getRoleColor(member.role)}`}>{getRoleLabel(member.role)}</Badge>
                          <Badge variant={member.status === "active" ? "default" : "secondary"} className="text-xs">
                            {member.status === "active" ? "Activo" : "Inactivo"}
                          </Badge>
                        </CardDescription>
                      </div>
                      <div className="flex gap-1">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedStaff(member)
                                setStaffFormData(member)
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Editar Miembro del Personal</DialogTitle>
                              <DialogDescription>Modifica la información del miembro del equipo</DialogDescription>
                            </DialogHeader>
                            <Tabs defaultValue="info" className="w-full">
                              <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="info">Información</TabsTrigger>
                                <TabsTrigger value="schedule">Horario</TabsTrigger>
                                <TabsTrigger value="permissions">Permisos</TabsTrigger>
                              </TabsList>
                              <TabsContent value="info" className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label>Nombre *</Label>
                                    <Input
                                      value={staffFormData.firstName || ""}
                                      onChange={(e) =>
                                        setStaffFormData({ ...staffFormData, firstName: e.target.value })
                                      }
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Apellidos *</Label>
                                    <Input
                                      value={staffFormData.lastName || ""}
                                      onChange={(e) => setStaffFormData({ ...staffFormData, lastName: e.target.value })}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Email *</Label>
                                    <Input
                                      type="email"
                                      value={staffFormData.email || ""}
                                      onChange={(e) => setStaffFormData({ ...staffFormData, email: e.target.value })}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Teléfono</Label>
                                    <Input
                                      value={staffFormData.phone || ""}
                                      onChange={(e) => setStaffFormData({ ...staffFormData, phone: e.target.value })}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Número de Licencia</Label>
                                    <Input
                                      value={staffFormData.licenseNumber || ""}
                                      onChange={(e) =>
                                        setStaffFormData({ ...staffFormData, licenseNumber: e.target.value })
                                      }
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Especialización</Label>
                                    <Input
                                      value={staffFormData.specialization || ""}
                                      onChange={(e) =>
                                        setStaffFormData({ ...staffFormData, specialization: e.target.value })
                                      }
                                    />
                                  </div>
                                </div>
                              </TabsContent>
                              <TabsContent value="schedule" className="space-y-4">
                                <p className="text-sm text-slate-600">Configurar horario de trabajo semanal</p>
                                <div className="space-y-3">
                                  {Object.entries(staffFormData.schedule || {}).map(([day, schedule]) => (
                                    <div key={day} className="flex items-center gap-4 p-3 border rounded-lg">
                                      <div className="w-20 text-sm font-medium capitalize">{day}</div>
                                      <div className="flex items-center gap-2">
                                        <Input
                                          type="time"
                                          value={schedule.start}
                                          className="w-24"
                                          disabled={!schedule.available}
                                        />
                                        <span className="text-slate-400">-</span>
                                        <Input
                                          type="time"
                                          value={schedule.end}
                                          className="w-24"
                                          disabled={!schedule.available}
                                        />
                                      </div>
                                      <Badge variant={schedule.available ? "default" : "secondary"} className="text-xs">
                                        {schedule.available ? "Disponible" : "No disponible"}
                                      </Badge>
                                    </div>
                                  ))}
                                </div>
                              </TabsContent>
                              <TabsContent value="permissions" className="space-y-4">
                                <p className="text-sm text-slate-600">Configurar permisos de acceso al sistema</p>
                                <div className="space-y-3">
                                  {Object.entries(staffFormData.permissions || {}).map(([permission, enabled]) => (
                                    <div
                                      key={permission}
                                      className="flex items-center justify-between p-3 border rounded-lg"
                                    >
                                      <div className="flex items-center gap-3">
                                        <Shield className="w-4 h-4 text-slate-400" />
                                        <span className="text-sm font-medium">
                                          {permission === "viewPatients" && "Ver Pacientes"}
                                          {permission === "editPatients" && "Editar Pacientes"}
                                          {permission === "viewAppointments" && "Ver Citas"}
                                          {permission === "editAppointments" && "Editar Citas"}
                                          {permission === "viewReports" && "Ver Reportes"}
                                          {permission === "manageStaff" && "Gestionar Personal"}
                                        </span>
                                      </div>
                                      <Badge variant={enabled ? "default" : "secondary"} className="text-xs">
                                        {enabled ? "Permitido" : "Denegado"}
                                      </Badge>
                                    </div>
                                  ))}
                                </div>
                              </TabsContent>
                            </Tabs>
                            <div className="flex justify-end gap-3 pt-4">
                              <Button variant="outline" onClick={() => setSelectedStaff(null)}>
                                Cancelar
                              </Button>
                              <Button onClick={handleEditStaff} className="bg-blue-600 hover:bg-blue-700">
                                Guardar Cambios
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteStaff(member.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{member.email}</span>
                    </div>
                    {member.phone && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Phone className="w-4 h-4" />
                        <span>{member.phone}</span>
                      </div>
                    )}
                    {member.licenseNumber && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <UserCheck className="w-4 h-4" />
                        <span>Licencia: {member.licenseNumber}</span>
                      </div>
                    )}
                    {member.specialization && (
                      <div className="text-sm text-slate-600">
                        <span className="font-medium">Especialización:</span> {member.specialization}
                      </div>
                    )}
                    <div className="pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Clock className="w-3 h-3" />
                        <span>Contratado: {member.hireDate}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredStaff.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No se encontró personal</h3>
                <p className="text-slate-500 mb-4">
                  {searchTerm
                    ? "Intenta con otros términos de búsqueda"
                    : "Comienza agregando tu primer miembro del equipo"}
                </p>
                {!searchTerm && (
                  <Button onClick={() => setIsAddingStaff(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Primer Miembro
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

// Login Form Component
const LoginForm = ({ onLogin }: { onLogin: (email: string, password: string) => void }) => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onLogin(email, password)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="loginEmail">Email</Label>
        <Input
          id="loginEmail"
          type="email"
          placeholder="email@dentalcare.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2 relative">
        <Label htmlFor="loginPassword">Contraseña</Label>
        <Input
          id="loginPassword"
          type={showPassword ? "text" : "password"}
          placeholder="********"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute top-1/2 right-1 transform -translate-y-1/2 translate-x-2"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <EyeOff className="w-4 h-4 text-slate-500" /> : <Eye className="w-4 h-4 text-slate-500" />}
        </Button>
      </div>
      <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
        Iniciar Sesión
      </Button>
    </form>
  )
}

// Register Form Component
const RegisterForm = ({
  onRegister,
}: { onRegister: (email: string, password: string, firstName: string, lastName: string) => boolean }) => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const success = onRegister(email, password, firstName, lastName)
    if (!success) {
      setError("Este email ya está registrado.")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-sm text-red-500 text-center">{error}</p>}
      <div className="space-y-2">
        <Label htmlFor="registerFirstName">Nombre</Label>
        <Input
          id="registerFirstName"
          placeholder="Nombre"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="registerLastName">Apellidos</Label>
        <Input
          id="registerLastName"
          placeholder="Apellidos"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="registerEmail">Email</Label>
        <Input
          id="registerEmail"
          type="email"
          placeholder="email@dentalcare.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2 relative">
        <Label htmlFor="registerPassword">Contraseña</Label>
        <Input
          id="registerPassword"
          type={showPassword ? "text" : "password"}
          placeholder="********"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute top-1/2 right-1 transform -translate-y-1/2 translate-x-2"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <EyeOff className="w-4 h-4 text-slate-500" /> : <Eye className="w-4 h-4 text-slate-500" />}
        </Button>
      </div>
      <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
        Registrarse
      </Button>
    </form>
  )
}

// AuthForm component to combine Login and Register
const AuthForm = ({
  onLogin,
  onRegister,
}: {
  onLogin: (email: string, password: string) => void
  onRegister: (email: string, password: string, firstName: string, lastName: string) => boolean
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Acceso al Sistema</CardTitle>
          <CardDescription>Inicia sesión o regístrate para continuar</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
              <TabsTrigger value="register">Registrarse</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <LoginForm onLogin={onLogin} />
            </TabsContent>
            <TabsContent value="register">
              <RegisterForm onRegister={onRegister} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
