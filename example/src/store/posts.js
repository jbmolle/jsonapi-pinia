import { defineStore } from "pinia";

export const usePostsStore = defineStore('posts', {
    actions: {
        test() {
            console.log('hi')
        }
    }
})