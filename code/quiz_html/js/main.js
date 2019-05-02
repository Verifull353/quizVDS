function printContent(el){
var restorepage = $('body').html();
var printcontent = $('#' + el).clone();
$('body').empty().html(printcontent);
window.print();
$('body').html(restorepage);
}

$(document).ready(
  function(){

    $('#print_quiz').on('click',function(){
      printContent('output_html');    
    });
  }
);
