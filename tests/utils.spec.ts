import {
  processIndexData,
  processGetData,
  processUpdateData
} from '../src/utils'
import { jsonArticle } from './data/articles'
import { jsonPeople } from './data/people'

describe('processIndexData', function() {
  it('should insert data', async () => {
    const store = {
      data: {}
    }
    const articles = {
      data: [
        jsonArticle('1', '1'),
        jsonArticle('2', '2'),
        jsonArticle('3', '2')
      ]
    }
    const options = { storeInitMap: {}, merge: true }
    processIndexData(articles, store, options)
    const expectedData = {}
    articles.data.forEach((art) => {
      expectedData[art.id] = art
    })
    expect(store.data).toEqual(expectedData)

    options.merge = false
    const otherArticles = {
      data: [
        jsonArticle('4', '1'),
        jsonArticle('5', '2'),
        jsonArticle('6', '2')
      ]
    }
    processIndexData(otherArticles, store, options)
    otherArticles.data.forEach((art) => {
      expectedData[art.id] = art
    })
    expect(store.data).toEqual(expectedData)
  })

  it('should merge data', async function() {
    const store = {
      data: {}
    }
    const articles = {
      data: [
        jsonArticle('1', '1'),
        jsonArticle('2', '2'),
        jsonArticle('3', '2')
      ]
    }
    const options = { storeInitMap: {}, merge: true }
    processIndexData(articles, store, options)
    articles.data[2].attributes = {
      created: '2015-05-22T14:56:29.000Z'
    }
    processIndexData(articles, store, options)
    const expectedData = {}
    articles.data.forEach((art) => {
      expectedData[art.id] = art
    })
    expectedData['3'].attributes = {
      title: 'Article title',
      content: 'Article content',
      created: '2015-05-22T14:56:29.000Z'
    }
    expect(store.data).toEqual(expectedData)
  })

  it('should replace data', async function() {
    const store = {
      data: {}
    }
    const articles = {
      data: [
        jsonArticle('1', '1'),
        jsonArticle('2', '2'),
        jsonArticle('3', '2')
      ]
    }
    const options = { storeInitMap: {}, merge: false }
    processIndexData(articles, store, options)
    articles.data[2].attributes = {
      created: '2015-05-22T14:56:29.000Z'
    }
    const expectedData = {}
    articles.data.forEach((art) => {
      expectedData[art.id] = art
    })
    expect(store.data).toEqual(expectedData)
  })

  it('should merge relationships arrays', async function() {
    const store = {
      data: {
        "5b4eedbd4c73c613946cce27": {
          id: "5b4eedbd4c73c613946cce27",
          type: "articles",
          relationships: {
            authors: {
              data: []
            }
          }
        }
      }
    }
    const jsonData = [
      {
        id: "5b4eedbd4c73c613946cce27",
        type: "articles",
        relationships: {
          authors: {
            data: [{ id: '1', type: 'authors' }]
          }
        }
      }
    ]
    const insertData = {
      "5b4eedbd4c73c613946cce27": jsonData[0]
    }
    const options = { storeInitMap: {}, merge: true }
    processIndexData({ data: jsonData }, store, options)
    expect(store.data).toEqual(insertData)
  })
})

describe('processGetData', function() {
  it('should insert data', async () => {
    const store = {
      data: {}
    }
    const article = {
      data: {
        ...jsonArticle('1', '1')
      }
    }
    const options = { storeInitMap: {}, merge: true }
    processGetData(article, store, options)
    const expectedData = {
      '1': article.data
    }
    expect(store.data).toEqual(expectedData)

    options.merge = false
    const otherArticle = {
      data: {
        ...jsonArticle('2', '1')
      }
    }
    processGetData(otherArticle, store, options)
    expectedData['2'] = otherArticle.data
    expect(store.data).toEqual(expectedData)
  })

  it('should merge data', async function() {
    const store = {
      data: {}
    }
    const article = {
      data: {
        ...jsonArticle('1', '1')
      }
    }
    const options = { storeInitMap: {}, merge: true }
    processGetData(article, store, options)
    article.data.attributes = {
      created: '2015-05-22T14:56:29.000Z'
    }
    processGetData(article, store, options)
    const expectedData = {
      '1': article.data
    }
    expectedData['1'].attributes = {
      title: 'Article title',
      content: 'Article content',
      created: '2015-05-22T14:56:29.000Z'
    }
    expect(store.data).toEqual(expectedData)
  })

  it('should replace data', async function() {
    const store = {
      data: {}
    }
    const article = {
      data: {
        ...jsonArticle('1', '1')
      }
    }
    const options = { storeInitMap: {}, merge: false }
    processGetData(article, store, options)
    article.data.attributes = {
      created: '2015-05-22T14:56:29.000Z'
    }
    processGetData(article, store, options)
    const expectedData = {
      '1': article.data
    }
    expectedData['1'].attributes = {
      created: '2015-05-22T14:56:29.000Z'
    }
    expect(store.data).toEqual(expectedData)
  })
})

describe('processUpdateData', function() {
  it('should merge data', async function() {
    const store = {
      data: {
        '1': jsonArticle('1', '1')
      }
    }
    processUpdateData('', store, {
      id: '1',
      body: { created: '2015-05-22T14:56:29.000Z' }
    })
    const expectedData = store.data
    expectedData['1'].attributes = {
      title: 'Article title',
      content: 'Article content',
      created: '2015-05-22T14:56:29.000Z'
    }
    expect(store.data).toEqual(expectedData)
  })

  it('should replace data', async function() {
    const store = {
      data: {
        '1': jsonArticle('1', '1')
      }
    }
    const expectedData = store.data
    expectedData['1'].attributes = {
      created: '2015-05-22T14:56:29.000Z'
    }
    processUpdateData({ data: jsonArticle('1', '1') }, store, {
      id: '1',
      body: { created: '2015-05-22T14:56:29.000Z' }
    })
    expect(store.data).toEqual(expectedData)
  })
})
