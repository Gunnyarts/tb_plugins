// ==UserScript==
// @name         NewMessageButton
// @namespace    https://gunnyarts.github.io/tb/
// @version      1.00
// @description  try to take over the world!
// @author       You
// @match        https://app.intercom.com/*
// @icon         https://www.google.com/s2/favicons?domain=intercom.com
// @grant        none
// @updateURL	   https://gunnyarts.github.io/tb/intercom/newmessagebutton.user.js
// @downloadURL  https://gunnyarts.github.io/tb/intercom/newmessagebutton.user.js
// ==/UserScript==

(function() {
    'use strict';

    let interval = setInterval(function(){
        if (location.href.includes("/users/")) {
            if (location.href.includes("segments")){
                updateListButtons()
            } else {
                updateMainButton()
            }
        }
    },500)

    function updateMainButton(){
        if (document.querySelector(".profile__user-data__actions > .newMsgLink") == null){
            let link = location.href
            let user = link.split("users/")[1].split("/")[0]
            let project = link.split("apps/")[1].split("/")[0]
            let msgLink = "https://app.intercom.com/a/apps/"+project+"/inbox/new-conversation?recipient="+user
            let parent = document.querySelector(".profile__user-data__actions")
            let button = parent.querySelector("button.o__primary")
            if (parent && button){
              let className = button.className
              let innerHTML = button.innerHTML
              let container = button.parentElement
              className += " " + container.className
              let newLink = document.createElement("a")
              newLink.className = "newMsgLink"
              newLink.href = msgLink
              newLink.className = className
              newLink.innerHTML = innerHTML
              container.remove()
              parent.prepend(newLink)
              console.log("NewMessageButton: Updated list button for ", user)
            } else {
              console.log("NewMessageButton: could not find button to replace")
            }
        }
    }
    function updateListButtons(){
        let rows = document.querySelectorAll(".tbl__user-list-row")
        rows.forEach(function(tr){
            if (tr.querySelector(".newMsgLink") == null){
                let link = tr.querySelector("a.t__solo-link").href
                let user = link.split("users/")[1].split("/")[0]
                let project = link.split("apps/")[1].split("/")[0]
                let msgLink = "https://app.intercom.com/a/apps/"+project+"/inbox/new-conversation?recipient="+user
                let button = tr.querySelector("button")
                let className = button.className
                let innerHTML = button.innerHTML
                let container = button.parentElement
                let parent = container.parentElement
                let newLink = document.createElement("a")
                newLink.className = "newMsgLink"
                newLink.href = msgLink
                newLink.className = className
                newLink.innerHTML = innerHTML
                container.remove()
                parent.appendChild(newLink)
                console.log("NewMessageButton: Updated list button for ", user)
            }
        })



    }
})();
