export interface UserReading {
  id: number
  meterNow: number
  meterBefore: number | null
  recordedAt: Date | null
}

export interface UserInfo {
  id: number
  name: string | null
  nik: string
  region: string | null
}

export interface UserReadingsGroup {
  user: UserInfo
  readings: UserReading[]
}
