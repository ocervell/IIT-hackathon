$('#jobnumber').focusout(function(){
      var jobnumber=$('#jobnumber').val()
      $.ajax({
            url: '/',
            data: $('form').serialize(),
            type: 'POST',
            // success: function(response) {
            //     //I need to some how be able to populate my table with the returned list called jobs;
            // },
            // error: function(error) {
            //     alert(error);
            // }
        });
});