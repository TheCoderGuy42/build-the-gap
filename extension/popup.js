// This script runs as soon as the popup opens

// ignore the chrome errors, chrome is globally defined in the extension context

// @ts-ignore
if (typeof chrome !== "undefined" && chrome.tabs) {
  // @ts-ignore
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentUrl = tabs[0]?.url || "";
    const targetUrl = `https://www.inquizitive.study/?link=${encodeURIComponent(currentUrl)}`; // Change to your deployed site
    // @ts-ignore
    chrome.tabs.create({ url: targetUrl });
    window.close(); // Close the popup after opening the tab
  });
} else {
  // Fallback for non-Chrome environments
  const currentUrl = window.location.href;
  const targetUrl = `https://www.inquizitive.study/?link=${encodeURIComponent(currentUrl)}`;
  window.open(targetUrl, "_blank");
  window.close();
}