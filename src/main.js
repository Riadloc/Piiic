import Vue from 'vue'
import App from './App.vue'
import { Button, Icon, Form, TextField, Helpers, Progress } from 'muse-ui'
import Loading from 'muse-ui-loading'

import './registerServiceWorker'

import 'normalize.css'
import 'muse-ui/lib/styles/base.less'
import 'muse-ui/lib/styles/theme.less'
import 'muse-ui-loading/dist/muse-ui-loading.css'
import './assets/app.scss'

Vue.use(Helpers)
Vue.use(Loading)
Vue.use(Button)
Vue.use(Icon)
Vue.use(Form)
Vue.use(TextField)
Vue.use(Progress)

Vue.config.productionTip = false

new Vue({
  render: h => h(App)
}).$mount('#app')
