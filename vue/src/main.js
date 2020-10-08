import Vue from 'vue'
import App from './App.vue'
import VueDrawing from "vue-drawing"

Vue.config.productionTip = false
Vue.use(VueDrawing);

new Vue({
  render: h => h(App),
}).$mount('#app')
