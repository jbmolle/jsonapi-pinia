import type { ResourceObject } from '../../src/types'

export const jsonPeople = (id: string, articlesId: string[] = []) => {
  return {
    id,
    type: 'people',
    attributes: {
      name: 'John'
    },
    relationships: {
      articles: {
        data: articlesId.map((artId) => ({ id: artId, type: 'articles' }))
      }
    }
  } as ResourceObject
}

export const normPeople = (id: string, articlesId: string[] = []) => {
  return {
    id,
    type: 'people',
    name: 'John',
    articles: articlesId.map((artId) => ({ id: artId, type: 'articles' }))
  }
}
