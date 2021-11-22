import type { ApiConf } from './types/apiConf'
import { defineStore } from 'pinia'
import { getUrl } from './utils'

export const useJsonApi = (resourceType: string, providedApiConf?: ApiConf) => {
  const defaultApiConf = {
    baseUrl: 'http://localhost',
    mode: 'cors',
    cache: 'default',
    headers: { 'Content-Type': 'application/vnd.api+json' }
  }
  const globalApiConf = {
    ...defaultApiConf,
    ...providedApiConf
  }
  return defineStore(resourceType, {
    state: () => {
      return {
        data: {}
      }
    },
    getters: {},
    actions: {
      async index(queryParams?: { [key: string]: any }) {
        const url = getUrl(globalApiConf.baseUrl, `/${resourceType}`)
        const conf = { method: 'GET' }
        if (queryParams) {
          Object.keys(queryParams).forEach((key) =>
            url.searchParams.append(key, queryParams[key])
          )
        }
        const response = await fetch(url.href, conf)
        const json = await response.json()
        this.data = {
          ...this.data,
          ...json.data
        }
      },
      async get(id: string, queryParams?: { [key: string]: any }) {
        const url = getUrl(globalApiConf.baseUrl, `/${resourceType}/${id}`)
        const conf = { method: 'GET' }
        if (queryParams) {
          Object.keys(queryParams).forEach((key) =>
            url.searchParams.append(key, queryParams[key])
          )
        }
        await fetch(url.href, conf)
      },
      async create(body: { [key: string]: any }) {
        const url = getUrl(globalApiConf.baseUrl, `/${resourceType}`)
        const conf = { method: 'POST', body }
        await fetch(url.href, conf)
      },
      async update(id: string, body: { [key: string]: any }) {
        const url = getUrl(globalApiConf.baseUrl, `/${resourceType}/${id}`)
        const conf = { method: 'PATCH', body }
        await fetch(url.href, conf)
      },
      async delete(id: string) {
        const url = getUrl(globalApiConf.baseUrl, `/${resourceType}/${id}`)
        const conf = { method: 'DELETE' }
        await fetch(url.href, conf)
      }
    }
  })()
}
