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
  address: string | null
  createdAt: Date | null
  monthlyUsage: number
  totalUsage: number
}
