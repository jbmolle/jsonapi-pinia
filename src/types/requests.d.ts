import { NewResourceObject, ResourceObject } from './resourceObjects'
import { MetaObject } from './meta'
import { TopLevelLinks } from './links'

/**
 * A Request to be sent to a JSON API-compliant server.
 */
export interface Request<
  D extends NewResourceObject | NewResourceObject[] =
    | NewResourceObject
    | NewResourceObject[]
> {
  data: D
  included?: ResourceObject[]
  links?: TopLevelLinks
  errors?: [Error]
  meta?: MetaObject
}
