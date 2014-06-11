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

function getCookie(name) {
  var value = "; " + document.cookie;
  var parts = value.split("; " + name + "=");
  if (parts.length == 2) return parts.pop().split(";").shift();
}
    
$(document).ready(function(){
    console.log("Cookie data: "+document.cookie);
    //Hide modal if false
    if(getCookie("intro")==false){
        $(".modalbox").css("display","none");
    }
    else{
        document.cookie="intro=false";
    }
    //Modal control
    $(".close-modal").click(function(e){
        $(".modalbox").fadeOut(200);
        e.preventDefault();
    });
    //Ajxcall
    $("#mpform").submit(function(e){
        e.preventDefault();
        
        var txt = $(this).children("input").val();
        $("legend").text(txt);
        if(txt == 'password'){
            $(".modalbox").fadeOut(200);
        }
        
        $.ajax({
            url: "exec/exec.php",
            type: "POST"
        }).done(function(){
            $("legend").text('<a class="close-modal" href="#">Explore the map &raquo;</a><a class="close-modal" href="#">Explore the map &raquo;</a>');
        });
    });
});