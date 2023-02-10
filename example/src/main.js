import { createApp } from 'vue'
import { createPinia } from 'pinia'
import jsonApi from 'jsonapi-pinia'
import './style.css'
import App from './App.vue'

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(jsonApi, {
  pinia: pinia, // pinia instance
  apiConf: {
    baseUrl: 'http://localhost:8000/api/v1' // your base api url(optional)
  }
})

app.mount('#app')
