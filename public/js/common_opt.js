$(document).ready(function(){
    $('#sendbtn').prop('disabled',true);
    $('#msg').keyup(function(){
        $('#sendbtn').prop('disabled', this.value == "" ? true : false);     
    })
});  