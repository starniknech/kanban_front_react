import { Socket } from 'socket.io-client';

interface AckError {
  data?: unknown;
  error?: string;
  message?: string | string[];
  status?: string;
}

function isAckError(ack: unknown): ack is AckError {
  return Boolean(ack && typeof ack === 'object');
}

function getAckErrorMessage(ack: AckError) {
  if (ack.error) return ack.error;
  if (ack.status === 'error') {
    return Array.isArray(ack.message) ? ack.message.join(', ') : ack.message;
  }
  return undefined;
}

export class RealtimeService {
  private static projectSocket: Socket | null = null;
  private static userSocket: Socket | null = null;
  private static ackTimeoutMs = 10000;

  static setProjectSocket(socket: Socket | null) {
    this.projectSocket = socket;
  }

  static clearProjectSocket(socket: Socket | null) {
    if (this.projectSocket === socket) this.projectSocket = null;
  }

  static setUserSocket(socket: Socket | null) {
    this.userSocket = socket;
  }

  static clearUserSocket(socket: Socket | null) {
    if (this.userSocket === socket) this.userSocket = null;
  }

  static emitProject<T>(event: string, payload: unknown) {
    return this.emit<T>(this.projectSocket, event, payload);
  }

  static emitUser<T>(event: string, payload: unknown) {
    return this.emit<T>(this.userSocket || this.projectSocket, event, payload);
  }

  private static async emit<T>(socket: Socket | null, event: string, payload: unknown): Promise<T> {
    if (!socket) {
      return Promise.reject(new Error('Realtime connection is not available'));
    }

    await this.ensureConnected(socket);

    return new Promise((resolve, reject) => {
      let settled = false;
      const timeout = setTimeout(() => {
        if (settled) return;
        settled = true;
        reject(new Error('Realtime request timed out'));
      }, this.ackTimeoutMs);

      socket.emit(event, payload, (ack: unknown) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);

        if (isAckError(ack)) {
          const message = getAckErrorMessage(ack);
          if (message) {
            reject(new Error(message));
            return;
          }

          if ('data' in ack) {
            resolve(ack.data as T);
            return;
          }
        }

        resolve(ack as T);
      });
    });
  }

  private static ensureConnected(socket: Socket): Promise<void> {
    if (socket.connected) return Promise.resolve();

    return new Promise((resolve, reject) => {
      let settled = false;
      const timeout = setTimeout(() => {
        if (settled) return;
        settled = true;
        cleanup();
        reject(new Error('Realtime connection timed out'));
      }, this.ackTimeoutMs);

      const cleanup = () => {
        clearTimeout(timeout);
        socket.off('connect', handleConnect);
        socket.off('connect_error', handleConnectError);
        socket.off('disconnect', handleDisconnect);
      };

      const handleConnect = () => {
        if (settled) return;
        settled = true;
        cleanup();
        resolve();
      };

      const handleConnectError = (error: Error) => {
        if (settled) return;
        settled = true;
        cleanup();
        reject(error);
      };

      const handleDisconnect = (reason: string) => {
        if (settled) return;
        settled = true;
        cleanup();
        reject(new Error('Realtime disconnected: ' + reason));
      };

      socket.once('connect', handleConnect);
      socket.once('connect_error', handleConnectError);
      socket.once('disconnect', handleDisconnect);
      socket.connect();
    });
  }
}
