import { Component, OnInit } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';

const GET_ITEMS = gql`
  query {
    getItems {
      id
      name
    }
  }
`;

const ADD_ITEM = gql`
  mutation($name: String!) {
    addItem(name: $name) {
      id
      name
    }
  }
`;

@Component({
  selector: 'app-item-list',
  template: `
    <h1>Items</h1>
    <input [(ngModel)]="newItem" placeholder="New Item" />
    <button (click)="addItem()">Add Item</button>
    <ul>
      <li *ngFor="let item of items">{{ item.name }}</li>
    </ul>
  `,
})
export class ItemListComponent implements OnInit {
  items: any[] = [];
  newItem = '';

  constructor(private apollo: Apollo) {}

  ngOnInit() {
    this.fetchItems();
  }

  fetchItems() {
    this.apollo.watchQuery<any>({ query: GET_ITEMS }).valueChanges.subscribe(({ data }) => {
      this.items = data.getItems;
    });
  }

  addItem() {
    this.apollo
      .mutate({ mutation: ADD_ITEM, variables: { name: this.newItem } })
      .subscribe((result: any) => {
        this.items.push(result.data.addItem);
        this.newItem = '';
      });
  }
}
