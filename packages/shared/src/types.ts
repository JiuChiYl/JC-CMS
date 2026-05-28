/** 扩展组件配置项 */
export interface ExpansionItem {
  name: string
  vuePage: string
}

/** 组件包配置 */
export interface ConfigJson {
  name: string
  expansion: ExpansionItem[]
  auhor?: string
  version: string
  description?: string
}

/** conf.json 的完整结构 */
export interface ConfData {
  moreExpansion: ConfigJson[]
}

/** 路由列表 */
export interface RouteListData {
  view: string[]
  component: string[]
}

/** 标题映射 */
export interface TitleMapData {
  default: Record<string, string>
  moreExpansion: Record<string, string>
}

/** 用户信息 */
export interface UserInfo {
  avatar: string
  username: string
  uid: string
  description: string
}

/** 版本日历条目 */
export interface VersionItem {
  start: string
  end: string
  content: string
  background?: string
}

/** 日程条目 */
export interface ScheduleItem {
  date: string
  title: string
  time: string
  important: number
}

/** AI 聊天消息 */
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

/** SSE 响应数据 */
export interface SSEChoice {
  delta: {
    content?: string
  }
}

export interface SSEData {
  choices: SSEChoice[]
}
