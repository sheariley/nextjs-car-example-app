import { createGraphQLServerHandler } from '@/graphql/server/server-handler'

const handler = createGraphQLServerHandler()

export { handler as GET, handler as POST }
