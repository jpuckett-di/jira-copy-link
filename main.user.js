// ==UserScript==
// @name        JIRA Copy Title Links
// @namespace   Violentmonkey Scripts
// @match       https://carscommerce.atlassian.net/browse/*
// @match       https://carscommerce.atlassian.net/jira/software/c/projects/*
// @grant       none
// @version     1.0
// @author      -
// @description 7/19/2024, 2:08:47 PM
// ==/UserScript==
const BUTTON_ID = "jira-copy-button";

async function setClipboard(text) {
  const type = "text/html";
  const blob = new Blob([text], { type });
  const data = [new ClipboardItem({ [type]: blob })];
  await navigator.clipboard.write(data);
  animateButton();
}

function animateButton() {
  const animation = [{ transform: "scale(0.5)" }];

  const timing = {
    duration: 100,
    iterations: 1,
  };

  document.getElementById(BUTTON_ID).animate(animation, timing);
}

function makeLink(text, url) {
  return `<a href="${url}">${text}</a>`;
}

function findTitle() {
  return document.querySelector(
    'h1[data-testid="issue.views.issue-base.foundation.summary.heading"]'
  ).textContent;
}

function findUrl() {
  return document.querySelector(
    'a[data-testid="issue.views.issue-base.foundation.breadcrumbs.current-issue.item"]'
  ).href;
}

function findIssueKey() {
  return document.querySelector(
    'a[data-testid="issue.views.issue-base.foundation.breadcrumbs.current-issue.item"] span'
  ).innerText;
}

function createButton(listener) {
  const button = document.createElement("button");
  button.id = BUTTON_ID;
  button.style = "position: absolute; top: 0px; left: 0px; z-index: 1000;";
  button.textContent = "copy";
  document.body.prepend(button);
  button.addEventListener("click", listener, false);
}

createButton(() => {
  setClipboard(makeLink(findIssueKey() + " " + findTitle(), findUrl()));
});
