import { Outlet } from 'react-router-dom'

export function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-app p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-md bg-accent text-white grid place-items-center font-semibold">
              С
            </div>
            <span className="text-xl font-semibold text-text-primary tracking-tight">СОИД</span>
          </div>
          <p className="text-sm text-text-muted">Система обработки инженерных данных</p>
        </div>
        <div className="bg-bg-surface border border-border-subtle rounded-xl p-6 shadow-sm">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
