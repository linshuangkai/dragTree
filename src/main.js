import Vue from 'vue'
import App from './App.vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import './styles/common.css'

// main.js
require('./mock');

Vue.use(ElementUI, {
  size: 'small',
  menuType: 'text'
})

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
