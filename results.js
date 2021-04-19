var app = angular.module("FYP", []);
app.controller("QuizController", ['$scope',function($scope){
    $scope.clicked = function(){
        window.location = "#/homePage.html";
  }

  

}])