import mitt from 'mitt'

export type EventBusEvents = {
  managerMusicPlayerChange: boolean
  siteMusicPlayerChange: boolean
  backgroundBlurChange: boolean
  backgroundBlurChange_val: number
  [key: string]: unknown
}

const eventBus = mitt<EventBusEvents>()

export default eventBus
