import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from './app/App'

async function bootstrap() {
  // MSW активируется и в dev, и в production (демо-прототип на моках).
  // Чтобы выключить — удалить worker.start() ниже и переключить apiFetch на реальный baseURL.
  const { worker } = await import('./mocks/browser')
  await worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: { url: '/mockServiceWorker.js' },
  })

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

bootstrap()
