import { 
    GET_POST_CONTENT
} from '../actions/types';

export default (state = {}, action) => {
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