/*
 * This file is part of harbour-dwd.
 * Copyright (C) 2021 blueprint@poetaster.de Mark Washeim
 *
 * harbour-dwd is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * harbour-dwd is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with harbour-dwd.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

//.import "cities.js" as Cities

function httpRequest(url, callback) {
    var doc = new XMLHttpRequest();
    doc.onreadystatechange = function() {
        if (doc.readyState === XMLHttpRequest.DONE) {
            callback(doc);
        }
    }
    doc.open("GET", url);
    doc.send();

}
/*  This json doc function takes and returns an index to the callback.
 * This permits it to be called in a loop.
 */

function httpRequestIndex(url, index, callback) {
    var doc = new XMLHttpRequest();
    doc.onreadystatechange = function() {
        if (doc.readyState === XMLHttpRequest.DONE) {
            callback(index,doc);
        }
    }
    doc.open("GET", url);
    doc.send();
}

WorkerScript.onMessage = function(msg) {
    if (msg.action === 'nextDay') {

        httpRequestIndex(uri, j, function(index,doc) {
        var response = JSON.parse(doc.responseText);
        var dailyDate = response.weather[0].timestamp;
        var dailyIcon =  response.weather[11].icon ;
        var dailyLow =  Locs.dailyMin(response.weather,"temperature");
        var dailyHigh =  Locs.dailyMax(response.weather,"temperature");
        var dailyRain =  Locs.dailyTotal(response.weather ,"precipitation");
        var dailyCloud =  Locs.dailyAvg(response.weather ,"cloud_cover");
        var dailyWind=  Locs.dailyAvg(response.weather ,"wind_speed");
        var daily = {dailyDate: dailyDate, icon: dailyIcon , temperatureHigh:  dailyHigh, temperatureLow: dailyLow,
                    totalRain: dailyRain, cloud_cover:dailyCloud, wind_speed:dailyWind};
        msg.model.append(daily);
        msg.model.sync();   // updates the changes to the list
        });
    }
}

function getDetails(token) {
    return {
        name: name,
        latitude: lat,
        longitude: lon,
    }
}
function search(string) {
    var ret = [];
    for (var i = 0; i < Locations.LocationsList.length; i++) {
        if (string !== "" && Locations.LocationsList[i].indexOf(string) >= 0) {
            ret.push({"name": Locations.LocationsList[i]});
        }
        if (ret.length === 50) break;
    }
    return ret;
}

function dailyTotal(weather, key) {
    var total = 0;
        //console.debug(JSON.stringify(weather));
    for (var i = 0; i < weather.length; i++) {
             total += weather[i][key];
    }
    //console.debug(parseFloat(total).toPrecision(2))
    return parseFloat(total).toPrecision(2);
}
function dailyAvg(weather, key) {
    return dailyTotal(weather, key) / weather.length;
}
function dailyMax(weather, key) {
    var  current = 0.0 ;
    for (var i = 0; i < weather.length; i++) {
             if ( weather[i][key] > current ) {
                 current = weather[i][key];
             }
    }
    return current;
}
function dailyMin(weather, key) {
    var current = dailyMax(weather,key);
    for (var i = 0; i < weather.length; i++) {
             if ( weather[i][key] < current ) {
                 current = weather[i][key];
             }
    }
    return current;
}
