# jsonapi-pinia

JSON:API implementation with a Vue 3 + Pinia store.

## Installation
```
npm install jsonapi-pinia
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
    baseUrl: "http://localhost:5173/api/v1", // your base api url(optional)
  },
});

app.mount("#app");
```
