import { createApp } from 'vue'
import App from './App.vue'
import VueDrawing from "vue-drawing"

const app = createApp(App)

app.config.productionTip = false
app.use(VueDrawing);

app.mount('#app')
