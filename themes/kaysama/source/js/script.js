;(function ($) {
  const $highlight = $('.highlight')
  if ($highlight.length) {
    $highlight.each((index, ele) => {
      $(ele).addClass('bg-body-tertiary border rounded')
    })
  }

  const $tagToggleTrigger = $('.tag-toggle-trigger')
  const $tagItemWrap = $('.tag-list')
  if ($tagToggleTrigger.length) {
    $tagToggleTrigger.click(() => {
      console.log('$tagItemWrap:', $tagItemWrap)
      $tagItemWrap.toggleClass('expanded', (e)=>{
        console.log(e)
      })
    })
  }

})(jQuery)