import { HostReminderInfo } from "@botc/shared";
import { useEffect, useState } from "react";
import { useGameContext } from "./useGameContext";

export function useHostListModal() {
  const { gameRoom } = useGameContext()
  const [hostListVisible, setHostListVisible] = useState(false)
  const [reminderInfo, setReminderInfo] = useState<HostReminderInfo[] | undefined>(undefined)

  useEffect(() => {
    aggregateReminders()
  }, [])

  const aggregateReminders = () => {
    if (!gameRoom) return
    const reminders = gameRoom.players.flatMap((p) => {
      if (p.host) return []
      let r = []
      if (p.role!.firstNight !== 0) {
        const entry: HostReminderInfo = {
          socketId: p.socketId,
          playerName: p.name,
          roleName: p.role!.name,
          firstNight: true,
          details: p.role!.firstNightReminder,
          priority: p.role!.firstNight,
        }
        r.push(entry)
      }
      if (p.role!.otherNight !== 0) {
        const entry: HostReminderInfo = {
          socketId: p.socketId,
          playerName: p.name,
          roleName: p.role!.name,
          firstNight: false,
          details: p.role!.otherNightReminder,
          priority: p.role!.otherNight,
        }
        r.push(entry)
      }
      return r
    });
    setReminderInfo(reminders.sort((a, b) => a.priority - b.priority))
  }
  return { hostListVisible, reminderInfo, setHostListVisible }
}
