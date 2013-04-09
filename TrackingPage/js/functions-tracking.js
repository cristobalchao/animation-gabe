$(document).ready(function(){

	/*** PROGRESS BAR **/
	var startProgressBar = false,
		currentProgressPos = parseFloat($('#current-progress').css('left'));

	$.fn.setActualElement = function() {
		var $this = this,
			$mark = $this.children('.mark'),
			$actual = $('#timeline > .process > .elem-timeline.active').last();

		setTimeout(function(){
			$actual.removeClass('active').addClass('actual');
			$mark.removeClass('active');
		}, 1000);
	}

	function checkProgressBar(){
		var	$progress = $('#bar-progress'),
			$mark = $('#current-progress'),
			posTimeline = $('#timeline').offset().left,
			valueProgress = Math.round(100*parseFloat($progress.css('width'))/938),
			cssValue = (valueProgress !== 100)?'13px':'6px';

		$mark.html(valueProgress+'%').css('padding-left',cssValue);

		$('#timeline > .process > .elem-timeline').each(function(){
			var posElem = $(this).offset().left,
			 	l = posElem - posTimeline;
			
			$(this).removeClass('actual');

			if (parseFloat($('#bar-progress').css('width')) > l){
				$(this).addClass('active');
			}else{
				$(this).removeClass('active');
			}
		});
	}

	$.fn.startProgressBar = function(){
		if(!!startProgress){
			checkProgressBar();
			setTimeout($(this).startProgressBar, 1);
		}
	}

	$.fn.changeWidthBar = function(width) {
		$this = this;
		$this.css('width',width);
		$('.mark',$this).addClass('active').addClass('checkActive').css('left',938*parseFloat(width)/100 + currentProgressPos +'px');
		startProgress = true;
		$this.startProgressBar();
	}

	$('#bar-progress, #bar-last').on('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd', 
		function() {
			startProgress = false;
			checkProgressBar();
			$(this).setActualElement();

			return false;
	});

	$('#current-progress, #last-progress').on('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd', 
		function() {
			return false;
	});

	/*** END PROGRESS BAR ***/


	/*** KALISTO ***/
	var prop = {	
			element: '.element',
			timing: 'cubic-bezier(1,-0.22,0,1.12)',
			duration: 1000,
			stopClass: 'crossed'
		};

	$('#container').kalisto(prop);

	/*** END KALISTO ***/


	$('.input-item').on('focus', function(){
		$(this).parent().parent().addClass('active');
	}).on('focusout', function(){
		$(this).parent().parent().removeClass('active');
	});

	$('.add-button').on('click', function(){
		var _value = $('.input-item').val();
		if ( _value !== ""){
			$('.input-item').val('');
			var str = "<tr class='new'><td><span class='check-item'>"+_value+"</span></td><td>Added by you</td></tr>";
			$(str).insertBefore($('.your-action .items tr').last()).animate({'opacity':1},500, function(){
				$(this).removeClass('new');
			});
		}
	});


	$('#control .close').on('click', function(){
		$('#control').toggleClass('active');
	});

	$('#control .last, #control .progress').on('focusout', function(){
		
		var val = 0;
		if ($(this).val() !== ""){
			val = $(this).val();
		}

		$('#bar-'+$(this).attr('class')).width(val+'%');
	});


	//init 

	(function disp_prompt(){
		var fname=prompt("Please enter the current progress of the patient ( % ):","");
		fname = parseInt(fname);
		if (fname != null){
			if (fname < 101 && fname > 0){
				$('#bar-progress').changeWidthBar(fname+'%');
			}
		}
	})();

});