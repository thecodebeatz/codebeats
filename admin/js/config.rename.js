/**
* Rename this file from config.rename.js to config.js
* * Update this file with your:
* * - AWS_REGION               =>   AWS region where your DynamoDB table and bucket are.
* * - AWS_ACCESS_KEY           =>   AWS access keys of user with privileged access  (should have read/write acess to DynamoDB table and S3 bucket)
* * - AWS_SECRET_KEY           =>   AWS secret keys of user with privileged access  (should have read/write acess to DynamoDB table and S3 bucket)
* * - AWS_S3_BUCKET            =>   Name of your S3 Bucket where you'll locate your blog post's images and files 
* * - AWS_S3_BUCKET_SUBFOLDER  =>   Any subfolder you'll like to place all blog post's images and files instead
* * - AWS_DYNAMO_TABLE         =>   DynamoDB table where all your blogpost data will be stored
* * - BLOG_SEO_SUBFOLDER       =>   Any subfolder you'd like your blog post articles to show on their URLs (e.g. if you set this to "blogpost/", 
* *                                 then your blog post will automatically have the following structure https://mysiteurl.com/blogpost/[blogpost-title]/[blogpost-unique-id])
* * - SITE_CANONICAL_URL       =>   Your site's canonical URL. This is how you want your homepage URL to be displayed on Google (e.g. https://mysiteurl.com/)
*
* ! DO NOT UPLOAD ANY OF THE FILES WITHIN THE /admin FOLDER TO YOUR SERVER
* ! The blog post editor is to be used ideally in your local machine, so you can easily 
* ! create or edit blog posts without exposing your AWS privileged access keys.
*
*/

const AWS_REGION = "";
const AWS_ACCESS_KEY = "";
const AWS_SECRET_KEY = "";
const AWS_S3_BUCKET = "";
const AWS_S3_BUCKET_SUBFOLDER = "posts/";
const AWS_DYNAMO_TABLE = "";
const BLOG_SEO_SUBFOLDER = "";
const SITE_CANONICAL_URL = "";