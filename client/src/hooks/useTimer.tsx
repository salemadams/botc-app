import { useState, useRef } from "react"

export function useTimer() {
  const [timeRemaining, setTimeRemaining] = useState(600)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef(0)
  const prevTimeRemainingRef = useRef(600)

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
    setTimeRemaining(prevTimeRemainingRef.current)
  }
  return { prevTimeRemainingRef, timeRemaining, setTimeRemaining, startTimer, pauseTimer, resetTimer, running }
}
