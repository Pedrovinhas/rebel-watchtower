export interface IEventListener {
  listen(channel: string, callback: (payload: string) => void): Promise<void>;
}
