import { 
    GET_POST_CONTENT
} from '../actions/types';

export default (state = {}, action) => {
    switch (action.type) {
        case GET_POST_CONTENT:
            return action.payload;
        default:
            return state;
    }
}