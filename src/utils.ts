/**
 * Utility functions
 */
import type { DocWithData, ResourceObject } from './types'
import { defineStore } from 'pinia'
import type { PiniaPluginContext } from 'pinia'

export const getUrl = (baseUrl: string, url: string) => {
  if (url.startsWith('/')) {
    return new URL(baseUrl + url)
  }
  return new URL(url)
}

export const processIncludedResources = (doc: DocWithData) => {
  if (doc.included) {
    doc.included.forEach((includedResource) => {
      const useIncludedStore = defineStore(includedResource.type, () => ({}), {
        query: false
      })
      const includedStore = useIncludedStore()
      includedStore.data[includedResource.id] = includedResource
    })
  }
}

export const processIndexData = async (
  json: DocWithData,
  { store }: PiniaPluginContext
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
  processIncludedResources(json)
  // Update root meta and links
  store.meta = json.meta
  store.links = json.links
}

export const processGetData = async (
  json: DocWithData,
  { store }: PiniaPluginContext
) => {
  const elementData = json.data as ResourceObject
  store.data[elementData.id] = elementData
  // Check if there are some included data and add it to the respective store
  processIncludedResources(json)
}
