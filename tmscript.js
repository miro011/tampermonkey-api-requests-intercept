/* eslint-disable dot-notation */
/* eslint-disable userscripts/better-use-match */
// ==UserScript==
// @name         bizbuysell - easy copy request data
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Monitors requests and gives the thing to add to the python scripts
// @author       You
// @match        https://www.bizbuysell.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=bizbuysell.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function is_api_url(url)
    {
        return url == "https://api.bizbuysell.com/bff/v2/BbsBfsSearchResults";
    }

    function html_to_node(code)
    {
        let tempWrapper = document.createElement("div");
        tempWrapper.innerHTML = code;
        if (tempWrapper.childElementCount == 1) tempWrapper = tempWrapper.firstChild;
        return tempWrapper;
    }

    function prep_output(body)
    {
        try {
            let requestBodyObj = JSON.parse(body);

            // Prepare the locations part
            let locationsStr = "LOCATIONS_ARR = " + JSON.stringify(requestBodyObj["bfsSearchCriteria"]["locations"], null, 4);

            // Prepare the request parameters - remove locations and page number as those would be handled seperatly in the automation (standalone) script
            delete requestBodyObj["bfsSearchCriteria"]["locations"];
            delete requestBodyObj["bfsSearchCriteria"]["pageNumber"];
            let requestBodyStr = "REQUEST_BODY_OBJ = " + JSON.stringify(requestBodyObj, null, 4);

            return [locationsStr, requestBodyStr]
        }
        catch(err) {
            alert(`Error converting the request's JSON\n${err}`);
            return [null, null];
        }
    }

    function display_output(locationsStr, requestBodyStr)
    {
        try {document.querySelector(`#custOutput`).remove();} catch(err) {}
        if (locationsStr === null) return;

        let style =
            `#custOutput {padding: 20px; z-index: 99999; position: fixed; height: 300px; bottom:0; width: 100%; background: #c7c7ff;}
            #custOutputHeader, #custOutputBody {display: flex; flex-direction: row; gap: 20px;}
            #custOutputBody {height: 100%;}
            #custOutput button {color: purple; background: #ffd4d4;}
            #custOutput p {font-size: 20px;}
            #custOutput textarea {width: 50%; height: 100%;}`;
        let htmlCode =
            `<div id="custOutput">
                <div id="custOutputHeader">
                    <button id="togglePythonJs" format="js">Toggle Python-JS Format</button>
                    <p id="curFormatText">current format: js</p>
                </div>
                <div id="custOutputBody">
                    <textarea id="reqTa"></textarea>
                    <textarea id="locTa"></textarea>
                </div>
                <style>${style}</style>
            </div>`;
        document.querySelector("html").appendChild(html_to_node(htmlCode));
        document.querySelector("#reqTa").value = requestBodyStr;
        document.querySelector("#locTa").value = locationsStr;

        document.querySelector("#togglePythonJs").addEventListener("click", ()=>{
            let formatTextElem = document.querySelector("#curFormatText");
            let curFormat = (document.querySelector("#curFormatText").innerText.includes("js")) ? "js" : "python";
            let newFormat = (curFormat === "js") ? "python" : "js";

            for (let taSelector of ["#reqTa", "#locTa"]) {
                let elem = document.querySelector(taSelector);
                let curStr = elem.value;
                let newStr;
                if (curFormat == "js") {
                    newStr = curStr.replace(/\bfalse\b/g, 'False').replace(/\btrue\b/g, 'True').replace(/\bnull\b/g, 'None');
                }
                else {
                    newStr = curStr.replace(/\bFalse\b/g, 'false').replace(/\bTrue\b/g, 'true').replace(/\bNone\b/g, 'null');
                }
                elem.value = newStr;
            }

            formatTextElem.innerHTML = `current format: ${newFormat}`;
        });
    }


    // Override the fetch() method
    const originalFetch = window.fetch;
    window.fetch = async function(...args) {
        const [resource, config] = args;

        let url = typeof resource === 'string' ? resource : resource.url;
        let method = (config && config.method) || 'GET';
        let body = (config && config.body) || null;

        if (is_api_url(url)) {
            console.log(`Intercepted fetch request:\nURL: ${url}\nMethod: ${method}\nRequest Body: ${body}`);

            let [locationsStr, requestBodyStr] = prep_output(body)
            display_output(locationsStr, requestBodyStr);
        }

        return originalFetch.apply(this, args);
    };


    // Override XMLHttpRequest open method
    const originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url) {
        // Save the method and URL for later use
        this._method = method;
        this._url = url;

        // Call the original open method
        originalOpen.apply(this, arguments);
    };

    // Override XMLHttpRequest send method
    const originalSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function(body) {
        if (is_api_url(this._url)) {
            console.log(`Detected a request:\nURL: ${this._url}\nMethod: ${this._method}\nRequest Body: ${body}`);
            
            let [locationsStr, requestBodyStr] = prep_output(body)
            display_output(locationsStr, requestBodyStr);
        }

        // Call the original send method
        originalSend.apply(this, arguments);
    };

})();
