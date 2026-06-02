import { SaveRecord } from '@/types/save'
import { GENRE_CONFIG } from './themeConfig'

export function exportNovelAsText(save: SaveRecord): string {
  const config = GENRE_CONFIG[save.genre]
  const date = new Date(save.updatedAt).toLocaleDateString('zh-CN')

  const lines: string[] = []

  // 封面信息
  lines.push(`《${save.worldConfig.worldName}》`)
  lines.push(``)
  lines.push(`题材：${config.label}　　主角：${save.worldConfig.protagonistName}`)
  lines.push(`共 ${save.turn} 回合　　导出时间：${date}`)
  lines.push(``)
  lines.push(`${'═'.repeat(40)}`)
  lines.push(``)

  // 世界设定
  lines.push(`【世界背景】`)
  lines.push(save.worldConfig.worldSetting)
  lines.push(``)

  // 主角信息
  lines.push(`【主角】${save.worldConfig.protagonistName}`)
  lines.push(save.worldConfig.protagonistTraits)
  lines.push(``)

  if (save.worldConfig.npcs.length > 0) {
    lines.push(`【配角】`)
    save.worldConfig.npcs.forEach((npc) => {
      lines.push(`${npc.name}（${npc.role}）：${npc.traits}`)
    })
    lines.push(``)
  }

  lines.push(`${'═'.repeat(40)}`)
  lines.push(``)
  lines.push(`【正文】`)
  lines.push(``)

  // 对话历史
  save.recentHistory.forEach((msg) => {
    if (msg.role === 'narrator') {
      lines.push(msg.content)
      lines.push(``)
    } else if (msg.role === 'player') {
      lines.push(`　　[${save.worldConfig.protagonistName}]：${msg.content}`)
      lines.push(``)
    } else if (msg.role === 'summary') {
      lines.push(`【回顾】${msg.content}`)
      lines.push(``)
    }
  })

  // 结局
  if (save.ending) {
    lines.push(`${'═'.repeat(40)}`)
    lines.push(``)
    lines.push(`【结局】${save.ending.title}`)
    lines.push(``)
  }

  lines.push(`${'─'.repeat(40)}`)
  lines.push(`本故事由「鸢叙」AI互动小说生成`)

  return lines.join('\n')
}

export function downloadText(content: string, filename: string) {
  if (typeof document === 'undefined') return
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}