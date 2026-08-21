/**
 * 声音播放 - 提示音 + 白噪音（Web Audio API 合成，无需音频文件）
 * @module composables/useSound
 * @description ① playDing() 短促"叮"声 ② 白噪音多场景混音播放
 *   （雨声/海浪/森林/咖啡馆用不同滤波参数模拟，可多场景叠加）
 */

import { NOISE_TYPE } from '@/utils/constants'

/** 噪声场景类型 */
type NoiseType = (typeof NOISE_TYPE)[keyof typeof NOISE_TYPE]

/** 激活场景节点 */
interface SceneNodes {
  source: AudioBufferSourceNode
  gain: GainNode
  filter: BiquadFilterNode
}

/** 单例 AudioContext（懒加载，浏览器策略要求用户交互后创建） */
let audioCtx: AudioContext | null = null

/** 激活的场景源节点集合 */
const activeScenes = new Map<string, SceneNodes>()

/** 获取 / 创建 AudioContext */
function getCtx(): AudioContext | null {
  if (audioCtx) return audioCtx
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
  if (!AC) return null
  audioCtx = new AC()
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {})
  }
  return audioCtx
}

/**
 * 声音组合式函数
 * @returns {{ playDing: Function, playWhiteNoise: Function, stopWhiteNoise: Function, setVolume: Function, getCurrentNoise: Function }}
 */
export function useSound() {
  /** 播放提示音（800Hz 正弦波，0.3s，带淡出包络） */
  function playDing(volume = 0.5): void {
    const ctx = getCtx()
    if (!ctx) return
    if (ctx.state === 'suspended') ctx.resume().catch(() => {})

    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(880, now) // A5 更清脆

    // ADSR 包络：快速起音 + 平滑衰减
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(volume, now + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.5)

    // 第二声（双音"叮-叮"）
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(1108.73, now + 0.12) // C6
    gain2.gain.setValueAtTime(0, now + 0.12)
    gain2.gain.linearRampToValueAtTime(volume * 0.8, now + 0.13)
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.45)
    osc2.connect(gain2)
    gain2.connect(ctx.destination)
    osc2.start(now + 0.12)
    osc2.stop(now + 0.55)
  }

  /**
   * 生成白噪音 AudioBuffer（1 秒循环）
   * @param {AudioContext} ctx
   * @param {number} seconds
   * @returns {AudioBuffer}
   */
  function createNoiseBuffer(ctx: AudioContext, seconds = 2): AudioBuffer {
    const sampleRate = ctx.sampleRate
    const length = sampleRate * seconds
    const buffer = ctx.createBuffer(1, length, sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1
    }
    return buffer
  }

  /** 生成低频"海浪"音色：正弦波慢速起伏 */
  function createWaveBuffer(ctx: AudioContext, seconds = 4): AudioBuffer {
    const sampleRate = ctx.sampleRate
    const length = sampleRate * seconds
    const buffer = ctx.createBuffer(1, length, sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < length; i++) {
      // 慢速正弦包络（约 0.12Hz）调制噪声，模拟海浪涨落
      const t = i / sampleRate
      const wave = 0.5 + 0.5 * Math.sin(2 * Math.PI * 0.12 * t)
      data[i] = (Math.random() * 2 - 1) * wave
    }
    return buffer
  }

  /** 生成"森林"音色：白噪声 + 高频随机鸟鸣式脉冲 */
  function createForestBuffer(ctx: AudioContext, seconds = 4): AudioBuffer {
    const sampleRate = ctx.sampleRate
    const length = sampleRate * seconds
    const buffer = ctx.createBuffer(1, length, sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate
      // 底层柔和噪声（叶响）+ 稀疏高频脉冲（鸟鸣感）
      const leaf = Math.random() * 0.3
      const chirp = Math.sin(2 * Math.PI * 2200 * t) * (Math.random() < 0.001 ? 0.6 : 0)
      data[i] = leaf + chirp
    }
    return buffer
  }

  /** 单场景的滤波参数 */
  function getFilterConfig(type: NoiseType): { type: BiquadFilterType; frequency: number; q: number } {
    switch (type) {
      case NOISE_TYPE.RAIN:
        // 雨声：低通 + 高频噪声，模拟雨滴
        return { type: 'lowpass', frequency: 2400, q: 0.5 }
      case NOISE_TYPE.WAVES:
        // 海浪：低通，低频起伏
        return { type: 'lowpass', frequency: 800, q: 0.7 }
      case NOISE_TYPE.FOREST:
        // 森林：带通，保留中高频
        return { type: 'bandpass', frequency: 1500, q: 0.4 }
      case NOISE_TYPE.CAFE:
        // 咖啡馆：带通 + 稍高频率，模拟环境嘈杂
        return { type: 'bandpass', frequency: 800, q: 0.3 }
      default:
        return { type: 'allpass', frequency: 0, q: 0 }
    }
  }

  /** 停止并清理单个场景 */
  function stopScene(type: string) {
    const scene = activeScenes.get(type)
    if (!scene) return
    try {
      scene.source.stop()
    } catch (_) {
      /* noop */
    }
    scene.source.disconnect()
    scene.gain.disconnect()
    scene.filter.disconnect()
    activeScenes.delete(type)
  }

  /** 播放单个场景（循环） */
  function playScene(type: NoiseType, volume: number) {
    const ctx = getCtx()
    if (!ctx) return
    if (ctx.state === 'suspended') ctx.resume().catch(() => {})

    let buffer
    if (type === NOISE_TYPE.WAVES) buffer = createWaveBuffer(ctx, 4)
    else if (type === NOISE_TYPE.FOREST) buffer = createForestBuffer(ctx, 4)
    else buffer = createNoiseBuffer(ctx, 2)

    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true

    const filter = ctx.createBiquadFilter()
    const cfg = getFilterConfig(type)
    filter.type = cfg.type
    if (cfg.frequency) filter.frequency.value = cfg.frequency
    filter.Q.value = cfg.q

    const gain = ctx.createGain()
    gain.gain.value = volume

    source.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)
    source.start()

    activeScenes.set(type, { source, gain, filter })
  }

  /** 播放白噪音（多场景混音，传入场景类型数组） */
  function playWhiteNoise(types: NoiseType | NoiseType[], volume = 0.5) {
    const list = Array.isArray(types)
      ? types.filter((t) => t && t !== NOISE_TYPE.NONE)
      : [types].filter((t) => t && t !== NOISE_TYPE.NONE)

    if (list.length === 0) {
      stopWhiteNoise()
      return
    }

    const listSet = new Set<string>(list)

    // 停掉不在新列表里的场景
    for (const type of [...activeScenes.keys()]) {
      if (!listSet.has(type)) stopScene(type)
    }

    // 播放（或保持）新列表里的场景
    list.forEach((type) => {
      if (activeScenes.has(type)) {
        // 已在播放，仅调音量
        const scene = activeScenes.get(type)
        const v = Math.max(0, Math.min(1, volume))
        if (scene && audioCtx) {
          scene.gain.gain.setTargetAtTime(v, audioCtx.currentTime, 0.05)
        }
      } else {
        playScene(type, volume)
      }
    })
  }

  /**
   * 停止所有白噪音
   */
  function stopWhiteNoise() {
    for (const type of [...activeScenes.keys()]) {
      stopScene(type)
    }
  }

  /** 设置白噪音音量（作用于所有激活场景） */
  function setVolume(volume: number) {
    const v = Math.max(0, Math.min(1, volume))
    const now = audioCtx ? audioCtx.currentTime : 0
    activeScenes.forEach((scene) => {
      scene.gain.gain.setTargetAtTime(v, now, 0.05)
    })
  }

  /**
   * 当前激活的场景类型列表
   * @returns {string[]}
   */
  function getCurrentNoise() {
    return [...activeScenes.keys()]
  }

  return { playDing, playWhiteNoise, stopWhiteNoise, setVolume, getCurrentNoise }
}

export default useSound
