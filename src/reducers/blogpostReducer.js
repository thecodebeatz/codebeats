/**
 * @file Reducer that stores the data (title, body, tags, etc.) of the last feteched blogpost (i.e. blog post state).
 * 
 * Blog post content is received from getBlogpostContent. If this action does not return any content,
 * a notFound flag is included in the state, which will be used to display the 404 message (component).
 *
 */
import { 
    GET_POST_CONTENT
} from '../actions/types';

const BlogpostReducer =  (state = {}, action) => {
    switch (action.type) {
        case GET_POST_CONTENT:
            if (action.payload === undefined) { // if blogpost not found...
                console.log("not found");
                return {...state, "notFound":true};
            } else {
                return action.payload;
            }
        default:
            return state;
    }
}

export default BlogpostReducer;