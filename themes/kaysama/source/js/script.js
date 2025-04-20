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

  // 处理展开收起
  $('.category-tree .toggle-trigger').on('click', function() {
    const $parent = $(this).parent();
    $parent.toggleClass('active');
    $parent.next('.sub-tree').toggle();
  });

  // 处理叶子节点点击跳转
  $('.category-tree .leaf, .category-tree .sub-leaf').on('click', function(e) {
    e.preventDefault();
    const path = e.target.dataset.path
    if(path) {
      window.location.href = location.origin + '/categories/' + path;
    }
  });

})(jQuery)