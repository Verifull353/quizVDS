
// function load_db(){
//     var xhr = new XMLHttpRequest();
//     xhr.open('GET', './js/quiz_VDS.sqlite', true);
//     xhr.responseType = 'arraybuffer';
    
//     xhr.onload = e => {
//       var uInt8Array = new Uint8Array(this.response);
//       var db = new SQL.Database(uInt8Array);
//       var contents = db.exec("SELECT * FROM quiz");
//       // contents is now [{columns:['col1','col2',...], values:[[first row], [second row], ...]}]
//       console.log(contents);
//     };
//     xhr.send();
// }

var quiz_esame_nq;
var quiz_esame_done = 0;
var quiz_esame_correct = 0;
var punti_esame = 0;
var tot_points;
var quiz_seq_done = 0;
var quiz_seq_correct = 0;

function generate_sections(title,idx){
  
  var bkd = idx%4 + 1;
  
  var section_html = '  <div class="col-lg-4">\
          <a class="portfolio-item argomento" href="#test-seq">\
            <span class="caption">\
              <span class="caption-content">\
                <h3 class="argomento-titolo">'+title+'</h3>\
                <p class="mb-0">Tutte le domande!</p>\
              </span>\
            </span>\
            <img class="img-fluid" src="img/portfolio-'+bkd.toString()+'.jpg" alt="">\
          </a>\
        </div>';
        
  return section_html;
  
}


function esame_quiz_genera(sqldb,success){
  //load data to table
  
  var nquiz = $('input[name="nquiz"]').val();
  quiz_esame_nq = nquiz;

  //if 30 then use the rules for exam see (http://www.deltaclubdolada.it/wp-content/uploads/VDS_QUIZ.pdf)  
  if (nquiz == 30){
    var query = "select * from quiz_esame_30;";
  }else{
    var query = "select * from quiz WHERE quiz_id IN (SELECT quiz_id FROM quiz ORDER BY RANDOM() LIMIT "+nquiz.toString()+") order by quiz_id;";
  }
  var res = sqldb.exec(query);
  
  tot_points = 0;
  
  $.each(res[0].values,function(key,val){
    $('#esame-tabella tbody').append('\
      <tr>\
      <td><b>'+val[0].toString()+'</b></td>\
      <td class="border-left"><code>'+val[2].toString()+'</code>\
      <ol done="no">\
      <li correct="'+val[6].toString()+'" points="'+val[7].toString()+'"><div class="btn btn-light">'+val[3].toString()+'</div></li>\
      <li correct="'+val[6].toString()+'" points="'+val[7].toString()+'"><div class="btn btn-light">'+val[4].toString()+'</div></li>\
      <li correct="'+val[6].toString()+'" points="'+val[7].toString()+'"><div class="btn btn-light">'+val[5].toString()+'</div></li></ol>\
      </td>\
      </tr>\
      ');
    //console.log(val[7]);
    tot_points+= parseInt(val[7]);
    //console.log(tot_points);
    //console.log(val);
  });
  
  //$('.tot_nq_esame').html(nquiz.toString());
  $('.tot_nq_esame').html('<h4><div class="punteggio-esame">0</div>'+tot_points.toString()+'<i class="far fa-star"></i></h4>');
  success();
  
}

function loadQuestions(sqldb,argomento,success){
  //load data to table
  var query = "select * from quiz where sezione='"+argomento+"' order by quiz_id ;";
  //console.log(query);
  var res = sqldb.exec(query);
  
  $.each(res[0].values,function(key,val){
    $('#argomento-tabella tbody').append('\
      <tr>\
      <td><b>'+val[0].toString()+'</b></td>\
      <td class="border-left"><code>'+val[2].toString()+'</code>\
      <ol done="no">\
      <li correct="'+val[6].toString()+'" points="'+val[7].toString()+'"><div class="btn btn-light">'+val[3].toString()+'</div></li>\
      <li correct="'+val[6].toString()+'" points="'+val[7].toString()+'"><div class="btn btn-light">'+val[4].toString()+'</div></li>\
      <li correct="'+val[6].toString()+'" points="'+val[7].toString()+'"><div class="btn btn-light">'+val[5].toString()+'</div></li></ol>\
      </td>\
      </tr>\
      ');
    //console.log(val);
  });
  
  $('.tot_nq_seq').html(res[0].values.length.toString());
  
  success();
}

function loadBinaryFile(path,success) {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", path, true); 
            xhr.responseType = "arraybuffer";
            xhr.onload = function() {
                var data = new Uint8Array(xhr.response);
                var arr = new Array();
                for(var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
                success(arr.join(""));
            };
            xhr.send();
        };


function printContent(el){
  var currentscrollpos = $(window).scrollTop();

  var restorepage = $('body').html();
  var printcontent = $('#' + el).clone();
  $('body').empty().html(printcontent);
  window.print();
  $('body').html(restorepage);
  $('#loader-para').show();
  enable_quiz_buttons_sequenziale();
  setTimeout(function(){
    $('#loader-para').fadeOut('slow')
    $("html, body").animate({ scrollTop: currentscrollpos }, 500);
  },2000);

}

function reset_quiz_sequenziale(){
  $('#argomento-tabella li div.btn').removeClass('btn-warning');
  $('#argomento-tabella li div.btn').removeClass('btn-success');
  $('#argomento-tabella li div.btn').addClass('btn-light');
  
  $('#risposte_corrette').html('0');
  $('#risposte_errate').html('0');
  $('#risposte_corrette_mobile').html('0');
  $('#risposte_errate_mobile').html('0');
  
  $('#argomento-tabella ol').attr('done','no');
  
  quiz_seq_done = 0;
  quiz_seq_correct = 0;

}

function reset_quiz_esame(){
  $('#esame-tabella li div.btn').removeClass('btn-warning');
  $('#esame-tabella li div.btn').removeClass('btn-success');
  $('#esame-tabella li div.btn').addClass('btn-light');
  
  $('#risposte_corrette_esame').html('0');
  $('#risposte_errate_esame').html('0');
  $('#risposte_corrette_esame_mobile').html('0');
  $('#risposte_errate_esame_mobile').html('0');
  
  $('#esame-tabella ol').attr('done','no');
  
  quiz_esame_done = 0;
  quiz_esame_correct = 0;
  punti_esame = 0;
  $('.punteggio-esame').html(punti_esame.toString());

}

function enable_quiz_buttons(){
  
  $('#esame-tabella li div.btn').on('click',function(event){
                
      if ($(this).parent().parent().attr('done')!='yes'){
        //event.preventDefault();
        var index = $(this).parent('li').index() +1;
        var check = $(this).parent().attr('correct');
        var q_points = parseInt($(this).parent().attr('points'));
        //console.log(index);
        //console.log(check);

        if (index.toString() == check.toString()){
          //alert('BRAO');
          $(this).removeClass('btn-light');
          $(this).addClass('btn-success');
          $('#risposte_corrette_esame').html( parseInt($('#risposte_corrette_esame').html())+1 );
          $('#risposte_corrette_esame_mobile').html( parseInt($('#risposte_corrette_esame_mobile').html())+1 );
          quiz_esame_correct+=1;
          punti_esame+=q_points;
          //console.log(punti_esame);
          $('.punteggio-esame').html(punti_esame.toString());
        }else{
          //alert('SOMARO');
          $(this).removeClass('btn-light');
          $(this).addClass('btn-warning');
          $('#risposte_errate_esame').html( parseInt($('#risposte_errate_esame').html())+1 );
          $('#risposte_errate_esame_mobile').html( parseInt($('#risposte_errate_esame_mobile').html())+1 );
          findCorrect($(this).parent().parent());
        }
        
        $(this).parent().parent().attr('done','yes');
        
        quiz_esame_done+=1;
        
//        if(quiz_esame_done.toString() == $('.tot_nq_esame').html() ){  quiz_esame_nq
        if(quiz_esame_done == quiz_esame_nq ){  
          $('#quiz_svolti').html(quiz_esame_done.toString());
          $('#riepilogo_quiz_div').empty();
          $('#riepilogo_quiz_div').append( $('#risposte_corrette_esame').parent().html()+'&nbsp;&nbsp;'  );
          $('#riepilogo_quiz_div').append( $('#risposte_errate_esame').parent().html() + '<p><hr></hr></p>' );
          if (punti_esame >= parseInt(0.80 * tot_points)){
            $('#riepilogo_quiz_div').append( '<p><i class="far fa-thumbs-up">&nbsp;</i>Punteggio Esame:&nbsp;<span class="btn btn-success">'+punti_esame.toString()+'</span></p>' );
          }else{
            $('#riepilogo_quiz_div').append( '<p><i class="far fa-thumbs-down">&nbsp;</i>Punteggio Esame:&nbsp;<span class="btn btn-danger">'+punti_esame.toString()+'</span></p>' );
          };
          $('#riepilogo_quiz_div').append( '<hr></hr>' );

          var err = quiz_esame_done - quiz_esame_correct; 
          console.log(err);
          
          //if( err == 0){
          if(punti_esame == tot_points){
            $('#riepilogo_quiz_div').append('<h1><i class="fas fa-brain"></i><p>PERFETTO!</p> <p>Continua cosi\'!</p><p>Nessun errore.</p><p>'+punti_esame.toString()+'/'+tot_points.toString()+'</p></h1>');  
          //}else if (err == 1)
          }else if(punti_esame > parseInt(0.85 * tot_points)){
            $('#riepilogo_quiz_div').append('<h1><i class="fas fa-thumbs-up"></i>Quasi perfetto .. IDONEO</h1>');
          //}else if (err > 1 && err < 4){
          }else if (punti_esame >= parseInt(0.80 * tot_points)){
            $('#riepilogo_quiz_div').append('<h1><i class="fas fa-exclamation-triangle"></i>\
            <code>idoneo con superamento di una verifica orale, riguardante i quesiti errati;</code>\
            <p>Sei tra l\'80-85% di risposte corrette, cerca di farne al massimo 1 o nessuno meglio ancora!</p></h1>');
          }else{
            $('#riepilogo_quiz_div').append('<h1><i class="fas fa-skull-crossbones"></i>SOMARO - BOCCIATO</h1><p>Hai risposto correttamente a meno dell\'80% delle domande!</p>');
          }
          
          if (err>0){
            $('#riepilogo_quiz_div').append('<hr></hr><h2>Risposte che hai sbagliato:</h2>');
            var wrong_answers = $('#esame-tabella tr[print_errors="true"]');
            $.each(wrong_answers,function(wa,obj){
              console.log(obj);
              $('#riepilogo_quiz_div').append('<div>'+$(obj).html()+'</div>');
            });
          };
          $('#quiz_modal').fadeIn(1500);
          quiz_esame_done = 0;
          quiz_esame_correct = 0;
          punti_esame = 0;
        }
        
      } else {
        // doing nothing already tried.
      }
      
    })  
}

function findCorrect(elem){
  //console.log(elem[0]);
  $(elem[0]).find('div.btn').removeClass('btn-light');
  $(elem[0]).find('div.btn').addClass('btn-warning');
  var correct = $(elem[0]).find('li')[0].getAttribute('correct') -1;
  //console.log(correct);
  $($(elem[0]).find('div.btn')[correct]).removeClass('btn-warning');
  $($(elem[0]).find('div.btn')[correct]).addClass('btn-success');

  $($(elem[0])).closest('tr').attr('print_errors','true');
}

function enable_quiz_buttons_sequenziale(){
    $('#argomento-tabella li div.btn').on('click',function(event){
      
      if ($(this).parent().parent().attr('done')!='yes'){
        //event.preventDefault();
        var index = $(this).parent('li').index() +1;
        var check = $(this).parent().attr('correct');
        //console.log(index);
        //console.log(check);

        if (index.toString() == check.toString()){
          //alert('BRAO');
          $(this).removeClass('btn-light');
          $(this).addClass('btn-success');
          $('#risposte_corrette').html( parseInt($('#risposte_corrette').html())+1 );
          $('#risposte_corrette_mobile').html( parseInt($('#risposte_corrette_mobile').html())+1 );
        }else{
          //alert('SOMARO');
          $(this).removeClass('btn-light');
          $(this).addClass('btn-warning');
          $('#risposte_errate').html( parseInt($('#risposte_errate').html())+1 );
          $('#risposte_errate_mobile').html( parseInt($('#risposte_errate_mobile').html())+1 );
          findCorrect($(this).parent().parent());
        }
        
        $(this).parent().parent().attr('done','yes');
        
      } else {
        // doing nothing already tried.
      }
      
    })

}

$(document).ready(
  function(){
    

        loadBinaryFile('./js/quiz_VDS.sqlite', function(data){
            var sqldb = new SQL.Database(data);
            // Database is ready
            var res = sqldb.exec("select distinct sezione from quiz order by quiz_id;");
            //console.log(res[0].values);
            
            $('#section_cards').empty();
            $.each(res[0].values,function(key,val){
              //console.log(key);
              var html_card = generate_sections(val[0],key);
              $('#section_cards').append(html_card);
            });
            
            $('#loader-para').fadeOut('slow');
            
            //quiz esame
            $('#esame-tabella tbody').empty();
            esame_quiz_genera(sqldb,function(){
             //after loading data to table
             enable_quiz_buttons();
            });
            reset_quiz_esame();
            $('.esame_quiz_genera').on('click',function(){
              $('#esame-tabella tbody').empty();
              esame_quiz_genera(sqldb,function(){
               //after loading data to table
              });
              reset_quiz_esame();
              enable_quiz_buttons();
            });
            
            $('.argomento').on('click',function(){
  
              $('#loader-para').fadeIn('slow');
  
              var argomento = $(this).find('.argomento-titolo').html();
              $('#test-seq').hide();
              $('#argomento-selezionato').html( argomento );
              $('#test-seq').fadeToggle(2000);
              $('html, body').animate({
                scrollTop: $("#test-seq").offset().top
              }, 1000);
              
              // quiz sequenziale
              $('#argomento-tabella tbody').empty();
              loadQuestions(sqldb,argomento,function(){
                //after loading data to table
                $('#loader-para').fadeOut('slow');
              });
              reset_quiz_sequenziale();
              enable_quiz_buttons_sequenziale();

              
              //$('#argomento-tabella').DataTable();
  
            })
        });


    $('input[name="nquiz"]').on('propertychange change click keyup input paste',function(){
      // sychronize all input: mobile and desktop
      var value = $(this).val();
      $('input[name="nquiz"]').val(value);
    });
    
    //load_db();
    $('.print_quiz').on('click',function(){
      printContent('esame-div');    
    });
    
    $('.print_quiz_argomento').on('click',function(){
      printContent('quiz_sequenziale');    
    });
    
    $('.print_report').on('click',function(){
      printContent('riepilogo_quiz_div');
      // $('#quiz_modal').modal();
      // $('.modal-backdrop').remove();
      // $('#quiz_modal').modal('toggle');
    });
    
    $('.close_modal').on('click',function(){ $('#quiz_modal').fadeOut(1500); });
    
    //scroll desktop
    $(window).scroll(function() {

      var q_top = $('#recap_errors').position().top;
      var q_h = $('#recap_errors').height();    
      var scroll_y = $(window).scrollTop();
      var c_h = $('#recap_errors .card').height();
      
      var y = Math.max( 50, Math.min( scroll_y - q_top + 50 , q_h -  c_h - 50 ));
      
      $("#recap_errors .card").css({
        "top": (y) + "px",
        "left": ($(window).scrollLeft()) + "px"
      });
      
       var q_top1 = $('#recap_errors_esame').position().top;
      var q_h1 = $('#recap_errors_esame').height();    
      var scroll_y1 = $(window).scrollTop();
      var c_h1 = $('#recap_errors_esame .card').height();
      
      var y1 = Math.max( 50, Math.min( scroll_y1 - q_top1 + 50 , q_h1 -  c_h1 - 50 ));
      
      $("#recap_errors_esame .card").css({
        "top": (y1) + "px",
        "left": ($(window).scrollLeft()) + "px"
      });
    });

    //scroll mobile
    $(window).scroll(function() {

      var q_top = $('#quiz_esame').position().top;
      var q_h = $('#quiz_esame').height();    
      var scroll_y = $(window).scrollTop();
      var c_h = $('#recap_errors_esame_mobile .card_mobile').height();

      var q_top1 = $('#quiz_sequenziale').position().top;
      var q_h1= $('#quiz_sequenziale').height();    
      var scroll_y1 = $(window).scrollTop();
      var c_h1= $('#recap_errors_mobile .card_mobile').height();
      
      var y = Math.max( q_top + 50, Math.min( scroll_y + 50 , q_top + q_h -  c_h - 50 ));
      var y1 = Math.max( q_top1 + 50, Math.min( scroll_y1 + 50 , q_top1 + q_h1 -  c_h1 - 50 ));
      //console.log(y);
      
      $("#recap_errors_esame_mobile").css({
        "top": (y) + "px",
        //"left": ($(window).scrollLeft()) + "px"
      });
      $("#recap_errors_mobile").css({
        "top": (y1) + "px",
        //"left": ($(window).scrollLeft()) + "px"
      });

    });

    // if ($(window).width()>1000){
      $('[data-toggle="tooltip"]').tooltip({trigger : 'hover'});
    // }  

  }
);
