AWS.config.update({
  region: AWS_REGION,
  accessKeyId: AWS_ACCESS_KEY,
  secretAccessKey: AWS_SECRET_KEY,
});

var selectedPhotoId = "1";
var selectedPhoto = "";
var selectedPhotoUrl = "";
var albumName = "";

var dynamodb = new AWS.DynamoDB();
var docClient = new AWS.DynamoDB.DocumentClient();
var id = getQueryVariable("id");
var s3 = new AWS.S3({
  apiVersion: "2006-03-01",
  params: { Bucket: AWS_S3_BUCKET },
});

function readItem() {
  if (id != false) {
    console.log(id);

    var params = {
      TableName: AWS_DYNAMO_TABLE,
      Key: {
        postid: id,
      },
    };

    docClient.get(params, function (err, data) {
      if (err) {
        Console.log(
          "Unable to read item: " + "\n" + JSON.stringify(err, undefined, 2)
        );
      } else {
        document.getElementById("post-title").value = data.Item.title;
        document.getElementById("tags").value = data.Item.post_tags;
        document.getElementById("post-summary").value = data.Item.summary;
        document.getElementById("post-date").innerHTML = dateToNiceString(
          data.Item.post_date
        );
        albumName = data.Item.post_folder;
        $("#editor").summernote("code", data.Item.post_body);
        viewBlogPostPhotos(data.Item.post_folder);
      }
    });
  }
}

function success(message) {

    $('.post-header').prepend(`<div class="alert alert-success" role="alert">${message}</div>`);
    $("html, body").animate({
        scrollTop: 0
    }, 300); 

}

function error(message) {
    $('.post-header').prepend(`<div class="alert alert-danger" role="alert">${message}</div>`);
    $("html, body").animate({
        scrollTop: 0
    }, 300); 
}


function submit() {
  if (id != false) {
    const event = new Date();

    const params = {
      TableName: AWS_DYNAMO_TABLE,
      Key: {
        postid: id,
      },
      UpdateExpression:
        "set title = :r, post_body=:p, date_modified=:d, post_tags=:t, summary=:s", //post_folder=:u,
      ExpressionAttributeValues: {
        ":r": document.getElementById("post-title").value,
        ":p": $('#editor').summernote('code'),
        ":d": event.toISOString(),
        //":u": toSeoUrl(document.getElementById('post-title').value), //comentamos aquí para no tener que mover las imágenes de folder
        ":t": document.getElementById("tags").value,
        ":s": document.getElementById("post-summary").value,
      },
      ReturnValues: "UPDATED_NEW",
    };

    docClient.update(params, function (err, data) {
      if (err) {
        error("Unable to read item: " + "\n" + JSON.stringify(err, undefined, 2));
      } else {
        success("Blogpost updated succesfully 🙂");
        addPhoto(albumName);
      }
    });
  } else {
    const event = new Date();

    const params = {
      TableName: AWS_DYNAMO_TABLE,
      Item: {
        postid: uuidv4(),
        post_date: event.toISOString(),
        summary: document.getElementById("post-summary").value,
        post_body: $('#editor').summernote('code'),
        featured: false,
        title: document.getElementById("post-title").value,
        image: "none",
        date_modified: event.toISOString(),
        published: false,
        post_folder: toSeoUrl(document.getElementById("post-title").value),
        post_tags: document.getElementById("tags").value,
      },
    };

    albumName = toSeoUrl(document.getElementById("post-title").value);

    docClient.put(params, function (err, data) {
      if (err) {
        error("Unable to read item: " + "\n" + JSON.stringify(err, undefined, 2));
      } else {
        success("Blogpost created succesfully 🙂");
        addPhoto(albumName);
      }
    });
  }
}


function addPhoto(albumName) {
  const files = document.getElementById("photoupload").files;
  if (!files.length) {
    return false;
  }

  for (let i = 0; i < files.length; i++) {
    let fileName = files[i].name;
    let albumPhotosKey = "posts/" + albumName + "/img/";

    let photoKey = albumPhotosKey + toSeoUrl(fileName);

    // Use S3 ManagedUpload class as it supports multipart uploads
    let upload = new AWS.S3.ManagedUpload({
      params: {
        Bucket: AWS_S3_BUCKET,
        Key: photoKey,
        Body: files[i],
        ACL: "public-read",
        CacheControl: "public, max-age=31536000",
      },
    });

    let promise = upload.promise();

    promise.then(
      function (data) {
        $("#uploadPhotoStatus").html(`<strong>${i+1}</strong> of <strong>${files.length}</strong> photos successfully uploaded.`);
        if (i == (files.length-1)){
            viewBlogPostPhotos(albumName);
        }
      },
      function (err) {
        console.log("There was an error uploading your photo: ", err.message);
      }
    );
  }
}

function viewBlogPostPhotos(albumName) {
  const albumPhotosKey = "posts/" + albumName + "/";
  s3.listObjects({ Prefix: albumPhotosKey }, function (err, data) {
    if (err) {
      return console.log(
        "There was an error loading your pictures: " + err.message
      );
    }

    // 'this' references the AWS.Response instance that represents the response
    const href = this.request.httpRequest.endpoint.href;
    const bucketUrl = href + AWS_S3_BUCKET + "/";

    let photos = data.Contents.map(function (photo) {
      const photoKey = photo.Key;
      const photoUrl = bucketUrl + encodeURIComponent(photoKey);
      return (
        '<img style="width:100px;height:auto;margin:1em" class="thumbnail float-left" id="' +
        photoKey.hashCode() +
        '" title="' +
        photoKey +
        '" src="' +
        photoUrl +
        '" onclick="selectPhoto(\'' +
        albumName +
        "','" +
        photoKey +
        "','" +
        photoUrl +
        "')\" />"
      );
    });

    photos = `
    <div style="display:flex;align-items:center;margin:2em 0 0.5em 0;width:100%;flex-wrap:wrap;border:#f04859 1px solid">
    ${photos.join(
      " "
    )}
    </div>
    <div class="form-group" style="padding:1em;display:flex;align-items:center;margin:0.5em 0 2em 0;width:100%;flex-wrap:wrap;border:#f04859 1px solid">
        <input type="button" value="Insert Pic." onclick="javascript:insertPhoto()" type="submit" class="btn btn-primary" style="margin:0.5em;border:none" />
        <input type="button" value="DELETE" onclick="javascript:deletePhoto()" type="submit" class="btn btn-primary" style="background-color:#f04859;margin:0.5em;border:none" />
    </div>`;
    document.getElementById("photoAlbum").innerHTML = photos;
  });

    $("html, body").animate({
    scrollTop: $(document).height()
    }, 500); 
}


function selectPhoto(albumName, photoKey, photoUrl) {
    $(".thumbnail").css("border", "");
    selectedPhoto = photoKey;
    selectedPhotoUrl = photoUrl;
    selectedPhotoId = photoKey.hashCode();
    $(`#${selectedPhotoId}`).css("border", "solid 6px #f04859");
  }
  

function insertPhoto() {
    $('#editor').summernote('pasteHTML',"<img src=\""+selectedPhotoUrl+"\" />");
}

function deletePhoto() {
    let r = confirm("Sure?");

    if (r == true) {
        s3.deleteObject({ Key: selectedPhoto }, function(err, data) {
          if (err) {
            return console.log("There was an error deleting your photo: ", err.message);
 
          }
          console.log("Successfully deleted photo.");
          $(`#${selectedPhotoId}`).remove();
        });
    }
}

window.onload = readItem();

// Useful functions

function uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
      (
        c ^
        (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
      ).toString(16)
    );
}

function getQueryVariable(variable) {
  const query = window.location.search.substring(1);
  const vars = query.split("&");
  for (let i = 0; i < vars.length; i++) {
    let pair = vars[i].split("=");
    if (pair[0] == variable) {
      return pair[1];
    }
  }
  return false;
}

Object.defineProperty(String.prototype, "hashCode", {
  value: function () {
    var hash = 0,
      i,
      chr;
    for (i = 0; i < this.length; i++) {
      chr = this.charCodeAt(i);
      hash = (hash << 5) - hash + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  },
});

function toSeoUrl(url) {
    return url
      .toString() // Convert to string
      .normalize("NFD") // Change diacritics
      .replace(/[\u0300-\u036f]/g, "") // Remove illegal characters
      .replace(/\s+/g, "-") // Change whitespace to dashes
      .toLowerCase() // Change to lowercase
      .replace(/&/g, "-and-") // Replace ampersand
      .replace(/[^a-z0-9\-]/g, "") // Remove anything that is not a letter, number or dash
      .replace(/-+/g, "-") // Remove duplicate dashes
      .replace(/^-*/, "") // Remove starting dashes
      .replace(/-*$/, ""); // Remove trailing dashes
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
    const hours = myDate.getHours();
    const minutes = myDate.getMinutes();
    return (
      month[myDate.getMonth()] +
      " " +
      myDate.getDate() +
      ", " +
      myDate.getFullYear()
    );
  }