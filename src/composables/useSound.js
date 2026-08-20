/**
 * 声音播放 - 提示音 + 白噪音（Web Audio API 合成，无需音频文件）
 * @module composables/useSound
 * @description ① playDing() 短促"叮"声 ② 白噪音循环播放（雨声/咖啡馆用滤波白噪音模拟）
 */

import { NOISE_TYPE } from '@/utils/constants'

/** 单例 AudioContext（懒加载，浏览器策略要求用户交互后创建） */
let audioCtx = null

/** 白噪音源节点 + 增益节点（用于循环控制） */
let noiseSource = null
let noiseGain = null
let noiseFilter = null
let currentNoiseType = NOISE_TYPE.NONE

/**
 * 获取 / 创建 AudioContext
 * @returns {AudioContext|null}
 */
function getCtx() {
  if (audioCtx) return audioCtx
  const AC = window.AudioContext || window.webkitAudioContext
  if (!AC) return null
  audioCtx = new AC()
  // 部分浏览器需要 resume
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
  /**
   * 播放提示音（800Hz 正弦波，0.3s，带淡出包络）
   * @param {number} [volume=0.5] - 音量 0-1
   * @returns {void}
   */
  function playDing(volume = 0.5) {
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
  function createNoiseBuffer(ctx, seconds = 2) {
    const sampleRate = ctx.sampleRate
    const length = sampleRate * seconds
    const buffer = ctx.createBuffer(1, length, sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1
    }
    return buffer
  }

  /**
   * 播放白噪音（循环）
   * @param {string} type - NOISE_TYPE 枚举值
   * @param {number} [volume=0.5] - 音量 0-1
   * @returns {void}
   */
  function playWhiteNoise(type, volume = 0.5) {
    if (type === NOISE_TYPE.NONE || type === NOISE_TYPE.SILENCE) {
      stopWhiteNoise()
      return
    }
    if (currentNoiseType === type && noiseSource) {
      // 已在播放同类型，仅调整音量
      setVolume(volume)
      return
    }
    stopWhiteNoise()

    const ctx = getCtx()
    if (!ctx) return
    if (ctx.state === 'suspended') ctx.resume().catch(() => {})

    const buffer = createNoiseBuffer(ctx, 2)
    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true

    const filter = ctx.createBiquadFilter()
    const gain = ctx.createGain()

    if (type === NOISE_TYPE.RAIN) {
      // 雨声：低通 + 高频噪声，模拟雨滴
      filter.type = 'lowpass'
      filter.frequency.value = 2400
      filter.Q.value = 0.5
    } else if (type === NOISE_TYPE.CAFE) {
      // 咖啡馆：带通 + 稍高频率，模拟环境嘈杂
      filter.type = 'bandpass'
      filter.frequency.value = 800
      filter.Q.value = 0.3
    } else {
      filter.type = 'allpass'
    }

    gain.gain.value = volume

    source.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)
    source.start()

    noiseSource = source
    noiseGain = gain
    noiseFilter = filter
    currentNoiseType = type
  }

  /**
   * 停止白噪音
   */
  function stopWhiteNoise() {
    if (noiseSource) {
      try {
        noiseSource.stop()
      } catch (_) {
        /* noop */
      }
      noiseSource.disconnect()
      noiseSource = null
    }
    if (noiseGain) {
      noiseGain.disconnect()
      noiseGain = null
    }
    if (noiseFilter) {
      noiseFilter.disconnect()
      noiseFilter = null
    }
    currentNoiseType = NOISE_TYPE.NONE
  }

  /**
   * 设置白噪音音量
   * @param {number} volume - 0-1
   */
  function setVolume(volume) {
    if (noiseGain) {
      const v = Math.max(0, Math.min(1, volume))
      noiseGain.gain.setTargetAtTime(v, audioCtx ? audioCtx.currentTime : 0, 0.05)
    }
  }

  /**
   * 当前白噪音类型
   * @returns {string}
   */
  function getCurrentNoise() {
    return currentNoiseType
  }

  return { playDing, playWhiteNoise, stopWhiteNoise, setVolume, getCurrentNoise }
}

export default useSound
