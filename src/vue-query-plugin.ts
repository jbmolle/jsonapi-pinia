import { reactive, watch } from 'vue'
import { useQuery, useMutation } from 'vue-query'
import { defu } from 'defu'
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

const getNullKeys = (element?: object) => Object.entries(element ?? {}).filter(entry => entry[1] === null).map(entry => entry[0])
const removeNullKeys = (receivedObject?: any, currentObject?: any) => {
  const nullAttributeKeys = getNullKeys(receivedObject?.attributes)
  const nullRelationshipKeys = getNullKeys(receivedObject?.relationships)
  if (!currentObject) return currentObject
  const attributes = !!currentObject?.attributes ? {} : { ...currentObject.attributes }
  const relationships = !!currentObject?.relationships ? {} : { ...currentObject.relationships }
  nullAttributeKeys.forEach(key => delete attributes[key])
  nullRelationshipKeys.forEach(key => delete relationships[key])
  return { ...currentObject, attributes, relationships }
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
      processIndexData(data, store)
    }
  }

  watch(indexQuery.data, (newData: any) => {
    const data = <DocWithData | null>newData
    if (data) {
      processIndexData(data, store)
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
      processGetData(data, store)
    }
  }

  watch(getQuery.data, (newData: any) => {
    const data = <DocWithData | null>newData
    if (data) {
      processGetData(data, store)
    }
  })

  const createQuery = useMutation(
    (body: any) => createRequest(resourceType, body),
    {
      onSuccess: (json: DocWithData | string, body: NewResourceObject) => {
        if (typeof json === 'string') {
          const currentData = store.data[body.id || '']
          const transformedData = removeNullKeys(body, currentData)
          store.data[body.id || ''] = defu(body, transformedData)
        } else {
          const elementData = json.data as ResourceObject
          const transformedData = removeNullKeys(elementData, store.data[elementData.id])
          store.data[elementData.id] = defu(elementData, transformedData)
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
          const transformedData = removeNullKeys(elementData, store.data[elementData.id])
          store.data[elementData.id] = defu(elementData, transformedData)
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
