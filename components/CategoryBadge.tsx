const categoryColors: Record<string, string> = {
  '뷰티/화장품': 'bg-pink-100 text-pink-700',
  '패션/의류': 'bg-purple-100 text-purple-700',
  '식품/음료': 'bg-orange-100 text-orange-700',
  '생활/가전': 'bg-gray-100 text-gray-700',
  '건강/피트니스': 'bg-green-100 text-green-700',
  '반려동물': 'bg-yellow-100 text-yellow-700',
  '유아/아동': 'bg-sky-100 text-sky-700',
  '스포츠/아웃도어': 'bg-teal-100 text-teal-700',
  '디지털/IT': 'bg-indigo-100 text-indigo-700',
  '기타': 'bg-gray-100 text-gray-600',
}

export default function CategoryBadge({ category }: { category: string }) {
  const colorClass = categoryColors[category] || 'bg-gray-100 text-gray-600'
  return (
    <span className={`inline-block text-xs font-medium px-2.5 py-0.5 rounded-full ${colorClass}`}>
      {category}
    </span>
  )
}
