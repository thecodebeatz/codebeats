import { dynamodb, dynamodbDocClient } from '../awsDynamo';
import { 
    FETCH_BLOG_POSTS,
    GET_POST_CONTENT
} from './types';
import { AWS_DYNAMO_TABLE } from '../config.js';

export const fetchBlogPosts = () => async (dispatch) => {

    let params = {
        TableName: AWS_DYNAMO_TABLE,
        ProjectionExpression: "title, post_folder, post_body, post_date, image, summary, post_tags, #pb",
        FilterExpression: "#pb = :published",
        ExpressionAttributeNames: {
            "#pb": "published",
        },
        ExpressionAttributeValues: {
             ":published": true,
        }    
    };

    const blogposts = await dynamodbDocClient.scan(params).promise();

    dispatch({
        type: FETCH_BLOG_POSTS,
        payload: blogposts.Items
    })
}

export const getBlogpostContent = (postid) => async (dispatch) => {

    let paramss = {
        TableName: AWS_DYNAMO_TABLE,
        Key:{
            "post_folder": { 'S' : postid }
        }
    };

    const blogpostcontent = await dynamodb.getItem(paramss).promise();

    dispatch({
        type: GET_POST_CONTENT,
        payload: blogpostcontent.Item
    })
}