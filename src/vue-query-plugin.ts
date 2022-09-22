import { reactive, watch, unref } from 'vue'
import { useQuery, useMutation } from 'vue-query'
// prettier-ignore
import { indexRequest, getRequest, createRequest, updateRequest, deleteRequest } from './requests'
import { processIndexData, processGetData } from './utils'
import type { UseQueryOptions, UseMutationOptions } from 'vue-query'
import type { ResourceObject, DocWithData, NewResourceObject } from './types'

interface QueriesOptions {
  index?: Omit<UseQueryOptions<any, unknown, unknown, any>, "queryKey" | "queryFn">
  get?: Omit<UseQueryOptions<any, unknown, unknown, any>, "queryKey" | "queryFn">
  create?: Omit<UseMutationOptions<any, unknown, any, unknown>, "mutationFn">
  update?: Omit<UseMutationOptions<any, unknown, { id: string, body: any }, unknown>, "mutationFn">
  delete?: Omit<UseMutationOptions<any, unknown, string, unknown>, "mutationFn">
}

let storeInitMap = {}

export const setStoreInitMap = (initMap: any) => {
  storeInitMap = initMap
}

const jsonApiMerge = (mainObject: ResourceObject, mergingObject: ResourceObject) => {
  const patch = {
    ...mainObject,
    id: mainObject.id,
    type: mainObject.type,
    attributes: { ...(mainObject.attributes ?? {}) },
    relationships: { ...(mainObject.relationships ?? {}) },
  }
  const attributes = mergingObject.attributes ?? {}
  const relationships = mergingObject.relationships ?? {}
  Object.keys(attributes).forEach(key => {
    if (attributes[key] !== undefined) {
      patch.attributes[key] = attributes[key]
    }
  })
  Object.keys(relationships).forEach(key => {
    if (relationships[key] !== undefined) {
      patch.relationships[key] = relationships[key]
    }
  })
  return patch
}

export const storeVueQuery = (
  store: any,
  apiResourceType?: string,
  queryOptions?: QueriesOptions
) => {
  const resourceType = apiResourceType || store.$id

  const indexKey = reactive([resourceType, {}])
  const indexQuery = useQuery(
    indexKey,
    () => indexRequest(resourceType, indexKey[1]),
    {
      keepPreviousData: true,
      staleTime: 10000,
      ...queryOptions?.index
    }
  )
  const index = async (queryParams: { [key: string]: any } = {}) => {
    indexKey[1] = queryParams
    // Reset the data to the cache of vue-query because it could have been changed by another store with relationships
    const data = <DocWithData | null>(indexQuery.data.value)
    if (data) {
      processIndexData(data, store, storeInitMap)
    }
  }

  watch(indexQuery.data, (newData: any) => {
    const data = <DocWithData | null>newData
    if (data) {
      processIndexData(data, store, storeInitMap)
    }
  })

  const getKey = reactive([resourceType, '', {}])
  const getQuery = useQuery(
    getKey,
    () => getRequest(resourceType, getKey[1], getKey[2]),
    {
      staleTime: 10000,
      ...queryOptions?.get
    }
  )
  const get = async (id: string, queryParams: { [key: string]: any } = {}) => {
    getKey[1] = id
    getKey[2] = queryParams
    // Reset the data to the cache of vue-query because it could have been changed by another store with relationships
    const data = <DocWithData | null>(getQuery.data.value)
    if (data) {
      processGetData(data, store, storeInitMap)
    }
  }

  watch(getQuery.data, (newData: any) => {
    const data = <DocWithData | null>newData
    if (data) {
      processGetData(data, store, storeInitMap)
    }
  })

  const createQuery = useMutation(
    (body: any) => createRequest(resourceType, body),
    {
      onSuccess: (json: DocWithData | string, body: NewResourceObject) => {
        if (typeof json === 'string') {
          store.data[body.id || ''] = body
        } else {
          const elementData = json.data as ResourceObject
          store.data[elementData.id] = elementData
        }
      },
      ...queryOptions?.create
    }
  )
  const create = async (body: NewResourceObject) => {
    createQuery.mutate(body)
  }

  const updateQuery = useMutation(
    (params: { id: string; body: any }) =>
      updateRequest(resourceType, params.id, params.body),
    {
      onSuccess: (json: DocWithData | string, variables: { id: string }) => {
        if (typeof json === 'string') {
          store.get(variables.id)
        } else {
          const elementData = json.data as ResourceObject
          store.data[elementData.id] = jsonApiMerge(store.data[elementData.id], elementData)
        }
      },
      ...queryOptions?.update
    }
  )
  const update = async (id: string, body: ResourceObject) => {
    updateQuery.mutate({ id, body })
  }

  const deleteQuery = useMutation(
    (id: string) => deleteRequest(resourceType, id),
    {
      onSuccess: (_: any, id: string) => {
        delete store.data[id]
      },
      ...queryOptions?.delete
    }
  )
  const vDelete = async (id: string) => {
    deleteQuery.mutate(id)
  }

  return {
    index,
    indexQuery,
    get,
    getQuery,
    create,
    createQuery,
    update,
    updateQuery,
    delete: vDelete,
    deleteQuery
  }
}
