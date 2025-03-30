chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getActiveTab") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length > 0) {
                sendResponse({ title: tabs[0].title, url: tabs[0].url });
            } else {
                sendResponse({ title: "No encontrado", url: "" });
            }
        });
        return true; 
    }
});
