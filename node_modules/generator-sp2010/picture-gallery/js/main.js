(function($) {
  $(function() {
    var $gallery = $("#showcase");
    // We'll use a handlebars template to create each slide http://handlebarsjs.com/
    var tplSlide = Handlebars.compile( $("#showcase-slide-template").html() );

    // Fetch the images from SP2010 using REST
    $.getJSON('/_vti_bin/listData.svc/Pictures', function(data) {

      // Process the returned data into something more meaningful
      var images = $.map(data.d.results, function(pic) {

        return {
          src: pic.__metadata.media_src,
          alt: pic.Title,
          width: pic.PictureWidth,
          height: pic.PictureHeight,
          thumb: pic.Path + thumbFromName(pic.Name)
        }
      });

      // Populate the carousel with slides
      $.each(images, function(i, pic) {
        $gallery.append(tplSlide(pic));
      });

      // Activate the carousel http://showcase.awkwardgroup.com/index4.html
      $gallery.awShowcase({
        thumbnails: true,
        thumbnails_position: 'outside-last',
        thumbnails_direction: 'horizontal'
      });

      // SP2010 automatically generates a jpg thumbnail for all images in Picture Libraries
      // ./LibraryName/PictureName.png -> ./LibraryName/_t/PictureName_png.jpg
      // A great tool for visualizing RegExps is http://www.regexper.com/
      function thumbFromName(picName) {
        return '/_t/' + picName.replace(/\.([^\.]*)$/, '_$1') + '.jpg';
      }
    });
  });
})(jQuery);
