(function (window, $) {
  $(document).ready(function () {
    if ($.fn.markdown) {

      $('.markdown-enabled').markdown({

        additionalButtons: [
                [{
            name: "groupCustom",
            data: [{
              name: "cmdBadge",
              title: "Add a badge",
              icon: "glyphicon glyphicon-certificate",
              callback: function (e) {
                // Replace selection with some drinks
                var chunk, cursor,
                  selected = e.getSelection();
                // transform selection and set the cursor into chunked text
                e.replaceSelection('[[' + (e.getSelection().text || '42') + ']]');
                cursor = selected.start;

                // Set the cursor
                e.setSelection(cursor + 2, cursor + selected.length + 2)
              }
                    }, {
              name: "cmdTags",
              title: "Add a label",
              icon: "glyphicon glyphicon-tags",
              callback: function (e) {
                // Replace selection with some drinks
                var chunk, cursor,
                  selected = e.getSelection();
                // transform selection and set the cursor into chunked text
                e.replaceSelection('||' + (e.getSelection().text || 'This is a label!') + '|info||');
                cursor = selected.start;

                // Set the cursor
                e.setSelection(cursor + 2, cursor + selected.length + 2)
              }
                    }, {
              name: "cmdIcon",
              title: "Add a label",
              icon: "glyphicon glyphicon-th-large",
              callback: function (e) {
                bootbox.dialog({
                  message: '<img class="col-md-4 col-md-offset-4" src="/images/load/spinner-256.gif" />',
                  title: "Select an icon",
                  buttons: {}
                });
                $('.bootbox-body').addClass('row');
                $('.bootbox-body').addClass('loading-bb');
                $.ajax({
                  url: '/api/ajax/glyphicons',
                  success: function (data) {
                    $('.bootbox-body').fadeOut(150, function () {
                      $('.bootbox-body').removeClass('loading-bb');
                      console.log(data);
                      $('.bootbox-body').html(data);
                      $('[name="login"]').remove();
                      $('.icon-item').click(function (event) {
                        var icon = $(this).attr('data-x-icon');
                        var selected = e.getSelection();
                        // transform selection and set the cursor into chunked text
                        e.replaceSelection('::|' + icon + '::');
                        var cursor = selected.start;

                        // Set the cursor
                        e.setSelection(cursor)
                        bootbox.hideAll();
                      })
                      $('.bootbox-body').fadeIn(150);

                    })
                  }
                })
              }
                    }, ]
                }, {
            name: 'groupUtil',
            data: [{
              name: "cmdHelp",
              title: "Help",
              btnClass: 'btn btn-info btn-sm',
              btnText: '<img width="22" src="images/markdown-mark.svg" />  Help',
              callback: function (e) {
                bootbox.dialog({
                  message: '<img class="col-md-4 col-md-offset-4" src="/images/load/spinner-256.gif" />',
                  title: "Help: Markdown Cheatsheet",
                  buttons: {}
                });
                $('.bootbox-body').addClass('row');
                $('.bootbox-body').addClass('loading-bb');
                $.ajax({
                  url: '/help/markdown-cs.md',
                  success: function (data) {
                    $('.bootbox-body').fadeOut(150, function () {
                      $('.bootbox-body').removeClass('loading-bb');
                      $('.bootbox-body').html(data);
                      $('.bootbox-body').fadeIn(150);

                    })
                  }
                })
              }
                    }, ]
                }]
            ],

        onPreview: function (e) {
          if (!window.XMLHttpRequest) return '<b>Please update your browser or enable XHR</b>';
          var req = new window.XMLHttpRequest();

          req.open('POST', '/api/ajax/parse.md', false);
          req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

          req.send(JSON.stringify({
            markdown: e.getContent()
          }))
          return req.responseText;
        }
      });
    }
  });
})(window, jQuery);
