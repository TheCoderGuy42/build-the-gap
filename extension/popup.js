// This script runs as soon as the popup opens

if (typeof chrome !== "undefined" && chrome.tabs) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentUrl = tabs[0]?.url || "";
    const targetUrl = `https://localhost:3000?from=${encodeURIComponent(currentUrl)}`; // Change to your deployed site
    chrome.tabs.create({ url: targetUrl });
    window.close(); // Close the popup after opening the tab
  });
} else {
  // Fallback for non-Chrome environments
  const currentUrl = window.location.href;
  const targetUrl = `https://localhost:3000?from=${encodeURIComponent(currentUrl)}`;
  window.open(targetUrl, "_blank");
  window.close();
}