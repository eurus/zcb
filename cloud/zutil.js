function rejectFn(promise){
  return function(error){
    promise.reject(error);
  }
}
