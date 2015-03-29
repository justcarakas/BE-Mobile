String.prototype.replaceAll = function(find, replace) {
    var str = this;
    return str.replace(new RegExp(find.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), replace);
};

function addRecent(service, id, value, location, lat, lng) {
    var key = service + '_' + location;
    var obj = {
        "key": key,
        "service": service,
        "id": id,
        "value": value,
        "location": location,
        "lat": lat,
        "lng": lng
    };
    var arrayLength = config["history"].length;
    for (var i = 0; i < arrayLength; i++) {

        if (config["history"][i] !== undefined) {
            if (config["history"][i].key === key) {
                config["history"].splice(i, 1);
            }
        }
    }
    config["history"].unshift(obj);
    if (config["history"].length > 15) {
        config["history"].pop();
    }
    saveConfig();
}

function failLocations() {
    $("#locations").html("<header>Locaties</header><ul><li><p>" + $.t('error.serverUnreachable') + "</p></li></ul>");
}

function getLocations(searchStr) {
    showHistory();
    if (true) {
        locations = $("#locations");
        if (searchStr.length >= 3) {
            locations.html("<header>Locaties</header><center><progress class=\"bigger\" style=\"margin-top:10%;\"/></center>");
            url = "http://www.belgianrail.be/jp/sncb-nmbs-routeplanner/ajax-getstop.exe/" + language.charAt(0) + "n" + "?S=" + searchStr;
            $.ajax({
                type: "GET",
                url: url,
                success: successLocations,
                error: failLocations,
                crossDomain: true
            });
        } else if (searchStr.length > 0) {
            locations.html("<header>Locaties</header><ul><li><p>" + $.t('error.searchTooShort') + "</p></li></ul>");
        } else {
            locations.html('');
        }
    } else {
        var dialog = UI.dialog("errorDialog").show();
        $("#errMsg").html("<li>" + $.t('error.turnOnDataWifi') + "</li>");
    }
}

function loadConfig() {
    // services
    $("#NMBS").prop('checked', config["settings"]["service"]["NMBS"]);
    $("#DeLijn").prop('checked', config["settings"]["service"]["DeLijn"]);
    $("#MIVB").prop('checked', config["settings"]["service"]["MIVB"]);
    $("#TEC").prop('checked', config["settings"]["service"]["TEC"]);

    // from
    from = $("#from");
    from.val(config["settings"]["from"]["location"]);
    from.data('id', config["settings"]["from"]["id"]);
    from.data('value', config["settings"]["from"]["value"]);
    from.data('lat', config["settings"]["from"]["lat"]);
    from.data('lng', config["settings"]["from"]["lng"]);
    from.data('service', config["settings"]["from"]["service"]);
    from.data('location', config["settings"]["from"]["location"]);
    $("#fromLogo").attr('src', "icons/" + config["settings"]["from"]["service"] + "@8.png");

    // to
    to = $("#to");
    to.val(config["settings"]["to"]["location"]);
    to.data('id', config["settings"]["to"]["id"]);
    to.data('value', config["settings"]["to"]["value"]);
    to.data('lat', config["settings"]["to"]["lat"]);
    to.data('lng', config["settings"]["to"]["lng"]);
    to.data('service', config["settings"]["to"]["service"]);
    to.data('location', config["settings"]["to"]["location"]);
    $("#toLogo").attr('src', "icons/" + config["settings"]["to"]["service"] + "@8.png");

    // via
    via = $("#via");
    via.val(config["settings"]["via"]["location"]);
    via.data('id', config["settings"]["via"]["id"]);
    via.data('value', config["settings"]["via"]["value"]);
    via.data('lat', config["settings"]["via"]["lat"]);
    via.data('lng', config["settings"]["via"]["lng"]);
    via.data('service', config["settings"]["via"]["service"]);
    via.data('location', config["settings"]["via"]["location"]);
    $("#viaLogo").attr('src', "icons/" + config["settings"]["to"]["service"] + "@8.png");

}

function restoreDefault() {
    localStorage.clear();
    config = {};

    config["history"] = [];

    config["settings"] = {};

    config["settings"]["service"] = {};
    config["settings"]["service"]["NMBS"] = true;
    config["settings"]["service"]["DeLijn"] = true;
    config["settings"]["service"]["MIVB"] = true;
    config["settings"]["service"]["TEC"] = true;

    config["settings"]["from"] = {};
    config["settings"]["from"]["location"] = "";
    config["settings"]["from"]["id"] = "";
    config["settings"]["from"]["value"] = "";
    config["settings"]["from"]["lat"] = "";
    config["settings"]["from"]["lng"] = "";
    config["settings"]["from"]["service"] = "noService";

    config["settings"]["to"] = {};
    config["settings"]["to"]["location"] = "";
    config["settings"]["to"]["id"] = "";
    config["settings"]["to"]["value"] = "";
    config["settings"]["to"]["lat"] = "";
    config["settings"]["to"]["lng"] = "";
    config["settings"]["to"]["service"] = "noService";

    config["settings"]["via"] = {};
    config["settings"]["via"]["location"] = "";
    config["settings"]["via"]["id"] = "";
    config["settings"]["via"]["value"] = "";
    config["settings"]["via"]["lat"] = "";
    config["settings"]["via"]["lng"] = "";
    config["settings"]["via"]["service"] = "noService";
    saveConfig();
}

function saveConfig() {
    try {
        localStorage.setItem("configV" + cnfgNr, JSON.stringify(config));
    } catch (e) {
        if (e == QUOTA_EXCEEDED_ERR) {
            console.log("Error: Local Storage limit exceeds.");
        } else {
            console.log("Error: Saving to local storage.");
        }
    }
}

function searchStation(clicked) {
    lastClicked = clicked;
    document.getElementById("location").value = document.getElementById(lastClicked).value;
    getLocations(document.getElementById("location").value);
    UI.pagestack.push("location-page");
    // uncomment this for it is buggy
    //document.getElementById("location").focus();
}

function showHistory() {

    var sugLnt = config["history"].length;
    var result = "";
    if (sugLnt > 0) {
        for (var i = 0; i < sugLnt; i++) {
            if (config["history"][i]["service"] != 'undefined' && config["history"][i]["location"] != 'undefined') {
                result += "<li><a class=\"locationResult\""
                result += " data-service=\"" + config["history"][i]["service"] + "\""
                result += " data-lat=\"" + config["history"][i]["lat"] + "\""
                result += " data-lng=\"" + config["history"][i]["lng"] + "\""
                result += " data-location=\"" + config["history"][i]["location"] + "\""
                result += " data-value=\"" + config["history"][i]["value"] + "\""
                result += " data-id=\"" + config["history"][i]["id"] + "\""
                result += " href=\"#\"><aside><img alt=\"logo\" src=\"icons/" + config["history"][i]["service"] + "@8.png\"></aside><p>" + config["history"][i]["location"] + "</p></a></li>"
            }
        }
    } else {
        result = "<li><p>" + $.t('error.noRecentLocations') + "</p></li>";
    }

    document.getElementById("locationsHistory").innerHTML = "<header>" + $.t('general.recentLocations') + "</header><ul>" + result + "</ul>";
}

function successLocations(data) {
    // get all the sugestions
    eval(data);
}

// Oject to catch the responce
// catch sugestions for locationsearch
var SLs = {
    showSuggestion: function() {
        var suggestedLocations = SLs.sls.suggestions;
        var incDeLijn = document.getElementById("DeLijn");
        var incNMBS = document.getElementById("NMBS");
        var incMIVB = document.getElementById("MIVB");
        var incTEC = document.getElementById("TEC");
        var oLength = suggestedLocations.length;
        var result = "";
        for (var i = 0; i < oLength; i++) {
            var rgx = /(.*)\s\[(.*)\]/g;
            var rgxResult = rgx.exec(suggestedLocations[i].value);
            lnglat = " data-lat=\"" + suggestedLocations[i].ycoord / 1000000 + "\" data-lng=\"" + suggestedLocations[i].xcoord / 1000000 + "\" ";
            if (rgxResult != null) {
                switch (rgxResult[2]) {
                    case "De Lijn":
                        if (incDeLijn.checked) {
                            result += "<li><a class=\"locationResult\" data-value=\"" + suggestedLocations[i].value + "\" data-id=\"" + suggestedLocations[i].id + "\" data-service=\"delijn\" " + lnglat + " data-location=\"" + rgxResult[1] + "\" href=\"#\"><aside><img alt=\"logo\" src=\"icons/delijn@8.png\"></aside><p>" + rgxResult[1] + "</p></a></li>"
                        }
                        break;
                    case "MIVB":
                    case "STIB/MIVB":
                        if (incMIVB.checked) {
                            result += "<li><a class=\"locationResult\" data-value=\"" + suggestedLocations[i].value + "\" data-id=\"" + suggestedLocations[i].id + "\" data-service=\"mivb\" " + lnglat + " data-location=\"" + rgxResult[1] + "\"href=\"#\"><aside><img alt=\"logo\" src=\"icons/mivb@8.png\"></aside><p>" + rgxResult[1] + "</p></a></li>"
                        }
                        break;
                    case "TEC":
                        if (incTEC.checked) {
                            result += "<li><a class=\"locationResult\" data-value=\"" + suggestedLocations[i].value + "\" data-id=\"" + suggestedLocations[i].id + "\" data-service=\"tec\" " + lnglat + " data-location=\"" + rgxResult[1] + "\"href=\"#\"><aside><img alt=\"logo\" src=\"icons/tec@8.png\"></aside><p>" + rgxResult[1] + "</p></a></li>"
                        }
                        break;

                }
            } else {
                if (incNMBS.checked) {
                    result += "<li><a class=\"locationResult\" data-value=\"" + suggestedLocations[i].value + "\" data-id=\"" + suggestedLocations[i].id + "\" data-service=\"nmbs\" " + lnglat + " data-location=\"" + suggestedLocations[i].value + "\"href=\"#\"><aside><img alt=\"logo\" src=\"icons/nmbs@8.png\"></aside><p>" + suggestedLocations[i].value + "</p></a></li>"
                }
            }
        }
        if (result == "") {
            result = "<li><p>" + $.t('error.noResultsFound') + "</p></li>"
        }

        document.getElementById("locations").innerHTML = "<header>" + $.t('general.locations') + "</header><ul>" + result + "</ul>";
    }
};

function getRoutes() {
    if (true) {
        console.log($("#from").data())
        data = "queryPageDisplayed=no";
        data += "&REQ0JourneyStopsS0G=" + escape($("#from").data('value'));
        data += "&REQ0JourneyStopsS0ID=" + escape($("#from").data('id'));
        data += "&REQ0JourneyStopsZ0G=" + escape($("#to").data('value'));
        data += "&REQ0JourneyStopsZ0ID=" + escape($("#to").data('id'));
        data += "&" + escape("HWAI=QUERY!direction") + "=" + escape("single!");
        data += "&REQ0JourneyDate=" + escape($("#datefield").val());
        data += "&wDayExt0=" + escape("Ma|Di|Wo|Do|Vr|Za|Zo");
        data += "&REQ0JourneyTime=" + escape($("#timefield").val());
        data += "&start=Dienstregeling";
        console.log(data);
        switch (language) {
            case 'nl':
                data += "&start=Dienstregeling";
                break;
            case 'en':
                data += "&start=Timetable";
                break;
            case 'fr':
                data += "&start=Horaires";
                break;
            case 'de':
                data += "&start=Fahrpl%C3%A4ne";
                break;
        }
        var timesel = $("#timeWhen .active").data('value');
        if (timesel == undefined) {
            timesel = "depart";
        }
        data += "&timesel=" + timesel;
        //@TODO utzoeke wa da moe kome;
        data += "&REQ0JourneyProduct_prod_list=" + escape("1:0111111111111111");

        //defaults for walking and stuf
        data += "&REQ0JourneyDep_Foot_enable%3D1%26REQ0JourneyDest_Foot_enable=1&existIntermodalDep_enable=yes&existIntermodalDest_enable=yes&REQ0JourneyDep_Foot_minDist=0&REQ0JourneyDep_Foot_maxDist=2000&REQ0JourneyDep_Foot_speed=85&REQ0JourneyDep_Bike_minDist=0&REQ0JourneyDep_Bike_maxDist=5000&REQ0JourneyDep_Taxi_minDist=2000&REQ0JourneyDep_Taxi_maxDist=50000";
        if (data != lastcall) {
            lastcall = data;
            url = "http://www.belgianrail.be/jp/nmbs-routeplanner/query.exe/" + language.charAt(0) + "n";
            $.ajax({
                type: "POST",
                url: url,
                success: successRoutes,
                dataType: "text",
                error: failRoutes,
                contentType: " text/plain; charset=UTF-8",
                data: data
            });
        } else {
            successRoutes(lastcallData);
        }
    } else {
        UI.pagestack.pop();
        var dialog = UI.dialog("errorDialog").show();
        $("#errMsg").html("<li>" + $.t('error.turnOnDataWifi') + "</li>");
    }
}

function successRoutes(data) {
    lastcallData = data;
    var cnt = 0;
    routesArr = {};
    var listItems = "";
    var rgx = /(<table\sclass="resultTable"[\s\S]+\/table>)/mg
    var rgxResult = rgx.exec(data);
    $table = $('<div></div>').html(rgxResult[0]);
    $table.find('tbody').each(function(item) {
        var $this = $(this);
        var date = $this.find('.separatorSmallDateLine');
        if (date.length != 0) {
            listItems += '<li class="routeHeader"><strong>' + date.text() + '</strong></li>';
        } else {
            var departureTime = $this.find('.planed.overviewDep').text().substring(0, 6);
            var arivalTime = $this.find('.planed.overviewDep + .planed').text().substring(0, 6);
            var travelTime = $this.find('.duration').text();
            var transfers = $this.find('.changes').text();
            var detailUrl = $this.find('a.dtlTab').attr('href');
            detailUrl += "HWAI=CONNECTION$C0-0!id=C0-0!journeyMode=OUTWARD!option=detailContainer!detailContainer=dtlTab!moreDetails=conMap!&hwaiID=C0-0&ajax=1";
            console.log(detailUrl);
            var dtlTab = $this.find('a.dtlTab');
            var detailUrl = dtlTab.attr('href');
            var rel = dtlTab.attr('rel');
            if (rel !== undefined) {
                rel = rel.replaceAll(':', '=');
                rel = rel.replaceAll('{', '$');
                rel = rel.replaceAll('[', '');
                rel = rel.replaceAll(']', '!');
                rel = rel.replaceAll('}', '!');
                var expression = /CONNECTION\$(.*?)!/g;
                rgxID = expression.exec(rel);
                console.log(rgxID)
                detailUrl += rel + "&hwaiID=" + rgxID[1] + "&ajax=1";
                console.log(detailUrl);
            }
            console.log('___________________')
            if (arivalTime.length > 0 && departureTime.length > 0) {
                listItems += "<li class=\"routeOptions\"><a data-url=\"" + detailUrl + "\"href =\"#\">";
                listItems += "<div><strong>" + departureTime + "</strong><span>" + $.t('general.traveltime') + ": " + travelTime + "</span></div>";
                listItems += "<span class=\"arrow\"></span>";
                listItems += "<div><strong>" + arivalTime + "</strong><span>" + $.t('general.switches') + ": " + transfers + "</span></div>";
                listItems += "</a></li>";
            }
        }

    });
    if (listItems == "") {
        listItems = "<li><p>" + $.t('error.noResultsFound') + "<p></li>"
    }

    $('#resultsList').html(listItems);
}

function failRoutes() {
    lastcall = new Date();
    lastcallData = "";
    $("#resultsList").html("<li><p>" + $.t('error.somethingWentWrong') + "</p></li>");
}

function getTravelTime(str) {
    var ret = {};
    var ans = "";
    var re = /P(\d*)DT(\d*)H(\d*)/;
    var match = re.exec(str);
    ret['D'] = match[1];
    ret['H'] = match[2];
    ret['M'] = match[3];
    if (ret['M'] > 60) {
        ret['H'] += Math.floor(ret['M'] / 60);
        ret['M'] = ret['M'] % 60;
    }

    if (ret['D'] != 0) {
        ans += ret['D'] + "D ";
    }
    if (ret['H'] != 0) {
        ans += ret['H'] + "H ";
    }
    ans += ret['M'] + "Min";
    return ans;
}

function getStepTime(str) {
    var ret = {};
    var re = /T(\d\d:\d\d)/;
    var match = re.exec(str);
    return match[1];
}

function showRoute(data) {
    var rgx = /(\<\!--\sRSPEAK_START[\s\S]+RSPEAK_STOP\s-->)/mg
    var match = rgx.exec(data);
    var res = $('<div></div>').html(match[1]);
    var html = "";
    res.find('p').each(function(item) {
        var item = $('<li>');
        item.addClass('routeStep');
        item.html('<p>' + this.outerText + '</p>');
        html += item[0].outerHTML;
    });
    if (html == "") {
        html = "<li><p>" + $.t('error.noResultsFound') + "<p></li>"
    }

    $('#routeDetailList').html(html);
}

function failRoute() {
    var dialog = UI.dialog("errorDialog").show();
    $("#errMsg").html("<li>" + $.t('error.somethingWentWrong') + "</li>");
}

function formatTweets(tweets) {
    var x = tweets.length;
    var n = 0;
    var element = document.getElementById('twitterFeed');
    var html = '';
    while (n < x) {
        tweet = $('<div></div>').html(tweets[n]);
        html += '<li>';
        if (tweet.find('.user').text().indexOf('@NMBS') !== -1) {
            html += '<aside><img src="icons/nmbs@8.png"></img></aside>';
        }
        if (tweet.find('.user').text().indexOf('@delijn') !== -1) {
            html += '<aside><img src="icons/delijn@8.png"></img></aside>';
        }
        if (tweet.find('.user').text().indexOf('@STIBMIVB') !== -1) {
            html += '<aside><img src="icons/mivb@8.png"></img></aside>';
        }


        html += '<p>' + tweet.find('.tweet').text().replace(/#(\S*)/g, '<strong>#$1&nbsp;</strong>') + '</p>';
        html += '</li>';
        n++;
    }
    html += '</ul>';
    element.innerHTML = html;
}

function getTweets() {
    if (true) {
        $('#twitterFeed').html("<center><progress class=\"bigger\" style=\"margin-top:10%;\"/></center>");
        if (twitterID != "") {
            twitterFetcher.fetch(twitterID, 'twitterFeed', 10, false, true, true, '', false, formatTweets, false);
        } else {
            $('#twitterFeed').html("<p>" + $.t('error.noTwitterAccountsForServices') + "</p>");
        }
    } else {
        $('#twitterFeed').html("<li><p>" + $.t('error.turnOnDataWifi') + "</p></li>");
    }
}

function setTwitterId() {
    var count = 0;
    if ($("#DeLijn").attr("checked")) {
        count += 1;
    }
    if ($("#NMBS").attr("checked")) {
        count += 10;
    }
    if ($("#MIVB").attr("checked")) {
        count += 100;
    }
    twitterID = "";
    switch (count) {
        case 1:
            twitterID = "452569746018299904";
            break;
        case 10:
            twitterID = "452570121236516864";
            break;
        case 11:
            twitterID = "452569886921732096";
            break;
        case 100:
            twitterID = "454002635406729216";
            break;
        case 101:
            twitterID = "453993942791360512";
            break;
        case 110:
            twitterID = "454002477973504000";
            break;
        case 111:
            twitterID = "454001524448829440";
            break;
    }
    getTweets();
}

function onResize() {
    // breaks scrolling on phone
    //$('#twitterFeed').height($(window).height() - 250);
}

function getRouteDetail() {
    UI.pagestack.push("routeDetail-page");
    $('#routeDetailList').html("<center><progress class=\"bigger\" style=\"margin-top:10%;\"/></center>");
    $.ajax({
        type: "GET",
        url: selectedRoute,
        success: showRoute,
        error: failRoute
    });
}

function translateHeaders() {
    $("#location-page").data('title', $.t('headers.location'));
    $("#datetime-page").data('title', $.t('headers.datetime'));
    $("#results-page").data('title', $.t('headers.results'));
    $("#routeDetail-page").data('title', $.t('headers.routeDetail'));
    // fix because it doesn't work elsewise
    UI.pagestack.onPageChanged(function(event) {
        $("li[data-role='tabitem']").text($("#" + event.page).data('title'));
    });
}

function languageSelection() {
    var dialog = UI.dialog("languageDialog").show();
    var data = '<section>';
    data += '<button data-role="button" class="selectLanguage" data-language="nl" >Selecteer uw taal</button>';
    data += '<button data-role="button" class="selectLanguage" data-language="en" >Select your language</button>';
    data += '<button data-role="button" class="selectLanguage" data-language="fr" >Choisissez votre langue</button>';
    data += '<button data-role="button" class="selectLanguage" data-language="de" >Wählen Sie Ihre Sprache</button>';
    data += '</section>';
    $("#languageDialog").html(data);
}

function initLanguage() {
    scrollOpt = {
        "date": {
            animate: false,
            preset: "date",
            dateOrder: "D dmmyy",
            mode: "scroller",
            display: "bottom",
            lang: language,
            dateFormat: 'D, dd/mm/y',
            minDate: currDate,
        },
        "time": {
            animate: false,
            preset: "time",
            mode: "scroller",
            display: "bottom",
            lang: language,
            timeformat: 'HH:ii:ss',
            timeWheels: 'HHii'
        }
    }

    $(".scroller-date").scroller("destroy").scroller(scrollOpt["date"]).scroller('setValue', 'now', true);
    $(".scroller-time").scroller("destroy").scroller(scrollOpt["time"]).scroller('setValue', new Date().getTime(), true);

    language = config['language'];
    languageNMBS = config['languageNMBS'];

    // language strings
    $.i18n.init({
        resStore: LANG,
        lng: language
    });
    $("#langContext").i18n();
    translateHeaders();
    UI.dialog("languageDialog").hide();
}