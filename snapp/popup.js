document.addEventListener('DOMContentLoaded', function() {
  var checkPageButton = document.getElementById('checkPage');
  checkPageButton.addEventListener('click', function() {

    chrome.tabs.executeScript(null, { file: "jquery-2.1.4.min.js" }, function() {
    chrome.tabs.executeScript(null, { file: "snapp.js" });
    });
  }, false);
}, false);
