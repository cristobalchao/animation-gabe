$(document).ready(function(){

	$(document).on('click',function(){ //Clicking on the document Filter or the Set Info Panel are deactivated.
		$('.filterButton').removeClass('active');
		$('.set-info').removeClass('active');
		$('#utilityBarExt').removeClass('active');
		$('.newset-1').css({'display':'block'});
		$('.newset-2').css({'display':'none'});
	});

	/*** Stop Event Bubbling ***/
	$('.set-info').on('click', function(){
		return false;
	});

	$('#utility-bar').on('click', function(){
		return false;
	});


	/*** EXTRACTING DATA FROM INPUT AND UPDATING SEARCH RESULTS ***/
	function updateResults(element,category){
		$('#autocomplete-search').html('');
		for(var i = 0; i < element.length; i++){
			var newElementResult = "<tr class='resultSearch'><td>" + input.tests[element[i]].title + "</td></tr>";
			$(newElementResult).appendTo('#autocomplete-search');
		}

		for(var i = 0; i < category.length; i++){
			var newCategoryResult = "<tr class='resultSearch'><td class='category-icon'>" + input.tests[category[i]].category + "</td></tr>";
			$(newCategoryResult).appendTo('#autocomplete-search');
		}
	}


	function getAjaxData(){
		var str = $('#searchInput #main-search').val(),
			maxResults = 4,cont = 1, result = [], resultCat = [], hashCategory = [];

		for(var i = 0; i < input.tests.length && cont < maxResults; i++){
			if(input.tests[i].title.toLowerCase().indexOf(str.toLowerCase()) !== -1){
				cont++;
				result.push(i);
			}

			if (input.tests[i].category.toLowerCase().indexOf(str.toLowerCase()) !== -1 && cont < maxResults && !!!hashCategory[input.tests[i].category.toLowerCase()]){
				cont++;
				hashCategory[input.tests[i].category.toLowerCase()] = true;
				resultCat.push(i);
			}
		}

		updateResults(result,resultCat);
	}
	/*** END EXTRACTING DATA FROM INPUT AND UPDATING SEARCH RESULTS ***/

/********* MAIN FUNCTIONS - RESULTS VIEW PAGE *********/
	//init
	deselectAllResults();
	$('.table-results .no-active .checkResults').removeClass('checkResults').addClass('no-checkResults');
	$('.condition-categories .categories').clone().appendTo('.bottomSearchResults');

	/*** Activating Condition Categories filter for the Search ***/
	$('.categoriesButton').on('click', function(e){
		e.stopPropagation();
		$(this).toggleClass('active');
		$(this).siblings('.categories').toggleClass('categories-show');
		$('.header-results').toggleClass('push');
		return false;
	});
	/*** END ***/

	/*** Activating Header Top Buttons ***/
	function activeResultButtons(bool){
		if (bool ===  undefined){
			bool = false;
			$('.checkResults').each(function(){
				if ($(this).hasClass('active')){
					bool = $(this).siblings('.title').html();
					return false;
				}
			});
		}

		bool && $('.add-top-buttons').css('display','block') || $('.add-top-buttons').css('display','none');
	}

	function hideSetsTopButtons(){
		$('.add-pageset-top-buttons').css('display','none');
	}

	function hideTopButtons(){
		$('.add-top-buttons').css('display','none');
	}

	function activeSetsResultButtons(bool){
		if (bool ===  undefined){
			bool = false;
			$('.checksetResults').each(function(){
				if ($(this).hasClass('active')){
					bool = $(this).siblings('.title').html();
					return false;
				}
			});
		}

		bool && $('.add-pageset-top-buttons').css('display','block') || $('.add-pageset-top-buttons').css('display','none');
	}
	/*** END ***/

	/*** Activating the result that has been selected in the checkbox */
	function activateParentSet(element){
		element.parent().siblings('.checkResults').addClass('active');
		element.parent().parent().parent().parent().addClass('active');
	}

	function activateSetParentSet(element){
		element.parent().siblings('.checksetResults').addClass('active');
		element.parent().parent().parent().parent().addClass('active');
	}

	function desactivateParentSet(element){
		element.parent().siblings('.checkResults').removeClass('active');
		element.parent().parent().parent().parent().removeClass('active');
	}

	function desactivateSetParentSet(element){
		element.parent().siblings('.checksetResults').removeClass('active');
		element.parent().parent().parent().parent().removeClass('active');
	}

	function checkAllSets(element){
		var allSel = true;

		$('tr', element).each(function(){
			if (!!!$(this).hasClass('active')){
				allSel = false;
				return false;
			}
		});

		return allSel;
	}

	function setEmpty(element){
		var allSel = true;

		$('tr', element).each(function(){
			if ($(this).hasClass('active')){
				allSel = false;
				return false;
			}
		});

		return allSel;
	}

	$('#your-sets-page').on('click', '.checksetResults',function(){
		var $parent = $(this).toggleClass('active').parent().parent().parent('tr');
		$parent.toggleClass('active');

		if($(this).parent().hasClass('test')){
			activateSetParentSet($($parent.parent()));
			if (setEmpty($($parent.parent()))){
				desactivateSetParentSet($($parent.parent()));
			}
		}

		if ($(this).hasClass('active') && $(this).siblings('.table-page-elements') !== undefined){
			$(this).siblings('.table-page-elements').find('tr, .checksetResults').addClass('active');
		}else if ($(this).siblings('.table-page-elements') !== undefined){
			$(this).siblings('.table-page-elements').find('tr, .checksetResults').removeClass('active');
		}
		activeSetsResultButtons();
		return false;
	});

	$('.table-results label > .checkResults').on('click', function(e){
		e.stopPropagation();
		var $parent = $(this).toggleClass('active').parent().parent().parent('tr');
		$parent.toggleClass('active');

		if($(this).parent().hasClass('test')){
			activateParentSet($($parent.parent()));
			if (setEmpty($($parent.parent()))){
				desactivateParentSet($($parent.parent()));
			}
		}

		if ($(this).hasClass('active') && $(this).siblings('.set-elements') !== undefined){
			$(this).siblings('.set-elements').find('tr, .checkResults').addClass('active');
		}else if ($(this).siblings('.set-elements') !== undefined){
			$(this).siblings('.set-elements').find('tr, .checkResults').removeClass('active');
		}
		activeResultButtons();
		return false;
	});
	/*** END Activating the result that has been selected in the checkbox ***/

	/*** Selecting/Deselecting all the results ***/
	function selectAllResults(){
		$('#main-container-results .table-results label > .checkResults').prop('checked',true).addClass('active');
		$('#main-container-results .table-results tr').each(function(){
			if ($(this).index() !== 0 && !!!$(this).hasClass('no-active')){
				$(this).addClass('active');
			}
		});
	}

	function selectAllSetsResults(){
		$('#your-sets-page .table-results label > .checksetResults').prop('checked',true).addClass('active');
		$('#your-sets-page .table-results tr').each(function(){
			if ($(this).index() !== 0 && !!!$(this).hasClass('no-active')){
				$(this).addClass('active');
			}
		});
	}

	function deselectAllResults(){
		$('#main-container-results .table-results label > .checkResults').prop('checked',false).removeClass('active');
		$('#main-container-results .table-results tr').removeClass('active');
	}

	function deselectAllSetsResults(){
		$('#your-sets-page .table-results label > .checksetResults').prop('checked',false).removeClass('active');
		$('#your-sets-page .table-results tr').removeClass('active');
	}
	/*** END ***/

	/*** Filter button Toggling when clicked ***/
	$('.filterButton').on('click',function(e){
		e.stopPropagation();
		$(this).toggleClass('active');	
		return false;
	});
	/*** END ***/

	/*** Selecting/deselecting results depending of the Filter selection ***/
	$('#main-container-results .filterButton .filterby td').on('click', function(){
		if ($(this).hasClass('all')){
			selectAllResults();
			activeResultButtons(true);
		}else{
			deselectAllResults();
			activeResultButtons(false);
		}
	});

	$('#your-sets-page .filterButton .filterby td').on('click', function(){
		if ($(this).hasClass('all')){
			selectAllSetsResults();
			activeSetsResultButtons(true);
		}else{
			deselectAllSetsResults();
			activeSetsResultButtons(false);
		}
	});
	/*** END ***/

	/*** Result Height toggling when its name (title) is clicked ***/
	$('.table-results tr:not(.no-active) .title').on('click', function(){
		$(this).siblings('.moreInfo').toggle('height,opacity').toggleClass('active');
		$(this).siblings('.set-elements').toggleClass('active');

		if (!!$(this).siblings('.moreInfo').hasClass('active')){
			$(this).parent().parent().parent().find('.genes p').addClass('active');
		}else{
			$(this).parent().parent().parent().find('.genes p').removeClass('active');
		}
	});
	/*** END ***/

/********* END MAIN FUNCTIONS - RESULTS VIEW PAGE *********/

/********* Search FUNCTIONS  *********/

	//INIT
	$('#searchInput #main-search').val('').focus();

	/*** Basic Functions for the results flow ***/
	function resultsHide(){
		closeCategory();
		$('#main-container-results').hide();
	}

	function resultsPreShow(){
		$('#main-container-results').css('opacity','0.5').show();
	}

	function resultsShow(){
		$('#autocomplete-search').hide();
		$('#main-container-results').css('opacity','1').show();
		$('.header-results').addClass('active');
	}

	function flashHighlight(element){
		element.addClass('new').animate({'opacity':1},800, function(){
			$(this).removeClass('new');
		});
	}

	function InitialState(){
		$('.condition-categories, #searchInput').show();
		$('#autocomplete-search').hide();
		$('#items-page').hide();
		$('#searchInput').removeClass('small');
		$('#main-search').val('').focus();
		resultsHide();
	}
	/*** END Basic Functions for the results flow ***/

	/*** Positioning Cursor at the End of The Search Box ***/
	$(function() {
		$('input[type="text"]').bind('focus',function() {
			window.o=this;
			if (o.setSelectionRange){    /* DOM */
				setTimeout('o.setSelectionRange(o.value.length,o.value.length)',2);
			}else if (o.createTextRange) {    /* IE */
				var r=o.createTextRange();
				r.moveStart('character',o.value.length);
				r.select();
			}
		});
	}); 
	/*** END Positioning Cursor at the End of The Search Box ***/

	/*** Triggering enter Textbox to the Button ***/
	$(".newset-tb").keyup(function(event){
		if(event.keyCode === 13){
			$(".newset-button").click();
		}
	});
	/*** END ***/

	/*** Prevent scrolling when keyarrows are pressed ***/
	document.onkeydown = function(e) {
		var k = e.keyCode;
		if(k === 38 || k === 40) {
			return false;
		}
	}
	/** END **/

	/**** Trigger clicking/hovering events ****/
	$('#main-search-button').on('click', function(){
		resultsShow();
	});

	$('#autocomplete-search td').mouseover(function(){
		resultsPreShow();
	});

	$('#autocomplete-search').on('click', '.resultSearch', function(){
		var result = $('#autocomplete-search .resultSearch .active').hasClass('category-icon') && 
					  createCategoryBox($('#autocomplete-search .resultSearch .active').text()) ||
					  	$('#autocomplete-search .resultSearch .active').text() || textBackup;

		$('#main-search').val(result);
		resultsShow();
	});

	$('#autocomplete-search td').on('click', function(){
		closeCategory();

		if ($(this).attr('class') === "category-icon"){
			$('.category-box-container .category-name').html($(this).html());
			$('#main-search').css('padding-left',$('.category-box-container').outerWidth()+30);
			$('.category-box-container').show();
		}else{
			$('#searchInput #main-search').val($(this).html());
		}

		resultsShow();
	});

	$('#utilityBar #search').on('click', function(){
		InitialState();
	});
	/**** END Trigger clicking/hovering events ****/
	
	/**** CATEGORIES ****/
	/*** Creates the Category Box into the Search Textbox ***/
	function createCategoryBox(categoryName){
		$('.category-box-container .category-name').html(categoryName);
		$('#main-search').css('padding-left',$('.category-box-container').outerWidth()+30);
		$('.category-box-container').show();
		$('.condition-categories').hide();
		$(this).siblings('table').show();
		$('#searchInput').addClass('small');
		getAjaxData();
	}
	/*** END ***/

	/*** Closes the Category Box of the Search Textbox ***/
	function closeCategory(){
		$('.category-box-container').hide();
		$('#searchInput #main-search').css('padding-left',10);
	}
	/*** END ***/

	/*** Triggering Categories ***/
	$('.close-category').on('click',function(){
		closeCategory();
	});

	$('.categories .title').on('click', function(){
		createCategoryBox($(this).html());
	});
	/*** END ***/
	/**** END CATEGORIES ****/

	/*** Main Search Event Typing ***/
	var textBackup = "";
	$('#searchInput #main-search').keyup(function(e){
		if (e.keyCode === 38 || e.keyCode === 40){ //If keyarrow (Up/Down) : exit
			return;
		}
		if ($(this).val() === ""){
			InitialState();
		}else{
			$('.condition-categories').hide();
			$(this).siblings('table').show();
			$('#searchInput').addClass('small');
			getAjaxData();
			hlSearchResults();
			textBackup = $('#searchInput #main-search').val();
		}
	});
	/*** END Main Search Event Typing ***/

	/*** Updating Autocomplete Results ***/
	function hlSearchResults(){
		var valSearch = $('#main-search').val();

		$('#autocomplete-search .resultSearch').each(function(){
			var valResult = $('td',this).html(),
				pos = valResult.toLowerCase().indexOf(valSearch.toLowerCase());

			if(pos > -1){
				var output = [valResult.slice(0, pos+valSearch.length), "<strong>", valResult.slice(pos+valSearch.length)].join('');
				output += "</strong>";
				$('td',this).html(output);
			}
		});
	}
	/*** END ***/

	/*** Autocomplete MouseOver Hightlight ***/
	$('#autocomplete-search').on('mouseover','.resultSearch',function(){
		if (!!! $('#autocomplete-search').hasClass('disableMouse')){
			$('#autocomplete-search td').removeClass('active');
			$('td',this).addClass('active');
		}
	}).on('mouseout','.resultSearch',function(){
		$('#autocomplete-search').removeClass('disableMouse');
		$('#autocomplete-search td').removeClass('active');
	});
	/*** END ***/

	/*** Function that traverses the Autocomplete element -> UP : -1, DOWN : 1 ***/
	function navAutocomplete(direction){
		var posTableResult = $('#autocomplete-search .resultSearch .active').parent().index(),
			length = $('#autocomplete-search tr').length;

		$('#autocomplete-search').addClass('disableMouse');				
		$('#autocomplete-search td').removeClass('active');

		posTableResult += direction;

		if (posTableResult >= 0 && posTableResult < length){			
			$('#autocomplete-search td').eq(posTableResult).addClass('active');
		}else if(posTableResult < -1){
			posTableResult = length-1;		
			$('#autocomplete-search td').eq(posTableResult).addClass('active');
		}else{
			posTableResult = -1;
		}

		var result = $('#autocomplete-search .resultSearch .active').hasClass('category-icon') && 
		createCategoryBox($('#autocomplete-search .resultSearch .active').text()) ||
		$('#autocomplete-search .resultSearch .active').text() || textBackup;

		$('#main-search').val(result).focus();
	}
	/*** END navAutocomplete ***/

	/*** Triggering Autocomplete keyarrow navigation ***/
	var searching = true;
	$(document).keyup(function(e) {
		e.preventDefault();
		if (searching){
			var key = e.keyCode;
			switch (key) {
				case 38: //UP
					navAutocomplete(-1);
					/** AJAX SEARCH **/
					resultsPreShow();
					break;
				
				case 40: //DOWN
					navAutocomplete(1);
					/** AJAX SEARCH **/
					resultsPreShow();
					break;

				case 13: //Return	
					resultsShow();	
					break;

				default:
					break;
			}
		}
		return false;
	});
	/*** END Triggering Autocomplete keyarrow navigation ***/
/********* END Search FUNCTIONS  *********/


	/**** CREATING NEW SETS/ORDERS ****/

	/*** Checks String for the creation of a new Set ***/
	function checkInputString(inputString, nameInput){
		if (inputString.length < 1 || inputString.length > 30){
			alert('Please enter a valid '+nameInput+' name');
			return false;
		}else{
			return true;
		}
	}
	/*** END ***/

	/*** Positioning Panel Set according to its Add Set Button when this button has been pressed ***/
	$('.add-set, .add-set-button').on('click', function(){
		var top = parseInt($(this).offset().top + $(this).outerHeight()  - $('#main-container-results').offset().top),
			left = parseInt($(this).offset().left - $('#main-container-results').offset().left);

		var linkId = -1;
		if ($(this).hasClass('add-set')){
			linkId = $(this).parent().parent().parent().parent().parent().attr('id');
		}

		$('.set-info').css({'top':top+'px', 'left':left+'px'}).addClass('active').attr('linkTo',linkId);
		return false;
	});
	/*** END ***/

	/* TEST ORDERS */
	function insertTestToOrder(testId){
		glOrder.tests.push(testId);
	}

	function deleteTestFromOrder(testId){
		for(var i = 0; i < glOrder.tests.length; i++){
			if (glOrder.tests[i] === testId){
				glOrder.tests.splice(i, 1);
			}
		}
	}

	/* SET ORDERS */
	function insertSetToOrder(setId){
		var _set = new orderSet(setId);
		glOrder.sets.push(_set);
	}

	function deleteSetFromOrder(setId){
		for(var i = 0; i < glOrder.sets.length; i++){
			if (glOrder.sets[i].id === setId){
				glOrder.sets.splice(i, 1);
			}
		}
	}

	function insertTestsetToOrder(setId,testId){
		for(var i = 0; i < glOrder.sets.length; i++){
			if (glOrder.sets[i].id === setId){
				glOrder.sets[i].push(testId);
			}
		}
	}

	function deleteTestsetFromOrder(setId,testId){
		for(var i = 0; i < glOrder.sets.length; i++){
			if (glOrder.sets[i].id === setId){
				for(var j = 0; j < glOrder.sets[i].length; j++){
					if (glOrder.sets[i].tests[j] === testId){
						glOrder.sets[i].tests.splice(j,1);
						if(glOrder.sets[i].length === 0){
							glOrder.sets.splice(i,1);
						}
						return true;
					}
				}
			}
		}
		return false;
	}

	/* PANEL ORDERS */
	function insertPanelToOrder(panelId){
		var _panel = new orderPanel(panelId);
		glOrder.panels.push(_panel);
	}

	function deletePanelFromOrder(panelId){
		for(var i = 0; i < glOrder.panels.length; i++){
			if (glOrder.panels[i].id === panelId){
				glOrder.panels.splice(i, 1);
			}
		}
	}

	function insertTestpanelToOrder(panelId,testId){
		for(var i = 0; i < glOrder.panels.length; i++){
			if (glOrder.panels[i].id === panelId){
				glOrder.panels[i].tests.push(testId);
			}
		}
	}

	function deleteTestpanelFromOrder(panelId,testId){
		for(var i = 0; i < glOrder.panels.length; i++){
			if (glOrder.panels[i].id === panelId){
				for(var j = 0; j < glOrder.panels[i].length; j++){
					if (glOrder.panels[i].tests[j] === testId){
						glOrder.panels[i].tests.splice(j,1);
						if(glOrder.panels[i].length === 0){
							glOrder.panels.splice(i,1);
						}
						return true;
					}
				}
			}
		}
		return false;
	}

	/* OBJECTS */

	var orderPanel = function(id){
		this.id = id;
		this.tests = [];
	}

	var orderSet = function(id,name,description){
		this.id = id;
		this.name = name;
		this.description = description;
		this.tests = [];
	}

	/*  SETS & ORDERS */
	var Set = function (id, name, description, type) {
		this.id = id; /*** ID OF THE TEST/PANEL ***/
		this.name = name; /* Description of the Test or Panel */
		this.description = description;
		this.type = type; /* TYPE : PRE-SET (1) - CUSTOM (DEFAULT) */
		this.tests = [];
	};

	var Order = function(){
		this.tests = [];
		this.panels = [];
		this.sets = [];
	};

	var glOrder = new Order();

	/* EXAMPLE INIT -> DELETE */
	var ArrSet = [],
		preSet1 = new Set('preset1','Cras mattis consectetur','Cras mattis consectetur purus sit amet fermentum. Aenean eu leo quam. Pallentesque ornare sem lacinia quam venenatis vestibulum. Cras justo odio, dapibus ac facilisis in, egestas eget quam', 1),
		preSet2 = new Set('preset2','Rupa don dreus','Cras mattis consectetur purus sit amet fermentum. Aenean eu leo quam. Pallentesque ornare sem lacinia', 1);

	ArrSet.push(preSet1);
	ArrSet.push(preSet2);

	renderSetInfo(true);
	/*** END EXAMPLE INIT ***/

	function renderSetInfo(){
		$('.set-info .pre-set').not('.default').remove();
		$('.set-info .custom').not('.default').remove();

		for(var i = 0; i < ArrSet.length; i++){
			if ( ArrSet[i].type === 1 ){ // PRESET
				var str = '<tr id="'+ ArrSet[i].id +'" class="pre-set"><td><div>'+ ArrSet[i].name +'</div></td></tr>';
				$(str).insertBefore('.set-info .pre-set.default');
			}else{ //CUSTOM
				var str = '<tr id="'+ ArrSet[i].id +'" class="custom"><td><div>'+ ArrSet[i].name +'</div></td></tr>';
				$(str).insertBefore('.set-info .custom.default');
			}
			
		}
	}

	function addTestToSet(idSet, idTest){
		for(var i = 0; i < ArrSet.length; i++){
			if (idSet === ArrSet[i].id){
				ArrSet[i].tests.push(idTest);
			}
		}
	}

 	function deleteTestFromSet(idSet,idTest){
 		var posSet = undefined;
 		for(var i = 0; i < ArrSet.length; i++){
 			if (ArrSet[i].id === idSet){
 				posSet = i;
 				break;
 			}
 		}

 		if (posSet !== undefined){
 			for(var i = 0; i < ArrSet[posSet].tests.length; i++){
 				if (idTest === ArrSet[posSet].tests[i]){
 					ArrSet[posSet].tests.splice(i, 1);
 				}
 			}
 		}
 	}

 	function deleteSet(idSet){
 		for(var i = 0; i < ArrSet.length; i++){
 			if (ArrSet[i].tests.length === 0 && idSet === ArrSet[i].id){
 				ArrSet.splice(i, 1);
 			}

 		}
	}

	/*** Adding new Order ***/
	$('.add-order, #main-container-results .add-to-order-button').on('click', function(e){
		/*****Check if (order === exists) return *****/
		var countOrders = parseInt($('#order').html() || 0) + 1;
		if($(e.target).hasClass('add-to-order-button')){
			var i = countOrders;
			$('.table-results > tbody > tr.active').each(function(){
				var activeTests = 0,
					totalTest = "",
					_id = $(this).attr('id');

				if ($(this).hasClass('panel')){
					insertPanelToOrder(_id);

					$('.set-elements .result-elementary.active',this).each(function(){
						insertTestpanelToOrder(_id,$(this).attr('id'));
					});
				}else{
					insertTestToOrder(_id);
				}

				//Rendering in Results Page
				$(this).find('.set-elements tr.active').each(function(){
					activeTests++;
				});

				(!!activeTests) && (totalTest = " ( " + activeTests + " )");

				var orderName = $('.title',this).html(),
					newLi = "<li><span class='order-id'>" + i++ + "</span><span class='order-name'>" + orderName + totalTest +"</span></li>";

				$(newLi).appendTo('#utilityBarExt .list-orders ul');
			});

		
			countOrders = i-1;
		}else if($(e.target).hasClass('add-order')){
			var orderName = $(this).parent().parent().siblings('.title').html(),
				newLi = "<li><span class='order-id'>" + countOrders + "</span><span class='order-name'>" + orderName + "</span></li>";

			$(newLi).appendTo('#utilityBarExt .list-orders ul');
			insertTestToOrder($(this).closest('.result-element').attr('id'));
		}
console.log(glOrder);
		$('#order').addClass('filled').html(countOrders);
		flashHighlight($('#order'));
	});
	/*** END Adding new Order ***/

	/*** When the Order of the Utility Bar is pressed, toggling its content ***/
	$('#order').on('click', function(){
		$('#order').addClass('active');
		$('#utilityBarExt').toggleClass('active');
		return false;
	});
	/*** END ***/

	$('.set-info').on('click', '.pre-set', function(){
		var $this = $(this);
			_link = $(this).parent().parent().attr('linkTo');

		if ( _link > -1 ){
			addTestToSet($this.attr('id'),_link);
		}else{
			$('.result-element.active').each(function(){
				if ($(this).hasClass('panel')){
					$('.set-elements .result-elementary.active',this).each(function(){
						addTestToSet($this.attr('id'),$(this).attr('id'));
					});
				}else{
					addTestToSet($this.attr('id'),$(this).attr('id'));
				}
			});
		}

		$(this).addClass('new');
		flashHighlight($(this));
	});

	$('.set-info').on('click', '.custom', function(){
		var $this = $(this);
			_link = $(this).parent().parent().attr('linkTo');
			
		if ( _link > -1 ){
			addTestToSet($this.attr('id'),_link);
		}else{
			$('.result-element.active').each(function(){
				if ($(this).hasClass('panel')){
					$('.set-elements .result-elementary.active',this).each(function(){
						addTestToSet($this.attr('id'),$(this).attr('id'));
					});
				}else{
					addTestToSet($this.attr('id'),$(this).attr('id'));
				}
			})
		}
		$(this).addClass('new');
		flashHighlight($(this));
	});

	function randomHash(len, charSet) {
		charSet = charSet || "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		var randomString = "";
		for (var i = 0; i < len; i++) {
			var randomPoz = Math.floor(Math.random() * charSet.length);
			randomString += charSet.substring(randomPoz,randomPoz+1);
		}
		return randomString;
	}

	/*** Toggling the Element Panel to create a New Set, and the Textbox & Button, which create a New Set ***/
	$('.newset-1, .newset-button').on('click', function(){
		if ($(this).hasClass('newset-button')){
			var value = $(this).siblings('.newset-tb').val();
			if (!checkInputString(value, "Set")){
				return false;
			}

			var setId = randomHash(10),
				_set = new Set(setId, value);

			ArrSet.push(_set);
 
			$('<tr id="' + setId + '" class="custom new"><td><div>'+value+'</div></td></tr>').insertBefore('.set-info .custom.default');
	
			$('.set-info .new');
			flashHighlight($('.set-info .new'));
		}
		$('.newset-1,.newset-2').toggle('height,opacity');
		$('.newset-tb').val('').focus();
		return false;
	});
	/*** END ***/

	/*** Header Results - Fixed Scrolling ***/
	var topHeaderResults,
		iniTopHeaderResults = $('.header-results').css('top');

	$(window).on('scroll', function(){
		if ($('.header-results').hasClass('active')){
			!!!topHeaderResults && (topHeaderResults = $('.header-results').offset().top);

			if($(this).scrollTop() >= topHeaderResults){
				$('.header-results').css({'top':$(this).scrollTop() - topHeaderResults - parseInt($('.header-results').css('padding-top')) + $('.header-results').height()});
			}else{
				$('.header-results').css({'top':iniTopHeaderResults});
			}
		}
	});
	/*** END ***/

	function renderPageSets(){
		$('#your-sets-page .table-results').remove();

		var mainStr = '<table class="table-results"><tr><th>'+ ArrSet.length +' Sets</th><th></th>';

		for(var i = 0; i < ArrSet.length; i++){
			var id = ArrSet[i].id,
				name = ArrSet[i].name,
				desc = ArrSet[i].description || "";

			mainStr += '<tr class="set-page-element" id_set="'+id+'"><td><input id="c-s-'+_id+'" type="checkbox"><label class="description" for="c-s-'+_id+'"><span class="checksetResults"></span><span class = "title">'+name+'</span><p>'+desc+'</p>';
			var str = '<table class="table-page-elements">';
			for(var j = 0; j < ArrSet[i].tests.length;j++){
				var _id = ArrSet[i].tests[j];
					$elem = $('#'+_id),
					_title = $(' > td > label > .title',$elem).html(),
					_type = "",
					_genes = $(' > td > .genes',$elem).html()
				
				$elem.hasClass('panel') && ( _type ='panel' ) ||
				$elem.hasClass('result-element') && ( _type = 'result-element') ||
				$elem.hasClass('result-elementary') && ( _type = 'result-elementary' );

				str += '<tr class="set-page-selement" id_elem="'+_id+'" type="'+_type+'"><td><input id="c-ss-'+_id+'" type="checkbox"><label class="description test" for="c-ss-'+_id+'"><span class="checksetResults"></span><span class = "title">'+_title+'</span>';
				str += '</label></td>';
				str += '<td><label class="genes">'+_genes+'</label></td></tr>';

				/*if ($elem.hasClass('panel')){
					var desc = $(' > td > label > p',$elem).html();
					str+= '<p>'+desc+'</p>';
					str += '</label></td></tr>';
				}else if($elem.hasClass('result-element')){
					var moreInfo =  $(' > td > label > .moreInfo',$elem).html();
					str += '<div class="moreInfo">'+ moreInfo +'</div>';
					str += '</label></td></tr>';
				}else if($elem.hasClass('result-elementary')){
					str += '</label></td></tr>';
					var parentId = $($elem).parent().parent().parent().parent().parent().attr('id');

				}*/
			}
			str += '</table>';
			mainStr += str+'</label></td><td></td></tr>';
		}
		mainStr += '</table>';
		$(mainStr).appendTo('#your-sets-page');
	}

	function renderPageOrder(){
		$('#your-order-page .table-results').remove();

		//ITEMS

		var mainStr = '<table class="table-results"><tr><th>'+ glOrder.tests.length +' Items</th><th></th>';

		for(var i = 0; i < glOrder.tests.length; i++){
			console.log(glOrder.tests[i]);
			var _id = glOrder.tests[i],
				_title = $('#main-container-results #'+_id+' .title').html(),
				_cat = $('#main-container-results #'+_id+' .category').siblings('.names').html(),
				_pack = $('#main-container-results #'+_id+' .package').siblings('.names').html(),
				_genes = $('#main-container-results #'+_id+' .genes').html();

			console.log('id : '+_id);
			mainStr += '<tr class="set-page-element" id_set="'+_id+'"><td><label class="description" for="c-s-'+_id+'"><span class = "title">'+_title+'</span>';
			mainStr += '<p><span class="category"></span>"'+ _cat +'"</p>';
			mainStr += '<p><span class="package"></span>"'+ _pack +'"</p>';
			mainStr += '</label></td><td>';
		}

		mainStr += '</table>';

		console.log($('#main-container-results #0'));

/*		//SETS

		mainStr2 = '<table class="table-page-order"><tr><th>'+ glOrder.sets.length +' Sets</th><th></th>';

		for (var i = 0; i < glOrder.sets.length;i++){
			var _id = glOrder.sets[i].id;
				_name = glOrder.sets[i].name,
				_description = glOrder.sets[i].description || "";

			mainStr2 += '<tr class="order-page-element" id_elem="'+_id+'"><td><label class="description"><span class = "title">'+_name+'</span>';
			for(var j = 0; j < glOrder.sets[i].tests.length;j++){
				var _idTest = glOrder.sets[i].tests[j]
				mainStr2 += '<table class="table-page-elements>"';
				str += '<tr class="order-page-selement" id_elem="'+_id+'"><td><input id="c-ss-'+_id+'" type="checkbox"><label class="description test" for="c-ss-'+_id+'"><span class="checksetResults"></span><span class = "title">'+_title+'</span>';
				str += '</label></td>';
				str += '<td><label class="genes">'+_genes+'</label></td></tr>';
			}
		}*/

		console.log(mainStr);
		$(mainStr).appendTo('#your-order-page');
	}


	$('.view-sets').on('click', function(){
		$('#items-page').siblings('div').each(function(){
			$(this).hide();
		});

		renderPageSets();
		
		deselectAllResults();
		hideSetsTopButtons();
		hideTopButtons();
		$('#items-page, #your-sets-page').show();
	});

	$('.viewOrderButton').on('click', function(){
		$('#items-page').siblings('div').each(function(){
			$(this).hide();
		});

		renderPageOrder();
		deselectAllResults();
		$('#items-page, #your-order-page').show();
	});

	function getParentIdSetSubElement(elem){
		return elem.closest('.set-page-element').attr('id_set');
	}

	$('.add-pageset-top-buttons .remove-button').on('click', function(){
		$('.add-pageset-top-buttons .table-results th').first().html('');

		$('.set-page-selement.active').each(function(){
			var _idSet = getParentIdSetSubElement($(this)),
				_idTest = $(this).attr('id_elem');

			deleteTestFromSet(_idSet,_idTest);
		});


		$('.set-page-element.active').each(function(){
			var _idSet = $(this).attr('id_set');
			deleteSet(_idSet);
		});

		hideSetsTopButtons();
		renderPageSets();
		renderSetInfo();
	});
});