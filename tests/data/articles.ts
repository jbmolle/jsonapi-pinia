import type { ResourceObject } from '../../src/types'

export const jsonArticle = (id: string, authorId: string) => {
  return {
    id,
    type: 'articles',
    attributes: {
      title: 'Article title',
      content: 'Article content'
    },
    relationships: {
      author: {
        data: { id: authorId, type: 'people' }
      }
    }
  } as ResourceObject
}

export const normArticle = (id: string, authorId: string) => {
  return {
    id,
    type: 'articles',
    title: 'Article title',
    content: 'Article content',
    author: {
      id: authorId,
      type: 'people'
    }
  }
}
