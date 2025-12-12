import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'

let client: ApolloClient

export function createApolloClient(authToken: string) {
  if (client) return client

  client = new ApolloClient({
    link: new HttpLink({
      uri: '/api/graphql', fetch,
      headers: {
        'Authentication': `Bearer ${authToken}`
      }
    }),
    cache: new InMemoryCache(),
  })

  return client
}