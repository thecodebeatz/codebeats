import { combineReducers } from 'redux';
import blogfeedReducer from './blogfeedReducer';
import blogpostReducer from './blogpostReducer';

export default combineReducers({
    blogfeed: blogfeedReducer,
    blogpost: blogpostReducer
});