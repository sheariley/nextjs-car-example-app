import 'server-only'

export function verifyAuthToken(token: string | null | undefined) {
  return typeof token === 'string' && token === process.env.MOCK_AUTH_TOKEN
}