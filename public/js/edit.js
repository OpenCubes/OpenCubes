(function () {
  // Variable to store your files
  var files;

  // Add events
  $(document).on('change', 'input.ajax-upload[type=file]', prepareUpload);

  // Grab the files and set them to our variable
  function prepareUpload(event) {
    files = event.target.files;
    uploadFiles(event);
  }

  // Catch the form submit and upload the files
  function uploadFiles(event) {
    event.stopPropagation(); // Stop stuff happening
    event.preventDefault(); // Totally stop stuff happening
    alert('upload')

    // START A LOADING SPINNER HERE

    // Create a formdata object and add the files
    var data = new FormData();
    $.each(files, function (key, value) {
      data.append(key, value);
    });

    $.ajax({
      url: '/mod/' + $.slug + '/edit/logo/upload',
      type: 'POST',
      data: data,
      cache: false,
      dataType: 'json',
      processData: false, // Don't process the files
      contentType: false, // Set content type to false as jQuery will tell the server its a query string request
      success: function (data, textStatus, jqXHR) {
        if (typeof data.error === 'undefined') {
          // Success so call function to process the form
          submitForm(event, data);
        } else {
          // Handle errors here
          console.log('ERRORS: ' + data.error);
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        // Handle errors here
        console.log('ERRORS: ' + textStatus);
        // STOP LOADING SPINNER
      }
    });
  }

})();
