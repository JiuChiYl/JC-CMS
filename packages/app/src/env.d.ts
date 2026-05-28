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
