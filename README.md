<h1 align="center">jsonapi-pinia</h1>
<p align="center">
  <a href="https://vuejs.org/" target="_blank" rel="noopener noreferrer">
    <img width="140" src="https://vuejs.org/images/logo.png" alt="Vue logo">
  </a>
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  <a href="https://pinia.vuejs.org" target="_blank" rel="noopener noreferrer">
    <img width="100" src="https://pinia.vuejs.org/logo.svg" alt="Pinia logo">
  </a>
</p>
<p align="center">JSON:API implementation with Vue 3 + Pinia store.</p>

## Installation
```
pnpm install jsonapi-pinia
```
## Usage
Firstly open your entry app inside `src/main.js` and add jsonPinia inside your vue instance as a vue plugin.
```js
import { createApp } from "vue";
import { createPinia } from "pinia";
import jsonApi from "jsonapi-pinia";
import "./style.css";
import App from "./App.vue";

const pinia = createPinia();
const app = createApp(App);

app.use(pinia);
app.use(jsonApi, {
  pinia: pinia, // pinia instance
  apiConf: {
    baseUrl: "http://localhost:3000/api/v1", // your base api url(optional)
  },
});

app.mount("#app");
```
