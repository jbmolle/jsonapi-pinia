import type { ApiConf } from './types/apiConf'
import { defineStore } from 'pinia'
import { getUrl, processIncludedResources } from './utils'
import type { DocWithData } from './types/documents'
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
        data: {},
        meta: {},
        links: {}
      }
    },
    getters: {
      normalizedItem: (state) => {
        return (itemId: string) => {
          const item = state.data[itemId]
          if (!item) {
            return undefined
          }
          const itemRelationships = {}
          if (item.relationships) {
            Object.keys(item.relationships).forEach((key) => {
              const relData = item.relationships[key].data
              if (!relData) {
                itemRelationships[key] = undefined
              } else {
                if (Array.isArray(relData)) {
                  itemRelationships[key] = relData.map((data) => {
                    const relStore = useJsonApi(data.type, globalApiConf)
                    return relStore.normalizedItem(data.id)
                  })
                } else {
                  const relStore = useJsonApi(relData.type, globalApiConf)
                  itemRelationships[key] = relStore.normalizedItem(relData.id)
                }
              }
            })
          }
          return {
            id: item.id,
            type: item.type,
            ...item.attributes,
            ...itemRelationships,
            meta: item.meta,
            links: item.links
          }
        }
      }
    },
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
        const json: DocWithData = await response.json()
        const data = json.data as ResourceObject[]
        // Transform json data array in an object with keys=ids
        const insertData = data.reduce((acc: any, val: any) => {
          return { ...acc, [val.id]: val }
        }, {})
        this.data = {
          ...this.data,
          ...insertData
        }
        // Check if there are some included data and add it to the respective store
        processIncludedResources(json, globalApiConf)
        // Update root meta and links
        this.meta = json.meta
        this.links = json.links
        // And return the response
        return json
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
        const json: DocWithData = await response.json()
        const elementData = json.data
        this.data[id] = elementData
        // Check if there are some included data and add it to the respective store
        processIncludedResources(json, globalApiConf)
        return json
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
          return json
        } else if (response.status === 204) {
          this.data[body.id] = body
          return body
        }
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
          return json
        } else if (response.status === 204) {
          // No document is returned so do a get request to update the document in the store
          return this.get(id)
        }
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
