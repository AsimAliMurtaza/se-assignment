import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ItemService {
  constructor(private apollo: Apollo) {}

  // Query to get all items
  getItems(): Observable<any> {
    return this.apollo.query({
      query: gql`
        query {
          getItems {
            id
            name
          }
        }
      `,
    });
  }

  // Mutation to add an item
  addItem(name: string): Observable<any> {
    return this.apollo.mutate({
      mutation: gql`
        mutation addItem($name: String!) {
          addItem(name: $name) {
            id
            name
          }
        }
      `,
      variables: {
        name,
      },
    });
  }
}
