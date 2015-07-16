angular.module('app')

    //Emilio is always right, Eric too (lots of changes) Joey commits are stronger

    // League info
    .controller('SearchCtrl', ['leagueApi', '$scope', '$rootScope', 'summonerStatsFactory',
        function(leagueApi, $scope, $rootScope, summonerStatsFactory){

        // View variables
        $scope.summonerName = "Elo Boosted";
        $scope.regions = ['oce', 'na', 'eune', 'euw', 'kr'];
        $scope.selectedRegion = $scope.regions[0];
        $scope.summonerStats = null;
        $scope.unranked = null;
        $scope.ranked = null;

        //
        // Setting the region
        //
        $scope.selectRegion = function(region){
            $scope.selectedRegion = region;
            console.log($scope.selectedRegion)
        };

        //
        //Champion list is constant hence is outside function to avoid getting called repeatedly
        //
        leagueApi.getChampionInfo().success(function(data){
            $scope.championArray = data.data;
            $scope.championNameArray = Object.keys(data.data);
        });

        //utilising id from param to obtain champion name and title
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

        //
        //Function to get all the summoner's statistics
        //
        $scope.getSummonerStats = function(name) {
            //Send api request
            leagueApi.getSummonerId($scope.selectedRegion, name).success(function (data) {

                //Obtaining summoner name and ID as stored in API object
                var summonerNameApi = Object.keys(data)[0];
                var summonerId = data[summonerNameApi].id;
                $scope.summonerName = data[summonerNameApi].name;

                //
                //Unranked stats
                //
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


                    //
                    //Ranked stats
                    //
                    leagueApi.getSummonerRankedData($scope.selectedRegion, summonerId).success(function(data){
                        //storing data from ranked games
                        $scope.ranked = [];
                        var playerRankedStats = data['champions'];

                        //storing ranked stats for each individual champion user has played
                        //Obj for individual champions
                        var constructChamp = function(name, title, win, loss, kills, double, triple, quadra, penta){
                            var buildObj = {
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

                            $scope.ranked.push(buildObj)
                        };

                        //Object for overall ranked stats
                        var constructOverall = function(total, win, loss, gold, time, alive){
                            var buildObj = {
                                gamesPlayed: total,
                                wins: win,
                                losses: loss,
                                goldEarned: gold,
                                timePlayed: time,
                                timeAlive: alive
                            };

                            $scope.ranked.push(buildObj)
                        };

                        for(var i = 0; i < playerRankedStats.length; i++){

                            var champion = $scope.getChampionName(playerRankedStats[i].id);

                            if(playerRankedStats[i].id !== 0){
                                constructChamp(champion.name, champion.title,
                                    playerRankedStats[i].stats.totalSessionsWon,
                                    playerRankedStats[i].stats.totalSessionsLost,
                                    playerRankedStats[i].stats.totalChampionKills,
                                    playerRankedStats[i].stats.totalDoubleKills,
                                    playerRankedStats[i].stats.totalTripleKills,
                                    playerRankedStats[i].stats.totalQuadraKills,
                                    playerRankedStats[i].stats.totalPentaKills
                                )
                            }else{
                                constructOverall(playerRankedStats[i].stats.totalSessionsPlayed,
                                    playerRankedStats[i].stats.totalSessionsWon,
                                    playerRankedStats[i].stats.totalSessionsLost,
                                    playerRankedStats[i].stats.totalGoldEarned,
                                    playerRankedStats[i].stats.maxTimePlayed,
                                    playerRankedStats[i].stats.maxTimeSpentLiving
                                )
                            }
                        }

                        //push final api data to service
                        $scope.summonerStats = {
                            unranked: $scope.unranked,
                            ranked: $scope.ranked
                        };
                        summonerStatsFactory.set($scope.summonerStats);

                        $rootScope.$broadcast('apiFinished')


                    }).error(function(){
                        //Insert message saying that the user is yet to play ranked
                        console.log('test')
                        $scope.ranked = 'Player is yet to play Ranked mode';
                    });
                });
            })


        }
    }])

    //Page control
    .controller('ViewCtrl', ['$scope', 'summonerStatsFactory', function($scope, summonerStatsFactory){
        $scope.$on('apiFinished', function(){
            summonerStatsFactory.get()
        })

    }]);


