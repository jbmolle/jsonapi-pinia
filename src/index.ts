import { defu } from 'defu'
import { VueQueryPlugin } from '@tanstack/vue-query'
import { JsonApiPiniaPlugin } from './pinia-plugin'
import { setApiConf } from './requests'
import { setStoreInitMap } from './vue-query-plugin'
import type { App } from 'vue'
import type { Pinia } from 'pinia'
import type { ApiConf } from './types'

interface Options {
  pinia: Pinia,
  apiConf?: ApiConf
  storeInitMap?: any
}

export default {
  install: (app: App, options: Options) => {
    setStoreInitMap(options.storeInitMap || {})
    const pinia = options.pinia
    pinia.use(JsonApiPiniaPlugin)
    const defaultApiConf = { baseUrl: 'http://localhost' }
    const apiConf = defu(options.apiConf, defaultApiConf)
    setApiConf(apiConf)
    app.use(VueQueryPlugin)
    app.use(pinia)
  }
}

export { storeVueQuery } from './vue-query-plugin'
