import { MetaObject } from './meta'

/**
 * A single Link
 */
export type Link = string | LinkObject

export interface LinkObject {
  href: string
  meta?: MetaObject
}

/**
 * An object of key -> Link
 */
export interface Links {
  [key: string]: Link
}

export interface PaginationLinks {
  first?: Link | null // the first page of data
  last?: Link | null // the last page of data
  prev?: Link | null // the previous page of data
  next?: Link | null // the next page of data
}

/**
 * The top level Links.
 */
export type TopLevelLinks = Links & PaginationLinks
