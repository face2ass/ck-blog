(function($){
  const $blogPostContent = $('#blog-post-content')
  if($blogPostContent.length) {
    const $blockquote = $blogPostContent.find('blockquote')
    if($blockquote.length) {
      $blockquote.each((index, ele) => {
        $(ele).addClass('blockquote')
      })
    }
  }
})(jQuery);