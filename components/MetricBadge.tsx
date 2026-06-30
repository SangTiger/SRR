interface MetricBadgeProps {
  label: string
  value: string
}

export default function MetricBadge({ label, value }: MetricBadgeProps) {
  return (
    <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 text-center">
      <div className="text-lg font-bold text-blue-700">{value}</div>
      <div className="text-xs text-blue-600">{label}</div>
    </div>
  )
}
