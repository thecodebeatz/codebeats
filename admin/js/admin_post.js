/**
 * This file is to be imported in ../admin_post.html which is the blog post editor which allows to create or editing blog posts.
 * ../config.js must also be imported in ../admin_post.html since it contains the definitions of some constants used in this file such as AWS keys (e.g. AWS_ACCESS_KEY)
 * 
 * @file This file includes all the functions used by the blogpost editor, such as:
 * - Connectivity to AWS DynamoDB and S3
 * - Retreiving blog post content from DynamoDB for blog post edition
 * - Uploading files and images to AWS S3
 * - User interface for blog post edition
 * - WYSIWYG used: summernote
 *
 * ! DO NOT UPLOAD ANY OF THE FILES WITHIN THE /admin FOLDER TO YOUR SERVER
 * ! The blog post editor is to be used ideally in your local machine, so you can easily
 * ! create or edit blog posts without exposing your AWS privileged access keys.
 *
 * @requires config.js
 * @requires {@link https://code.jquery.com/jquery-3.5.1.min.js|jquery}
 * @requires {@link https://summernote.org/|GitHub}
 */

/** Configure AWS parameters */
AWS.config.update({
  region: AWS_REGION,
  accessKeyId: AWS_ACCESS_KEY,
  secretAccessKey: AWS_SECRET_KEY,
});

/** Global variables used by several functions */
var selectedFileId = "1";
var selectedFile = "";
var selectedFileUrl = "";
var selectedFileIsImage = null;
var albumName = "";

/** Configure AWS objects for DynamoDB and S3  */
var dynamodb = new AWS.DynamoDB();
var docClient = new AWS.DynamoDB.DocumentClient();
var id = getQueryVariable("id"); // getting blog post id from URL, in case of blog post edition.
var s3 = new AWS.S3({
  apiVersion: "2006-03-01",
  params: { Bucket: AWS_S3_BUCKET },
});

/**
 * @function readItem
 * Whenever blog post editor is called, this funciton is called.
 * In case user wants to edit instead of creating a new blog post, data is retreived
 * from DynamoDB, and blog post data blog post editor HTML form fields (with Blogpost's title, summary, content, etc.).
 * 
 * * Depends on global constants (see config.js file).
 * * Depends on global variables (loaded at the beginning of this file):
 * *   - "docClient" -> DynamoDB object to perform get() requests to DynamoDB.
 * 
 */
function readItem() {
  if (id != false) {
    var params = {
      TableName: AWS_DYNAMO_TABLE,
      Key: {
        post_folder: id,
      },
    };

    docClient.get(params, function (err, data) {
      if (err) {
        Console.log(
          "Unable to read item: " + "\n" + JSON.stringify(err, undefined, 2)
        );
      } else {
        // Load form with blog post data from DynamoDB
        document.getElementById("post-title").value = data.Item.title;
        document.getElementById("tags").value = data.Item.post_tags;
        document.getElementById("post-summary").value = data.Item.summary;
        document.getElementById("post-date").innerHTML = dateToNiceString(
          data.Item.post_date
        );
        albumName = data.Item.post_folder;
        document.getElementById("publishNow").checked = data.Item.published;
        $("#editor").summernote("code", data.Item.post_body);

        // View images stored on S3 blog post subfolder
        viewBlogPostPhotos(data.Item.post_folder);

        // allow to set a featured image for this blog post only if user is editing (not creating a new) blog post.
        $("#featuredImageSection").html(
          `<form>
            <div class="form-group">
              <label for="featuredImage">Upload featured image:</label>
              <input type="file" class="form-control-file" id="featuredImage">
              <input type="button" value="Set as Featured Image" onclick="javascript:setAsFeaturedImage()" type="submit" class="btn btn-primary" style="margin:0.5em;border:none" />
            </div>
          </form>`
        );

        if (data.Item.image != null) {
          $("#featuredImageSection").append(`<img src="${SITE_CANONICAL_URL+data.Item.image}" style="width:auto;height:250px" />`);
        }


      }
    });
  }
}

window.onload = readItem();

/**
 * @function success
 * Shows a successful operation message at the top of the blogpost editor.
 *
 * @param {string} message - message to be displayed
 * 
 */
function success(message) {
  $(".post-header").prepend(
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
  $(".post-header").prepend(
    `<div class="alert alert-danger" role="alert">${message}</div>`
  );
  $("html, body").animate(
    {
      scrollTop: 0,
    },
    300
  );
}

/**
 * @function submit
 * Create or edit blog post. Sends form data to AWS DynamoDB.
 * If blog post creation/update is sucessful, upload attached images and files to AWS S3. by calling {@link addPhoto}
 * 
 * * Depends on global constants (see config.js file).
 * * Depends on global variables (loaded at the beginning of this file):
 * *   - "docClient" -> DynamoDB object to perform update() requests to DynamoDB.
 * * Depends on toSEOUrl funciton
 *
 * @param {string} message - message to be displayed
 */
function submit() {
  let date = new Date();
  let current_timestamp = date.toISOString();
  let title = document.getElementById("post-title").value;
  let summary = document.getElementById("post-summary").value;
  let post_body = $("#editor").summernote("code");
  let tags = document.getElementById("tags").value;
  let SEO_title = toSeoUrl(title);
  let publishNow = document.getElementById("publishNow").checked;

  // in case of blog post edition
  if (id != false) {
    const params = {
      TableName: AWS_DYNAMO_TABLE,
      Key: {
        post_folder: id,
      },
      UpdateExpression:
        "set title = :r, post_body=:p, date_modified=:d, post_tags=:t, summary=:s, published=:u",
      ExpressionAttributeValues: {
        ":r": title,
        ":p": post_body,
        ":d": current_timestamp,
        ":t": tags,
        ":s": summary,
        ":u": publishNow
      },
      ReturnValues: "UPDATED_NEW",
    };

    docClient.update(params, function (err, data) {
      if (err) {
        error(
          "Unable to read item: " + "\n" + JSON.stringify(err, undefined, 2)
        );
      } else {
        success("Blogpost updated succesfully 🙂");
        addPhoto(albumName);
      }
    });
  } else {
    // in case of new blog post creation
    const params = {
      TableName: AWS_DYNAMO_TABLE,
      Item: {
        post_date: current_timestamp,
        summary: summary,
        post_body: post_body,
        featured: false,
        title: title,
        image: null,
        date_modified: current_timestamp,
        published: publishNow,
        post_folder: SEO_title,
        post_tags: tags,
      },
    };

    albumName = SEO_title;

    docClient.put(params, function (err, data) {
      if (err) {
        error(
          "Unable to read item: " + "\n" + JSON.stringify(err, undefined, 2)
        );
      } else {
        success("Blogpost created succesfully 🙂");
        addPhoto(albumName);
      }
    });
  }
}

/**
 * @function setAsFeaturedImage
 * Set selected image as blog post's featured image on DynamoDB record.
 * 
 * * Depends on global constants (see config.js file).
 * * Depends on global variables (loaded at the beginning of this file):
 * *   - "albumName" -> Stores blog post folder name.
 * *   - "s3" -> Stores AWS S3 object.
 * *   - "docClient" -> DynamoDB object to perform update() requests to DynamoDB.
 * * Depends on resizeImage function
 *
 */
function setAsFeaturedImage() {
  // in case of blog post edition
  const file = document.getElementById("featuredImage").files[0];
  const featuredImageBase64Promise = resizeImage(file, 500, 500);

  featuredImageBase64Promise.then((featuredImageBase64) => {
    /*
      * It is possible to show the resized image on screen by uncommenting this block
      * I'd rather not do it... unnecessary IMHO. Let's just send it to AWS!
      */
    // const newImg = document.createElement("img");
    // const url = URL.createObjectURL(featuredImageBase64);
    // newImg.src = url;
    // document.body.appendChild(newImg);

    const fileName = "featuredImage.jpg";
    const albumPhotosKey = AWS_S3_BUCKET_SUBFOLDER + albumName + "/img/";
    const photoKey = albumPhotosKey + fileName;

    const upload = new AWS.S3.ManagedUpload({
      params: {
        Bucket: AWS_S3_BUCKET,
        Key: photoKey,
        Body: featuredImageBase64,
        CacheControl: "public, max-age=31536000",
        ContentType: "image/jpeg",
      },
    });
    const promise = upload.promise();
    promise.then(
      function (data) {
        // Whenever a file is uploaded, update progress message at the top of the blog post editor.
        success("Featured image successfully uploaded.");
        console.log(fileIsImage);
        const uploadedImageURL = photoKey;

        // Once the image is uploaded, let's also update the blog record to specify the featured image's URL.
        const params = {
          TableName: AWS_DYNAMO_TABLE,
          Key: {
            post_folder: id,
          },
          UpdateExpression: "set image=:f",
          ExpressionAttributeValues: {
            ":f": uploadedImageURL,
          },
          ReturnValues: "UPDATED_NEW",
        };

        docClient.update(params, function (err, data) {
          if (err) {
            error(
              "Unable to read item: " +
                "\n" +
                JSON.stringify(err, undefined, 2)
            );
          } else {
            success("Featured image updated sucessfully 🙂");
          }
        });
      },
      function (err) {
        error("There was an error uploading your photo: " + err.message);
      }
    );
  });
}

/**
 * @function addPhoto
 * Uploads ALL selected images and photos by user to AWS S3
 * 
 * * Depends on global constants (see config.js file).
 * * Depends on toSEOUrl function
 * 
 * @param {string} albumName - Name of the "folder" in S3 where photos and pictures will be uploaded.
 * 
 */
function addPhoto(albumName) {
  const files = document.getElementById("photoupload").files;
  if (!files.length) {
    return false;
  }

  for (let i = 0; i < files.length; i++) {
    let fileName = files[i].name;
    let albumPhotosKey = AWS_S3_BUCKET_SUBFOLDER + albumName + "/img/";

    let photoKey = albumPhotosKey + toSeoUrl(fileName);

    // Use S3 ManagedUpload class as it supports multipart uploads
    let upload = new AWS.S3.ManagedUpload({
      params: {
        Bucket: AWS_S3_BUCKET,
        Key: photoKey,
        Body: files[i],
        CacheControl: "public, max-age=31536000",
      },
    });

    let promise = upload.promise();

    promise.then(
      function (data) {
        // Whenever a file is uploaded, update progress message at the top of the blog post editor.
        $("#uploadPhotoStatus").html(
          `<strong>${i + 1}</strong> of <strong>${
            files.length
          }</strong> photos successfully uploaded.`
        );
        if (i == files.length - 1) {
          // if all photos were succesfully uploaded, display them on screen.
          viewBlogPostPhotos(albumName);
        }
      },
      function (err) {
        error("There was an error uploading your photo: " + err.message);
      }
    );
  }
}

/**
 * @function viewBlogPostPhotos
 * Shows thumbnails off all photos within an AWS folder on screen.
 * Thumbnails are clickable/selectable. Two buttons displayed at the bottom of the image 
 * that allows to either insert an image to the WYSIWYG editor or to delete them from AWS S3.
 * 
 * * Depends on global constants (see config.js file).
 * * Depends on global variables (loaded at the beginning of this file):
 * *   - "s3" -> Stores AWS S3 object.
 *
 * @param {string} albumName - Name of the "folder" in S3 where photos and pictures to display are located.
 * 
 */
function viewBlogPostPhotos(albumName) {
  const albumPhotosKey = AWS_S3_BUCKET_SUBFOLDER + albumName + "/";
  s3.listObjects({ Prefix: albumPhotosKey }, function (err, data) {
    if (err) {
      return console.log(
        "There was an error loading your pictures: " + err.message
      );
    }

    let photos = data.Contents.map(function (photo) {
      const photoKey = photo.Key;
      const photoUrl = SITE_CANONICAL_URL + encodeURIComponent(photoKey);
      fileIsImage(photoKey);

      if (fileIsImage(photoKey)) {
        // Use photoKey.hashCode() to generate a unique number for each image or file
        // This id will be used later through the DOM
        return (
            `<img 
            style="width:100px;height:auto;margin:1em" 
            class="thumbnail float-left" 
            id="${photoKey.hashCode()}" 
            title="${photoKey}" 
            src="${photoUrl}"
            onclick="javascript:selectFile('${photoKey}','${photoUrl}',true)" />`
        );
      } else {
        return (
          `<span class="fileAttachment">
            <img 
              style="width:100px;height:auto;margin:1em" 
              class="thumbnail float-left" 
              id="${photoKey.hashCode()}" 
              title="${photoKey}" 
              src="attachment.png"
              onclick="javascript:selectFile('${photoKey}','${photoUrl}',false)" />
              ${photoKey}
            </span>`
        );
      }
    });
    photos = `
    <div style="display:flex;align-items:center;margin:0 0 0.5em 0;width:100%;flex-wrap:wrap;border:#f04859 2px solid">
    ${photos.join(" ")}
    </div>
    <div class="form-group" style="padding:1em;display:flex;align-items:center;margin:0.5em 0 2em 0;width:100%;flex-wrap:wrap;border:#f04859 1px solid">
        <input type="button" value="Insert Pic." onclick="javascript:insertFile()" type="submit" class="btn btn-primary" style="margin:0.5em;border:none" />
        <input type="button" value="DELETE" onclick="javascript:deletePhoto()" type="submit" class="btn btn-primary" style="background-color:#f04859;margin:0.5em;border:none" />
    </div>`;
    document.getElementById("photoAlbum").innerHTML = photos;
  });
  // Automatically scroll down so user can see loaded images and files.
  $("html, body").animate(
    {
      scrollTop: $(document).height(),
    },
    500
  );
}

/**
 * @function selectFile
 * Whenever a user clicks a photo or file, its AWS S3 key is saved in the global variable selectedFile
 * Similarly, its URL is saved in the global variable selectedFileUrl.
 * 
 * * Depends on global variables (loaded at the beginning of this file):
 * *   - "selectedFileUrl" -> Temporarily stores the URL of the clicked photograph to later be either inserted
 * *                         to the WYSIWYG editor or be deleted from AWS S3.
 * *   - "selectedFileId" -> Stores tempory DOM id of the thumbnail selected.
 * *   - "selectedFileIsImage" -> Indicates whether selected file is an image or not.
 * *   - "selectedFile" -> Store temporary AWS S3 file key of the selected thumbnail.
 *
 * @param {string} fileKey - AWS S3 key of the image or file clicked.
 * @param {string} fileUrl - AWS URL of the image or file clicked.
 * 
 */
function selectFile(fileKey, fileUrl, fileIsImage) {
  $(".thumbnail").css("border", "");
  selectedFile = fileKey;
  selectedFileUrl = fileUrl;
  selectedFileId = fileKey.hashCode();
  selectedFileIsImage = fileIsImage;
  $(`#${selectedFileId}`).css("border", "solid 6px #f04859");
}

/**
 * @function insertFile
 * Adds whichever image or photo is currently selected to the WYSIWYG editor
 * To do this reads the value of global variable selectedFileUrl
 * 
 * * Depends on global variables (loaded at the beginning of this file):
 * *   - "selectedFileUrl" -> Temporarily stores the URL of the clicked photograph to later be either inserted
 * *                           to the WYSIWYG editor or be deleted from AWS S3.
 * *   - "selectedFileIsImage" -> Indicates whether selected file is an image or not.
 *
 */
function insertFile() {
  if (selectedFileIsImage === true) {
    $("#editor").summernote(
      "pasteHTML",
      '<img src="' + selectedFileUrl + '" />'
    );
  } else {
    $("#editor").summernote(
      "pasteHTML",
      '<p><a href="' + selectedFileUrl + '">📎 Download <strong>'+selectedFile+'</strong></a></p>'
    );
  }
}

/**
 * @function deletePhoto
 * Deletes whichever image or photo is currently selected from AWS S3 bucket.
 * To do this reads the value of global variable selectedFile.
 * Once deleted from S3, removes photo from screen
 * 
 * * Depends on global variables (loaded at the beginning of this file):
 * *   - "selectedFileId" -> Stores tempory DOM id of the thumbnail selected.
 * *   - "selectedFile" -> Store temporary AWS S3 file key of the selected thumbnail.
 * *   - "s3" -> Stores AWS S3 object.
 *
 */
function deletePhoto() {
  let r = confirm("Sure?");

  if (r == true) {
    s3.deleteObject({ Key: selectedFile }, function (err, data) {
      if (err) {
        return console.log(
          "There was an error deleting your photo: ",
          err.message
        );
      }
      console.log("Successfully deleted photo.");
      $(`#${selectedFileId}`).remove();
    });
  }
}

// Useful functions

/**
 * @function getQueryVariable
 * Get variable from URL
 *
 * @param {string} Variable id to read from URL
 * @returns {string} Value of the variable
 */
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

/**
 * @method hashCode
 * returns the hash code of a string
 *
 * @returns {string} returns the hash code of a string.
 * @see {@link https://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/}
 */
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

/**
 * @function toSeoUrl
 * Converts a string to URL and SEO friendly format, by removing and replacing unnecessary characters.
 *
 * @param {string} url string which needs to be converted to URL friendly string
 * @returns {string} URL friendly string
 */
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

/**
 * @function dateToNiceString
 * Converts date timestamp to format Mon DD, YYYY
 *
 * @param {string} myDateInput a string representing a timestamp.
 * @returns {string} A string representation of the date following the format Mon DD, YYYY (e.g. Jan 1, 2021)
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
  // const hours = myDate.getHours();
  // const minutes = myDate.getMinutes();
  return (
    month[myDate.getMonth()] +
    " " +
    myDate.getDate() +
    ", " +
    myDate.getFullYear()
  );
}

/**
 * @function fileIsImage
 * Determines if file extension corresponds to an image.
 *
 * @param {string} fileName - Filename (must include extension).
 * @returns {boolean} true if filename corresponds to a valid image extension (jpg, png, etc.). Return false otherwise.
 * 
 */
function fileIsImage(fileName){
  const extension = fileName.substring(fileName.length-3, fileName.length);
  const extension2 = fileName.substring(fileName.length-4, fileName.length);
  const imageExtensions = ["png","jpg","gif","jpeg","webp"];
  if (imageExtensions.includes(extension) || imageExtensions.includes(extension2)) {
    return true;
  } else {
    return false;
  }
}

/**
 * @function resizeImage
 * Resizes image
 *
 * @param {number} newImageWidth - New image width size
 * @param {number} [newFrameWidth=null] - New width of image's canvas/frame; if null (default), it will be set to the new width of the image. If newFrameWidth is less than newImageWidth, image will be cropped.
 * @param {number} [newFrameHeight=null] - New height of the image's canvas/frame; if null(default), it will be set to the new height of the image. If newFrameHeight is less than the new height of the image, image will be cropped.
 * @param {number} [newImageHeight=null] - New height of the image; if null (default), new height will be calculated automatically by keeping original ratio.
 * @returns {blob} Promise => either a base64 resized JPEG image in case of resolve, or error in case of rejection.
 * 
 */
function resizeImage(
  filePath,
  newImageWidth,
  newFrameWidth = null,
  newFrameHeight = null,
  newImageHeight = null
) {
  imageResizePromise = new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(filePath);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      (img.onload = () => {
        if (newFrameWidth == null) {
          newFrameWidth = newImageWidth;
        }

        if (newImageHeight == null) {
          newImageHeight = img.height * (newImageWidth / img.width);
        }

        if (newFrameHeight == null) {
          newFrameHeight = newImageHeight;
        }

        const elem = document.createElement("canvas");
        elem.width = newFrameWidth;
        elem.height = newFrameHeight;

        const ctx = elem.getContext("2d");
        ctx.drawImage(img, 0, 0, newImageWidth, newImageHeight);
        ctx.canvas.toBlob(
          (blob) => {
            resolve(blob); // return base64 image
          },
          "image/jpeg",
          1 // 1 = high quality
        );
      }),
        (reader.onerror = (error) => reject(error));
    };
  });
  return imageResizePromise;
}
