/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, unknown>
  export default component
}

declare module '*.json' {
  const value: unknown
  export default value
}

declare module '@wangeditor/editor-for-vue' {
  export { Editor, Toolbar } from '@wangeditor/editor'
}

interface Window {
  wallpaperPropertyListener: {
    applyUserProperties: (props: Record<string, { value: unknown }>) => void
    setPaused: (isPaused: boolean) => void
  }
}

declare const anime: {
  (params: Record<string, unknown>): anime.AnimeInstance
  timeline(params: Record<string, unknown>): anime.AnimeTimelineInstance
  random(min: number, max: number): number
}

declare namespace anime {
  interface AnimeInstance {
    play(): void
    pause(): void
  }

  interface AnimeTimelineInstance {
    add(params: Record<string, unknown>, offset?: number | string): AnimeTimelineInstance
  }

  interface Animatable {
    target: {
      draw?: () => void
    }
  }
}
