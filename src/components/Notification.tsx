import { useEffect } from 'react'
import './Notification.css'

interface NotificationProps {
  title: string
  message: string
  onClose: () => void
  autoClose?: number
}

export const Notification = ({ title, message, onClose, autoClose = 5000 }: NotificationProps) => {
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        onClose()
      }, autoClose)
      return () => clearTimeout(timer)
    }
  }, [autoClose, onClose])

  return (
    <div className="notification">
      <div className="notification-icon">🎉</div>
      <div className="notification-content">
        <div className="notification-title">{title}</div>
        <div className="notification-message">{message}</div>
      </div>
      <button className="notification-close" onClick={onClose}>×</button>
    </div>
  )
}
