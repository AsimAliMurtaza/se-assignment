import { Component } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http'; 
import { GraphQLModule } from './graphql.module'; 

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, GraphQLModule, HttpClientModule], 
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'angular-frontend';
  items: { id: string; name: string }[] = [];
  newItemName: string = '';

  constructor(private apollo: Apollo) {}

  getItems() {
    this.apollo
      .watchQuery({
        query: gql`
          query GetItems {
            getItems {
              id
              name
            }
          }
        `,
      })
      .valueChanges.subscribe({
        next: (result: any) => {
          this.items = result.data.getItems;
        },
        error: (err) => {
          console.error('Error fetching items:', err);
        },
      });
  }

  addItem() {
    if (this.newItemName.trim()) {
      this.apollo
        .mutate({
          mutation: gql`
            mutation AddItem($name: String!) {
              addItem(name: $name) {
                id
                name
              }
            }
          `,
          variables: {
            name: this.newItemName,
          },
        })
        .subscribe({
          next: (result: any) => {
            this.items.push(result.data.addItem); 
            this.newItemName = ''; 
          },
          error: (err) => {
            console.error('Error adding item:', err);
          },
        });
    }
  }

  ngOnInit() {
    this.getItems();
  }
}
