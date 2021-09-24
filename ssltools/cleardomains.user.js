// ==UserScript==
// @name         Clear Domains on Tools List
// @namespace    http://gunnyarts.com
// @version      1.0
// @description  Clear multiple domains at once on the SSL list on ssl.new.php
// @author       Dennis Jensen
// @match        https://tools.zitcom.dk/ssl.new.php
// @updateURL    https://gunnyarts.github.io/tb/ssltools/cleardomains.user.js
// @downloadURL  https://gunnyarts.github.io/tb/ssltools/cleardomains.user.js
// @icon         https://www.google.com/s2/favicons?domain=zitcom.dk
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Your code here...

    let formContainer = document.createElement("div")
    formContainer.className = "domain_clear col-md-12 tc tc-blue"
    formContainer.innerHTML = "<h3 class=\"tc-h\">Bulk clear domains</h3>"
    let form = document.createElement("form")
    form.id = "domain_clear_form"
    form.addEventListener("submit", formSubmit)
    form.innerHTML = "<div><textarea name=\"domains\" class=\"col-md-12\"></textarea></div><div><input type=\"submit\" class=\"btn btn-xs btn-info\" value=\"Clear domains\"></div>"
    formContainer.appendChild(form)
    let masterContainer = document.querySelector("div.container.master")
    masterContainer.appendChild(formContainer)
        /*
<div class="domain_clear container">
    <div class=" col-md-12 tc tc-blue">
    <h3 class="tc-h">Bulk clear domains</h3>
    <form id="domain_clear_form">
    <div><textarea name="domains" class="col-md-12"></textarea></div>
    <div><input type="submit" class="btn btn-xs btn-info" value="Clear domains"></div>
    </form></div>
</div>
        */
    function formSubmit(e){
        e.preventDefault()
        let formData = new FormData(e.target)
        let domains = new URLSearchParams(formData).toString().split("domains=")[1].split("%0D%0A")
        var temp = []

        for(let i of domains) {
            i && temp.push(i); // copy each non-empty value to the 'temp' array
        }
        domains = temp;

        clearDomains(domains) // must be array of trimmed domains
    }

    function clearDomains(domains) {
        let tds = document.getElementsByTagName("td")
        for(let td of tds) {
            if(domains.includes(td.textContent.trim())) {
                let checkbox = td.parentElement.querySelector("span.notify_toggle")
                if (checkbox.innerHTML.includes("fa-check-square-o")) {
                    checkbox.click()
                    console.log( "unchecked domain: " + td.textContent.trim() )
                } else {
                    console.log( "domain already unchecked: " + td.textContent.trim() )
                }
            }
        }
    }
})();
