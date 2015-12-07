
function foo() {
}

$(document).ready(function() {
  var categoryData = getData();

  document.body.innerHTML += '<div id="default-categories">'
    +'<div id="default-inner-holder">'
      +formatTree(categoryData.default_tree)
    +'</div>'
  +'</div>';

  document.body.innerHTML += '<div id="target-categories">'
    +formatTree(categoryData.target_tree)
  +'</div>';

  updateMappingConsistency();

});


var updateMappingConsistency = function(){
  $('.mapping').each(function(index, item) {
    $('#' +item.getAttribute('data-mapped')).addClass('mapped');
  });
}

var formatTree = function(parentCategoryItems) {
  var result = '';
  parentCategoryItems.forEach(function(item) {
    var parentCategory = ""
    +'<div id="' +item.id +'" class="parent category">'
      +'<span>' +item.id +': ' +item.name +'</span>'
        +'<div class="sub-holder">'
          +formatSubCategories(item.sub_categories)
        +'</div>'
    +'</div>';
    result += parentCategory;
  });
  return result;
}

var formatSubCategories = function(subCategoryItems) {
  var result = '';
  subCategoryItems.forEach(function(item) {
    var subCategory = ""
      +'<div id="' +item.id +'" class="sub category">'
        +'<span>Sub ' +item.id +': ' +item.name +'</span>'
        +formatMappingItems(item.mapping)
      +'</div>';
    result += subCategory;
  });
  return result;
}

var formatMappingItems = function(mappings) {
var result = '';
  mappings.forEach(function(item) {
    var mapping = ""
      +'<div id="map-' +item +'" class="mapping", data-mapped="' +item  +'">'
        +'<span>' +item +'</span>'
      +'</div>';
    result += mapping;
  });
  return result;  
}