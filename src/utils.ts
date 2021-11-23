/**
 * Utility functions
 */
import type { DocWithData } from './types/documents'
import type { ApiConf } from './types/apiConf'
import { useJsonApi } from './index'

export const getUrl = (baseUrl: string, url: string) => {
  if (url.startsWith('/')) {
    return new URL(baseUrl + url)
  }
  return new URL(url)
}

export const processIncludedResources = (
  doc: DocWithData,
  globalApiConf: ApiConf
) => {
  if (doc.included) {
    doc.included.forEach((includedResource) => {
      const includedStore = useJsonApi(includedResource.type, globalApiConf)
      includedStore.data[includedResource.id] = includedResource
    })
  }
}
