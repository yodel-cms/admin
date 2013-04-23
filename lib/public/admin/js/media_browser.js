$('.browser a').click(function(event) {
  event.preventDefault();
  var win = tinyMCEPopup.getWindowArg("window");
  var url = $(event.target).attr('data-url');
  win.document.getElementById(tinyMCEPopup.getWindowArg("input")).value = url;
  if (typeof(win.ImageDialog) != "undefined") {
    if (win.ImageDialog.getImageData)
      win.ImageDialog.getImageData();
    if (win.ImageDialog.showPreviewImage)
      win.ImageDialog.showPreviewImage(url);
  }
  tinyMCEPopup.close();
});
