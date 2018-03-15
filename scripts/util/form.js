define(function(require){
  //////////////////////////////////
  /////////////////////////////////
  // /// Form Utilties
  ///////////////////////////////
  var getValue = function(form){
    return $(form).find("input").eq(0).val();
  }
  
  this.validate = function(form){
    return !!getValue(form);
  }

  this.getValue = function(form){
    return getValue(form);
  }
  
  this.reset = function(form){
    $("input", form).val("");
  }
  return this;
  
})