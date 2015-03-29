/**
 * Wait before the DOM has been loaded before initializing the Ubuntu UI layer
 */
// set the vars
var lastClicked;
var UI = new UbuntuUI();
var config;
var routesArr;
var selectedRoute;
var lastcall;
var lastcallData;
var twitterID;
var cnfgNr = "2.1.1";
var language = "nl";
var currDate = new Date();
var scrollOpt;

$( document ).ready(function() {
    onResize();
    $(window).bind('resize', onResize);
    // init Ubuntu UI
    UI.init();
    UI.pagestack.push('search-page')
    UI.optionselector("timeWhen");
    //checking for saved config
    if (localStorage.getItem("configV" + cnfgNr) === null) {
        localStorage.clear();
        restoreDefault();
        var dialog = UI.dialog("errorDialog").show();
        $("#errMsg").html("<li>Config gereset door update</li>");
    }
    config = JSON.parse(localStorage.getItem("configV" + cnfgNr));

    if (config['language'] === undefined ) {
        languageSelection();
    }
    else {
        initLanguage();
    }

    loadConfig();
    setTwitterId();
    // Event listeners
    $("#location").on(
        "input",
        function(){
            getLocations($("#location").val());
        }
    );

    $("ul#pathLocations").delegate("input", "click", function(e) {
        if (!$("#DeLijn").attr("checked") && !$("#NMBS").attr("checked") && !$("#MIVB").attr("checked") && !$("#TEC").attr("checked")) {
            $errMsg = "<li>" + $.t('error.noServicesSelected') + "</li>"
            var dialog = UI.dialog("errorDialog").show();
            $("#errMsg").html($errMsg);
        } else {
            searchStation(e.target.id);
        }
    });

    // @TODO fix this
    $("ul#pathLocations").delegate("input", "search", function(e) {
        if (this.value === '') {
            $("#" + this.id + "Logo").attr("src", "icons/noService@8.png");
        }
    });

    $("ul#serviceProviders").delegate("input", "change", function(e) {
        config["settings"]["service"][e.target.id] = e.target.checked;
        saveConfig();
        setTwitterId();
    });

    $("#resultsList").delegate("a", "click", function(e) {
        selectedRoute = $(this).data('url');
        $('#routeDetailList').html("<center><progress class=\"bigger\" style=\"margin-top:10%;\"/></center>");
        getRouteDetail();
    });

    $(".locationsList").on(
        "click",
        function(e){
            var locationResult = $(e.target).closest(".locationResult");
            if(locationResult != null && locationResult.data("value") != 'undefined') {
                targetElement = $('#' + lastClicked);
                targetElement.val(locationResult.data("location"));
                $("#" + lastClicked + "Logo").attr("src", "icons/" + locationResult.data("service") + "@8.png");
                targetElement.data("service", locationResult.data("service"))
                targetElement.data("id", locationResult.data("id"))
                targetElement.data("value", locationResult.data("value"))
                targetElement.data("lat", locationResult.data("lat"))
                targetElement.data("lng", locationResult.data("lng"))
                targetElement.data("location", locationResult.data("location"))
                addRecent(
                    locationResult.data("service"),
                    locationResult.data("id"),
                    locationResult.data("value"),
                    locationResult.data("location"),
                    locationResult.data("lat"),
                    locationResult.data("lng")
                );

                config["settings"][lastClicked]["location"] = locationResult.data("location");
                config["settings"][lastClicked]["id"] = locationResult.data("id");
                config["settings"][lastClicked]["value"] = locationResult.data("value");
                config["settings"][lastClicked]["lat"] = locationResult.data("lat");
                config["settings"][lastClicked]["lng"] = locationResult.data("lng");
                config["settings"][lastClicked]["service"] = locationResult.data("service");
                saveConfig();
                UI.pagestack.pop();
            }
        }
    );
    $("#twitterRefresh").on("click", getTweets);
    // date and time scrollers
    var currDate = new Date();
    var opt = {
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

    $(".scroller-date").scroller("destroy").scroller(opt["date"]).scroller('setValue', 'now', true);
    $(".scroller-time").scroller("destroy").scroller(opt["time"]).scroller('setValue', new Date().getTime(), true);

    $("#timeanddate").on(
        "click",
        function(e){
            $errMsg = "";
            if ($("#from").val() === ""){
                $errMsg += "<li>" + $.t('error.noDepartureLocation') + "</li>"
            }
            if ($("#to").val() === ""){
                $errMsg += "<li>" + $.t('error.noArrivalLocation') + "</li>"
            }
            else {
                if ($("#to").val() == $("#from").val()) {
                    $errMsg += "<li>" + $.t('error.departuraAndArrivalTheSame') + "</li>"
                }
            }

            if (!$("#DeLijn").attr("checked") && !$("#NMBS").attr("checked") && !$("#MIVB").attr("checked") && !$("#TEC").attr("checked")) {
                $errMsg += "<li>" + $.t('error.noServicesSelected') + "</li>"
            }

            if ($errMsg === ""){
                UI.pagestack.push("datetime-page")
            }
            else{
                var dialog = UI.dialog("errorDialog").show();
                $("#errMsg").html($errMsg);
            }
        }
    );
    $("#lookup").on(
        "click",
        function(e){
            $('#resultsList').html("<center><progress class=\"bigger\" style=\"margin-top:10%;\"/></center>");
            $errMsg = "";
            if ($("#timefield").val() === ""){
                $errMsg += "<li>" + $.t('error.noTime') + "</li>"
            }
            if ($("#datefield").val() === ""){
                $errMsg += "<li>" + $.t('error.noDate') + "</li>"
            }
            if ($errMsg === ""){
                getRoutes();
                UI.pagestack.push("results-page")
            }
            else{
                var dialog = UI.dialog("errorDialog").show();
                $("#errMsg").html($errMsg);
            }

        }
    );
    $("#errOk").on(
        "click",
        function(e){
            var dialog = UI.dialog("errorDialog").hide();
        }
    );
    $("#languageDialog").delegate(
        ".selectLanguage",
        "click",
        function(event){
            $target = $(event.target);
            language = $target.data('language');
            config['language'] = language;
            saveConfig();
            initLanguage();
        }
    );
    $("#appHeader").delegate('#languageSelection', 'click', languageSelection);
    $("#appHeader").delegate('#twitterLink', 'click', function(e){
        UI.pagestack.push("twitter-page");
    });
});
