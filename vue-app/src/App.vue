<template>
  <div id="app">
    <!-- Hello World Banner -->
    <div class="hello-banner">
      <h2>Hello World!</h2>
    </div>

    <!-- Main Container -->
    <div class="content">
      <h1>Item List</h1>
      <div class="input-container">
        <input
          v-model="newItem"
          @keyup.enter="addItem"
          placeholder="Add a new item"
        />
        <button @click="addItem">Add Item</button>
      </div>

      <!-- Item List -->
      <ul class="item-list">
        <li v-for="item in items" :key="item.id">
          {{ item.name }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      items: [],
      newItem: "",
    };
  },
  created() {
    this.fetchItems();
  },
  methods: {
    async fetchItems() {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/items/");
        this.items = response.data;
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    },
    async addItem() {
      if (this.newItem.trim() === "") return;

      try {
        const response = await axios.post("http://127.0.0.1:8000/api/items/", {
          name: this.newItem,
        });
        this.items.push(response.data);
        this.newItem = "";
      } catch (error) {
        console.error("Error adding item:", error);
      }
    },
  },
};
</script>

<style scoped>
/* General Body Styling */
body {
  font-family: "Arial", sans-serif;
  margin: 0;
  background-color: #f4f4f9;
  color: #333;
}

/* Hello World Banner */
.hello-banner {
  background-color: #007bff;
  color: white;
  text-align: center;
  padding: 1rem;
  font-size: 1.5rem;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* Main Content Styling */
.content {
  max-width: 600px;
  margin: 2rem auto;
  background: #ffffff;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
}

/* Input and Button Styling */
.input-container {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}

input {
  flex: 1;
  padding: 0.8rem;
  border: 1px solid #ccc;
  border-radius: 5px 0 0 5px;
  font-size: 1rem;
  outline: none;
}

input:focus {
  border-color: #007bff;
}

button {
  padding: 0.8rem 1.2rem;
  background-color: #28a745;
  border: none;
  color: white;
  border-radius: 0 5px 5px 0;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #218838;
}

/* Item List Styling */
.item-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.item-list li {
  padding: 0.8rem;
  margin: 0.5rem 0;
  background: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.item-list li:hover {
  transform: scale(1.02);
  background-color: #f1f1f1;
}
</style>
