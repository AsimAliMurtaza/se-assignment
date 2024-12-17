import { NgModule } from '@angular/core';
import { ApolloModule, APOLLO_OPTIONS } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache } from '@apollo/client/core';

@NgModule({
  exports: [ApolloModule],
})
export class GraphQLModule {
  static forRoot() {
    return {
      ngModule: GraphQLModule,
      providers: [
        {
          provide: APOLLO_OPTIONS,
          useFactory: (httpLink: HttpLink) => ({
            cache: new InMemoryCache(),
            link: httpLink.create({ uri: 'http://localhost:8000/graphql' }), // Replace with your GraphQL server URI
          }),
          deps: [HttpLink],
        },
      ],
    };
  }
}
