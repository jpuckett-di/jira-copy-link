// ==UserScript==
// @name        JIRA Copy Title Links
// @namespace   Violentmonkey Scripts
// @match       https://carscommerce.atlassian.net/browse/*
// @match       https://carscommerce.atlassian.net/jira/software/c/projects/*
// @grant       none
// @version     1.1.0
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
        "text/plain": new Blob([text], { type: "text/plain" }),
        "text/html": new Blob([htmlText], { type: "text/html" }),
      }),
    ];
    await navigator.clipboard.write(clipboardItems);
    animateButton();
  } catch (err) {
    console.error("Failed to copy:", err);
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
  return document
    .querySelector(
      'h1[data-testid="issue.views.issue-base.foundation.summary.heading"]'
    )
    .textContent.trim();
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

function findStatus() {
  const statusElement = document.getElementById(
    "issue.fields.status-view.status-button"
  );
  if (statusElement) {
    const statusSpan = statusElement.querySelector("span");
    return statusSpan ? statusSpan.textContent.trim() : "";
  }
  return "";
}

function createButton(clickListener, longPressListener) {
  const button = document.createElement("button");
  button.id = BUTTON_ID;
  button.style = "position: absolute; top: 0px; left: 0px; z-index: 1000;";
  button.textContent = "copy";
  document.body.prepend(button);

  let pressTimer;
  let isLongPress = false;

  button.addEventListener("mousedown", (e) => {
    isLongPress = false;
    pressTimer = setTimeout(() => {
      isLongPress = true;
      button.textContent = "copy+status";
      longPressListener(e);
    }, 800); // 800ms for long press
  });

  button.addEventListener("mouseup", (e) => {
    clearTimeout(pressTimer);
    if (!isLongPress) {
      clickListener(e);
    }
    // Reset button text after a short delay
    setTimeout(() => {
      button.textContent = "copy";
    }, 500);
  });

  button.addEventListener("mouseleave", () => {
    clearTimeout(pressTimer);
    button.textContent = "copy";
  });
}

// Regular click handler
const handleClick = () => {
  const issueKey = findIssueKey();
  const title = findTitle();
  const url = findUrl();

  const plainText = `${issueKey} ${title}`;
  const htmlText = makeLink(`${issueKey} ${title}`, url);

  setClipboard(plainText, htmlText);
};

// Long press handler
const handleLongPress = () => {
  const issueKey = findIssueKey();
  const title = findTitle();
  const status = findStatus();
  const url = findUrl();

  const plainText = `${issueKey} [${status}] ${title}`;
  const htmlText = makeLink(`${issueKey} [${status}] ${title}`, url);

  setClipboard(plainText, htmlText);
};

createButton(handleClick, handleLongPress);
