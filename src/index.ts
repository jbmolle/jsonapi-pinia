import type { ApiConf } from './types/apiConf'
import { defineStore } from 'pinia'
import { getUrl } from './utils'
import type { ResourceObject, NewResourceObject } from './types/resourceObjects'

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
        // If an error occured, return the response
        if (!response.ok) {
          return response
        }
        // Else add the element array to the store
        const json = await response.json()
        this.data = {
          ...this.data,
          ...json.data
        }
        // And return the response
        return response
      },
      async get(id: string, queryParams?: { [key: string]: any }) {
        const url = getUrl(globalApiConf.baseUrl, `/${resourceType}/${id}`)
        const conf = { method: 'GET' }
        if (queryParams) {
          Object.keys(queryParams).forEach((key) =>
            url.searchParams.append(key, queryParams[key])
          )
        }
        const response = await fetch(url.href, conf)
        // If an error occured, return the response
        if (!response.ok) {
          return response
        }
        // The api returns one element. Add it to the store with id
        const json = await response.json()
        const elementData = json.data
        this.data[id] = elementData
        return response
      },
      async create(body: NewResourceObject) {
        const url = getUrl(globalApiConf.baseUrl, `/${resourceType}`)
        const conf = { method: 'POST', body }
        const response = await fetch(url.href, conf)
        // If an error occured, return the response
        if (!response.ok) {
          return response
        }
        // The server can respond with a 201 Created and include the document or 204 No Content and no document
        if (response.status === 201) {
          const json = await response.json()
          const elementData = json.data
          this.data[elementData.id] = elementData
        } else if (response.status === 204) {
          this.data[body.id] = body
        }
        return response
      },
      async update(id: string, body: ResourceObject) {
        const url = getUrl(globalApiConf.baseUrl, `/${resourceType}/${id}`)
        const conf = { method: 'PATCH', body }
        const response = await fetch(url.href, conf)
        // If an error occured, return the response
        if (!response.ok) {
          return response
        }
        // The server can respond with a 200 OK and include the document or 204 No Content and no document
        if (response.status === 200) {
          const json = await response.json()
          this.data[id] = json.data
        } else if (response.status === 204) {
          // No document is returned so do a get request to update the document in the store
          this.get(id)
        }
        return response
      },
      async delete(id: string) {
        const url = getUrl(globalApiConf.baseUrl, `/${resourceType}/${id}`)
        const conf = { method: 'DELETE' }
        const response = await fetch(url.href, conf)
        // If the server respond with 200 or 204 then the deletion was successful
        if (response.ok) {
          delete this.data[id]
        }
        return response
      }
    }
  })()
}
