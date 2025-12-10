import { ApolloServer } from '@apollo/server'
import { startServerAndCreateNextHandler } from '@as-integrations/next'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client'
import { GraphQLError, GraphQLFormattedError } from 'graphql'

import { resolvers } from '@/graphql/generated/resolvers.generated'
import { typeDefs } from '@/graphql/generated/typeDefs.generated'
import prisma from '@/prisma/client'

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

  return handler
}

// convert prisma errors to GraphQL friendly errors
export function formatError(formattedError: GraphQLFormattedError, error: unknown): GraphQLFormattedError {
  const originalError = error instanceof GraphQLError ? error.originalError : error
  if (originalError instanceof PrismaClientKnownRequestError) {
    if (originalError.code === 'P2002') {
      return new GraphQLError(
        'Unique constraint failed on the fields: ' + (originalError.meta?.target as string[]).join(', '),
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