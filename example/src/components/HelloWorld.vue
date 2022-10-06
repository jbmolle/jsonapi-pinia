<script setup>
import { storeVueQuery } from 'jsonapi-pinia'
import { usePostsStore } from '../store/posts'
import { toRaw } from 'vue'

const postsStore = usePostsStore() 
const posts = storeVueQuery(postsStore)

const getPosts = () => {
  posts.index()
}

const createPosts = () => {
  const payload = {
    "data": {
      "type": "posts",
      "attributes": {
        "content": "In our second blog post, you will learn how to create resources using the JSON:API specification.",
        "publishedAt": null,
        "slug": "creating-jsonapi-resources",
        "title": "How to Create JSON:API Resources"
      },
      "relationships": {
        "tags": {
          "data": [
            {
              "type": "tags",
              "id": "2"
            }
          ]
        }
      }
    }
  }
  posts.create(payload)
}

console.log(posts)
</script>

<template>
  <h1>JSON:API Pinia</h1>
  <button @click="getPosts">Refetch</button>
  <button @click="createPosts">Create Post</button>
  <p v-for="post in postsStore.data">
    {{ post.attributes?.title }}
  </p>
</template>

<style scoped>
</style>
