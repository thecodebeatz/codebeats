/**
 * @file Reducer that stores list of blog posts (i.e. the list of blog post state).
 * 
 * Blog post list is received from fetchBlogPosts action in an Array (action.payload)
 * lodash function mapkeys is used to convert this array into an object so we can easily update the state object.
 * The state object returned by this reducer coud look like this.
 * 
 * Reducer used in the Blogfeed component. When state is loaded to that component, the state is converted back
 * to and array with the function Object.values()
 * 
 * @example
 * {
 *      "how-to-write-a-blog-post" : {
 *          title: "How to write a blog post",
 *          summary: "article that explains how to write a blog post",
 *          post_folder:
 *          ...
 *      },
 *      "another-blog-post" : {
 *          ...
 *      },
 *      ...
 * }
 *
 */
import mapKeys from 'lodash/mapKeys';
import { 
    FETCH_BLOG_POSTS
} from '../actions/types';

 const BlogfeedReducer = (state = {}, action) => {
    switch (action.type) {
        case FETCH_BLOG_POSTS:
            return {...state, ...mapKeys(action.payload, 'post_folder')};
        default:
            return state;
    }
}

export default BlogfeedReducer;