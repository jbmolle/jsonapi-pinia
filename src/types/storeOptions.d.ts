import 'pinia'

declare module 'pinia' {
  /* eslint-disable  no-unused-vars */
  export interface DefineStoreOptionsBase<S, Store> {
    resourceType?: string
    query:
      | boolean
      | {
          index?: object
          get?: object
          create?: object
          update?: object
          delete?: object
        }
  }
}
