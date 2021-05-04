var output="";


function calculateScore() {
  var EISum = 0;
  var SNSum = 0;
  var TFSum = 0;
  var JPSum = 0;
  var radios = document.getElementsByTagName("input");
  var value;
  for (var i = 0; i < radios.length; i++) {
    if (radios[i].type === "radio" && radios[i].checked) {
      // get value, set checked flag or do whatever you need to
      key = radios[i].getAttribute("key");
      value = radios[i].value;
      question = radios[i].name;
      if (key === "EI") {
        EISum = EISum + +value;
      } else if (key === "SN") {
        SNSum = SNSum + +value;
      } else if (key === "TF") {
        TFSum = TFSum + +value;
      } else {
        JPSum = JPSum + +value;
      }
    }
  }
 
  if (EISum >= 12) {
    output += "E";
  } else {
    output += "I";
  }
  if (SNSum >= 12) {
    output += "N";
  } else {
    output += "S";
  }
  if (TFSum >= 12) {
    output += "F";
  } else {
    output += "T";
  }
  if (JPSum >= 12) {
    output += "P";
  } else {
    output += "J";
  }
  console.log(EISum);
  console.log(SNSum);
  console.log(TFSum);
  console.log(JPSum);

  window.location.href = "file:///Users/dbaz/Desktop/FYP/" +output+".html"
  console.log(output);
  return output;
}

//window.location.href = "http://www.w3schools.com";

/*
function redirector(output){

  console.log(output)
  if (output == "ENFP"){
    window.location = "#/ENFP.html";
  }

  else if (output = "ENFJ"){
    location.href = "#/ENFJ.html";
  }

  else if (output = "ENTJ"){
    window.location = "#/ENTJ.html";
  }

  else if (output = "ENTP"){
    window.location = "#/ENTP.html";
  }

  else if (output = "ESFJ"){
    window.location = "#/ESFJ.html";
  }

  else if (output = "ESFP"){
    window.location = "#/ENFP.html";
  }

  else if (output = "ESTJ"){
    window.location = "#/ESTJ.html";
  }

  else if (output = "ESTP"){
    window.location = "#/ESTP.html";
  }

  else if (output = "INFJ"){
    window.location = "#/INFJ.html";
  }

  else if (output = "INFP"){
    window.location = "#/INFP.html";
  }

  else if (output = "INTJ"){
    window.location = "#/INTJ.html";
  }

  else if (output = "INTP"){
    window.location = "#/INTP.html";
  }

  else if (output = "ISFJ"){
    window.location = "#/ISFJ.html";
  }

  else if (output = "ISFP"){
    window.location = "#/INFP.html";
  }

  else if (output = "ISTJ"){
    window.location = "#/ISTJ.html";
  }

  else if (output = "ISTP"){
    window.location = "#/ISTP.html";
  }
}*/

var app = angular.module("FYP", []);
app.controller("QuizController", ['$scope',function($scope){

}])