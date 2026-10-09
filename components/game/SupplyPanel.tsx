'use client'
import { useWorldStore } from '@/stores/worldStore'
import { useGameStore } from '@/stores/gameStore'
import { ACTION_LABELS } from '@/lib/supplyGame'
import { normalizeSocial, PERSON_NAMES, supplyRecap } from '@/lib/supplySocial'
import { PLAN_EDITS, previewSupplyPlan } from '@/lib/supplyPlan'

export default function SupplyPanel({ onAction }: { onAction: (action: string) => void }) {
  const state = useWorldStore(s => s.worldConfig.supply)
  const busy = useGameStore(s => s.isStreaming)
  if (!state) return null
  const social = normalizeSocial(state.social)
  const complete = state.departed || state.time === 0
  return <section aria-label="补给站处境与已知情况" className="rounded-xl border px-3 py-2 text-xs space-y-2 max-h-[35dvh] overflow-y-auto" style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-surface)' }}>
    <div className="flex flex-wrap justify-between gap-2"><strong>风暴倒计时：{state.time} 时间单位</strong><span>目标：保障站内安全与城外供水</span></div>
    <p>排水：{state.repaired ? '已修复' : state.known.includes('shelter') ? '故障已诊断' : '待诊断'} · 装载：{state.cargo === 'none' ? '空车' : state.cargo === 'core' ? '净水核心' : '完整设备'} · 工具：{state.tools ? '已找到' : '待寻找'}</p>
    {state.pending && <p role="status" className="leading-6">待执行：{state.pending.steps.map(a => ACTION_LABELS[a]).join(' → ')}。{state.pending.explanation}。{busy ? '正在处理…' : '请在下方确认执行或取消；资源尚未改变。'}</p>}
    {!complete && state.pending && <details><summary className="cursor-pointer">查看代价与调整计划</summary><div className="pt-2 space-y-2"><p>{previewSupplyPlan(state, state.pending).join('；')}</p><div className="flex flex-wrap gap-2">{PLAN_EDITS.map(command => <button key={command} disabled={busy || (state.pending!.steps.length >= 4 && command.startsWith('在方案前'))} onClick={() => onAction(command)} className="border rounded-lg px-2 py-2 disabled:opacity-40">{command}</button>)}</div><p>也可以自由输入一个完整的新方案，替换尚未执行的步骤。</p></div></details>}
    {!complete && social.offer && <div className="rounded-lg border p-2 space-y-2"><p>{PERSON_NAMES[social.offer.target]}的合作条件：{social.offer.description}。尚未生效。</p><div className="flex gap-3"><button disabled={busy} onClick={() => onAction(ACTION_LABELS.accept_offer)} className="underline py-2">接受条件</button><button disabled={busy} onClick={() => onAction(ACTION_LABELS.reject_offer)} className="underline py-2">拒绝条件</button></div></div>}
    {complete && <details open><summary>结局复盘</summary><ul className="list-disc pl-4 pt-2 space-y-1">{supplyRecap(state).map(line => <li key={line}>{line}</li>)}</ul></details>}
    <details><summary className="cursor-pointer">已知情况、人物与承诺</summary><div className="space-y-2 pt-2 leading-6">
      <p>已知：两套净水设备；车辆只能运输一套完整设备。询问不耗时，调查耗时 1；操作前会展示代价。</p>
      {state.known.includes('water') && <p>储水：站内可维持一天，不能替代长期供水。</p>}
      {state.known.includes('vehicle') && <p>核心：城外有兼容接口；拆装耗时 2，需要工具。车辆不可返程。</p>}
      {state.known.includes('shelter') && <p>维修：工具必需；玩家和周宁耗时 2，有额外协助耗时 1。</p>}
      <p>许岚：{state.team ? '已借出队员' : '尚未提供后续协助'}。{social.trust.xu === 'wary' ? '保持戒备，需要实际保障。' : ''}{state.hiddenRisk && !social.exposed ? '你隐瞒了设施风险，她尚未发现。' : social.exposed ? '她已通过证据发现此前隐瞒。' : ''}</p>
      <p>居民撤离：{state.evacuated ? state.departed ? '已随车离开' : '已登车，尚未出发' : '留在补给站'}。</p>
      <p>陈默：{state.residents ? '居民参与维修，须保留站内一套设备' : '需要确认储水与设施情况'}。周宁：负责技术操作，需要工具与时间。</p>
      {social.promises.map(p => <p key={p.id}>对{PERSON_NAMES[p.target]}的承诺：{p.description} · {p.status === 'active' ? '待兑现' : p.status === 'fulfilled' ? '已兑现' : '未兑现'}</p>)}
      <p>人物已知：许岚{social.knowledge.xu.includes('shelter') ? '了解故障' : '尚未收到故障依据'}；陈默{social.knowledge.chen.includes('water') ? '了解储水调查' : '尚未收到储水调查'}。你的私下调查不会自动传给所有人。</p>
      <ol className="list-decimal pl-5">{state.log.slice(-8).map((entry, index) => <li key={index}>{entry}</li>)}</ol>
    </div></details>
  </section>
}
