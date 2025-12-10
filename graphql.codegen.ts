import type { CodegenConfig } from '@graphql-codegen/cli'
import { defineConfig } from '@eddeee888/gcg-typescript-resolver-files'
 
const config: CodegenConfig = {
  schema: '**/schema.graphql',
  ignoreNoDocuments: true,
  generates: {
    // server config
    'graphql/generated': defineConfig({
      add: {
        './types.generated.ts': { content: '/* eslint-disable */' },
        './resolvers.generated.ts': { content: '/* eslint-disable */' },
        './typeDefs.generated.ts': { content: '/* eslint-disable */' },
      },
      typesPluginsConfig: {
        useTypeImports: true,
        contextType: '@/graphql/server/context.type#GQLServerContext',
        avoidOptionals: {
          // Use `null` for nullable fields instead of optionals
          field: true,
          // Allow nullable input fields to remain unspecified
          inputValue: false
        }
      }
    }),

    // client config
    'graphql/generated/client/': {
      documents: [
        'graphql/operations/**/*.ts'
      ],
      preset: 'client',
      presetConfig: {
        typesPath: 'graphql/generated/types.generated.ts'
      },
      plugins: [
        { add: { content: ['/* eslint-disable */'] } }
      ],
      config: {
        useTypeImports: true,
        overwrite: true,
        avoidOptionals: {
          // Use `null` for nullable fields instead of optionals
          field: true,
          // Allow nullable input fields to remain unspecified
          inputValue: false
        },
        // Use `unknown` instead of `any` for unconfigured scalars
        defaultScalarType: 'unknown',
        // Apollo Client always includes `__typename` fields
        nonOptionalTypename: true,
        // Apollo Client doesn't add the `__typename` field to root types so
        // don't generate a type for the `__typename` for root operation types.
        skipTypeNameForRoot: true
      }
    }

    // TODO: Try to get this to work to avoid duplicate generated types
    // 'graphql/generated/gql.ts': {
    //   documents: ['app/**/*.tsx', 'api-clients/car-data-api-client.ts'],
    //   preset: 'import-types',
    //   plugins: [
    //     'typescript-operations',
    //     {
    //       'typed-document-node': {
    //         ignoreNoDocuments: true, // for better experience with the watcher
    //       }
    //     }
    //   ],
    //   presetConfig: {
    //     typesPath: './types.generated'
    //   }
    // }
  }
}

export default config