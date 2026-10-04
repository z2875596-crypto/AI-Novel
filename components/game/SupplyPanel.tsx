'use client'
import { useWorldStore } from '@/stores/worldStore'
import { useGameStore } from '@/stores/gameStore'
import { ACTION_LABELS } from '@/lib/supplyGame'

export default function SupplyPanel() {
  const state = useWorldStore(s => s.worldConfig.supply)
  const busy = useGameStore(s => s.isStreaming)
  if (!state) return null
  return <section aria-label="补给站处境与已知情况" className="rounded-xl border px-3 py-2 text-xs space-y-2" style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-surface)' }}>
    <div className="flex flex-wrap justify-between gap-2"><strong>风暴倒计时：{state.time} 时间单位</strong><span>目标：保障站内安全与城外供水</span></div>
    <p>排水：{state.repaired ? '已修复' : state.known.includes('shelter') ? '故障已诊断' : '待诊断'} · 装载：{state.cargo === 'none' ? '空车' : state.cargo === 'core' ? '净水核心' : '完整设备'} · 工具：{state.tools ? '已找到' : '待寻找'}</p>
    {state.pending && <p role="status" className="leading-6">待执行：{state.pending.steps.map(a => ACTION_LABELS[a]).join(' → ')}。{state.pending.explanation}。{busy ? '正在处理…' : '请在下方确认执行或取消；资源尚未改变。'}</p>}
    <details><summary className="cursor-pointer">已知情况、人物与承诺</summary><div className="space-y-2 pt-2 leading-6">
      <p>已知：两套净水设备；车辆只能运输一套完整设备。询问不耗时，调查耗时 1；操作前会展示代价。</p>
      {state.known.includes('water') && <p>储水：站内可维持一天，不能替代长期供水。</p>}
      {state.known.includes('vehicle') && <p>核心：城外有兼容接口；拆装耗时 2，需要工具。车辆不可返程。</p>}
      {state.known.includes('shelter') && <p>维修：工具必需；玩家和周宁耗时 2，有额外协助耗时 1。</p>}
      <p>许岚：{state.team ? '已借出队员，承诺交付设备或核心' : '等待故障诊断与交付承诺'}。{state.hiddenRisk ? '你隐瞒了设施风险，信任存在隐患。' : ''}</p>
      <p>居民撤离：{state.evacuated ? state.departed ? '已随车离开' : '已登车，尚未出发' : '留在补给站'}。</p>
      <p>陈默：{state.residents ? '居民参与维修，须保留站内一套设备' : '需要确认储水与设施情况'}。周宁：负责技术操作，需要工具与时间。</p>
      <ol className="list-decimal pl-5">{state.log.slice(-8).map((entry, index) => <li key={index}>{entry}</li>)}</ol>
    </div></details>
  </section>
}
