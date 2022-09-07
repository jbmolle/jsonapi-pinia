import { JsonApiPiniaPlugin } from './pinia-plugin'
import { setApiConf } from './requests'

export default {
  install: (app, options) => {
    const pinia = options.pinia
    pinia.use(JsonApiPiniaPlugin)
    const apiConf = options.apiConf || {}
    const defaultApiConf = { baseUrl: 'http://localhost' }
    setApiConf({ ...defaultApiConf, ...apiConf })
  }
}

export { storeVueQuery } from './vue-query-plugin'
