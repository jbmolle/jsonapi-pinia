import { Links } from './links'
import { MetaObject } from './meta'

/**
 * A representation of a single resource.
 */
export interface ResourceObject<
  T extends string = string,
  A extends AttributesObject = AttributesObject
> {
  id: string
  type: T
  attributes?: AttributesObject<A>
  relationships?: RelationshipsObject
  links?: Links
  meta?: MetaObject
}

export type PrimaryData<
  T extends string = string,
  A extends AttributesObject = AttributesObject
> = ResourceObject<T, A> | Array<ResourceObject<T, A>>

/**
 * A ResourceIdentifier identifies and individual resource.
 */
export type ResourceIdentifierObject<
  T extends ResourceObject = ResourceObject
> = Pick<T, 'type' | 'id' | 'meta'>

/**
 * A representation of a new Resource Object that
 * originates at the client and is yet to be created
 * on the server. The main difference between a regular
 * Resource Object is that this may not have an `id` yet.
 */
export interface NewResourceObject<
  T extends string = string,
  A extends AttributesObject = AttributesObject
> {
  id?: string
  type: T
  attributes?: AttributesObject<A>
  relationships?: RelationshipsObject
  links?: Links
}

/**
 * Attributes describing a Resource Object
 */
export type AttributesObject<
  ATTRS extends { [k: string]: any } = { [k: string]: any }
> = { [K in keyof ATTRS]: ATTRS[K] }

export type ResourceLinkage =
  | null
  | never[]
  | ResourceIdentifierObject
  | ResourceIdentifierObject[]

export interface RelationshipsWithLinks {
  links: Links
}

export interface RelationshipsWithData {
  data: ResourceLinkage
}

export interface RelationshipsWithMeta {
  meta: MetaObject
}

/**
 * Describes a single Relationship type between a
 * Resource Object and one or more other Resource Objects.
 */
export type RelationshipObject =
  | RelationshipsWithData
  | RelationshipsWithLinks
  | RelationshipsWithMeta

export function isRelationshipWithData(
  relationship: RelationshipObject
): relationship is RelationshipsWithData {
  return (<RelationshipsWithData>relationship).data !== undefined
}

/**
 * A Resource object's Relationships.
 */
export interface RelationshipsObject {
  [k: string]: RelationshipObject
}
