;(function ($) {
  const $highlight = $('.highlight')
  if ($highlight.length) {
    $highlight.each((index, ele) => {
      $(ele).addClass('bg-body-tertiary border rounded')
    })
  }
})(jQuery);