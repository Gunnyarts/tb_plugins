// ==UserScript==
// @name         Intercom Tag Enforcer
// @namespace    https://gunnyarts.com
// @version      2.09
// @description  Check Intercom tags
// @author       Dennis Jensen
// @match        https://app.intercom.com/*
// @exclude      https://app.intercom.com/a/apps/f9x5v1mz/*
// @grant        none
// @updateURL	   https://gunnyarts.github.io/tb/tagenforcer/tagenforcer.user.js
// @downloadURL  https://gunnyarts.github.io/tb/tagenforcer/tagenforcer.user.js
// ==/UserScript==

(function() {
    'use strict';

    //WAIT 3 SEC FOR CONTENT TO LOAD...
    setTimeout(function() {
        console.log("TagChecker injected!");
        inject();
    }, 3000);
    var tagAdded = 0

    function inject() {
        setInterval(function() {
            let tag = getTag()
            let tagdiv = document.getElementById("TAGDIV")
            let isOutgoing = document.querySelector('.conversation__stream').firstElementChild.querySelector('.o__admin') != null
            let scroll = false
            let hideControls = true
            let tagClass = "noTag"
            let tagMessage = ""
            if (tagdiv == null) {
                let el = document.querySelector("div.conversation__card__content-expanded__controls")
                let elChild = document.createElement('div')
                elChild.id = "TAGDIV"
                el.insertBefore(elChild, el.firstChild);
                tagdiv = elChild
            }
            if (tag) {
                let args = {
                    tagMessage: "Tag: " + tag + "  ( click to update )",
                    tagClass: "hasTag",
                    hideControls: false,
                    scroll: false
                }
                updateTag(args)
            } else if (detect_lazyload()){
                let args = {
                    tagMessage: "Lazyload detected - click here to scroll up and activate.",
                    tagClass: "lazyloadDetected",
                    hideControls: true,
                    scroll: true
                }
                updateTag(args)
            } else if ( isOutgoing) {
                let args = {
                    tagMessage: "Outgoing - No tag needed.",
                    tagClass: "hasTag",
                    hideControls: false,
                    scroll: false
                }
                updateTag(args)
            } else if (tag == false){
                let args = {
                    tagMessage: "No tag! Reply locked. Please click here to add tag and unlock reply tab.",
                    tagClass: "noTag",
                    hideControls: true,
                    scroll: false
                }
                updateTag(args)
            } else {
                let args = {
                    tagMessage: "Error loading tag - please check console and/or refresh page.",
                    tagClass: "noTag",
                    hideControls: true,
                    scroll: false
                }
                updateTag(args)
            }
        }, 1000);
    }

    // F2 keyboard shortcut
    document.addEventListener('keyup', keypress)
    function keypress(e){
        if(e.which == 113) { //F2
            if (detect_lazyload()){
                scrollToTop()
            } else {
                addTag()
            }
        }
    }

    function getTag() {
        let filter = Array.prototype.filter
        let tags = document.querySelectorAll('.pill a')
        tags = filter.call( tags, function( node ) {
            return (node.href).includes('search?tagIds')
        })
        // if outgoing only
        if (tags[0]){
            return (tags[tags.length - 1].text).trim()
        } else {
            return false
        }
    }
    function getTagElement() {
        let filter = Array.prototype.filter
        let tags = document.querySelectorAll('.pill a')
        tags = filter.call( tags, function( node ) {
            return (node.href).includes('search?tagIds')
        })
        if (tags[0]){
            return (tags[tags.length - 1])
        } else {
            return false
        }
    }

    // detect lazyload
    function detect_lazyload(){
        if (document.querySelector('.conversation__stream').firstElementChild.classList[0] == "ember-view"){
            return false
        } else {
            return true
        }
    }

    //scroll to top
    function scrollToTop(){
        let el = document.querySelector('.conversation__stream')
        let itv = setInterval(function() {
            if(detect_lazyload() && !getTag()){
                el.scrollTo(0,0)
            } else {
                clearInterval(itv)
                el.scrollBy(0,100000)
                document.getElementById('TAGDIV').removeEventListener('click', scrollToTop)
                if (getTag() || document.querySelector('.conversation__stream').firstElementChild.querySelector('.o__admin') != null){
                    document.querySelector('.inbox__conversation-controls__pane-selector.tabs > .tabs__tab:nth-of-type(1)').click()
                }
            }
        }, 2000)
    }

    // trigger add tag
    function addTag(){
        let first_element = document.querySelector(".conversation__bubble-container.o__user-comment")
        let tagElement = getTagElement()
        if (first_element.classList[0] == "sp__3" && !getTag()){
           console.log('Detected lazyload and no tags - scrolling up to look')
        } else if (tagElement) {
            tagElement.closest('.conversation__bubble-container').querySelector('.quick-action').click()
        } else {
            first_element.querySelector('.quick-action').click()
            tagAdded = 1
        }
    }

    function updateTag(args = {scroll:false, hideControls:true,tagClass:"noTag", tagMessage:""}) {
        let tag = getTag()
        let tagdiv = document.getElementById("TAGDIV")
        let reply_tab = document.querySelector('.inbox__conversation-controls__pane-selector.tabs > div.tabs__tab > a')
        let note_tab = document.querySelector('.inbox__conversation-controls__pane-selector.tabs .tabs__tab[data-intercom-target=note-tab]')
        tagdiv.innerHTML = args.tagMessage
        tagdiv.className = args.tagClass
        if (args.hideControls){
            reply_tab.style.display = "none"
            if (!note_tab.classList.contains("o__selected")) {
                note_tab.click()
            }
        } else {
            reply_tab.style.display = "block"
            if (tagAdded){
              reply_tab.click()
              tagAdded = 0
            }
        }
        if (args.scroll){
            tagdiv.removeEventListener('click', addTag)
            tagdiv.addEventListener('click', scrollToTop)
        } else {
            tagdiv.removeEventListener('click', scrollToTop)
            tagdiv.addEventListener('click', addTag)
        }
    }

    /**********************/
    /* Intercom Signature */
    /**********************/

        // Check ready state
    function checkReady(){
        let intervalButtons = setInterval(function(){
            if (document.querySelector(".js__conversation-controls-buttons") != null){
                init()
                clearInterval(intervalButtons)
            }
        }, 1000)
        let intervalSignature = setInterval(function(){
            if (typeof intercomSettings === "object"){
                updateButtons()
                clearInterval(intervalSignature)
            }
        }, 1000)
    }
    checkReady()

    /* Button functions */
    function newEl(options){
        let el = document.createElement(options.element)
        el.className = options.class
        el.id = options.id
        el.textContent = options.text
        if (options.attributes){
            options.attributes.map(x => el.setAttribute(x[0], x[1]))
        }
        if (options.events){
            options.events.map(x => el.addEventListener(x[0], x[1]))
        }
        return el
    }
    function isNote(){
        return document.querySelector(".inbox__conversation-controls__pane-selector.tabs > a.o__selected[data-intercom-target=note-tab]")
    }
    function isNewConversation(){
        return location.pathname.includes("new-conversation")
    }
    function contentEmpty(){
        let editor = document.querySelector(".conversation__text:not(.o__note) .embercom-prosemirror-composer-editor")
        if (isNote()){
            editor = document.querySelector(".conversation__text.o__note .embercom-prosemirror-composer-editor")
        }
        if (editor.textContent == "" && editor.querySelector("img") == null){
            return true
        } else {
            return false
        }
    }
    function switchTabs(){
        setTimeout(function(){
            document.querySelector(".embercom-prosemirror-composer-editor").addEventListener("keyup", updateButtons)
            updateButtons(true)
        },200)
    }

    function sendCloseClick(e){
        insertSignature()
        setTimeout(function(){document.querySelector(".js__conversation-controls-buttons > span button").click()},200)
    }
    function sendClick(e){
        insertSignature()
        setTimeout(function(){console.log("clicking send button", document.querySelector(".js__conversation-controls-buttons > div button"));document.querySelector(".js__conversation-controls-buttons > div button").click()},200)
    }

    function updateButtons(tabswitch = null){
        let customButtons = document.getElementById("customBtnContainer")
        let controlContainer = document.querySelector(".js__conversation-controls-buttons")
        let editor = document.querySelector(".embercom-prosemirror-composer-editor")
        if (customButtons){
            if (customButtons.children.length != controlContainer.children.length || tabswitch){
                customButtons.remove()
                customButtons = null
            } else {
                if (contentEmpty() || typeof intercomSettings !== "object"){
                    customButtons.querySelectorAll("button").forEach(function(x){x.disabled = true; x.classList.add("o__disabled")})
                } else {
                    customButtons.querySelectorAll("button").forEach(function(x){x.disabled = false; x.classList.remove("o__disabled")})
                }
            }
        }
        if (!customButtons){
            // Generate custom buttons
            let right = document.querySelector(".inbox__conversation-controls__info-area > .u__right")
            let customSendCloseBtn = null
            if (document.querySelector(".js__conversation-controls-buttons > span button")){
                customSendCloseBtn = newEl({
                    element: "button",
                    class: "btn o__secondary",
                    id: "custom_send_close_btn",
                    text: "Send & close",
                    events: [
                        ["click", sendCloseClick]
                    ]
                })
                if (contentEmpty() || typeof intercomSettings !== "object"){
                    customSendCloseBtn.disabled = true
                    customSendCloseBtn.classList.add("o__disabled")
                }
            }
            let sendBtnText = "Send"
            if (isNote()) sendBtnText = "Add note"
            if (isNewConversation()) sendBtnText = "Send email"
            let customSendBtn = newEl({
                element: "button",
                class: "btn o__primary",
                id: "custom_send_btn",
                text: sendBtnText,
                events: [
                    ["click", sendClick]
                ]
            })
            if (contentEmpty() || typeof intercomSettings !== "object"){
                customSendBtn.disabled = true
                customSendBtn.classList.add("o__disabled")
            }

            let customBtnContainer = newEl({
                element: "div",
                class: "customButtons",
                id: "customBtnContainer",
                text: ""
            })

            // add buttons to the button container
            if (customSendCloseBtn){
                customBtnContainer.appendChild(customSendCloseBtn)
            }
            customBtnContainer.appendChild(customSendBtn)
            // add button container to the editor
            right.appendChild(customBtnContainer)

        }
    }
    /* Signature functions */

    function isEmail (){
        // check if last message from customer is an email
        let lastComment = document.querySelector(".conversation__stream > span[data-intercom-target=last-user-comment]")
        if (lastComment){
        let svg = lastComment.querySelector(".conversation__bubble__meta .interface-icon")
        return svg.className.baseVal.includes("email")
        } else {
            return false
        }
    }
    function getSurvey(){
        // get survey ID from brand URL
        let surveys = {
            "dkxsf7d2": "44d1079e1c84bdff", // DanDomain
            "osjokbhp": "f616373baa5b1358", // Scannet
            "abemyq6a": "283410e7f2b7553b" // Curanet
        }
        let survey = surveys[location.pathname.split("/")[3]]
        if (survey){
            return survey
        } else {
            return false
        }
    }
    function surveyLink(){
        // build the survey link
        let emailField = document.querySelector(".profile-sidebar-section__current-profile > div > div > div:nth-child(2) > div > div:nth-child(1)  div[data-attribute=Email] span.attribute__value-label")
        let email = null
        if (isNewConversation()) {
            emailField = document.querySelector(".conversation__inbox__current-context div[data-name=Email]").parentElement.parentElement
            if (emailField.querySelector("input")){
                email = emailField.querySelector("input").value
            }else {
                email = emailField.querySelector(".attribute__label-wrapper div[data-value]").dataset.value
            }
        }
        if (!email && emailField){
            email = emailField.textContent.trim()
        } else if (!email && !emailField) {
            console.log("No email visible. Could not generate survey link")
            return false
        }
        let supporter = intercomSettings.name.toLowerCase().replace(" ",".")
        let path = location.pathname.split("/")
        let conversation = ""
        if (path[path.length - 1] == "") path.pop()
        if (path[path.length-2] == "conversations" || path[path.length-2] == "conversation"){
            conversation = path[path.length - 1]
        } else {
            console.log("Tried sending survey signature, but this is not a conversation.")
            return false
        }
        return "https://survey.survicate.com/"+getSurvey()+"/?p=intercom&s="+supporter+"&email="+email+"&c="+conversation
    }
    function insertSignature(){
        // check if replying to email in relevant brand. if so, add signature to message
        if ((isNewConversation() || isEmail()) && surveyLink() && getSurvey() && !isNote()){
            let editor = document.querySelector(".embercom-prosemirror-composer-editor")
            let signatureContent = "<p><br />------</p><p>Vil du hjælpe os med at yde en bedre service?<br />Udfyld vores spørgeskema <a href=\""+surveyLink()+"\" target=\"_blank\">her</a> - det tager under 1 minut!<p>"
            editor.innerHTML += signatureContent
        }
    }

    /* Initialize signature script */
    function init(){
        document.querySelector(".embercom-prosemirror-composer-editor").addEventListener("keyup", updateButtons)
        document.querySelectorAll(".inbox__conversation-controls__pane-selector.tabs > a").forEach(function(x){x.addEventListener("click", switchTabs)})
        document.querySelector(".js__conversation-controls-buttons").style.display = "none"
        updateButtons()
    }
    let interval = setInterval(init, 1000)
    // Insert styles

    let style = document.createElement("style")
    style.innerHTML = "<style type=\"text/css\">#TAGDIV:empty{display:none}#TAGDIV{margin:0 15px;border-radius:5px;padding:5px;line-height:1;position:relative;z-index:0;cursor:pointer;}#TAGDIV.hasTag{background-color:#63b32d;color:#fff;font-size:12px}#TAGDIV.noTag{background-color:#e64646;color:#fff;font-weight:700;}#TAGDIV.lazyloadDetected{background-color:#999;color:#fff;}div#customBtnContainer button+button{margin-left:10px}div#customBtnContainer{position:relative;bottom:5px;right:5px}</style>"
    document.body.appendChild(style)

})();
