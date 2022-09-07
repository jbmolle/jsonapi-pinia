import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { PiniaPluginContext } from 'pinia'

export function JsonApiPiniaPlugin(context: PiniaPluginContext) {
  const { store } = context

  // Store JSON:API root data (when returning a collection)
  const data = ref({})
  const meta = ref({})
  const links = ref({})

  store.data = data
  store.$state.data = data
  store.meta = meta
  store.$state.meta = meta
  store.links = links
  store.$state.links = links

  // Function to normalize an JSON:API item
  store.normalizedItem = (itemId: string) => {
    const item = data.value[itemId]
    if (!item) {
      return undefined
    }

    const handler = {
      get(target, prop, receiver) {
        if (['id', 'type', 'meta', 'links'].includes(prop))
          return Reflect.get(target, prop, receiver)
        if (Object.keys(target.attributes || {}).includes(prop))
          return target.attributes[prop]
        if (Object.keys(target.relationships || {}).includes(prop)) {
          const relData = target.relationships[prop].data
          if (!relData) return undefined
          if (Array.isArray(relData)) {
            return relData.map((data2) => {
              const useRelStore = defineStore(data2.type)
              const relStore = useRelStore()
              return relStore.normalizedItem(data2.id)
            })
          }
          // Not array
          const useRelStore = defineStore(relData.type)
          const relStore = useRelStore()
          return relStore.normalizedItem(relData.id)
        }
        return undefined
      },
      has() {
        return true
      },
      ownKeys(target) {
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
      getOwnPropertyDescriptor(target, prop) {
        return {
          value: handler.get(target, prop),
          enumerable: true,
          configurable: true
        }
      }
    }
    return new Proxy(item, handler)
  }
}
