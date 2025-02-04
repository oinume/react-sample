import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client/index';

const httpLink = createHttpLink({
  uri: 'https://mojaskola-hasura.dokku.lampetty.net/v1/graphql',
});

export const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});