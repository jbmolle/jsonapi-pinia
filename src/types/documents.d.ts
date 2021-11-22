import { TopLevelLinks } from './links'
import { MetaObject } from './meta'
import { Errors } from './errors'
import { PrimaryData, ResourceObject } from './resourceObjects'

/**
 * A JSON object MUST be at the root of every JSON API request and responsecontaining data.
 * This object defines a document’s “top level”.
 * A document MUST contain at least one of the following top-level members:
 */

export interface DocWithData<T extends PrimaryData = PrimaryData>
  extends DocBase {
  data: T // the document’s “primary data”
  included?: Included
}

export interface DocWithErrors extends DocBase {
  errors: Errors // an array of error objects
}

/* A document MAY contain any of these top-level members: */
export interface DocBase {
  jsonapi?: ImplementationInfo
  links?: TopLevelLinks
  meta?: MetaObject // a meta object that contains non-standard meta-information.
}

export type Document = DocWithErrors | DocWithData
export type SingleResourceDoc<
  T extends string = string,
  A extends { [k: string]: any } = { [k: string]: any }
> = DocWithData<ResourceObject<T, A>>
export type CollectionResourceDoc<
  T extends string = string,
  A extends { [k: string]: any } = { [k: string]: any }
> = DocWithData<Array<ResourceObject<T, A>>>

// an object describing the server’s implementation
export interface ImplementationInfo {
  version?: string
  meta?: MetaObject
}

export type Included = ResourceObject[]
