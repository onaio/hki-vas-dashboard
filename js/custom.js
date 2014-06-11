var slider = $("#slider"),
	value = 0,
	year = 0,
	round = 0;

slider.slider({
	tooltip: 'none',
	formater: function(value){
		year = Math.floor(value);
		round = (Math.round(value)-year)+1;
		return Math.floor(value) + ' Round '+round;
	}
}).on('slide', function(evt){
	var value = evt.value;
	var year = Math.round(value);
	var round = 1;
	if((year-value) > 0){
		year = Math.floor(value);
		round = 2;
	}
	setReportParameters(year, round);
});

$(document).ready(function(){
    if($.cookie('hkistr')!=1){
        $(".modalbox").show();
    }
    //Modal control
    $(".close-modal").click(function(e){
        $(".modalbox").fadeOut(200);
        e.preventDefault();
    });
    //Ajxcall
    $("#mpform").submit(function(e){
        e.preventDefault();
        
        var tfield = $(this).children("input");
        var txt = tfield.val();
        if(txt == 'orange' || txt == undefined){
            $.cookie('hkistr',1);
            $(".modalbox").fadeOut(200);
        }
        else{
            $("#mpform").next("span").text("Enter correct password").addClass("error");
            tfield.addClass("error");
        }
    });
});