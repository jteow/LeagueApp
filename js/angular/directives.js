angular.module('app')
    .directive('summonerProfile', function(){
        return{
            restrict: 'E',
            templateUrl: '../../html/partials/profile.html'
        }
    })

    .directive('onEnter', function () {
        return function (scope, element, attrs) {
            element.bind("keydown keypress", function (event) {
                if(event.which === 13) {
                    scope.$apply(function (){
                        scope.$eval(attrs.onEnter);
                    });
                    event.preventDefault();
                }
            });
        };
    })
;