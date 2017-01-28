var startButtonData = ['Resident Evil','Call of Duty','Minecraft','Overwatch'];
var buttonData = JSON.parse(localStorage.getItem("buttonResults")) || startButtonData;
var buttonsDiv = document.getElementById("buttons");
var searchButton = document.getElementById("searchButton");
var searchBox = document.getElementById("search");
var clearButton = document.getElementById("clear");
var giphyData = JSON.parse(localStorage.getItem("giphyResults")) || [];
var suggestCallBack; // global var for autocomplete jsonp


function createButtons(){

  for(var i = 0; i < buttonData.length; i++){
    var button = document.createElement('button');
    var text = document.createTextNode(buttonData[i]);
    button.appendChild(text);
    button.dataset.name = buttonData[i];
    button.className = ('custom-button');
 
    button.addEventListener('click', function(){
      callGiphy(this.dataset.name);
    })
    
    buttonsDiv.appendChild(button);
  }

}

function callGiphy(search){
  search = search.replace(' ','+');
  $.ajax({
    url: 'https://api.giphy.com/v1/gifs/search?',
    data: {
      api_key: 'dc6zaTOxFJmzC',
      q: search,
      limit: 10
    }

  }).done(function(returnData) {
    giphyData = returnData.data;
    localStorage.setItem("giphyResults", JSON.stringify(giphyData));
    putOnPage();
  });
}

function putOnPage(){

    document.getElementById('gif-section').innerHTML = "";

    for (var i = 0; i < giphyData.length; i++){
      var stillUrl = giphyData[i].images.fixed_height_still.url;
      var animatedUrl = giphyData[i].images.fixed_height.url;
      var rating = giphyData[i].rating;

      var divOuter = document.createElement('div');
      var divInner = document.createElement('div');
      var divCaption = document.createElement('div');
      var ratingHeading = document.createElement('h3');
      var img = document.createElement('img');

      if(i === 8){
        divOuter.className = ('col-xs-12 col-sm-12 col-md-3 col-md-offset-3')
      } else{
        divOuter.className = ('col-xs-12 col-sm-12 col-md-3')
      }
      
      divInner.className = ('thumbnail');
      divCaption.className = ('caption');
      ratingHeading.className = ('text-center');

      ratingHeading.innerHTML = "Rating: " + rating;
      divCaption.appendChild(ratingHeading);

      img.setAttribute('src', stillUrl);
      img.dataset.state = "still";
      img.dataset.still = stillUrl;
      img.dataset.animate = animatedUrl;
      divInner.appendChild(img);
      divInner.appendChild(divCaption);
      divOuter.appendChild(divInner);

      document.getElementById('gif-section').appendChild(divOuter);
    }

    var imgs = document.querySelectorAll('img');
    for(var j = 0; j < imgs.length; j++){
      imgs[j].addEventListener('click', function(){
        if(this.dataset.state === 'still'){
          this.setAttribute('src', this.dataset.animate);
          this.dataset.state = 'animated';
        } else {
          this.setAttribute('src', this.dataset.still);
          this.dataset.state = 'still';
        }
      })
    }

}

$( document ).ready(function(){

  createButtons();

  putOnPage();
  
  searchButton.addEventListener("click", function(){
    buttonData.push(searchBox.value);
    localStorage.setItem("buttonResults", JSON.stringify(buttonData));
    buttonsDiv.innerHTML = "";
    searchBox.value = "";
    createButtons();
  })
  
  clearButton.addEventListener("click", function(){
    document.getElementById('gif-section').innerHTML = "";
    document.getElementById('buttons').innerHTML = "";
    localStorage.clear();
    buttonData = ['cat','dog','bird','horse'];
    createButtons();
  })

  $("#search").autocomplete({
      source: function(request, response) {
          $.getJSON("https://suggestqueries.google.com/complete/search?callback=?",
              {
                "hl":"en", // Language
                "jsonp":"suggestCallBack", // jsonp callback function name
                "q":request.term, // query term
                "client":"youtube" // force youtube style response, i.e. jsonp
              }
          );
          suggestCallBack = function (data) {
              var suggestions = [];
              $.each(data[1], function(key, val) {
                  suggestions.push({"value":val[0]});
              });
              suggestions.length = 5; // prune suggestions list to only 5 items
              response(suggestions);
          };
      },
  });  
  
});
