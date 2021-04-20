var app = angular.module("FYP", []);
app.controller("QuizController", ['$scope',function($scope){
  
  $scope.clicked = function(){
     window.location = "#/resultsPage.html";
  }

  var EISum, SNSum, TFSum, JPSum = 0; // setting sums from inputs

  
  function calculatescore(){
    var radios = document.getElementsByTagName('input');
    var value;
    for (var i = 0; i < radios.length; i++) {
      
      if (radios[i].type === 'radio' && radios[i].checked) {
        // get value, set checked flag or do whatever you need to
        value = radios[i].value;       
        console.log(value)
      }
    }

    return value;
  }

}])