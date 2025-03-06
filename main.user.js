// ==UserScript==
// @name        JIRA Copy Title Links
// @namespace   Violentmonkey Scripts
// @match       https://carscommerce.atlassian.net/browse/*
// @match       https://carscommerce.atlassian.net/jira/software/c/projects/*
// @grant       none
// @version     1.0.1
// @author      Jeff Puckett
// @description Adds a button that copies the current JIRA issue title and link to the clipboard
// @homepageURL https://github.com/jpuckett-di/jira-copy-link
// @downloadURL https://raw.githubusercontent.com/jpuckett-di/jira-copy-link/refs/heads/main/main.user.js
// ==/UserScript==
const BUTTON_ID = "jira-copy-button";

async function setClipboard(text, htmlText) {
  try {
    // Create clipboard data with both text and HTML formats
    const clipboardItems = [
      new ClipboardItem({
        'text/plain': new Blob([text], { type: 'text/plain' }),
        'text/html': new Blob([htmlText], { type: 'text/html' })
      })
    ];
    await navigator.clipboard.write(clipboardItems);
    animateButton();
  } catch (err) {
    console.error('Failed to copy:', err);
  }
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
  const issueKey = findIssueKey();
  const title = findTitle();
  const url = findUrl();

  const plainText = `${issueKey} ${title}\n${url}`;
  const htmlText = makeLink(`${issueKey} ${title}`, url);

  setClipboard(plainText, htmlText);
});
