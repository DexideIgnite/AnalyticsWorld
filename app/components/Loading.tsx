import { Spinner } from './ui/Spinner'

interface LoadingProps {
  text?: string
  size?: 'sm' | 'md' | 'lg'
}

export function Loading({ text = 'Loading...', size = 'md' }: LoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] p-4">
      <Spinner size={size} className="mb-4" />
      <p className="text-gray-600">{text}</p>
    </div>
  )
} 