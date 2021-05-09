var feedback;
function submit(){
    feedback=document.getElementById("feedbackBox").value;
    console.log(feedback);
    alert("Thank you for your feedback!")
}
var app = angular.module("FYP", []);
app.controller("QuizController", ['$scope',function($scope){
  
}])