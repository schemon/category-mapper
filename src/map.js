
var data = ###categoryData###

var getData = function() {
  return data
}

var getCategory = function(id) {
  var result
  var inDefault = getCategoryFromTree(id, getData().default_tree)
  var inTarget = getCategoryFromTree(id, getData().target_tree)
  
  if(!$.isEmptyObject(inDefault)) {
    result = inDefault
  } else {
    result = inTarget
  }

  return result
}

var getCategoryFromTree = function(id, tree) {
  var result = {}
  tree.forEach(function(item, index) {
    if(item.id == id) {
      result = item
    } else if(item.sub_categories.length > 0){
      item.sub_categories.forEach(function(subItem) {
        if(subItem.id == id) {
          result = {
            parentId: item.id,
            parentName: item.name,
            id: id,
            name: subItem.name
          }
        }
      })
    }
  })
  return result
}


$(document).ready(function() {

  document.body.innerHTML += '<div id="default-categories"></div>'
  document.body.innerHTML += '<div id="target-categories"></div>'

  refreshViews()

})


var refreshViews = function() {
  var categoryData = getData()
  refreshTree(categoryData.default_tree, 'default')
  refreshTree(categoryData.target_tree, 'target')
  updateMappingConsistency()
  attachClickEvents()
}

var attachClickEvents = function() {


  $('.category.default').on('mouseover', function(e){
    e.stopPropagation()
    $(this).addClass('hover')
    })
  .on('mouseout', function(e){
    $(this).removeClass('hover')
  })
}

var setData = function(newData) {
  data = newData
}

var refreshTree = function(data, treeName) {
  $('#' +treeName +"-categories").html(formatTree(data, treeName))
}

$(document).keyup(function(e) {

  if (e.keyCode == 27) { // Escape
    $('.marked').removeClass('marked')
  }

  if(e.keyCode == 46) { // Delete
    //deleteMarkedItems()
    //refreshViews()
  }
})

var deleteMarkedItems = function() {
  $('.marked').each(function(index, item) {
   var id = item.getAttribute('id')
    deleteItem(id)
  })
}

var deleteItem = function(idToRemove) {
  var dataToKeep = data.target_tree.filter(item => {
    item.sub_categories = item.sub_categories.filter(item => {
      item.mapping = item.mapping.filter(item => {
        return item != idToRemove
      })
      return item.id != idToRemove
    })
    return item.id != idToRemove
  })

  data.target_tree = dataToKeep
}


var updateMappingConsistency = function(){
  $('.sub.category.mapping').each(function(index, item) {
    var element = $('#' +item.getAttribute('id'))
      element.addClass('mapped')
  })
}

var formatTree = function(parentCategoryItems, tag) {
  var result = []
  parentCategoryItems.forEach(function(item) {

    var parentCategory = $('<div id="'+item.id +'" class="category ' +tag +'"></div>')

    
    var meAndMyChildren = []
    var children = {}

    if(item.sub_categories) {
      meAndMyChildren = item.sub_categories.map(item => item.id)
      children = formatTree(item.sub_categories, tag +" sub")
    }
    meAndMyChildren.push(item.id)


    parentCategory.click(e => {
      meAndMyChildren.forEach(item => {
        $('#'+item).addClass('marked')
      })
      e.stopPropagation()
    })

    var mapping = {}
    if(item.mapping) {
      mapping = formatMappingItems(item.mapping, tag)
    }

    // Head
    var head = $('<div></div>')
    head.append(item.id +': ' +item.name)

    head.append(createControls(item.id, meAndMyChildren, tag))

    parentCategory.append(head)
    parentCategory.append(children)
    parentCategory.append(mapping)

    result.push(parentCategory)
  })
  return result
}

var createControls = function(me, meAndMyChildren, tag) {
  var holder = $('<div class="control-holder"></div>')

  holder.append(createControl('X', tag +' control', e => {
    meAndMyChildren.forEach((item, index) => {
      deleteItem(item)
    })
    refreshViews()
  }))

  holder.append(createControl('<', tag +' control move', e => {
    index = data.target_tree.findIndex((item, index) => {
      console.log(item)
      return item.id == me
    })

    data.target_tree.move(index, (index-1))
    refreshViews()
  }))

  holder.append(createControl('>', tag +' control move', e => {
    index = data.target_tree.findIndex((item, index) => {
      console.log(item)
      return item.id == me
    })

    data.target_tree.move(index, (index+1))
    refreshViews()
  }))

  return holder;
}

Array.prototype.move = function (old_index, new_index) {
  if(old_index < 0 || new_index < 0) {
    return this
  }

  while (old_index < 0) {
      old_index += this.length;
  }
  while (new_index < 0) {
      new_index += this.length;
  }
  if (new_index >= this.length) {
      var k = new_index - this.length;
      while ((k--) + 1) {
          this.push(undefined);
      }
  }
  this.splice(new_index, 0, this.splice(old_index, 1)[0]);
  return this; // for testing purposes
};


var createControl = function(name, tag, onClick) {
  var control = $('<div></div>')
  control.addClass(tag)
  control.append(name)

  control.click(onClick)

  control.on('mouseover', function(e){
    e.stopPropagation()
    $(this).addClass('hover')
    })
  .on('mouseout', function(e){
    $(this).removeClass('hover')
  })

  return control
}

var formatMappingItems = function(mappings) {
  if(!mappings || mappings.length < 1) {
    return []
  } else {
    var idTree = buildIdTree(mappings)
    var mt = fillIdTree(idTree)
    return formatTree(mt, 'mapping')
  }
}

var buildIdTree = function(ids) {
  var idTree = []
  ids.forEach(function(item) {
    var fullItem = getCategory(item)

    idTree[fullItem.parentId] = idTree[fullItem.parentId] || []
    idTree[fullItem.parentId][fullItem.id] = []
  })
  return idTree  
}


var fillIdTree = function(tree) {
  var mt = []
  tree.forEach(function(item, index) {
    var fullItem = getCategory(index)

    if(fullItem) {
      mt.push({
        id: fullItem.id,
        name: fullItem.name,
        sub_categories: fillIdTree(item)
      })
    }
  })
  return mt
}
