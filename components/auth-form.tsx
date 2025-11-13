"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, EyeOff, Stethoscope } from "lucide-react"

interface AuthFormProps {
  onLogin: (email: string, password: string) => void
  onRegister: (email: string, password: string, firstName: string, lastName: string) => boolean
}

export function AuthForm({ onLogin, onRegister }: AuthFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [registerEmail, setRegisterEmail] = useState("")
  const [registerPassword, setRegisterPassword] = useState("")
  const [registerPasswordConfirm, setRegisterPasswordConfirm] = useState("")
  const [registerFirstName, setRegisterFirstName] = useState("")
  const [registerLastName, setRegisterLastName] = useState("")
  const [loginError, setLoginError] = useState("")
  const [registerError, setRegisterError] = useState("")
  const [registerSuccess, setRegisterSuccess] = useState(false)

  const handleLogin = () => {
    setLoginError("")
    if (!loginEmail || !loginPassword) {
      setLoginError("Por favor completa todos los campos")
      return
    }
    onLogin(loginEmail, loginPassword)
    if (!loginEmail) {
      setLoginError("Email o contraseña incorrectos")
    }
  }

  const handleRegister = () => {
    setRegisterError("")
    setRegisterSuccess(false)

    if (!registerEmail || !registerPassword || !registerPasswordConfirm || !registerFirstName || !registerLastName) {
      setRegisterError("Por favor completa todos los campos")
      return
    }

    if (registerPassword !== registerPasswordConfirm) {
      setRegisterError("Las contraseñas no coinciden")
      return
    }

    if (registerPassword.length < 6) {
      setRegisterError("La contraseña debe tener al menos 6 caracteres")
      return
    }

    const success = onRegister(registerEmail, registerPassword, registerFirstName, registerLastName)
    if (success) {
      setRegisterSuccess(true)
      setRegisterEmail("")
      setRegisterPassword("")
      setRegisterPasswordConfirm("")
      setRegisterFirstName("")
      setRegisterLastName("")
      setTimeout(() => setRegisterSuccess(false), 3000)
    } else {
      setRegisterError("Este email ya está registrado")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-3 text-center">
          <div className="flex justify-center mb-2">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl text-slate-900">Dental Clinic Management</CardTitle>
          <CardDescription>Sistema de gestión para clínicas dentales</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
              <TabsTrigger value="register">Registrarse</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="tu@email.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Contraseña</Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                {loginError && <p className="text-sm text-red-600">{loginError}</p>}
              </div>

              <div className="pt-2 space-y-3">
                <Button onClick={handleLogin} className="w-full bg-blue-600 hover:bg-blue-700">
                  Iniciar Sesión
                </Button>
                <div className="pt-2 border-t border-slate-200">
                  <p className="text-xs text-slate-500 text-center mb-2">Credenciales de prueba:</p>
                  <p className="text-xs text-slate-600">Admin: admin@dentalcare.com / admin123</p>
                  <p className="text-xs text-slate-600">Dentist: dentist@dentalcare.com / dentist123</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="register" className="space-y-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="register-firstname">Nombre</Label>
                    <Input
                      id="register-firstname"
                      placeholder="Juan"
                      value={registerFirstName}
                      onChange={(e) => setRegisterFirstName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-lastname">Apellido</Label>
                    <Input
                      id="register-lastname"
                      placeholder="Pérez"
                      value={registerLastName}
                      onChange={(e) => setRegisterLastName(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="tu@email.com"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">Contraseña</Label>
                  <div className="relative">
                    <Input
                      id="register-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password-confirm">Confirmar Contraseña</Label>
                  <div className="relative">
                    <Input
                      id="register-password-confirm"
                      type={showPasswordConfirm ? "text" : "password"}
                      placeholder="••••••••"
                      value={registerPasswordConfirm}
                      onChange={(e) => setRegisterPasswordConfirm(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPasswordConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                {registerError && <p className="text-sm text-red-600">{registerError}</p>}
                {registerSuccess && (
                  <p className="text-sm text-green-600">¡Registro exitoso! Ahora puedes iniciar sesión.</p>
                )}
              </div>

              <Button onClick={handleRegister} className="w-full bg-blue-600 hover:bg-blue-700">
                Crear Cuenta
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
