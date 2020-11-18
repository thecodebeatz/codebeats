/**
 * @file Connection to AWS DynamoDB is made
 * 
 * DynamoDB objects returned (to be used to perform queries by other components).
 * 
 */

import AWSdynamodb from 'aws-sdk/clients/dynamodb';
import AWS from 'aws-sdk/global';
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

export const dynamodb = new AWSdynamodb();
export const dynamodbDocClient = new AWSdynamodb.DocumentClient();