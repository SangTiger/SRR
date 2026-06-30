import CardForm from '../CardForm'

export default function NewCardPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">新規レファレンス追加</h1>
        <p className="text-sm text-gray-500 mt-1">新しいブランド事例を追加します</p>
      </div>
      <CardForm />
    </div>
  )
}
