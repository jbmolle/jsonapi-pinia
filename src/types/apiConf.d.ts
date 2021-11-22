import type { HeadersInit } from 'node-fetch'

export interface ApiConf {
  baseUrl: string
  mode: string
  cache: string
  headers: HeadersInit
}
