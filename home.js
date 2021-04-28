function calculatescore() {
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
  var output = "";
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
  console.log(output);
  return output;
}

var app = angular.module("FYP", []);
app.controller("QuizController", [
  "$scope",
  function ($scope) {
    $scope.clicked = function () {
      window.location = "#/resultsPage.html";
    };
  },
]);
