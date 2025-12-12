import 'server-only'

import { ApolloServer } from '@apollo/server'
import { startServerAndCreateNextHandler } from '@as-integrations/next'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client'
import { GraphQLError, GraphQLFormattedError } from 'graphql'

import { resolvers } from '@/graphql/generated/resolvers.generated'
import { typeDefs } from '@/graphql/generated/typeDefs.generated'
import prisma from '@/prisma/client'

import { verifyAuthToken } from '@/lib/auth'
import { NextRequest } from 'next/server'
import type { GQLServerContext } from './context.type'

export function createGraphQLServerHandler() {
  const server = new ApolloServer<GQLServerContext>({
    typeDefs,
    resolvers,
    formatError,
  })
  
  const handler = startServerAndCreateNextHandler(
    server, 
    {
      context: async (req, res) => ({
        req,
        res,
        dbClient: prisma
      })
    })

  const handlerWithAuth = (req: NextRequest, res?: undefined) => {
    // not authenticated?
    const authHeaderValue = req.headers.get('Authorization') as string | null | undefined
    if (!authHeaderValue?.length) {
      throw new GraphQLError('Access denied', {
        extensions: {
          code: 'UNAUTHENTICATED',
          http: { status: 401 }
        }
      })
    }

    const tokenValue = authHeaderValue.replace('Bearer ', '').replace('bearer ', '')
    // invalid token
    if (!verifyAuthToken(tokenValue)) {
      throw new GraphQLError('Access denied', {
        extensions: {
          code: 'FORBIDDEN',
          http: { status: 403 }
        }
      })
    }

    return handler(req, res)
  }

  return handlerWithAuth
}

// convert prisma errors to GraphQL friendly errors
export function formatError(formattedError: GraphQLFormattedError, error: unknown): GraphQLFormattedError {
  const originalError = error instanceof GraphQLError ? error.originalError : error
  if (originalError instanceof PrismaClientKnownRequestError) {
    if (originalError.code === 'P2002') {
      return new GraphQLError(
        'Unique constraint failed on the fields: ' + (originalError.meta?.target as string[] || []).join(', '),
        {
          extensions: {
            code: 'BAD_USER_INPUT',
            http: { status: 409 },
          },
        }
      )
    }
    if (originalError.code === 'P2025') {
      return new GraphQLError('Record not found', {
        extensions: {
          code: 'NOT_FOUND',
          http: { status: 404 },
        },
      })
    }
  }

  return formattedError
}