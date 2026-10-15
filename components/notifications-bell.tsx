"use client"

import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { formatDateTime } from "@/lib/dates"
import { useStore } from "@/lib/store"

export function NotificationsBell() {
  const { db, currentUser, actions } = useStore()
  if (!currentUser) return null
  const mine = db.notifications.filter((n) => n.userId === currentUser.id)
  const unread = mine.filter((n) => !n.read).length

  return (
    <Popover onOpenChange={(open) => !open && unread > 0 && actions.markNotificationsRead()}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notificaciones">
          <Bell className="h-5 w-5 text-slate-600" />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-pink-500 px-1 text-[11px] font-bold text-white">
              {unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="border-b px-4 py-3">
          <p className="font-semibold text-slate-900">Notificaciones</p>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {mine.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-slate-500">Todo tranquilo por aquí 🦷</p>
          ) : (
            mine.slice(0, 30).map((n) => (
              <div key={n.id} className={`border-b px-4 py-3 last:border-0 ${n.read ? "" : "bg-sky-50/60"}`}>
                <div className="flex items-start gap-2">
                  {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-sky-500" />}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900">{n.title}</p>
                    <p className="text-sm text-slate-600">{n.body}</p>
                    <p className="mt-1 text-xs text-slate-400">{formatDateTime(n.at)}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
