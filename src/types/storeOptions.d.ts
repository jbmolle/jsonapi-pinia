import 'pinia'

declare module 'pinia' {
  /* eslint-disable  no-unused-vars */
  export interface PiniaCustomProperties<Id, S, G, A> {
    $options: {
      id: Id
      state?: () => S
      getters?: G
      actions?: A & { normalizedItem: (itemId: string) => void }
    }
  }
  export interface DefineStoreOptionsBase<S, Store> {
    resourceType?: string
  }
}
