import { ApolloServer } from '@apollo/server'
import { startServerAndCreateNextHandler } from '@as-integrations/next'

import { resolvers } from '@/app/generated/gql/resolvers.generated'
import { typeDefs } from '@/app/generated/gql/typeDefs.generated'

const server = new ApolloServer({ typeDefs, resolvers })

const handler = startServerAndCreateNextHandler(server)

export { handler as GET, handler as POST }
