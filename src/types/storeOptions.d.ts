import 'pinia'

export type Store = PiniaPluginContext['store']

declare module 'pinia' {
  export interface PiniaCustomProperties<Id, S, G, A> {
    $options: {
      id: Id
      state?: () => S & { data: any }
      getters?: G
      actions?: A & { normalizedItem: (itemId: string) => void }
    }
  }
  export interface DefineStoreOptionsBase<S, Store> {
    resourceType?: string
  }
}
