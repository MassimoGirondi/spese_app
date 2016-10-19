/* eslint no-alert: 0 */

'use strict';

//
// Here is how to define your module
// has dependent on mobile-angular-ui
//


var app = angular.module('spese', [
  'ngRoute',
  'mobile-angular-ui',

  // touch/drag feature: this is from 'mobile-angular-ui.gestures.js'.
  // This is intended to provide a flexible, integrated and and
  // easy to use alternative to other 3rd party libs like hammer.js, with the
  // final pourpose to integrate gestures into default ui interactions like
  // opening sidebars, turning switches on/off ..
  'mobile-angular-ui.gestures',
]);

app.run(function($transform) {
  window.$transform = $transform;
});

//
// You can configure ngRoute as always, but to take advantage of SharedState location
// feature (i.e. close sidebar on backbutton) you should setup 'reloadOnSearch: false'
// in order to avoid unwanted routing.
//
app.config(function($routeProvider) {
  $routeProvider.when('/', {templateUrl: 'home.html', reloadOnSearch: false});
  $routeProvider.when('/membri', {templateUrl: 'membri.html', reloadOnSearch: false});
  $routeProvider.when('/edit_membro/:id', {templateUrl: 'edit_membro.html', reloadOnSearch:false});
  $routeProvider.when('/edit_spesa/:id', {templateUrl: 'edit_spesa.html', reloadOnSearch:false});
  $routeProvider.when('/conguaglio', {templateUrl: 'conguaglio.html', reloadOnSearch:false});
  $routeProvider.when('/dati', {templateUrl: 'dati.html', reloadOnSearch:false});
  $routeProvider.when('/tutte_spese', {templateUrl: 'tutte_spese.html', reloadOnSearch:false});
  $routeProvider.when('/speso', {templateUrl: 'speso.html', reloadOnSearch:false});
  $routeProvider.when('/correggi', {templateUrl: 'correggi.html', reloadOnSearch:false});
});

app.controller('membri', ['$scope','$window','$location', function($scope,$window,$location) {

  if(membri.length!=0)
  {
    var elenco=[];
    for (var i = 0; i < membri.length; i++) {
       elenco.push({name : membri[i],id : i});
    }
    $scope.scrollItems=elenco;
  }
    if($window.localStorage['spese'])
      $scope.spese_presenti=true;
    else {
        $scope.spese_presenti=false;
    }
}]);

app.controller('edit_membro', ['$scope','$window','$routeParams', function($scope,$window,$routeParams) {

  var id=$routeParams.id;

  if(id>=0 && id< membri.length)
  {
    $scope.nome=membri[id];
    $scope.mod_btn="Modifica";
    if(!$window.localStorage['spese'])
      $scope.el_btn=true;

  }
  else {
    $scope.nome="";
    $scope.mod_btn="Aggiungi";
    $scope.el_btn=false;

  }

  $scope.elimina = function() {
    //alert("elimina "+id);

    if(confirm("Vuoi davvero eliminare "+membri[id]+"?"))
    {
      membri.splice(id,1);
      $window.localStorage['membri']=membri.join('$');
    }

    $window.location = "#/membri";
  };


  $scope.modifica = function() {

      if($scope.mod_btn=="Modifica")
      {
        membri[id]=document.getElementById("nome").value;
        $window.localStorage['membri']=membri.join('$');
      }

      else {
          //alert($scope.mod_btn+" "+document.getElementById("nome").value);
        membri.push(document.getElementById("nome").value);
        $window.localStorage['membri']=membri.join('$');
      }
      $window.location = "#/membri";
  };

}]);

app.controller('nuova_spesa', ['$scope','$window','$routeParams', function($scope,$window,$routeParams) {

  if(membri.length!=0)//se ci sono membri
  {
      var elenco=[];
      for (var i = 0; i < membri.length; i++) {
         elenco.push({name : membri[i],id : i});
      }
      $scope.membri_presenti=true;
      $scope.items=elenco;

      var id=$routeParams.id;

      if(id<0)//inserimento nuovo
      {
            $scope.btn="Aggiungi spesa";
            $scope.nuova=function(spesa)
                {
                  var importo=spesa.importo;
                  var pagante=spesa.pagante;
                  var altri=spesa.altri;

                  var spese="";
                  if( $window.localStorage['spese'])
                    {
                      spese=$window.localStorage['spese']+",";
                    }

                  spese+=(angular.toJson({'importo': importo, 'pagante' : pagante, 'altri':altri}));
                //  console.log(angular.toJson({'importo': importo, 'pagante' : pagante, 'altri':altri}));
                //  console.log(spese);
                  $window.localStorage['spese']=spese;
                  $window.location = "#/tutte_spese";
                };
      }
    else {//modifica vecchio
        $scope.btn="Modifica spesa";
        var json="["+$window.localStorage['spese']+"]";
        //console.log(json);
        var spese=JSON.parse(json);
        $scope.spesa={'importo': spese[id]['importo'],'pagante': spese[id]['pagante'],'altri': spese[id]['altri']};

        $scope.nuova=function(spesa)
              {
                var spesa_n={ 'importo': spesa.importo,
                              'pagante': spesa.pagante,
                              'altri':   spesa.altri
                            };
                spese[id]=spesa_n;
                var str=angular.toJson(spese);
                $window.localStorage['spese']=str.substring(1, str.length-1);
                $window.location = "#/tutte_spese";
              };
        $scope.rimuovi=function(spesa)
              {

                if(confirm("Vuoi davvero eliminare la spesa"+"?"))
                {
                  spese.splice(id,1);


                $window.localStorage['spese']=angular.toJson(spese);
                //$window.location = "#/edit_spesa";
                $window.location = "#/tutte_spese";
                }
              };

      }
}
}]);

app.controller('conguaglio', ['$scope','$window','$routeParams', function($scope,$window,$routeParams) {
  if($window.localStorage['spese'])
    {
      $scope.spese_presenti=true;
      var json="["+$window.localStorage['spese']+"]";
      //console.log(json);
      var spese=JSON.parse(json);
      //console.log(spese);
      var importi=[];
      for (var i = 0; i < membri.length; i++) {
        importi[i]=0.0;
      }

      for (var s in spese) {
          var n=spese[s]['altri'].length;
          var importo=spese[s]['importo'];
          var pagante=spese[s]['pagante'];

          importi[pagante]+=importo;
          importo/=1.0*n;

           for (var p in spese[s]['altri']) {
               importi[p]-=(importo);

          }
      }


      var items=[];
      for (var i = 0; i < membri.length; i++) {
        //console.log(membri[i]+" "+importi[i]);
        items.push({'name': membri[i], 'importo': arrotonda(importi[i])});

      }


      $scope.items=items;
    }
  else
    $scope.spese_presenti=false;
}]);

app.controller('dati', ['$scope','$window','$routeParams', function($scope,$window,$routeParams) {
  $scope.tutto=function()
  {
    if(confirm("Sicuro di voler eliminare tutti i dati?"))
      {
        $window.localStorage.clear();
        $window.location = "#/";
      }
  };
  $scope.spese=function()
  {
    if(confirm("Sicuro di voler eliminare tutte le spese?"))
      {
          if($window.localStorage['spese'])  $window.localStorage['spese']="";
          $window.location = "#/";
      }
  }

}]);
app.controller('tutte_spese', ['$scope','$window','$routeParams', function($scope,$window,$routeParams) {


  if($window.localStorage['spese'] && $window.localStorage['spese'].length>0)
    {
      $scope.spese_presenti=true;
      var json="["+$window.localStorage['spese']+"]";
      //console.log(json);
      var spese=JSON.parse(json);
      //console.log(spese);

      var items=[];
      for (var s in spese) {
          var n=spese[s]['altri'].length;
          var importo=spese[s]['importo'];
          var pagante=spese[s]['pagante'];
          var altri="";
          for (var p in spese[s]['altri']) {
            //  console.log(membri[p]);
              altri+= ","+membri[spese[s]['altri'][p]];
         }
         //console.log(altri);

          items.push({name: membri[pagante], 'importo': arrotonda(importo),'altri': altri.substring(1), id: s});
      }
      $scope.items=items;
    }
  else {
    $scope.spese_presenti=false;

  }

}]);


app.controller('home', ['$scope','$window','$routeParams', function($scope,$window,$routeParams) {

  if($window.localStorage['spese'] && $window.localStorage['spese'].length>0)
    {
      $scope.spese_presenti=true;

      var json="["+$window.localStorage['spese']+"]";
      var spese=JSON.parse(json);

      var tot=0;
      for (var s in spese) {
          tot+=spese[s]['importo'];
        //  console.log(spese[s]['importo']);
      }
      $scope.totale=tot;
    }


}]);


app.controller('speso', ['$scope','$window','$routeParams', function($scope,$window,$routeParams) {



  if($window.localStorage['spese'])
    {
      $scope.membri_presenti=true;
      var json="["+$window.localStorage['spese']+"]";
      //console.log(json);
      var spese=JSON.parse(json);
      //console.log(spese);
      var importi=[];
      for (var i = 0; i < membri.length; i++) {
        importi[i]=0.0;
      }

      for (var s in spese) {
          var n=spese[s]['altri'].length;
          var importo=spese[s]['importo'];
          var pagante=spese[s]['pagante'];

          //importi[pagante]+=importo;
          importo/=1.0*n;

           for (var p in spese[s]['altri']) {
               importi[p]+=(importo);

          }
      }


      var items=[];
      for (var i = 0; i < membri.length; i++) {
        //console.log(membri[i]+" "+importi[i]);
        items.push({'name': membri[i], 'importo': arrotonda(importi[i])});

      }


      $scope.items=items;
    }
  else
    $scope.membri_presenti=false;

}]);



app.controller('correggi', ['$scope','$window','$routeParams', function($scope,$window,$routeParams) {
  if(membri.length!=0)
  {
    $scope.membri_presenti=true;
    var elenco=[];
    for (var i = 0; i < membri.length; i++) {
       elenco.push({name : membri[i],id : i});
    }
    $scope.scrollItems=elenco;
  }

}]);



app.controller('MainController', ['$scope','$window',function($scope,$window) {
  if($window.localStorage['membri'])
    membri=$window.localStorage['membri'].split('$');
}]);

var membri=[];

function arrotonda(N){N=parseFloat(N);if(!isNaN(N))N=N.toFixed(2);else N='0.00';return N;}




function hideAddressBar(){
  if(document.documentElement.scrollHeight<window.outerHeight/window.devicePixelRatio)
    document.documentElement.style.height=(window.outerHeight/window.devicePixelRatio)+'px';
  setTimeout(window.scrollTo(1,1),0);
}
window.addEventListener("load",function(){hideAddressBar();});
window.addEventListener("orientationchange",function(){hideAddressBar();});
// if (window.cordova && StatusBar)
// {
//     StatusBar.backgroundColorByHexString('#f7f7f7');
// }
