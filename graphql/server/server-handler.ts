import { ApolloServer } from '@apollo/server'
import { startServerAndCreateNextHandler } from '@as-integrations/next'

import { resolvers } from '@/graphql/generated/resolvers.generated'
import { typeDefs } from '@/graphql/generated/typeDefs.generated'
import prisma from '@/lib/prisma'

import type { GQLServerContext } from './context.type'

export function createGraphQLServerHandler() {
  const server = new ApolloServer<GQLServerContext>({ typeDefs, resolvers })
  
  const handler = startServerAndCreateNextHandler(
    server, 
    {
      context: async () => ({ dbClient: prisma })
    })

  return handler
}