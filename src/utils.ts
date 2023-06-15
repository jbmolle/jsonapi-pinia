/**
 * Utility functions
 */
import { defineStore } from 'pinia'
import { mergeWith, isArray } from 'lodash-es'
import type { Store, DocWithData, ResourceObject } from './types'

interface Options {
  storeInitMap: any
  merge: boolean
}

const customizer = (objValue: any, srcValue: any) => {
  if ((!objValue || isArray(objValue)) && isArray(srcValue)) {
    return srcValue
  }
}

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
  options: Options,
  doc?: DocWithData
) => {
  if (doc?.included) {
    doc.included.forEach((includedResource) => {
      const resourceType = includedResource.type
      const useIncludedStore = defineStore(
        resourceType,
        options.storeInitMap[resourceType] || {}
      )
      const includedStore = useIncludedStore() as Store
      // Merge or replace object
      if (options.merge) {
        if (!includedStore.data[includedResource.id]) {
          includedStore.data[includedResource.id] = {}
        }
        mergeWith(
          includedStore.data[includedResource.id],
          includedResource,
          customizer
        )
      } else {
        includedStore.data[includedResource.id] = includedResource
      }
    })
  }
}

export const processIndexData = async (
  json: DocWithData,
  store: Store,
  options: Options
) => {
  const jsonData = json.data as ResourceObject[]
  // Transform json data array in an object with keys=ids
  const insertData = jsonData.reduce((acc: any, val: any) => {
    return { ...acc, [val.id]: val }
  }, {})
  // Merge or replace
  if (options.merge) {
    mergeWith(store.data, insertData, customizer)
  } else {
    store.data = {
      ...store.data,
      ...insertData
    }
  }
  // Check if there are some included data and add it to the respective store
  processIncludedResources(options, json)
  // Update root meta and links
  store.meta = json.meta
  store.links = json.links
}

export const processGetData = async (
  json: DocWithData,
  store: Store,
  options: Options
) => {
  const elementData = json.data as ResourceObject
  // Merge or replace object
  if (options.merge) {
    if (!store.data[elementData.id]) {
      store.data[elementData.id] = {}
    }
    mergeWith(store.data[elementData.id], elementData, customizer)
  } else {
    store.data[elementData.id] = elementData
  }
  // Check if there are some included data and add it to the respective store
  processIncludedResources(options, json)
}

export const processUpdateData = async (
  json: DocWithData | string,
  store: Store,
  variables: { id: string; body: any }
) => {
  if (typeof json === 'string') {
    mergeWith(store.data[variables.id], variables.body, customizer)
  } else {
    const elementData = json.data as ResourceObject
    store.data[variables.id] = elementData
  }
}
