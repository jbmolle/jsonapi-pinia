import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { PiniaPluginContext } from 'pinia'

export function JsonApiPiniaPlugin(context: PiniaPluginContext) {
  const { store } = context

  // Store JSON:API root data (when returning a collection)
  const data = ref({})
  const meta = ref({})
  const links = ref({})

  const normalizeHandler = {
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
            const useRelStore = defineStore(data2.type, {})
            const relStore = useRelStore()
            return relStore.normalizedData.value[data2.id]
          })
        }
        // Not array
        const useRelStore = defineStore(relData.type, {})
        const relStore = useRelStore()
        return relStore.normalizedData.value[relData.id]
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
        value: normalizeHandler.get(target, prop),
        enumerable: true,
        configurable: true
      }
    }
  }

  const normalizedData = computed(() => Object.values(data.value)
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
