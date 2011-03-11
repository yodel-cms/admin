function initialiseHTMLField(id) {
	tinyMCE.init({
  	mode : "specific_textareas",
  	editor_selector : '#' + id,
  	theme : "advanced",
  	plugins : "safari,inlinepopups,paste",
    width: '100%',
  	height: '200',
  	theme_advanced_blockformats: 'p,h1,h2,h3',
	
  	theme_advanced_buttons1 : "bold,italic,underline,strikethrough,sub,sup,charmap,|,justifyleft,justifycenter,justifyright,justifyfull,|,formatselect,fontsizeselect,|,bullist,numlist,outdent,indent,blockquote,|,undo,redo,|,link,unlink,|,cleanup,code",
  	theme_advanced_buttons2 : '',
  	theme_advanced_buttons3 : '',
  	theme_advanced_toolbar_location : "top",
  	theme_advanced_toolbar_align : "left",
  	theme_advanced_statusbar_location : "none",
  	theme_advanced_resizing : false
  });
}

function initialiseDateTimeField(id) {
	$('#' + id).datetimepicker({
    ampm: false,
    dateFormat: 'dd/mm/yy',
    autoSize: true,
    buttonImage: '/admin/images/clock.png',
    buttonImageOnly: true,
    showOn: 'button'
  });
}

$('#save button').click(function(event) {
  $('#save_spinner').fadeIn().delay(1000).fadeOut();
  $('#save_success').delay(1500).fadeIn().delay(2000).fadeOut();
});



var menus = {};

function showMenu(parentName, recordID) {
	if(menus[recordID]) {
		pushNavigationPanel(parentName, menus[recordID]);
	} else {
		// TODO: show spinner & blacken until loaded
		jQuery.getJSON('/admin/tree.json', {id: recordID}, function(data) {
			menus[recordID] = data;
			pushNavigationPanel(parentName, data);
		});
	}
}




var NEW_ROW = '<li><h1 class="new"><div class="folder_state_spacer"></div><div class="icon"><img src="/admin/images/new.png"></div>New</h1></li>';

function constructRecordListItem(tree) {
	// add the icon, name, slide and delete icons
	var list = '<li class="record" id="' + tree.id + '" data-type="' + tree.type + '">';

	// the h1 contains the content elements for each record
	if(tree.menu_root)
		list += '<h1 class="new_panel">';
	else
		list += '<h1>';

	// add space for any children underneath this record
	if(!tree.root) {
		if(tree.children && tree.children.length > 0)
			list += '<div class="folder_state close"></div>';
		else
			list += '<div class="folder_state_spacer"></div>';
	}

	// add the slider, delete and drag handle icons if necessary
	list += '<div class="icon"><img src="' + tree.icon + '"></div><p>' + tree.name + '</p>';
	if(tree.menu_root)
		list += '<div class="slide"></div>';
	if(!tree.root)
		list += '<div class="delete"></div><div class="drag"></div>';
	list += '</h1>';

	// generate a tree for child elements of this record
	var child_lists = [];
	for(var i = 0, c = tree.children.length; i < c; i++)
		child_lists.push(constructRecordListItem(tree.children[i]));

	if(types[tree.type].validChildren.length > 0 && !tree.menu_root)
		child_lists.push(NEW_ROW);
	
	return list + '<ul class="child_elements">' + child_lists.join('') + '</ul></li>';
}

function constructRecordList(tree) {
  return '<ul>' + constructRecordListItem(tree) + '</ul>';
}


var navigationPanels = [];

function pushNavigationPanel(rootName, tree) {
  // create the panel html
  html = '<nav class="previous_folder">';
  if(rootName)
    html += '<a href="#" class="prev_nav_panel">' + rootName + '</a>';
  html += '</nav><nav class="records">' + constructRecordList(tree) + '</nav></div>';
  
  // push the panel to the elements list
  var panel = $('<div class="navigation_panel">');
  panel.html(html);
  navigationPanels.push(panel);
  
  // prepare for animation and insert the panel
  if(navigationPanels.length != 1)
    panel.css('left', '242px');
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
    }
  });
  
  // animate the panel in to view
  if(navigationPanels.length != 1) {
    navigationPanels[navigationPanels.length - 2].animate({left: '-242px'});
    panel.animate({left: '0px'});
  }
}

function popNavigationPanel() {
  if(navigationPanels.length == 1)
    return;
  
  // swap between the previous and current panels, and remove the current panel
  navigationPanels[navigationPanels.length - 2].animate({left: '0px'});
  navigationPanels[navigationPanels.length - 1].animate({left: '242px'}, {complete: function() {
    $(this).remove();
  }});
  navigationPanels = navigationPanels.slice(0, -1);
}


function showNavigationPanel(event) {
	var element = $(event.target);
	
  // get the name of the root element in the current list
  var rootName = element.parents('nav.records').find('> ul > li > h1 > p').html();
  
  // the id of the record is used to load the next tree
  var recordID = element.parents('li.record').attr('id');
  
  // show the new navigation panel
  showMenu(rootName, recordID);
  event.preventDefault();
}

function showPreviousNavigationPanel(event) {
  popNavigationPanel();
  event.preventDefault();
}


// folder open/close
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


// delete buttons
function deleteButtonPressed(event) {
  var recordTypeName = types[$(event.target).parents('li').attr('data-type')].humanName;
  if(confirm('Are you sure you want to delete this ' + recordTypeName + '?'))
    alert('deleting');
}


// has many search box
function restrictHasManyListToSearchPattern(event) {
  var items = $(event.target.parentNode).siblings('ul').first().children('li');
  var pattern = event.target.value.toLowerCase();
  
  items.each(function() {
    if($(this).children('p').first().html().toLowerCase().indexOf(pattern) == -1)
      $(this).css('display', 'none');
    else
      $(this).css('display', 'list-item');
  });
}


// attachment/photo clearing
function clearAttachmentOrPhoto(event) {
  $(event.target.parentNode).slideUp();
  
  if($(event.target.parentNode.parentNode).hasClass('photo')) {
    $(event.target.parentNode.parentNode).find('.photo_preview img').fadeOut();
  }
}


// new record type panel
function showNewRecordTypePanel(event) {
	// hide all new record type buttons, then display only those valid for the selected parent
	$('ul.new_record_type a').hide();
	var childTypes = types[$(event.target).parents('li.record').attr('data-type')].validChildren;
	for(var i = 0, c = childTypes.length; i < c; i++) {
		$('a.record_type[data-type="' + childTypes[i] + '"]').show();
	}
	
  $('#new_article_panel').fadeIn();
  $('#record_form').fadeOut();
}

function hideNewRecordTypePanel(event) {
  $('#new_article_panel').fadeOut();
  $('#record_form').fadeIn();
}


// options and section toggle button
function toggleSectionVisibility(event) {
  $(event.target).parents('section').find('> div').slideToggle('slow');
  $(event.target).html($(event.target).html() == 'show' ? 'hide' : 'show');
  event.preventDefault();
}


// delete an embedded doc
function deleteEmbeddedDoc(event) {
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


// global event handlers
// TODO: optimisation: split the class name out and do a switch
$(document).click(function(event) {
  if(event.target.tagName == 'DIV') {
    // delete buttons
    if(event.target.className == 'delete') {
      deleteButtonPressed(event);
    }
    
    // folder open/close buttons
    if($(event.target).hasClass('folder_state')) {
      if($(event.target).hasClass('open'))
        showChildren(event);
      else
        hideChildren(event);
    }
    
  } else if(event.target.tagName == 'A') {
    // attachment/photo clear buttons
    if(event.target.className == 'clear') {
      clearAttachmentOrPhoto(event);
    } else if(event.target.className == 'prev_nav_panel') {
      showPreviousNavigationPanel(event);
    } else if(event.target.className == 'section_toggle') {
      toggleSectionVisibility(event);
    } else if(event.target.className == 'delete_embedded_document') {
      deleteEmbeddedDoc(event);
    } else if(event.target.className == 'add_embedded_document') {
      addEmbeddedDoc(event);
    }
    
  } else {
    var target = $(event.target);
    if(target.parents('a.record_type').size() != 0) {
      hideNewRecordTypePanel(event);
    } else if(target.closest('h1.new').size() != 0) {
      showNewRecordTypePanel(event);
    } else if(target.closest('h1.new_panel').size() != 0) {
      showNavigationPanel(event);
    }
  }
  
  event.preventDefault();
});

$(document).keyup(function(event) {
  if(event.target.tagName == 'INPUT' && event.target.className == 'has_many_search') {
    restrictHasManyListToSearchPattern(event);
  }
});

$(document).change(function(event) {
  if(event.target.tagName == 'INPUT' && event.target.className == 'has_many_search') {
    restrictHasManyListToSearchPattern(event);
  }
});
