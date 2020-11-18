# Codebeats

<img src="http://localhost:3000/static/media/codebeats_logo.f40a8e75.svg" width="80px" height="80px" />

Codebeats is a React-based **content management system** (CMS) which leverages AWS for hosting (**Amazon S3**) and database purposes (**Dynamo DB**). Codebeats was created and maintained by Tomás Jaramillo Quintero ([check out my blog, which runs on this CMS]

## Live Demo
[Check out my blog, which runs on this CMS](http://codebeats.ml "check out my blog, which runs on this CMS").

# Features

- Great for running lightweight personal blogs.

- Designed to run on AWS infrastructure, which makes it **cheap to host** ([i.e. from USD 0.5/month](https://aws.amazon.com/getting-started/hands-on/host-static-website/faq/#:~:text=The%20total%20cost%20of%20hosting,will%20cost%20around%20%240.50%2Fmonth. "i.e. from USD$0.5/month")):

	- **Amazon S3** is used for website and image hosting.
	- **Amazon DynamoDB** is used as the main CMS database.
	
- Includes a CMS, which is a standalone javascript solution and it&apos;s located in the [admin](https://github.com/thecodebeatz/codebeats/tree/master/admin "admin") folder. The CMS allows you to create and edit blog posts, as well as uploading and managing images stored on S3. I highly suggest you NOT TO upload the CMS to your hosting or S3. You&apos;ll be able to locally use it by setting up its config file (as explained below) and opening the `index.html` file in your browser.

# Guide

If you want to set up Codebeats and host it on AWS, you may follow these steps.

1. [Register on AWS](https://aws.amazon.com/premiumsupport/knowledge-center/create-and-activate-aws-account/ "Register on AWS"). If this is the first time you register, you&apos;ll get free access to several AWS services for 1 year ([read more](https://aws.amazon.com/free/?all-free-tier.sort-by=item.additionalFields.SortRank&all-free-tier.sort-order=asc "read more")).

2. Once you&apos;re registered you&apos;ll need to [create and set up an S3 bucket as a website](https://docs.aws.amazon.com/AmazonS3/latest/user-guide/static-website-hosting.html "create and setup an S3 bucket as a website"). **IMPORTANT**: Since this CMS leverages React Router, you&apos;ll need to define the bucket&apos;s index and error documents as `index.html`, however, this is a workaround that has some flaws. A much better solution is integrating your bucket with AWS Cloudfront by following [this guide](https://aws.amazon.com/premiumsupport/knowledge-center/cloudfront-https-requests-s3/ "this guide") and [then this one](https://www.codebyamir.com/blog/fixing-403-access-denied-errors-when-hosting-react-router-app-in-aws-s3-and-cloudfront "then this one"), which would also allow you to set up your website as an HTTPS site.

3. From the AWS console, access DynamoDB service and create a new table, give it whichever name you want, but make sure to name the partition key as `post_folder` and do not set any sort key ([this YouTube video shows you how](https://youtu.be/soNG0n68spw?t=880 "this YouTube video shows you how")  - Just watch the segment from 14:40 until 16:36).

4. Take note of ARN of your newly created table, you&apos;ll need it for later (to get the ARN, open the table from the AWS Console and you&apos;ll find it under the *Additional information* section.).

5. Go to AWS IAM and [create **two** new programmatic access users](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_users_create.html "create two new programmatic access users"). **Take note of their access and secrets keys**:

	5.1 One of these users will be used by the frontend application (the website) to authenticate and connect to DynamoDB and fetch all the blog posts and show them to your blog&apos;s visitors. We&apos;ll need to attach a **highly** restrictive policy to this user, so it&apos;s only allowed to read content from that table. There are several ways to do so, but the quickest way to do so is by [defining an inline-policy, like the one below, to that user](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_manage-edit.html#edit-inline-policy-console "defining an inline-policy, like the one below, to that user").
	```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "VisualEditor0",
            "Effect": "Allow",
            "Action": [
                "dynamodb:GetItem",
                "dynamodb:Scan"
            ],
            "Resource": "[ARN_OF_YOUR_DYNAMODB_TABLE_GOES_HERE]"
        }
    ]
}
```
	5.2 The other user (e.g. cms_admin) will be used by the CMS (admin module) to authenticate against S3 and DynamoDB and get permission to create/update blog post entries and upload images to S3. The quickest way to achieve this (not necessarily the most secure) is by linking **AmazonS3FullAccess** and **AmazonDynamoDBFullAccess** policies to this user. 
	
	This is rather fine if you&apos;ll store the CMS and access keys in your local machine and local network. If you are considering to upload this admin module to your server, you&apos;ll need to configure a much stricter policy for this user.
	
6. Clone this repo.

7. Update and rename files `src/config.rename.js` and `admin/js/config.rename.js`. Make sure to place the credentials of your admin user in `admin/js/config.rename.js` and not in `src/config.rename.js`. In these config files, you&apos;ll also be able to set up the name of your website, meta description, etc.

8. Build the solution by running `npm run build` and upload your built solution to your AWS S3 bucket.

8. Access the CMS module and create your first blog post!

# Screenshots

![](https://drive.google.com/uc?id=1FD--3WQjrHItyCySZoAzNgUL7FQca1Cs)

![](https://drive.google.com/uc?id=1EwVJJbZ41QwRR5OXXTTgCGzMc5B3O7zt)

![](https://drive.google.com/uc?id=1ssaD-v4pwW31SqGzvo5P3xkqr0PKjtIC)
