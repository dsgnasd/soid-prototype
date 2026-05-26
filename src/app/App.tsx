import { Providers } from './providers'
import { AppRouter } from './router'
import { useTheme } from '@/shared/hooks/useTheme'

export function App() {
  // Активируем тему на html элемента при старте
  useTheme()
  return (
    <Providers>
      <AppRouter />
    </Providers>
  )
}
