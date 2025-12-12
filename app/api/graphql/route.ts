import { createGraphQLServerHandler } from '@/graphql/server/server-handler'
import { NextRequest } from 'next/server'

const handler = createGraphQLServerHandler()

export async function GET(request: NextRequest) {
  return handler(request)
}

export async function POST(request: NextRequest) {
  return handler(request)
}
