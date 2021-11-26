import { watch } from 'vue'
import { defineStore } from 'pinia'
import { useSWRV, LocalStorageCache } from 'swrv'
import { generateRequests } from './requests'
import { processIncludedResources } from './utils'
import type { ApiConf } from './types/apiConf'
import type { DocWithData } from './types/documents'
import type { ResourceObject, NewResourceObject } from './types/resourceObjects'

export const useJsonApi = (
  resourceType: string,
  providedApiConf?: ApiConf,
  cacheKey?: Function
) => {
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

  const {
    indexRequest,
    getRequest,
    createRequest,
    updateRequest,
    deleteRequest
  } = generateRequests(resourceType, providedApiConf)

  const store = defineStore(resourceType, {
    state: () => {
      return {
        data: {}
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
                    const relStore = useJsonApi(data.type, globalApiConf).store
                    return relStore.normalizedItem(data.id)
                  })
                } else {
                  const relStore = useJsonApi(relData.type, globalApiConf).store
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
            _jp: item
          }
        }
      }
    },
    actions: {
      async index(json: DocWithData) {
        /*const response = await indexRequest(queryParams)
        // If an error occured, return the response
        if (!response.ok) {
          return response
        }
        // Else add the element array to the store
        const json: DocWithData = await response.json()*/
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
        // And return the response
        return json
      },
      async get(id: string, queryParams?: { [key: string]: any }) {
        const response = await getRequest(id, queryParams)
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
        const response = await createRequest(body)
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
        const response = await updateRequest(id, body)
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
        const response = await deleteRequest(id)
        // If the server respond with 200 or 204 then the deletion was successful
        if (response.ok) {
          delete this.data[id]
        }
        return response
      }
    }
  })()

  const { data: indexData } = useSWRV(cacheKey ?? resourceType, indexRequest, {
    cache: new LocalStorageCache('swrv'),
    shouldRetryOnError: false
  })

  watch(indexData, (newData) => {
    store.index(newData)
  })

  return {
    store
  }
}
