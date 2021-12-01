import { App } from 'vue'
import { JsonApiPiniaPlugin } from './pinia-plugin'
import { setApiConf } from './requests'
import { QueryClient } from 'react-query/core'
import { VUE_QUERY_CLIENT } from 'vue-query'

export default {
  install: (app, options) => {
    const pinia = options.pinia
    pinia.use(JsonApiPiniaPlugin)
    const apiConf = options.apiConf || {}
    const defaultApiConf = { baseUrl: 'http://localhost' }
    setApiConf({ ...defaultApiConf, ...apiConf })
    const client = new QueryClient({})
    client.mount()
    const installedApps = new Set<App>()
    app.provide(VUE_QUERY_CLIENT, client)
    const unmountApp = app.unmount
    installedApps.add(app)
    app.unmount = function () {
      installedApps.delete(app)
      if (installedApps.size < 1) {
        client.unmount()
      }
      unmountApp()
    }
  }
}
