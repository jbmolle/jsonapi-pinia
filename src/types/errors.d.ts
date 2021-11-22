import { Links } from './links'
import { MetaObject } from './meta'

export interface ErrorObject {
  id?: number | string
  links?: Links
  status?: string
  code?: string
  title?: string
  detail?: string
  source?: {
    pointer?: any
    parameter?: string
  }
  meta?: MetaObject
}

export type Errors = ErrorObject[]
