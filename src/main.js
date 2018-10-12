import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'

import 'normalize.css'
import 'muse-ui/lib/styles/base.less'
import 'muse-ui/lib/styles/theme.less'
import './assets/app.scss'

import { Button, Icon } from 'muse-ui'

Vue.use(Button)
Vue.use(Icon)

Vue.config.productionTip = false

new Vue({
  render: h => h(App)
}).$mount('#app')
