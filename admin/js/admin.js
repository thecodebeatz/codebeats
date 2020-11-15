AWS.config.update({
  region: AWS_REGION,
  accessKeyId: AWS_ACCESS_KEY,
  secretAccessKey: AWS_SECRET_KEY,
});

var dynamodb = new AWS.DynamoDB();
var docClient = new AWS.DynamoDB.DocumentClient();
var s3 = new AWS.S3({
  apiVersion: "2006-03-01",
  params: { Bucket: AWS_S3_BUCKET },
});

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
          '\')" href="#">[delete]</a>           <span class="posts-list-item-description">📅 created: ' +
          dateToNiceString(Blogpost.post_date) +
          " - modified: " +
          dateToNiceString(Blogpost.date_modified) +
          "          </span>        </li>";
      });

      document.getElementById("posts-list").innerHTML += posts;
    }
  }
}
window.onload = scanData();

function createSiteMap() {
  let r = confirm("Sure?");

  if (r == true) {
    const event = new Date();

    const params = {
      TableName: AWS_DYNAMO_TABLE,
      ProjectionExpression:
        "title, post_folder, post_body, date_modified",
    };

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
          '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>http://codebeats.ml/</loc><lastmod>' +
          event.toISOString() +
          "</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>";
        data.Items.forEach(function (Blogpost) {
          posts +=
            `<url><loc>${SITE_CANONICAL_URL}${BLOG_SEO_SUBFOLDER}/${Blogpost.post_folder}</loc><lastmod>${Blogpost.date_modified}</lastmod><changefreq>monthly</changefreq></url>`;
        });
        posts += "</urlset>";
        console.log(posts);

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

function dateToUnix(dateString) {
  return new Date(dateString).getTime();
}

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