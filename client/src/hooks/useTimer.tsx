import { useState, useRef } from "react"

export function useTimer() {
  const [minutes, setMinutes] = useState(1)
  const [seconds, setSeconds] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(minutes * 60 + seconds)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef(0)

  const startTimer = () => {
    if (intervalRef.current) return
    setRunning(true)
    const intervalId = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 0) {
          clearInterval(intervalRef.current)
          intervalRef.current = 0
          setRunning(false)
          return 0
        }
        return prev - 1
      })
    }, 1000);
    intervalRef.current = intervalId;
  }
  const pauseTimer = () => {
    setRunning(false)
    clearInterval(intervalRef.current)
    intervalRef.current = 0
  }
  const resetTimer = () => {
    setRunning(false)
    clearInterval(intervalRef.current)
    intervalRef.current = 0
    setTimeRemaining(minutes * 60 + seconds)
  }
  return { timeRemaining, startTimer, pauseTimer, resetTimer, running }
}
