import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { RoleId, User } from '@/shared/types'

interface AuthState {
  user: User | null
  setUser: (user: User | null) => void
  hasRole: (role: RoleId) => boolean
  isAuthenticated: () => boolean
}

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      setUser: (user) => set({ user }),
      hasRole: (role) => Boolean(get().user?.roles.includes(role)),
      isAuthenticated: () => Boolean(get().user),
    }),
    { name: 'soid.auth' },
  ),
)

export function useAuth() {
  return useAuthStore()
}

export function useCurrentUser(): User | null {
  return useAuthStore((s) => s.user)
}

export function useCurrentRole(): RoleId {
  const user = useCurrentUser()
  // Если у пользователя несколько ролей — берём самую «сильную»: superadmin > admin > operator.
  if (user?.roles.includes('superadmin')) return 'superadmin'
  if (user?.roles.includes('admin')) return 'admin'
  return 'operator'
}
