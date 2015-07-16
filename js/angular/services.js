angular.module('app')

    .factory('leagueApi', ['$http', function($http){

        //Auth key
        var base = 'https://na.api.pvp.net/api/lol';
        var key = 'api_key=ce101e40-58a8-41fa-be45-a7575546883d';

        //Summoner statistic requests
        //Get summoner info
        var getSummonerId = function(region, summonerName){
            var request = {
                method: 'GET',
                url: base + '/'+ region + '/v1.4/summoner/by-name/' + summonerName + '?' + key
            };

            return $http(request);
        };

        //Get summoner statistics
        var getSummonerData = function(region, id){
            var request = {
                method: 'GET',
                url: base + '/' + region + '/v1.3/stats/by-summoner/' + id + '/summary?' + key
            };

            return $http(request);
        };

        //Get summoner ranked statistics
        var getSummonerRankedData = function(region, id){
            var request = {
                method: 'GET',
                url: base + '/' + region + '/v1.3/stats/by-summoner/' + id + '/ranked?' + key
            };

            return $http(request);
        };

        //Champion info
        var getChampionInfo = function(){
            var request = {
                method: 'GET',
                url: base + '/static-data/oce/v1.2/champion?' + key
            };

            return $http(request);
        };


        return{
            getSummonerId:getSummonerId,
            getSummonerData:getSummonerData,
            getSummonerRankedData:getSummonerRankedData,
            getChampionInfo: getChampionInfo
        }
    }])

    .factory('summonerStatsFactory', function(){

        var data = null;

        var get = function(){
            return data
        };
        var set = function(input){
            data = input;
        };

        return {
            get: get,
            set: set
        }
    });
