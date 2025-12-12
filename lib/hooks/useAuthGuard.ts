import { useRouter } from 'next/navigation'
import { authSelectors, useAppSelector } from '../store'

export function useAuthGuard() {
  const router = useRouter()
  const isAuthenticated = useAppSelector(authSelectors.selectAuthenticated)
  const token = useAppSelector(authSelectors.selectPassword)

  if (!isAuthenticated) {
    router.push('/login')
  }

  return { isAuthenticated, token }
}
