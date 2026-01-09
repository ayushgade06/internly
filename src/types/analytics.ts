// src/types/analytics.ts

export type MetricSummary = {
  totalApplications: number
  interviewRate: number
  offerRate: number
}

export type LineChartPoint = {
  date: string
  count: number
}

export type StatusPiePoint = {
  name: "Applied" | "Interview" | "Offer" | "Rejected"
  value: number
}

export type WeeklyBarPoint = {
  day: string
  apps: number
}

export type AnalyticsData = {
  metrics: MetricSummary
  lineChart: LineChartPoint[]
  statusPie: StatusPiePoint[]
  weeklyBar: WeeklyBarPoint[]
}
