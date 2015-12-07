
var data = ###categoryData###;

var getData = function() {
  return data;
}

var getCategory = function(id) {
  var result;
  getData().default_tree.forEach(function(item, index) {
    if(item.id == id) {
      result = item;
    } else if(item.sub_categories.length > 0){
      item.sub_categories.forEach(function(subItem) {
        if(subItem.id == id) {
          result = {
            parentId: item.id,
            parentName: item.name,
            id: id,
            name: subItem.name
          };
        }
      });
    }
  });
  return result;
}


$(document).ready(function() {
  var categoryData = getData();

  document.body.innerHTML += '<div id="default-categories">'
    +'<div id="default-inner-holder">'
      +formatTree(categoryData.default_tree, 'default')
    +'</div>'
  +'</div>';

  document.body.innerHTML += '<div id="target-categories">'
    +formatTree(categoryData.target_tree, 'target')
  +'</div>';

  updateMappingConsistency();

});


var updateMappingConsistency = function(){
  $('.sub.category.glurk').each(function(index, item) {
    var element = $('#' +item.getAttribute('id'));
      element.addClass('mapped');
  });
}



var formatTree = function(parentCategoryItems, tag) {
  console.log('formatTree');
  console.log(parentCategoryItems);
  var result = '';
  parentCategoryItems.forEach(function(item) {
    var parentCategory = ""
    +'<div id="' +item.id +'" class="parent category ' +tag +'">'
      +'<div>' +item.id +': ' +item.name +'</div>'
        +'<div class="sub-holder">'
          +formatSubCategories(item.sub_categories, tag)
        +'</div>'
    +'</div>';
    result += parentCategory;
  });
  return result;
}

var formatSubCategories = function(subCategoryItems, tag) {
  var result = '';
  subCategoryItems.forEach(function(item) {
    var subCategory = ""
      +'<div id="' +item.id +'" class="sub category ' +tag +'">'
        +'<div>' +item.id +': ' +item.name +'</div>'
        +formatMappingItems(item.mapping)
      +'</div>';
    result += subCategory;
  });
  return result;
}

var formatMappingItems = function(mappings) {
  var result = '';
  if(!mappings || mappings.length < 1) {
    return result;
  }

  // First bild a tree of the mappings
  var idTree = [];
  mappings.forEach(function(item) {
    var fullItem = getCategory(item);
    idTree[fullItem.parentId] = idTree[fullItem.parentId] || [];
    idTree[fullItem.parentId][fullItem.id] = [];
  });


  console.log('idTree');
  console.log(idTree);

  mt = fillIdTree(idTree);
  console.log('filledTree');
  console.log(mt);
  result = formatTree(mt, 'glurk');
  // Then render tree hiearchy
  mappings.forEach(function(item) {
    var fullItem = getCategory(item);
    var mapping = ""
      +'<div id="map-' +item +'" class="mapping", data-mapped="' +item  +'">'
        +'<span>' +fullItem.parent +' '+fullItem.name +'</span>'
      +'</div>';
    //result += mapping;
  });
  return result;  
}


var fillIdTree = function(tree) {
  var mt = [];
  tree.forEach(function(item, index) {
    console.log('###start###');
    console.log(item);
    console.log(index);

    var fullItem = getCategory(index);
    console.log(fullItem);
    console.log('#######');
    if(fullItem) {
      mt.push({
        id: fullItem.id,
        name: fullItem.name,
        sub_categories: fillIdTree(item)
      })
    }
  });
  return mt;
}

