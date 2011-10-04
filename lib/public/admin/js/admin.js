var MENU_WIDTH = 371;

// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

function initialiseWidgets() {
  hideModelPanel();
  initialiseHTMLFields();
  initialiseMultipleSelectFields();
  addClearLinks();
}

function initialiseHTMLFields() {
  $('textarea.html').each(function(index, field) {
    $(field).tinymce({
  		script_url : '/admin/tiny_mce/tiny_mce.js',
  		theme : "advanced",
    	plugins : "safari,inlinepopups,paste",
      width: '100%',
    	height: '200',
    	theme_advanced_blockformats: 'p,h1,h2,h3',

    	theme_advanced_buttons1 : "bold,italic,underline,strikethrough,sub,sup,charmap,|,justifyleft,justifycenter,justifyright,justifyfull,|,formatselect,fontsizeselect,|,bullist,numlist,outdent,indent,blockquote,|,link,unlink,|,code",
    	theme_advanced_buttons2 : '',
    	theme_advanced_buttons3 : '',
    	theme_advanced_toolbar_location : "top",
    	theme_advanced_toolbar_align : "left",
    	theme_advanced_statusbar_location : "none",
    	theme_advanced_resizing : false
  	});
  });
}

function initialiseMultipleSelectFields() {
  $('select[multiple=multiple]').chosen();
}

function addClearLinks() {
  $('#record_form .field-type-attachment p, #record_form .field-type-image p').each(function(index, p) {
    var clear = $('<a class="clear">clear</a>');
    $(p).append(clear);
    if($(p).find('span').html() == 'none')
      clear.hide();
  });
}

$('#admin_save button').click(function(event) {
  $('#admin_save_spinner').fadeIn().delay(1000).fadeOut();
  $('#admin_save_success').delay(1500).fadeIn().delay(2000).fadeOut();
});



var menus = {};

function showMenu(parentName, recordID, initialLoad) {
	if(menus[recordID]) {
		pushNavigationPanel(parentName, menus[recordID]);
	} else {
		jQuery.getJSON(jsonURL + '?id=' + recordID, function(data) {
			menus[recordID] = data;
			pushNavigationPanel(parentName, data, initialLoad);
			highlightSelectedRow(recordID);
		});
	}
}




var NEW_ROW = '<h1 class="new"><div class="folder_state spacer"></div><div class="icon"><div class="spinner"></div><img src="/admin/images/new.png"></div>New</h1></li>';

function constructRecordListItem(tree) {
	// add the icon, name, slide and delete icons
	var list = '<li class="record" data-record-id="' + tree.id + '" data-type="' + tree.type + '">';

	// the h1 contains the content elements for each record
	if(tree.menu_root)
		list += '<h1 class="new_panel">';
	else
		list += '<h1>';

	// add space for any children underneath this record
	var canHaveChildren = (types[tree.type].validChildren.length > 0 && !tree.menu_root);
	var hasChildren = (tree.children && tree.children.length > 0);
	if(!tree.root) {
	  list += '<div class="folder_state';
		if(hasChildren)
			list += ' open';
		list += '"></div>';
	}

	// add the slider, delete and drag handle icons if necessary
	list += '<div class="icon"><div class="spinner"></div><img src="';
	if(tree.icon)
	  list += tree.icon;
	else
	  list += '/admin/images/default_icon.png';
	list += '"></div><p>' + tree.name + '</p>';
	if(tree.menu_root)
		list += '<div class="slide"></div>';
	if(!tree.root)
		list += '<div class="delete"></div><div class="drag"></div>';
	if(canHaveChildren) {
	  list += '<div class="add_child';
	  if(hasChildren || tree.root)
	    list += ' hidden';
	  list += '"></div>';
	}
	list += '</h1>';

	// generate a tree for child elements of this record
	var child_lists = [];
	for(var i = 0, c = tree.children.length; i < c; i++)
		child_lists.push(constructRecordListItem(tree.children[i]));

	if(canHaveChildren)
	  child_lists.push('<li>' + NEW_ROW);
	
	if(!tree.root)
	  list += '<ul class="child_elements" style="display: none">';
	else
	  list += '<ul class="child_elements">';
	  
	return list + child_lists.join('') + '</ul></li>';
}

function constructRecordList(tree) {
  return '<ul>' + constructRecordListItem(tree) + '</ul>';
}


var navigationPanels = [];

function dragError(parent, oldIndex, row) {
  alert('Sorry, an error occurred updating the position of this record. Please reload the page and try again.');
  
  // move the row back to its old position; record indexes are 1 based
  if(oldIndex == 1) {
    row.insertBefore('.record[data-record-id=' + parent.children[1].id + ']');
  } else {
    row.insertAfter('.record[data-record-id=' + parent.children[oldIndex - 2].id + ']');
  }
}

function pushNavigationPanel(rootName, tree, isPageRoot) {
  // create the panel html
  html = '<nav class="previous_folder">';
  if(rootName) {
    html += '<a href="#" class="prev_nav_panel'
    if(isPageRoot)
      html += ' root';
    html += '">' + rootName + '</a>';
  }
  html += '</nav><nav class="records">' + constructRecordList(tree) + '</nav></div>';
  
  // push the panel to the elements list
  var panel = $('<div class="navigation_panel">');
  panel.html(html);
  panel.data('tree', tree);
  navigationPanels.push(panel);
  
  // prepare for animation and insert the panel
  if(navigationPanels.length != 1)
    panel.css('left', MENU_WIDTH + 'px');
  $('#navigation_panels').append(panel);
  panel.find('ul.child_elements').sortable({
    containment: 'parent',
    items: '> li.record',
    axis: 'y',
    handle: 'div.drag',
    revert: 200,
    cursor: 'ns-resize',
    start: function(event, ui) {
      ui.item.addClass('dragging');
    },
    stop: function(event, ui) {
      ui.item.removeClass('dragging');
      
      // save the new record index
      var tree = navigationPanels[navigationPanels.length - 1].data('tree');
      var id = ui.item.attr('data-record-id');
      var record = null;
      var parent = null;
      
      // find the record by id
      if(id == tree.id)
        record = tree;
      else
        record = findRecord(tree, id);
      
      // try and find the parent record
      if(record && record.parent_id)
        parent = findRecord(tree, record.parent_id);
      if(!parent) {
        alert("Sorry, an error occurred updating the position of this record (the parent record could not be found). Please refresh the page and try again.");
        return;
      }
      
      // if this is the only child of the parent, ignore the index change
      if(parent.children.length == 1)
        return;
      
      // otherwise detect the new index of this record
      var oldIndex = record.index;
      if(ui.item.prev().length != 0) {
        var sibling = findRecord(tree, ui.item.prev().attr('data-record-id'));
        var newIndex = sibling.index;
        if(record.index > sibling.index)
          newIndex += 1;
      } else {
        var newIndex = 1;
      }
      if(oldIndex == newIndex)
        return;
      
      // save the updated index
      $.ajax(jsonURL, {
        data: {id: record.id, _method: 'put', action: 'set_index', index: newIndex},
        dataType: 'json',
        type: 'post',
        success: function(data, textStatus, jqXHR) {
          if(data.success == false) {
            dragError(parent, oldIndex, ui.item);
            return;
          }

          // update backing object
          record.index = newIndex;
          
          // update the index of other affected records
          if(newIndex > oldIndex) {
            for(var i = oldIndex; i < newIndex; i++)
              parent.children[i].index -= 1;
          } else {
            for(var i = (newIndex - 1); i < (oldIndex - 2); i++)
              parent.children[i].index += 1;
          }
          
          // change the position of the record in the parent's list of children
          parent.children.splice(oldIndex - 1, 1);
          parent.children.splice(newIndex - 1, 0, record);
          
        }, error: function(jqXHR, textStatus, errorThrown) {
          dragError(parent, oldIndex, ui.item);
        }
      });
    }
  });
  
  // animate the panel in to view
  if(navigationPanels.length != 1) {
    navigationPanels[navigationPanels.length - 2].animate({left: '-' + MENU_WIDTH + 'px'});
    panel.animate({left: '0px'});
  }
}

function popNavigationPanel() {
  if(navigationPanels.length == 1)
    return;
  
  // swap between the previous and current panels, and remove the current panel
  navigationPanels[navigationPanels.length - 2].animate({left: '0px'});
  navigationPanels[navigationPanels.length - 1].animate({left: MENU_WIDTH + 'px'}, {complete: function() {
    $(this).remove();
  }});
  navigationPanels = navigationPanels.slice(0, -1);
  
  // sliding back a navigation panel means the currently displayed record
  // can no longer be displayed; clear the record form and any highlights
  $('#record').empty();
  $('.record h1.selected').removeClass('selected');
}


function showNavigationPanel(recordID, element) {	
  // get the name of the root element in the current list
  var rootName = $(element).parents('nav.records').find('> ul > li > h1 > p').html();
  
  // show the new navigation panel
  showMenu(rootName, recordID);
}

function showPreviousNavigationPanel(event) {
  popNavigationPanel();
  event.preventDefault();
}


// folder open/close
function showOrHideChildren(event) {
  event.preventDefault();
  event.stopPropagation();
  if($(event.target).hasClass('open'))
    showChildren(event);
  else
    hideChildren(event);
}

function showChildren(event) {
  var button = $(event.target);
  
  button.parents('h1').siblings('ul').animate({
    height: 'show',
    opacity: 'show'
  }, 400);
  
  button.removeClass('open');
  button.addClass('close');
}

function hideChildren(event) {
  var button = $(event.target);
  
  button.parents('h1').siblings('ul').animate({
    height: 'hide',
    opacity: 'hide'
  }, 400);
  
  button.removeClass('close');
  button.addClass('open');
}


// update an existing record or add a record to the tree
function updateRecord(record) {
  // either find the parent record by searching from the root of the
  // current tree, or the updated record is the root of the current tree
  var tree = navigationPanels[navigationPanels.length - 1].data('tree');
  var treeRecord = null;
  var parent = null;
  
  if(record.id == tree.id)
    treeRecord = tree;
  else
    if(record.parent_id == tree.id)
      parent = tree;
    else
      parent = findRecord(tree, record.parent_id);
    
  if(!treeRecord && !parent) {
    alert("Sorry, an error occurred while creating this record (no parent or record could be found). Please refresh the page and try again.");
    return;
  }
  
  // if we found a parent, determine if this is a new or existing record
  var update = false;
  if(parent) {
    if(!parent.children)
      parent.children = [];
    
    // try and find an existing record
    for(var i = 0, c = parent.children.length; i < c; i++) {
      if(parent.children[i].id == record.id) {
        treeRecord = parent.children[i];
        update = true;
        break;
      }
    }
    
    // if none was found, create a blank record
    if(!update) {
      treeRecord = {children:[]};
      parent.children.push(treeRecord);
    }
  } else {
    // if there's no parent, treeRecord must be an existing root record
    update = true;
  }
  
  // copy the new values across
  treeRecord.id = record.id;
  treeRecord.icon = record.icon;
  treeRecord.index = record.index;
  treeRecord.root = treeRecord.root || false;
  treeRecord.menu_root = record.menu_root;
  treeRecord.name = record.name;
  treeRecord.parent_id = record.parent_id;
  treeRecord.type = record.type;
  
  if(update) {
    // change the existing record's name
    $('.record[data-record-id=' + record.id + '] > h1 > p').html(record.name);
    
  } else {
    // if this is the first new child of the parent, hide the new (+)
    // button, show the "New" row, show the list, and set the disclosure
    // button to - (indicating the folder is open)
    var parentRow = $('.record[data-record-id=' + parent.id + ']');
    var parentChildList = parentRow.find('> .child_elements');
    if(parent && !parent.root && !parent.menu_root) {
      if(parent.children.length == 1) {
        parentChildList.show();
        parentRow.find('> h1 > .add_child').addClass('hidden');
        parentRow.find('> h1 > .folder_state').addClass('close');
        parentRow.find('> h1 > .folder_state').removeClass('open');
      }
    }
    
    // insert the new row
    var row = constructRecordListItem(treeRecord);
    parentChildList.find('li:last-child').before(row);
    highlightSelectedRow(treeRecord.id);
    
    // if the row is a menu root, slide to the new menu
    if(treeRecord.menu_root)
      showNavigationPanel(treeRecord.id, parentRow);
  }
}

function findRecord(parent, id) {
  if(parent.id == id)
    return parent;
  
  if(parent.children && parent.children.length > 0) {
    for(var i = 0, c = parent.children.length; i < c; i++) {
      if(parent.children[i].id == id)
        return parent.children[i];
      var record = findRecord(parent.children[i], id);
      if(record != false)
        return record;
    }
  }
  return false;
}

// delete a record from the tree
function deleteRecordInTree(parent, id) {
  if(parent.children && parent.children.length > 0) {
    for(var i = 0, c = parent.children.length; i < c; i++) {
      var record = parent.children[i];
      if(record.id == id) {
        parent.children.remove(i, i);
        return parent;
      } else {
        var result = deleteRecordInTree(record, id);
        if(result)
          return result;
      }
    }
  }
  return false;
}




// delete buttons
function deleteButtonPressed(event) {
  event.preventDefault();
  event.stopPropagation();
  var recordRow = $(event.target).parents('li').first();
  var recordTypeName = types[recordRow.attr('data-type')].humanName;
  var recordID = recordRow.attr('data-record-id');
  
  if(confirm('Are you sure you want to delete this ' + recordTypeName + '?')) {
    showSpinner(recordRow);
    $.ajax(jsonURL, {
      data: {id: recordID, _method: 'delete'},
      dataType: 'json',
      type: 'post',
      success: function(data, textStatus, jqXHR) {
        // delete the backing object
        var tree = navigationPanels[navigationPanels.length - 1].data('tree');
        var parent = deleteRecordInTree(tree, recordID);
        
        // remove the row representing the object
        recordRow.remove();
        
        // clear the record panel if this record was being displayed
        if($('#record_id').val() == recordID)
          $('#record').empty();
        
        // clear the record panel if this record was the parent of a
        // new record currently being created
        if($('#parent').val() == recordID)
          $('#record').empty();
        
        // collapse the record if this was the last child record
        if(parent && parent.children.length == 0 && !parent.root) {
          var parentRow = $('.record[data-record-id=' + parent.id + ']');
          var parentChildList = parentRow.find('> .child_elements');
          var folderState = parentRow.find('> h1 > .folder_state');
          parentChildList.hide();
          parentRow.find('h1 > .add_child').removeClass('hidden');
          folderState.removeClass('close');
          folderState.removeClass('open');
          
          // if a new record was being created under the parent, and this
          // deleted record was the last child, change the highlighted
          // row from the 'new' row to the parent row itself
          if(parentChildList.find('li .new').hasClass('selected')) {
            parentChildList.find('li .new').removeClass('selected');
            parentRow.find('> h1').addClass('selected');
          }
        }

        // remove the record from the menu list if it was a menu root
        if(menus[recordID])
          delete menus[recordID];
      }, error: function(jqXHR, textStatus, errorThrown) {
        // FIXME: better error message
        hideSpinner(recordRow);
        alert('Sorry, an error occurred deleting this record. Please reload the page and try again.');
      }
    });
  }
}


// attachment/photo clearing
function clearAttachmentOrPhoto(event) {
  event.preventDefault();
  var link = $(event.target);
  var container = link.closest('.field-type-attachment, .field-type-image');
  link.hide();
  container.find('p span').html('none');
  container.find('input[type=checkbox]').attr('checked', true);
  container.find('input[type=file]').val('');
  link.closest('.field-type-image').find('img').hide();
}

function hideClear(event) {
  var file_input = $(event.target);
  var container = file_input.closest('.field-type-attachment, .field-type-image');
  container.find('input[type=checkbox]').removeAttr('checked');
  container.find('.clear').show();
}


// new record type panel
var modelPanelShowing = false;
function showModelPanel(event) {
  event.preventDefault();
  event.stopPropagation();
  var recordRow = $(event.target).parents('li.record');
  
	// hide all new model buttons, then display only those valid for the selected parent
	// if the model only has a single allowed child type, immediately show a new record form
	var childTypes = types[recordRow.attr('data-type')].validChildren;
	var parentID = recordRow.attr('data-record-id');
	
	if(childTypes.length == 1) {
	  var modelID = types[childTypes[0]].id;
	  loadNewRecord(modelID, parentID);
	  return;
	} else {
	  $('#new_model_panel ul a').hide();
	  for(var i = 0, c = childTypes.length; i < c; i++) {
  		$('a.model[data-type="' + childTypes[i] + '"]').show();
  	}
	}
	
	$('#new_model_panel').attr('data-parent-id', parentID);
  $('#new_model_panel').fadeIn();
  $('#admin_content').fadeOut();
  modelPanelShowing = true;
}

function hideModelPanel(event) {
  if(!modelPanelShowing) return;
  if(event) event.preventDefault();
  if(modelPanelShowing) {
    $('#new_model_panel').fadeOut();
    $('#admin_content').fadeIn();
    $('#new_model_panel .spinner').hide();
    $('#new_model_panel .icon').show();
  }
  modelPanelShowing = false;
}




// options and section toggle button
function toggleSectionVisibility(event) {
  event.preventDefault();
  $(event.target).parents('section').find('> div').slideToggle('slow');
  $(event.target).html($(event.target).html() == 'show' ? 'hide' : 'show');
  event.preventDefault();
}


// delete an embedded doc
function deleteEmbeddedDoc(event) {
  event.preventDefault();
  var target = $(event.target);
  var documents = target.parents('div.embedded_documents');
  var type = documents.attr('data-type');
  
  if(confirm('Are you sure you want to delete this ' + type + '?')) {
    target.parents('div.embedded_document').animate({
      height: 'hide',
      opacity: 'hide'
    }, {
      complete: function() {
        // show the 'No TYPE' text if we are removing the last embedded doc in a collection
        if(documents.find('div.embedded_document').size() == 1)
          documents.find('.no_embedded_documents').animate({height: 'show', opacity: 'show'});
        $(this).remove();
      }
    });
  }
}

// add a new embedded doc
function addEmbeddedDoc(event) {
  event.preventDefault();
  var target = $(event.target);
  var documents = target.parents('div.embedded_documents');
  
  // construct a new document form an insert in to the collection
  var doc = $('<div class="embedded_document" style="display: none"><a href="#" class="delete_embedded_document"></a><table><tr><td id="label_col"></td><td id="input_col"></td></tr><tr><td><label>Photo</label></td><td><div class="attachment photo"><div class="photo_preview"><img src="sample_photo.jpg"></div><p class="current_value"><span class="title">File:</span>train.jpeg <a href="#" class="clear">Clear</a></p><p><span class="title">Select:</span><input type="file"></p><input type="hidden" name="delete_X" class="delete" value="false"></div></td></tr><tr><td><label>Name</label></td><td><input type="text"></td></tr></table></div>');
  $(event.target).before(doc);
  
  // hide the 'No TYPE' text if we are adding a new embedded doc in to an empty collection
  // animate the insertion of the new doc after hiding the 'No TYPE' text or immediately
  if(documents.find('div.embedded_document').size() == 1) {
    documents.find('.no_embedded_documents').animate({
      height: 'hide', 
      opacity: 'hide'
    }, {
      duration: 150,
      complete: function() {
        doc.animate({height: 'show', opacity: 'show'});
      }
    });
  } else {
    doc.animate({height: 'show', opacity: 'show'});
  }
}



$('div.delete').live('click', deleteButtonPressed);
$('div.folder_state').live('click', showOrHideChildren);

$('a.clear').live('click', clearAttachmentOrPhoto);
$('input[type=file]').live('change', hideClear);

$('a.prev_nav_panel').live('click', showPreviousNavigationPanel);
$('a.section_toggle').live('click', toggleSectionVisibility);
$('a.delete_embedded_document').live('click', deleteEmbeddedDoc);
$('a.add_embedded_document').live('click', addEmbeddedDoc);

$('h1.new').live('click', showModelPanel);
$('div.add_child').live('click', showModelPanel);
$('#cancel_new_record').live('click', hideModelPanel);

$('.opens-editor').click(function(event) {
  $.ajax($(event.target).attr('href'));
  event.preventDefault();
});





// show and hide spinners to indicate network activity. More than
// one spinner at a time may be shown (e.g deleting two records
// while loading another)
function showSpinner(row) {
  if(typeof row == 'string')
    row = $('.record[data-record-id=' + row + '] > h1 > .icon .spinner').show();
  else
    row = $(row).find('.icon .spinner').show();
}

function hideSpinner(row) {
  if(typeof row == 'string')
    row = $('.record[data-record-id=' + row + '] > h1 > .icon .spinner').hide();
  else
    row = $(row).find('.icon .spinner').hide();
}

// un-highlight all other rows, and highlight a new selected record
function highlightSelectedRow(row) {
  $('.record h1.selected').removeClass('selected');
  hideSpinner(row);
  if(typeof row == 'string')
    row = $('.record[data-record-id=' + row + '] > h1');
  else
    row = $(row);
  row.addClass('selected');
}

// load an existing record's form
function loadRecord(id) {
  $('#record').load(htmlURL + '?action=show&id=' + id, function(text, status, req) {
    highlightSelectedRow(id);
    hideModelPanel();
    initialiseWidgets();
  });
}

// show a menu root record
$('.record > h1.new_panel').live('click', function(event) {
  var recordID = $(this).parent().attr('data-record-id');
  showSpinner(this);
  loadRecord(recordID);
  showNavigationPanel(recordID, this);
  event.stopImmediatePropagation();
});

// show a normal record
$('.record > h1').live('click', function(event) {
  showSpinner(this);
  loadRecord($(this).parent().attr('data-record-id'));
});

// load a blank (new) record
function loadNewRecord(modelID, parentID, modelWasSelected) {
  // for parents with existing children, show a spinner on and highlight
  // the 'new' row, otherwise highlight the parent row itself
  var tree = navigationPanels[navigationPanels.length - 1].data('tree');
  var parent = findRecord(tree, parentID);
  
  if(modelWasSelected == undefined) {
    if(parent.children.length == 0)
      showSpinner(parentID);
    else
      showSpinner($('.record[data-record-id=' + parentID + '] > .child_elements > li > h1.new'));
  }
  
  // load the blank default record
  $('#record').load(htmlURL + '?action=new&model=' + modelID + '&parent=' + parentID, function(text, status, req) {
    initialiseWidgets();
    if(parent.children.length == 0)
      highlightSelectedRow(parentID);
    else
      highlightSelectedRow($('.record[data-record-id=' + parentID + '] > .child_elements > li > h1.new'));
  });
}

$('a.model').click(function(event) {
  var parentID = $('#new_model_panel').attr('data-parent-id');
  var modelID = $(this).attr('data-model-id');
  event.preventDefault();
  
  $(this).find('.spinner').show();
  $(this).find('.icon').hide();
  loadNewRecord(modelID, parentID, true);
});
