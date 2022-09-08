import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { PiniaPluginContext } from 'pinia'
import type { ResourceObject, RelationshipsWithData, Store } from './types'

export function JsonApiPiniaPlugin(context: PiniaPluginContext) {
  const { store } = context

  // Store JSON:API root data (when returning a collection)
  const data = ref({})
  const meta = ref({})
  const links = ref({})

  const normalizeHandler = {
    get(target: ResourceObject, prop: string, receiver?: any) {
      if (['id', 'type', 'meta', 'links'].includes(prop))
        return Reflect.get(target, prop, receiver)
      if (Object.keys(target.attributes || {}).includes(prop))
        return target.attributes?.[prop]
      if (Object.keys(target.relationships || {}).includes(prop)) {
        const relData = (<RelationshipsWithData>target.relationships?.[prop])?.data
        if (!relData) return undefined
        if (Array.isArray(relData)) {
          return relData.map((data2: ResourceObject) => {
            const useRelStore = defineStore(data2.type, {})
            const relStore = useRelStore() as Store
            return relStore.normalizedData[data2.id]
          })
        }
        // Not array
        const useRelStore = defineStore(relData.type, {})
        const relStore = useRelStore() as Store
        return relStore.normalizedData[relData.id]
      }
      return undefined
    },
    has() {
      return true
    },
    ownKeys(target: ResourceObject) {
      const targetAttributeKeys = Object.keys(target.attributes || {})
      const targetRelationshipKeys = Object.keys(target.relationships || {})
      return [
        'id',
        'type',
        'meta',
        'links',
        ...targetAttributeKeys,
        ...targetRelationshipKeys
      ]
    },
    getOwnPropertyDescriptor(target: ResourceObject, prop: string) {
      return {
        value: normalizeHandler.get(target, prop),
        enumerable: true,
        configurable: true
      }
    }
  }

  const normalizedData = computed<any>(() => Object.values(data.value)
    .reduce((acc: any, val: any) => ({ ...acc, [val.id]: new Proxy(val, normalizeHandler) }), {})
  )

  store.data = data
  store.$state.data = data
  store.normalizedData = normalizedData
  store.$state.normalizedData = normalizedData
  store.meta = meta
  store.$state.meta = meta
  store.links = links
  store.$state.links = links

  // Function to normalize an JSON:API item
  store.normalizedItem = (itemId: string) => normalizedData.value[itemId]
}
