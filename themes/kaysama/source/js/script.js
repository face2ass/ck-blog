(function ($) {
  // const $blogPostContent = $('#blog-post-content')
  // if ($blogPostContent.length) {
  //   const $blockquote = $blogPostContent.find('blockquote')
  //   if ($blockquote.length) {
  //     $blockquote.each((index, ele) => {
  //       $(ele).addClass('blockquote')
  //     })
  //   }
  // }
  const $highlight = $('.highlight')
  if ($highlight.length) {
    $highlight.each((index, ele) => {
      $(ele).addClass('bg-body-tertiary border rounded')
    })
  }

  // data-bs-theme="dark"
  // document.documentElement
})(jQuery)