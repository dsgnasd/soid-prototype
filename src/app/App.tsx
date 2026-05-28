import { Providers } from './providers'
import { AppRouter } from './router'
import { useTheme } from '@/shared/hooks/useTheme'
import { Toaster } from '@/shared/ui/toast'

export function App() {
  // Активируем тему на html элемента при старте
  useTheme()
  return (
    <Providers>
      <AppRouter />
      <Toaster />
    </Providers>
  )
}
