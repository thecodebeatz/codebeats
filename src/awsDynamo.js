import AWS from 'aws-sdk';
import {
    AWS_REGION,
    AWS_ACCESS_KEY,
    AWS_SECRET_KEY
} from './config.js';

AWS.config.update({
    region: AWS_REGION,
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_KEY
});

export const dynamodb = new AWS.DynamoDB();
export const dynamodbDocClient = new AWS.DynamoDB.DocumentClient();