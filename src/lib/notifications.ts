// Event emitter simple para notificaciones
type NotificationListener = () => void;

class NotificationManager {
  private listeners: NotificationListener[] = [];

  subscribe(listener: NotificationListener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(listener => listener());
  }
}

export const notificationManager = new NotificationManager();

