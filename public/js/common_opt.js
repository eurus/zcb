$(document).ready(function(){
    $('#sendbtn').prop('disabled',true);
    $('#msg').keyup(function(){
        $('#sendbtn').prop('disabled', $.trim(this.value) == "" ? true : false);     
    })
});  