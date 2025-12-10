import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'

let client: ApolloClient

export function createApolloClient() {
  if (client) return client

  client = new ApolloClient({
    link: new HttpLink({ uri: '/api/graphql', fetch }),
    cache: new InMemoryCache(),
  })

  return client
}