angular.module('app')

    // League info
    .controller('SearchCtrl', ['leagueApi', '$scope', '$rootScope', 'summonerStatsFactory', '$q',
        function(leagueApi, $scope, $rootScope, summonerStatsFactory, $q){
        //variables
        $scope.summonerName = "";
        $scope.regions = ['oce', 'na', 'eune', 'euw', 'kr'];
        $scope.selectedRegion = $scope.regions[0];
        $scope.summonerStats = null;
        $scope.unranked = null;
        $scope.ranked = null;
        $scope.viewSearch = true;
        $scope.errorMsg = false;

        /**
         *
         * Setting the region
         */
        $scope.selectRegion = function(region){
            $scope.selectedRegion = region;
        };

        /**
         *
         * Remove error message once user starts typing
         */
        $scope.hideErrorMsg = function(){
            $scope.errorMsg = false;
        };

        /**
         *
         * Move globe according to region
         */
        $scope.moveGlobe = function(region){
            switch(region){
                case 'oce':
                target.x = 7.05;
                target.y = 6;
                break;
            case 'na':
                target.x = 9.2;
                target.y = 7;
                break;
            case 'euw':
                target.x = 4.6;
                target.y = 7.1;
                break;
            case 'eune':
                target.x = 5;
                target.y = 7;
                break;
            case 'kr':
                target.x = 6.9;
                target.y = 6.95;
                break;
            default:

            }
        };

       /**
        *
        * Champion list is constant hence is outside function to avoid getting called repeatedly
        */
        leagueApi.getChampionInfo().success(function(data){
            $scope.championArray = data.data;
            $scope.championNameArray = Object.keys(data.data);
        });

        /**
         *
         * utilising id from param to obtain champion name and title
         */
        $scope.getChampionName = function(id){
            for(var i = 0; i < $scope.championNameArray.length; i++){
                if($scope.championArray[$scope.championNameArray[i]].id == id){
                    var champion = {
                        name: $scope.championArray[$scope.championNameArray[i]].name,
                        title: $scope.championArray[$scope.championNameArray[i]].title
                    };
                    return champion;
                }
            }
        };




        /**
         *
         * Function to get all the summoner's statistics
         */
        $scope.getSummonerStats = function(name) {
            var promises = [];
            //If name is not empty
            if (name != "" && name != undefined && name != null) {

                leagueApi.getSummonerId($scope.selectedRegion, name).success(function(data){
                    //Obtaining summoner name and ID as stored in API object
                    var summonerNameApi = name.toLowerCase();
                    var summonerId = data[summonerNameApi].id;
                    $scope.summonerName = data[summonerNameApi].name;

                    promises.push($scope.getSummonerUnrankedData(summonerId));
                    promises.push($scope.getSummonerRankedData(summonerId));

                    $q.all(promises);
                }).error(function(){
                    $scope.errorMsg = true;
                    $scope.summonerName = '';
                })
            }
        };


        /**
         *
         * Function to get summoner's unranked data
         */
        $scope.getSummonerUnrankedData = function(summonerId){
            var deferred = $q.defer;
            leagueApi.getSummonerData($scope.selectedRegion, summonerId).success(function (data) {
                //storing data for specified unranked game types
                $scope.unranked = [];
                var playerStats = data['playerStatSummaries'];

                //Base object construct that will be added to the unranked array
                var construct = function(obj, type){
                    var buildObj = {
                        //sub-variables that will either be assigned the coressponding data OR
                        //be assigned default values if a game mode doesn't exist
                        gameMode: obj ? playerStats[i].playerStatSummaryType : type,
                        wins: obj ? playerStats[i].wins : 0
                    };
                    //push object to unranked array
                    $scope.unranked.push(buildObj)
                };

                //creating triggers to determine whether game type data exists for summoner
                var unRankedTrig = false;
                var unRanked3Trig = false;
                var unRankedATrig = false;

                //loop through unranked stats and creating objects based on the game type
                for(var i = 0; i < playerStats.length; i++){
                    if(playerStats[i].playerStatSummaryType == 'Unranked'){
                        construct(playerStats[i]);
                        unRankedTrig = true;
                    }
                    if(playerStats[i].playerStatSummaryType == 'Unranked3x3'){
                        construct(playerStats[i]);
                        unRanked3Trig = true;
                    }
                    if(playerStats[i].playerStatSummaryType == 'AramUnranked5x5'){
                        construct(playerStats[i]);
                        unRankedATrig = true;
                    }
                }

                //If any of the triggers did not fire, still create object but with default values
                if(!unRankedTrig) {construct(null, 'Unranked')}
                if(!unRanked3Trig) {construct(null, 'Unranked3x3')}
                if(!unRankedATrig) {construct(null, 'AramUnranked5x5')}
                return deferred.promise;
            }).error(function(e) {
                return deferred.reject;
            });
        };

        /**
         *
         * Function to get ranked data from ranked api
         */
        $scope.getSummonerRankedData = function(summonerId) {
            var deferred = $q.defer;
            leagueApi.getSummonerRankedData($scope.selectedRegion, summonerId).success(function (data) {
                //storing data from ranked games
                $scope.ranked = null;
                $scope.rankedChamps = [];
                $scope.rankedOverall = null;
                var playerRankedStats = data['champions'];

                //storing ranked stats for each individual champion user has played
                //Obj for individual champions
                var constructChamp = function (id, name, title, win, loss, kills, double, triple, quadra, penta) {
                    var buildObj = {
                        id: id,
                        champName: name,
                        champTitle: title,
                        wins: win,
                        losses: loss,
                        kills: kills,
                        doubleKill: double,
                        tripleKill: triple,
                        quadraKill: quadra,
                        pentaKill: penta
                    };

                    $scope.rankedChamps.push(buildObj)
                };

                //Object for overall ranked stats
                var constructOverall = function (id, total, win, loss, gold, time, alive) {
                    $scope.rankedOverall = {
                        id: id,
                        gamesPlayed: total,
                        wins: win,
                        losses: loss,
                        goldEarned: gold,
                        timePlayed: time,
                        timeAlive: alive
                    };
                };

                for (var i = 0; i < playerRankedStats.length; i++) {

                    var champion = $scope.getChampionName(playerRankedStats[i].id);

                    if (playerRankedStats[i].id !== 0) {
                        constructChamp(playerRankedStats[i].id,
                            champion.name, champion.title,
                            playerRankedStats[i].stats.totalSessionsWon,
                            playerRankedStats[i].stats.totalSessionsLost,
                            playerRankedStats[i].stats.totalChampionKills,
                            playerRankedStats[i].stats.totalDoubleKills,
                            playerRankedStats[i].stats.totalTripleKills,
                            playerRankedStats[i].stats.totalQuadraKills,
                            playerRankedStats[i].stats.totalPentaKills
                        )
                    } else if (playerRankedStats[i].id == 0) {
                        constructOverall(playerRankedStats[i].id,
                            playerRankedStats[i].stats.totalSessionsPlayed,
                            playerRankedStats[i].stats.totalSessionsWon,
                            playerRankedStats[i].stats.totalSessionsLost,
                            playerRankedStats[i].stats.totalGoldEarned,
                            playerRankedStats[i].stats.maxTimePlayed,
                            playerRankedStats[i].stats.maxTimeSpentLiving
                        )
                    }
                }

                //push final api data to service
                $scope.ranked = {
                    overall: $scope.rankedOverall,
                    champs: $scope.rankedChamps
                };

                $scope.summonerStats = {
                    name: $scope.summonerName,
                    unranked: $scope.unranked,
                    ranked: $scope.ranked
                };
                summonerStatsFactory.set($scope.summonerStats);

                $rootScope.$broadcast('apiFinished');

                $scope.viewSearch = false;

                return deferred.promise;
            }).error(function () {
                $scope.ranked = {
                    msg: 'Summoner is yet to play ranked'
                };

                //push final api data to service
                $scope.summonerStats = {
                    name: $scope.summonerName,
                    unranked: $scope.unranked,
                    ranked: $scope.ranked
                };
                summonerStatsFactory.set($scope.summonerStats);

                $rootScope.$broadcast('apiFinished');

                $scope.viewSearch = false;

                return deferred.reject;
            });
        };


        $rootScope.$on('showSearchPage', function() {
            $scope.viewSearch = true;
            $scope.summonerName = '';
        });
    }])



    /**
     *  This control binds the API data to its respective partial
     */
    .controller('ViewCtrl', ['$scope', '$rootScope', 'summonerStatsFactory', function($scope, $rootScope, summonerStatsFactory){
        //toggle variables
        $scope.viewProfile = false;
        $scope.hasRanked = null;
        $scope.isOverall = null;

        /**
         * This function lets us go back to the search
         */
        $scope.back = function(){
            $scope.viewProfile = false;
            $rootScope.$broadcast('showSearchPage');
        };

        /**
         * Function assigns local variables for the controller once the API is finished
         */
        $scope.$on('apiFinished', function(event){
            $scope.viewProfile = true;
            $scope.summonerStats = summonerStatsFactory.get();
            $scope.hasRanked = !$scope.summonerStats.ranked.hasOwnProperty('msg');
        })
    }]);


