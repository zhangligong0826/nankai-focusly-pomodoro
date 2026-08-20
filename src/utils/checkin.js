/**
 * 合并本地与远端的当日打卡累计值。
 * 远端数据可补齐或提升本地数据，但绝不降低已经离线持久化的累计值。
 */
export function mergeTodayCheckin(local, remote) {
  return {
    ...local,
    ...remote,
    date: local.date,
    firstCheckinAt: local.firstCheckinAt || remote.firstCheckinAt,
    pomodoroCount: Math.max(
      Number(local.pomodoroCount) || 0,
      Number(remote.pomodoroCount) || 0
    ),
    totalMinutes: Math.max(
      Number(local.totalMinutes) || 0,
      Number(remote.totalMinutes) || 0
    ),
  }
}

export default { mergeTodayCheckin }
