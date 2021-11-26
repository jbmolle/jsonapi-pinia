import type { ApiConf } from './types/apiConf'
import { getUrl } from './utils'
import type { ResourceObject, NewResourceObject } from './types/resourceObjects'

export const generateRequests = (
  resourceType: string,
  globalApiConf: ApiConf
) => {
  const indexRequest = (queryParams?: { [key: string]: any }) => {
    const url = getUrl(globalApiConf.baseUrl, `/${resourceType}`)
    const conf = { method: 'GET' }
    if (queryParams) {
      Object.keys(queryParams).forEach((key) =>
        url.searchParams.append(key, queryParams[key])
      )
    }
    return fetch(url.href, conf)
  }

  const getRequest = (id: string, queryParams?: { [key: string]: any }) => {
    const url = getUrl(globalApiConf.baseUrl, `/${resourceType}/${id}`)
    const conf = { method: 'GET' }
    if (queryParams) {
      Object.keys(queryParams).forEach((key) =>
        url.searchParams.append(key, queryParams[key])
      )
    }
    return fetch(url.href, conf)
  }

  const createRequest = (body: NewResourceObject) => {
    const url = getUrl(globalApiConf.baseUrl, `/${resourceType}`)
    const conf = { method: 'POST', body }
    return fetch(url.href, conf)
  }

  const updateRequest = (id: string, body: ResourceObject) => {
    const url = getUrl(globalApiConf.baseUrl, `/${resourceType}/${id}`)
    const conf = { method: 'PATCH', body }
    return fetch(url.href, conf)
  }

  const deleteRequest = (id: string) => {
    const url = getUrl(globalApiConf.baseUrl, `/${resourceType}/${id}`)
    const conf = { method: 'DELETE' }
    return fetch(url.href, conf)
  }

  return {
    indexRequest,
    getRequest,
    createRequest,
    updateRequest,
    deleteRequest
  }
}
