// ==UserScript==
// @name         OPR tools
// @namespace    https://opr.ingress.com/recon
// @version      0.9.18
// @description  Added links to Intel and OSM and disabled autoscroll.
// @author       1110101, tehstone, Hedger, Deep-thot, senfomat, pd1254, pieter.schutz, fotofreund0815, peter.gelsbo, stdssr
// @match        https://opr.ingress.com/recon
// @grant        unsafeWindow
// @downloadURL  https://gitlab.com/1110101/opr-tools/raw/master/opr-tools.user.js

// ==/UserScript==

// source https://gitlab.com/1110101/opr-tools
// merge-requests welcome

/*
MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/

const PORTAL_MARKER = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAYdEVYdFNvZnR3YXJlAHBhaW50Lm5ldCA0LjAuOWwzfk4AAADlSURBVDhPY/j//z8CTw3U/V8lcvx/MfPX/2Xcd//XyWwDYxAbJAaS63c2Q9aD0NygUPS/hPXt/3bD5f93LI7DwFvnJILlSlg//K+XrUc1AKS5jOvx/wU55Vg1I2OQmlKOpzBDIM4G2UyMZhgGqQW5BOgdBrC/cDkbHwbpAeplAAcONgWEMChMgHoZwCGMTQExGKiXARxN2CSJwUC9VDCAYi9QHIhVQicpi0ZQ2gYlCrITEigpg5IlqUm5VrILkRdghoBMxeUd5MwE1YxqAAiDvAMKE1DAgmIHFMUgDGKDxDCy838GAPWFoAEBs2EvAAAAAElFTkSuQmCC";
function addGlobalStyle(css) {
    let head, style;
    head = document.getElementsByTagName("head")[0];
    if (!head) { return; }
    style = document.createElement("style");
    style.type = "text/css";
    style.innerHTML = css;
    head.appendChild(style);
}

function init() {
    const w = typeof unsafeWindow == "undefined" ? window : unsafeWindow;
    let tryNumber = 5;
    const initWatcher = setInterval(function () {
        if (tryNumber === 0) {
            clearInterval(initWatcher);
            w.document.getElementById("NewSubmissionController").insertAdjacentHTML("afterBegin", `
<div class='alert alert-danger'><strong><span class='glyphicon glyphicon-remove'></span> OPR tools initialization failed,</strong> check developer console for error details</div>
`);
            return;
        }
        if (w.angular) {
            let err = false;
            try {
                initAngular();
                clearInterval(initWatcher);
            }
            catch (error) {
                err = error;
                console.log(error);
            }
            if (!err) {
                try {
                    initScript();
                } catch (error) {
                    console.log(error);
                }
            }
        }
        tryNumber--;
    }, 500);

    function initAngular() {
        const el = w.document.querySelector("[ng-app='portalApp']");
        w.$app = w.angular.element(el);
        w.$injector = w.$app.injector();
        w.$rootScope = w.$app.scope();

        w.$scope = function (element) {
            return w.angular.element(element).scope();
        };
    }

    function initScript() {
        const descDiv = document.getElementById("descriptionDiv");
        const ansController = w.$scope(descDiv).answerCtrl;
        const subController = w.$scope(descDiv).subCtrl;
        const scope = w.$scope(descDiv);
        const pageData = subController.pageData;
        let watchAdded = false;

        // run on init
        modifyPage();

        if (!watchAdded) {
            // re-run on data change
            scope.$watch("subCtrl.pageData", function () {
                modifyPage();
            });
        }

        function modifyPage() {

            // adding CSS
            addGlobalStyle(`
.dropdown {
position: relative;
display: inline-block;
}

.dropdown-content {
display: none;
position: absolute;
z-index: 1;
margin: 0;
}
.dropdown-menu li a {
color: #ddd !important;
}
.dropdown:hover .dropdown-content {
display: block;
background-color: #004746 !important;
border: 1px solid #0ff !important;
border-radius: 0px !important;

}
.dropdown-menu>li>a:focus, .dropdown-menu>li>a:hover {
background-color: #008780;
}
.modal-sm {
width: 350px !important;
}

/**
* Tooltip Styles
*/

/* Add this attribute to the element that needs a tooltip */
[data-tooltip] {
position: relative;
z-index: 2;
cursor: pointer;
}

/* Hide the tooltip content by default */
[data-tooltip]:before,
[data-tooltip]:after {
visibility: hidden;
-ms-filter: "progid:DXImageTransform.Microsoft.Alpha(Opacity=0)";
filter: progid: DXImageTransform.Microsoft.Alpha(Opacity=0);
opacity: 0;
pointer-events: none;
}

/* Position tooltip above the element */
[data-tooltip]:before {
position: absolute;
top: 150%;
left: 50%;
margin-bottom: 5px;
margin-left: -80px;
padding: 7px;
width: relative;
-webkit-border-radius: 3px;
-moz-border-radius: 3px;
border-radius: 3px;
background-color: #000;
background-color: hsla(0, 0%, 20%, 0.9);
color: #fff;
content: attr(data-tooltip);
text-align: center;
font-size: 14px;
line-height: 1.2;
}

/* Triangle hack to make tooltip look like a speech bubble */
[data-tooltip]:after {
position: absolute;
top: 132%;
left: relative;
width: 0;
border-bottom: 5px solid #000;
border-bottom: 5px solid hsla(0, 0%, 20%, 0.9);
border-right: 5px solid transparent;
border-left: 5px solid transparent;
content: " ";
font-size: 0;
line-height: 0;
}

/* Show tooltip content on hover */
[data-tooltip]:hover:before,
[data-tooltip]:hover:after {
visibility: visible;
-ms-filter: "progid:DXImageTransform.Microsoft.Alpha(Opacity=100)";
filter: progid: DXImageTransform.Microsoft.Alpha(Opacity=100);
opacity: 1;
}
`);

            /**
             * China location fixed begin
             * transform_lat, transform_lng, out_of_china, wgs84togcj02, gcj02tobd09 function
             * is From https://git.io/vQ6hK by: xdnain
             */
            const x_PI = 3.14159265358979324 * 3000.0 / 180.0;
            const PI = 3.1415926535897932384626;
            const b = 6378245.0;
            const ee = 0.00669342162296594323;

            //GCJ-02 to WGS84
            function transform_lat(lng, lat) {
                var lat1 = +lat;
                var lng1 = +lng;
                var ret = -100.0 + 2.0 * lng1 + 3.0 * lat1 + 0.2 * lat1 * lat1 + 0.1 * lng1 * lat1 + 0.2 * Math.sqrt(Math.abs(lng1));
                ret += (20.0 * Math.sin(6.0 * lng1 * PI) + 20.0 * Math.sin(2.0 * lng1 * PI)) * 2.0 / 3.0;
                ret += (20.0 * Math.sin(lat1 * PI) + 40.0 * Math.sin(lat1 / 3.0 * PI)) * 2.0 / 3.0;
                ret += (160.0 * Math.sin(lat1 / 12.0 * PI) + 320 * Math.sin(lat1 * PI / 30.0)) * 2.0 / 3.0;
                return ret;
            }

            function transform_lng(lng, lat) {
                var lat1 = +lat;
                var lng1 = +lng;
                var ret = 300.0 + lng1 + 2.0 * lat1 + 0.1 * lng1 * lng1 + 0.1 * lng1 * lat1 + 0.1 * Math.sqrt(Math.abs(lng1));
                ret += (20.0 * Math.sin(6.0 * lng1 * PI) + 20.0 * Math.sin(2.0 * lng1 * PI)) * 2.0 / 3.0;
                ret += (20.0 * Math.sin(lng1 * PI) + 40.0 * Math.sin(lng1 / 3.0 * PI)) * 2.0 / 3.0;
                ret += (150.0 * Math.sin(lng1 / 12.0 * PI) + 300.0 * Math.sin(lng1 / 30.0 * PI)) * 2.0 / 3.0;
                return ret;
            }

            //check is location in China
            function out_of_china(lng, lat) {
                var lat1 = +lat;
                var lng1 = +lng;
                // 纬度3.86~53.55,经度73.66~135.05
                return !(lng1 > 73.66 && lng1 < 135.05 && lat1 > 3.86 && lat1 < 53.55);
            }

            /**
             * WGS84转GCj02
             * @param lng
             * @param lat
             * @returns {*[]}
             */
            function wgs84togcj02(lng, lat) {
                var lat1 = +lat;
                var lng1 = +lng;
                if (out_of_china(lng1, lat1)) {
                    return [lng1, lat1];
                } else {
                    var dlat = transform_lat(lng1 - 105.0, lat1 - 35.0);
                    var dlng = transform_lng(lng1 - 105.0, lat1 - 35.0);
                    var radlat = lat1 / 180.0 * PI;
                    var magic = Math.sin(radlat);
                    magic = 1 - ee * magic * magic;
                    var sqrtmagic = Math.sqrt(magic);
                    dlat = (dlat * 180.0) / ((b * (1 - ee)) / (magic * sqrtmagic) * PI);
                    dlng = (dlng * 180.0) / (b / sqrtmagic * Math.cos(radlat) * PI);
                    var mglat = lat1 + dlat;
                    var mglng = lng1 + dlng;
                    return [mglng, mglat];
                }
            }

            /**
             * 火星坐标系 (GCJ-02) 到百度坐标系 (BD-09) 的转换
             * @param lng
             * @param lat
             * @returns {*[]}
             */
            function gcj02tobd09(lng, lat) {
                var lat1 = +lat;
                var lng1 = +lng;
                var z = Math.sqrt(lng1 * lng1 + lat1 * lat1) + 0.00002 * Math.sin(lat1 * x_PI);
                var theta = Math.atan2(lat1, lng1) + 0.000003 * Math.cos(lng1 * x_PI);
                var bd_lng = z * Math.cos(theta) + 0.0065;
                var bd_lat = z * Math.sin(theta) + 0.006;
                return [bd_lng, bd_lat];
            }

            function wgs84tobd09(lng, lat){
                var lat1 = +lat;
                var lng1 = +lng;
                if (out_of_china(lng1,lat1)){
                    return [lng1,lat1];
                } else {
                    return gcj02tobd09(lng,lat);
                }
            }

            var lat_detected = transform_lat(pageData.lng,pageData.lat);
            var lng_detected = transform_lng(pageData.lng,pageData.lat);
            var bd_loc = wgs84tobd09(pageData.lng,pageData.lat);
            var gcj02 = wgs84togcj02(pageData.lng);

            /**
             * China location fixed end
             */


            // adding map buttons
            const mapButtons = [
                "<a class='button btn btn-default' target='intel' href='https://www.ingress.com/intel?ll=" + pageData.lat + "," + pageData.lng + "&z=17'>Intel</a>",
                "<a class='button btn btn-default' target='mapqq' href='http://map.qq.com/?type=marker&isopeninfowin=1&markertype=1&addr=" + pageData.lat + "," + pageData.lng + "&pointy=" + gcj02[1] + "&pointx=" + gcj02[0] + "&zoom=16'>Tencent map</a>",
                "<a class='button btn btn-default' target='osm' href='https://www.openstreetmap.org/?mlat=" + lat_detected + "&mlon=" + lng_detected + "&zoom=16'>OSM</a>",
                "<a class='button btn btn-default' target='bing' href='https://bing.com/maps/default.aspx?cp=" + lat_detected + "~" + lng_detected + "&lvl=16&style=a'>bing</a>"
            ];

            // more map buttons in a dropdown menu
            const mapDropdown = [
                "<li><a target='heremaps' href='https://wego.here.com/?map=" + lat_detected + "," + lng_detected + ",17,satellite'>HERE maps</a></li>",
                "<li><a target='wikimapia' href='http://wikimapia.org/#lat=" + lat_detected + "&lon=" + lng_detected + "&z=16'>Wikimapia</a></li>",
                "<li><a targeT='zoomearth' href='https://zoom.earth/#" + lat_detected + "," + lng_detected + ",18z,sat'>Zoom Earth</a></li>",
/*
                "<li role='separator' class='divider'></li>",

                // national maps
                "<li><a target='swissgeo' href='http://map.geo.admin.ch/?swisssearch=" + lat_detected + "," + lng_detected + "'>CH - Swiss Geo Map</a></li>",
                "<li><a target='kompass' href='http://maps.kompass.de/#lat=" + lat_detected + "&lon=" + lng_detected + "&z=17'>DE - Kompass.maps</a></li>",
                "<li><a target='bayernatlas' href='https://geoportal.bayern.de/bayernatlas/index.html?X=" + lat_detected + "&Y=" + lng_detected + "&zoom=14&lang=de&bgLayer=luftbild&topic=ba&catalogNodes=122'>DE - BayernAtlas</a></li>",
                "<li><a target='yandex' href='https://maps.yandex.ru/?text=" + lat_detected + "," + lng_detected + "'>RU - Yandex</a></li>",
                "<li><a target='hitta' href='https://www.hitta.se/kartan!~" + lat_detected + "," + lng_detected + ",18z/tileLayer!l=1'>SE - Hitta.se</a></li>",
                "<li><a target='eniro' href='https://kartor.eniro.se/?c=" + lat_detected + "," + lng_detected + "&z=17&l=nautical'>SE - Eniro Sjökort</a></li>",
                "<li><a target='eniro' href='http://opr.pegel.dk/?17/" + lat_detected + "/" + lng_detected + "'>DK - SDFE Orthophotos</a></li>"
*/
            ];

            descDiv.insertAdjacentHTML("beforeEnd", "<div><div class='btn-group'>" + mapButtons.join("") +
                                       "<div class='button btn btn-primary dropdown'><span class='caret'></span><ul class='dropdown-content dropdown-menu'>" + mapDropdown.join("") + "</div></div>");


            // moving submit button to right side of classification-div
            const submitDiv = w.document.querySelectorAll("#submitDiv, #submitDiv + .text-center");
            const classificationRow = w.document.querySelector(".classification-row");
            const newSubmitDiv = w.document.createElement("div");
            newSubmitDiv.className = "col-xs-12 col-sm-6";
            submitDiv[0].style.marginTop = 16;
            newSubmitDiv.appendChild(submitDiv[0]);
            newSubmitDiv.appendChild(submitDiv[1]);
            classificationRow.insertAdjacentElement("afterend", newSubmitDiv);


            // adding text buttons
            const textButtons = [
                "<button id='photo' class='button btn btn-default textButton' data-tooltip='indicates a low quality photo'>Photo</button>",
                "<button id='private' class='button btn btn-default textButton' data-tooltip='located on private residential property'>Private</button>",
                "<button id='duplicate' class='button btn btn-default textButton' data-tooltip='duplicate of one you have previously reviewed'>Duplicate</button>",
                "<button id='school' class='button btn btn-default textButton' data-tooltip='located on school property'>School</button>",
                "<button id='person' class='button btn btn-default textButton' data-tooltip='photo contains 1 or more people'>Person</button>",
                "<button id='perm' class='button btn btn-default textButton' data-tooltip='seasonal or temporary display or item'>Temporary</button>",
                "<button id='location' class='button btn btn-default textButton' data-tooltip='location wrong'>Location</button>",
                "<button id='clear' class='button btn btn-default textButton' data-tooltip='clears the comment box'>Clear</button>"
            ];

            newSubmitDiv.insertAdjacentHTML("beforeEnd", "<div class='center' style='text-align: center'>" + textButtons.join("") + "</div>");

            const textBox = w.document.querySelector("#submitDiv + .text-center > textarea");

            const buttons = w.document.getElementsByClassName("textButton");
            for (let b in buttons) {
                if (buttons.hasOwnProperty(b)) {
                    buttons[b].addEventListener("click", function () {
                        const source = event.target || event.srcElement;
                        let text;
                        switch (source.id) {
                            case "photo":
                                text = "low quality photo";
                                break;
                            case "private":
                                text = "private residential property";
                                break;
                            case "duplicate":
                                text = "duplicate of previously reviewed portal candidate";
                                break;
                            case "school":
                                text = "located on primary or secondary school grounds";
                                break;
                            case "person":
                                text = "picture contains one or more people";
                                break;
                            case "perm":
                                text = "portal candidate is seasonal or temporary";
                                break;
                            case "location":
                                text = "Portal candidate's location is not on object";
                                break;
                            case "clear":
                                text = "";
                                break;
                        }
                        textBox.innerText = text;

                    }, false);
                }
            }


            // adding percent procressed number
            const stats = w.document.querySelector("#player_stats").children[2];

            const reviewed = parseInt(stats.children[3].children[2].innerText);
            const accepted = parseInt(stats.children[5].children[2].innerText);
            const rejected = parseInt(stats.children[7].children[2].innerText);

            let percent = (accepted + rejected) / reviewed;
            percent = Math.round(percent * 1000) / 10;
            w.document.querySelector("#player_stats:not(.visible-xs) div p:last-child")
                .insertAdjacentHTML("afterEnd", '<br><p><span class="glyphicon glyphicon-info-sign ingress-gray pull-left"></span><span style="margin-left: 5px" class="ingress-mid-blue pull-left">Percent Processed</span> <span class="gold pull-right">' + percent + '%</span></p>');

            w.document.querySelector("#player_stats:not(.visible-xs) div p:last-child").insertAdjacentHTML("afterEnd", '<br><p><input type="text" value="'+reviewed+' / '+accepted+' / '+rejected+' / '+percent+'%"/></p>');

            // kill autoscroll
            ansController.goToLocation = null;

            // portal image zoom button with "=s0"
            w.document.querySelector("#AnswersController .ingress-background").insertAdjacentHTML("beforeBegin",
                                                                                                  "<div style='position:absolute;float:left;'><a class='button btn btn-default' style='display:inline-block;' href='" + subController.pageData.imageUrl + "=s0' target='fullimage'><span class='glyphicon glyphicon-search' aria-hidden='true'></span></div>");

            // skip "Your analysis has been recorded." dialog and go directly to next review
            exportFunction(function () {
                window.location.assign("/recon");
            }, ansController, {defineAs: "openSubmissionCompleteModal"});

            // Make photo filmstrip scrollable
            const filmstrip = w.document.getElementById("map-filmstrip");

            function scrollHorizontally(e) {
                e = window.event || e;
                const delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
                filmstrip.scrollLeft -= (delta * 50); // Multiplied by 50
                e.preventDefault();
            }

            filmstrip.addEventListener("DOMMouseScroll", scrollHorizontally, false);
            filmstrip.addEventListener("mousewheel", scrollHorizontally, false);

            // Replace map markers with a nice circle
            for (let i = 0; i < subController.markers.length; ++i) {
                const marker = subController.markers[i];
                marker.setIcon(PORTAL_MARKER);
            }
            subController.map.setZoom(16);

            // Re-enabling scroll zoom
            subController.map.setOptions(cloneInto({scrollwheel: true}, w));

            // HACKY way to move portal rating to the right side
            const scorePanel = w.document.querySelector("div[class~='pull-right']");
            let nodesToMove = Array.from(w.document.querySelector("div[class='btn-group']").parentElement.children);
            nodesToMove = nodesToMove.splice(2, 6);
            nodesToMove.push(w.document.createElement("br"));
            for (let j = nodesToMove.length - 1; j >= 0; --j) {
                scorePanel.insertBefore(nodesToMove[j], scorePanel.firstChild);
            }

            // Bind click-event to Dup-Images-Filmstrip. result: a click to the detail-image the large version is loaded in another tab
            const imgDups = w.document.querySelectorAll("#map-filmstrip > ul > li > img");
            const clickListener = function () {
                w.open(this.src + "=s0", 'fulldupimage');
            };
            for (let imgSep in imgDups) {
                if (imgDups.hasOwnProperty(imgSep)) {
                    imgDups[imgSep].addEventListener("click", function () {
                        const imgDup = w.document.querySelector("#content > img");
                        imgDup.removeEventListener("click", clickListener);
                        imgDup.addEventListener("click", clickListener);
                        imgDup.setAttribute("style", "cursor: pointer;");
                    });
                }
            }

            // add translate buttons to title and description (if existing)
            const link = w.document.querySelector("#descriptionDiv a");
            const content = link.innerText.trim();
            let a = w.document.createElement("a");
            let span = w.document.createElement("span");
            span.className = "glyphicon glyphicon-book";
            span.innerHTML = " ";
            a.appendChild(span);
            a.className = "button btn btn-default pull-right";
            a.target = 'translate';
            a.style.padding = '0px 4px';
            a.href = "https://translate.google.com/#auto/en/" + content;
            link.insertAdjacentElement("afterend",a);

            const description = w.document.querySelector("#descriptionDiv").innerHTML.split("<br>")[3].trim();
            if (description !== '&lt;No description&gt;' && description !== '') {
                a = w.document.createElement('a');
                span = w.document.createElement("span");
                span.className = "glyphicon glyphicon-book";
                span.innerHTML = " ";
                a.appendChild(span);
                a.className = "button btn btn-default pull-right";
                a.target = 'translate';
                a.style.padding = '0px 4px';
                a.href = "https://translate.google.com/#auto/en/" + description;
                const br = w.document.querySelectorAll("#descriptionDiv br")[2];
                br.insertAdjacentElement("afterend",a);
            }

            // Automatically open the first listed possible duplicate
            try {
                const e = w.document.querySelector("#map-filmstrip > ul > li:nth-child(1) > img");
                setTimeout(function () {
                    e.click();
                }, 500);
            } catch (err) {}

            // expand automatically the "What is it?" filter text box
            try {
                const f = w.document.querySelector("#AnswersController > form > div:nth-child(5) > div > p > span.ingress-mid-blue.text-center");
                setTimeout(function () {
                    f.click();
                }, 500);
            } catch (err) {}

            watchAdded = true;
        }

    }

}

setTimeout(function () {
    if (document.querySelector("[src*='all-min']")) {
        init();
    }
}, 500);
