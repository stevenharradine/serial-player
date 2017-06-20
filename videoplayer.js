var bodyEl = document.getElementsByTagName("body")[0];

var show = getParameterByName ("show");
var season = getParameterByName ("season");
var seasonCode = season <= 9 ? "0" + season : season;
var path = "../" + show + "/Season%20" + season + "/";
var playlist;

document.getElementById("light").onclick = function () {
        document.getElementsByTagName("body")[0].classList.toggle ("nightmode")
}

document.getElementById ("show").onclick = function () {
    document.getElementById ("selector").innerHTML = ""
    loadJSON ("../shows.json",
         function(shows) {
            if (document.getElementById ("selector-container").getAttribute ("data-selected") != "show") {
                document.getElementById ("selector-container").setAttribute ("data-selected", "show")
                for (i = 0; i < shows.length; i++) {
                    document.getElementById ("selector").innerHTML += "<div><a href='./?show="+shows[i]+"&season=1'><img src=\"../" + shows[i] + "/folder.jpg\" /></a></div>"
                }
            } else {
                document.getElementById ("selector-container").setAttribute ("data-selected", "")
            }
         },
         function(xhr) { console.error(xhr); }
    );
}

document.getElementById ("season").onclick = function () {
    document.getElementById ("selector").innerHTML = ""
    loadJSON ("../" + show + "/seasons.json",
             function(seasons) {
                if (document.getElementById ("selector-container").getAttribute ("data-selected") != "season") {
                    document.getElementById ("selector-container").setAttribute ("data-selected", "season")
                    for (i = 0; i < seasons.length; i++) {
                        document.getElementById ("selector").innerHTML += "<div><a href='./?show="+ show +"&season=" + seasons[i].split(" ")[1] + "'><img src=\"../" + show + "/" + seasons[i] + "/folder.jpg\" /></a></div>"
                    }
                } else {
                    document.getElementById ("selector-container").setAttribute ("data-selected", "")
                }
             },
             function(xhr) { console.error(xhr); }
    );
}

document.getElementById ("episode").onclick = function () {
    document.getElementById ("selector").innerHTML = ""
    loadJSON ("../" + show + "/Season%20" + season + "/episodes.json",
             function(episodes) {
                if (document.getElementById ("selector-container").getAttribute ("data-selected") != "episode") {
                    document.getElementById ("selector-container").setAttribute ("data-selected", "episode")
                    for (i = 0; i < episodes.length; i++) {
                        var xhttp = new XMLHttpRequest();
                        xhttp.open("GET", path + "metadata/" + episodes[i] + ".xml", false);
                        xhttp.send();
                        if (xhttp.status === 200) {
                            var xmlDoc = xhttp.responseXML;
                            var episodeName = xmlDoc.getElementsByTagName("EpisodeName")[0].innerHTML;
                            var episodeNumber = xmlDoc.getElementsByTagName("EpisodeNumber")[0].innerHTML;
                            var filename = xmlDoc.getElementsByTagName("filename")[0].innerHTML;

                            document.getElementById ("selector").innerHTML += "<div onclick='play_item (\"" + episodes[i] + "\")'><img src=\"../" + show + "/Season%20" + season + "/metadata" + filename + "\" />" + episodeNumber + ". " + episodeName + "</div>"
                        }
                    }
                } else {
                    document.getElementById ("selector-container").setAttribute ("data-selected", "")
                }
             },
             function(xhr) { console.error(xhr); }
    );
}

function play_item (episode) {
    document.getElementsByTagName("body")[0].setAttribute ("data-episode", episode);
    init_video(false, 0);
}

load_playlist (function () {
        load_qualities (function () {
                if (bodyEl.getAttribute ("data-episode") == "null") {
                        bodyEl.setAttribute ("data-episode", playlist[0]);
                }

                document.getElementById ("banner").src = path + "banner.jpg";

                init_playlist ();
                init_video (false, 0);
                init_size ();
                highlight_playlist_currently_playing ();
        });
});

function getParameterByName(name, url) {
    if (!url) {
      url = window.location.href;
    }
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function loadJSON(path, success, error)
{
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function()
    {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                if (success)
                    success(JSON.parse(xhr.responseText));
            } else {
                if (error)
                    error(xhr);
            }
        }
    };
    xhr.open("GET", path, true);
    xhr.send();
}

function load_playlist (callback) {
        loadJSON(path + "episodes.json",
                 function(thisPlaylist) { playlist = thisPlaylist; callback(); },
                 function(xhr) { console.error(xhr); }
        );
}

function init_size () {
        var newSizeEl = document.getElementById ("videoSize");
        var newSize = newSizeEl.options[newSizeEl.selectedIndex].getAttribute("value");
        document.getElementsByTagName("body")[0].setAttribute ("data-size", newSize);
}

function load_qualities (callback) {
        loadJSON(path + "quality.json",
                 function(quality) {
                        console.log (quality.length);
                        for (i = 0; i < quality.length; i++) {
                                document.getElementById("videoSize").innerHTML += "<option value=\"" + quality[i] + "\">" + quality[i] + "</option>"
                        }
                        callback ();
                 },
                 function(xhr) { console.error(xhr); }
        );
}

function init_playlist () {
        var playlistEl = document.getElementById ("playlist");
        var bodyEl = document.getElementsByTagName("body")[0];
        var current_episode = bodyEl.getAttribute ("data-episode");

        for (var i = 0; i < playlist.length; i++) {
                var episodeLink = document.createElement ("a");
                episodeLink.onclick = function () {
                        bodyEl.setAttribute ("data-episode", this.innerHTML);
                        init_video(false, 0);
                }

                episodeLink.appendChild (document.createTextNode (playlist[i]));

                playlistEl.appendChild (episodeLink);
        }
}

function highlight_playlist_currently_playing () {
        var currentEpisode = document.getElementsByTagName("body")[0].getAttribute("data-episode");
        var playlistEl = document.getElementById ("playlist");

        for (var i = 0; i < playlistEl.children.length; i++) {
                var episode = playlistEl.children[i].innerHTML;

                playlistEl.children[i].className = episode == currentEpisode ? "active" : "";
        }
}

document.getElementById ("videoSize").onchange = function () {
        init_size ();
        console.log ()
        init_video(!document.getElementsByTagName("video")[0].paused, document.getElementsByTagName("video")[0].currentTime);
}

function fetch_video_data () {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                        display_video_data (this);
                }
        };
        xhttp.open("GET", path + "metadata/" + document.getElementsByTagName("body")[0].getAttribute ("data-episode") + ".xml", true);
        xhttp.send();
}

function display_video_data (xml) {
        var i;
        var xmlDoc = xml.responseXML;

        var episode = document.getElementsByTagName("body")[0].getAttribute ("data-episode");
        var episodeName = xmlDoc.getElementsByTagName("EpisodeName")[0].innerHTML;
        var firstAired = xmlDoc.getElementsByTagName("FirstAired")[0].innerHTML;
        var overview = xmlDoc.getElementsByTagName("Overview")[0].innerHTML;

        document.getElementById("show").innerHTML = show;
        document.getElementById("season").innerHTML = "Season " + season;
        document.getElementById("episode").innerHTML = episodeName;
        document.getElementById("episode").innerHTML = episodeName;
        document.getElementById("firstAired").innerHTML = firstAired;
        document.getElementById("overview").innerHTML = overview;

        document.getElementsByTagName("title")[0].innerHTML = show + " " + episode + " " + episodeName + " (" + firstAired + ")";
}

function init_video(autoplay, currentTime) {
        var episode = bodyEl.getAttribute ("data-episode");

        // remove old video player
        var playerEl = document.getElementById ("player");
        if (playerEl.firstChild.volume != undefined) document.getElementsByTagName("body")[0].setAttribute("data-volume", playerEl.firstChild.volume);
        while (playerEl.firstChild) {
                playerEl.removeChild(playerEl.firstChild);
        }

        var newSizeEl = document.getElementById ("videoSize");
        var newSize = newSizeEl.options[newSizeEl.selectedIndex].getAttribute("value");

        var newSource = document.createElement ("source");
        newSource.src = path + newSize + "/" + episode + "." + newSize + ".mp4";
        newSource.type = "video/mp4";

        var newVideo = document.createElement ("video");
        newVideo.setAttribute ("controls", "controls");
        newVideo.setAttribute ("poster", path + episode + ".tbn");
        newVideo.volume = parseFloat (document.getElementsByTagName("body")[0].getAttribute("data-volume"));
        newVideo.currentTime = currentTime;
        if (autoplay) newVideo.setAttribute ("autoplay", "autoplay");
        newVideo.onended = function () {
                var currentItemIndex;
                for (var i = 0; i < playlist.length; i++) {
                        if (playlist[i] == episode) {
                                currentItemIndex = i;
                        }
                }

                var nextItemIndex = currentItemIndex + 1 > playlist.length - 1 ? 0 : currentItemIndex + 1;

                document.getElementsByTagName("body")[0].setAttribute ("data-episode", playlist[nextItemIndex]);

                init_video(true, 0);
        }
        newVideo.appendChild (newSource);

        playerEl.appendChild (newVideo);

        fetch_video_data ();
        highlight_playlist_currently_playing();
}
