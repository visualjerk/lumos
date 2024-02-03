export default function ActionButton({
  onClick,
  children,
}: {
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className="bg-indigo-600 text-white p-1 px-2 rounded"
    >
      {children}
    </button>
  )
}
