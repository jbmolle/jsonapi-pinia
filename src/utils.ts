/**
 * Utility functions
 */
import { defineStore } from 'pinia'
import type { Store, DocWithData, ResourceObject } from './types'

export const getUrl = (baseUrl: string, url: string) => {
  if (url.startsWith('/')) {
    if (baseUrl.endsWith('/')) {
      return new URL(baseUrl.slice(0, -1) + url)
    }
    return new URL(baseUrl + url)
  }
  return new URL(url)
}

export const processIncludedResources = (
  storeInitMap: any,
  doc?: DocWithData
) => {
  if (doc?.included) {
    doc.included.forEach((includedResource) => {
      const resourceType = includedResource.type
      const useIncludedStore = defineStore(
        resourceType,
        storeInitMap[resourceType] || {}
      )
      const includedStore = useIncludedStore() as Store
      includedStore.data[includedResource.id] = includedResource
    })
  }
}

export const processIndexData = async (
  json: DocWithData,
  store: Store,
  storeInitMap: any
) => {
  const jsonData = json.data as ResourceObject[]
  // Transform json data array in an object with keys=ids
  const insertData = jsonData.reduce((acc: any, val: any) => {
    return { ...acc, [val.id]: val }
  }, {})
  store.data = {
    ...store.data,
    ...insertData
  }
  // Check if there are some included data and add it to the respective store
  processIncludedResources(storeInitMap, json)
  // Update root meta and links
  store.meta = json.meta
  store.links = json.links
}

export const processGetData = async (
  json: DocWithData,
  store: Store,
  storeInitMap: any
) => {
  const elementData = json.data as ResourceObject
  store.data[elementData.id] = elementData
  // Check if there are some included data and add it to the respective store
  processIncludedResources(storeInitMap, json)
}
