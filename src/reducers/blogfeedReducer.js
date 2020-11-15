import _ from 'lodash';
import { 
    FETCH_BLOG_POSTS
} from '../actions/types';

export default (state = {}, action) => {
    switch (action.type) {
        case FETCH_BLOG_POSTS:
            return {...state, ..._.mapKeys(action.payload, 'post_folder')};
        default:
            return state;
    }
}
