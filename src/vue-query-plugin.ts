import { reactive, watch } from 'vue'
import { useQuery, useMutation } from '@tanstack/vue-query'
// prettier-ignore
import { indexRequest, getRequest, createRequest, updateRequest, deleteRequest } from './requests'
import { processIndexData, processGetData, processUpdateData } from './utils'
import type { UseQueryOptions, UseMutationOptions } from '@tanstack/vue-query'
import type { ResourceObject, DocWithData, NewResourceObject } from './types'

interface QueriesOptions {
  index?: Omit<
    UseQueryOptions<any, unknown, unknown, any>,
    'queryKey' | 'queryFn'
  > & { merge?: boolean }
  get?: Omit<
    UseQueryOptions<any, unknown, unknown, any>,
    'queryKey' | 'queryFn'
  > & { merge?: boolean }
  create?: Omit<
    UseMutationOptions<any, unknown, { body: any; headers: Headers }, unknown>,
    'mutationFn'
  >
  update?: Omit<
    UseMutationOptions<
      any,
      unknown,
      { id: string; body: ResourceObject; headers: Headers },
      unknown
    >,
    'mutationFn'
  >
  delete?: Omit<
    UseMutationOptions<any, unknown, { id: string; headers: Headers }, unknown>,
    'mutationFn'
  >
}

let storeInitMap = {}

export const setStoreInitMap = (initMap: any) => {
  storeInitMap = initMap
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
    // Test: Let the user choose if she wants a merge or a replace when executing a query.
    /*const data = <DocWithData | null>indexQuery.data.value
    if (data) {
      processIndexData(data, store, { storeInitMap, merge: true })
    }*/
  }

  watch(indexQuery.data, (newData: any) => {
    const data = <DocWithData | null>newData
    if (data) {
      const merge = queryOptions?.index?.merge ?? true
      processIndexData(data, store, { storeInitMap, merge })
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
    // Test: Let the user choose if she wants a merge or a replace when executing a query.
    /*const data = <DocWithData | null>getQuery.data.value
    if (data) {
      processGetData(data, store, { storeInitMap, merge: true })
    }*/
  }

  watch(getQuery.data, (newData: any) => {
    const data = <DocWithData | null>newData
    if (data) {
      const merge = queryOptions?.index?.merge ?? true
      processGetData(data, store, { storeInitMap, merge })
    }
  })

  const createQuery = useMutation(
    (params: { body: any; headers: Headers }) =>
      createRequest(resourceType, params.body, params.headers),
    {
      onSuccess: (json: DocWithData | string, { body }) => {
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
  const create = async (
    body: NewResourceObject,
    headers: Headers = new Headers()
  ) => {
    createQuery.mutate({ body, headers })
  }

  const updateQuery = useMutation(
    (params: { id: string; body: any; headers: Headers }) =>
      updateRequest(resourceType, params.id, params.body, params.headers),
    {
      onSuccess: (json: DocWithData | string, { id, body }) => {
        processUpdateData(json, store, { id, body })
      },
      ...queryOptions?.update
    }
  )
  const update = async (
    id: string,
    body: ResourceObject,
    headers: Headers = new Headers()
  ) => {
    updateQuery.mutate({ id, body, headers })
  }

  const deleteQuery = useMutation(
    (params: { id: string; headers: Headers }) =>
      deleteRequest(resourceType, params.id, params.headers),
    {
      onSuccess: (_: any, { id }) => {
        delete store.data[id]
      },
      ...queryOptions?.delete
    }
  )
  const vDelete = async (id: string, headers: Headers = new Headers()) => {
    deleteQuery.mutate({ id, headers })
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
