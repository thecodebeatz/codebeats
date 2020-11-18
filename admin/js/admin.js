/**
 * This file is to be imported in ../admin.html which is the blog admin post.
 * ../config.js must also be imported in ../admin.html since it contains the definitions of some constants used in this file such as AWS keys (e.g. AWS_ACCESS_KEY)
 * 
 * @file This file includes all the scripts used by the blog administration home page, such as:
 * - Connectivity to AWS DynamoDB and S3
 * - Retreiving list of blog posts
 * - Allows to rebuild/update blog's sitemap manually
 *
 * ! DO NOT UPLOAD ANY OF THE FILES WITHIN THE /admin FOLDER TO YOUR SERVER
 * ! The blog post editor is to be used ideally in your local machine, so you can easily
 * ! create or edit blog posts without exposing your AWS privileged access keys.
 *
 * @requires config.js
 * @requires {@link https://code.jquery.com/jquery-3.5.1.min.js|jquery}
 */

/** Configure AWS parameters */
AWS.config.update({
  region: AWS_REGION,
  accessKeyId: AWS_ACCESS_KEY,
  secretAccessKey: AWS_SECRET_KEY,
});

/** Configure AWS objects for DynamoDB and S3  */
var dynamodb = new AWS.DynamoDB();
var docClient = new AWS.DynamoDB.DocumentClient();
var s3 = new AWS.S3({
  apiVersion: "2006-03-01",
  params: { Bucket: AWS_S3_BUCKET },
});

/**
 * @function scanData
 * Gets all blog posts data from DynamoDB and shows them on screen.
 * 
 * * Depends on global constants (see config.js file).
 * * Depends on global variables (loaded at the beginning of this file):
 * *   - "s3" -> Stores AWS S3 object.
 * *   - "docClient" -> DynamoDB object to perform update() requests to DynamoDB.
 * * Depends on function dateToUnix()
 * 
 */
function scanData() {
  const params = {
    TableName: AWS_DYNAMO_TABLE,
    ProjectionExpression:
      "title, post_folder, post_body, post_date, date_modified, published",
  };

  docClient.scan(params, onScan);

  function onScan(err, data) {
    if (err) {
      console.log(
        "Unable to scan the table: " + "\n" + JSON.stringify(err, undefined, 2)
      );
    } else {
      let posts = "";

      // order blogpost by publication date, in desc order 
      data.Items.sort(function (a, b) {
        return dateToUnix(b.post_date) - dateToUnix(a.post_date);
      });

      data.Items.forEach(function (Blogpost) {
        posts +=
          `<li class="posts-list-item">${Blogpost.published ? "✅" : "⏲"} <a class="posts-list-item-title" href="admin_post.html?id=` +
          Blogpost.post_folder +
          '">' +
          Blogpost.title +
          "</a> | <a onclick=\"delete_post('" +
          Blogpost.post_folder +
          '\')" href="#">[delete]</a><span class="posts-list-item-description">📅 created: ' +
          dateToNiceString(Blogpost.post_date) +
          " - modified: " +
          dateToNiceString(Blogpost.date_modified) +
          "</span></li>";
      });

      document.getElementById("posts-list").innerHTML += posts;
    }
  }
}
window.onload = scanData();


/**
 * @function createSiteMap
 * Creates sitemap and uploads it to SE
 * 
 * * Depends on global constants (see config.js file).
 * * Depends on global variables (loaded at the beginning of this file):
 * *   - "s3" -> Stores AWS S3 object.
 * *   - "docClient" -> DynamoDB object to perform update() requests to DynamoDB.
 *
 */
function createSiteMap() {
  let r = confirm("Sure?");

  if (r == true) {
    const event = new Date();

    const params = {
      TableName: AWS_DYNAMO_TABLE,
      ProjectionExpression:
        "title, post_folder, post_body, date_modified",
    };
    // scan all blog posts data.
    docClient.scan(params, onScan);

    function onScan(err, data) {
      if (err) {
        console.log(
          "Unable to scan the table: " +
            "\n" +
            JSON.stringify(err, undefined, 2)
        );
      } else {
        let posts =
          `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
            <url>
              <loc>${SITE_CANONICAL_URL}</loc>
            <lastmod>
              ${event.toISOString()}
            </lastmod>
            <changefreq>monthly</changefreq>
            <priority>0.8</priority></url>`;

        data.Items.forEach(function (Blogpost) {
          posts +=
            `<url><loc>${SITE_CANONICAL_URL}${BLOG_SEO_SUBFOLDER}/${Blogpost.post_folder}</loc><lastmod>${Blogpost.date_modified}</lastmod><changefreq>monthly</changefreq></url>`;
        });
        posts += "</urlset>";

        const upload = new AWS.S3.ManagedUpload({
          params: {
            Bucket: AWS_S3_BUCKET,
            Key: "sitemap.xml",
            Body: posts,
            ACL: "public-read",
            ContentType: "application/xml",
          },
        });

        const promise = upload.promise();

        promise.then(
          function (data) {
            success("Successfully uploaded your sitemap.");
          },
          function (err) {
            error("There was an error uploading your sitemap: " + err.message);
          }
        );
      }
    }
  }
}

/**
 * @function delete_post
 * Deletes post from DB
 * TODO: Delete as well related files from AWS S3.
 * 
 * * Depends on global constants (see config.js file).
 * * Depends on global variables (loaded at the beginning of this file):
 * *   - "docClient" -> DynamoDB object to perform update() requests to DynamoDB.
 *
 * @id id of the post to be deleted.
 * 
 */
function delete_post(id) {
  let r = confirm("Sure?");

  if (r == true) {
    const table = AWS_DYNAMO_TABLE;

    const params = {
      TableName: table,
      Key: {
        post_folder: id,
      },
    };

    docClient.delete(params, function (err, data) {
      if (err) {
        console.log(
          "Unable to read item: " + "\n" + JSON.stringify(err, undefined, 2)
        );
      } else {
        location.reload();
      }
    });
  }
}

/**
 * @function dateToNiceString
 * Converts date timestamp to format Mon DD, YYYY HH:MM
 *
 * @param {string} myDateInput a string representing a timestamp.
 * @returns {string} A string representation of the date following the format Mon DD, YYYY HH:MM (e.g. Jan 1, 2021 12:30)
 */
function dateToNiceString(myDateInput) {
  const myDate = new Date(myDateInput);
  const month = new Array();
  month[0] = "Jan";
  month[1] = "Feb";
  month[2] = "Mar";
  month[3] = "Apr";
  month[4] = "May";
  month[5] = "Jun";
  month[6] = "Jul";
  month[7] = "Aug";
  month[8] = "Sep";
  month[9] = "Oct";
  month[10] = "Nov";
  month[11] = "Dec";
  const hours = ("00" + myDate.getHours()).substr(-2); // 2 leading zeros
  const minutes = ("00" + myDate.getMinutes()).substr(-2); // 2 leading zeros
  return (
    month[myDate.getMonth()] +
    " " +
    myDate.getDate() +
    ", " +
    myDate.getFullYear() +
    " " +
    hours +
    ":" +
    minutes
  );
}

/**
 * @function dateToUnix
 * Convertes timestamp to Unix time
 *
 * @param {string} dateString a string representing a timestamp.
 * @returns {number} Unix time
 */
function dateToUnix(dateString) {
  return new Date(dateString).getTime();
}

/**
 * @function success
 * Shows a successful operation message at the top of the blogpost editor.
 *
 * @param {string} message - message to be displayed
 * 
 */
function success(message) {
  $("body").prepend(
    `<div class="alert alert-success" role="alert">${message}</div>`
  );
  $("html, body").animate(
    {
      scrollTop: 0,
    },
    300
  );
}

/**
 * @function error
 * Shows a error message at the top of the blogpost editor.
 *
 * @param {string} message - message to be displayed
 * 
 */
function error(message) {
  $("body").prepend(
    `<div class="alert alert-danger" role="alert">${message}</div>`
  );
  $("html, body").animate(
    {
      scrollTop: 0,
    },
    300
  );
}
