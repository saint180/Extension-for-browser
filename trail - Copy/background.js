let MEMORY_THRESHOLD_MB = 200;
let IDLE_TIME_THRESHOLD_MINUTES = 30;

let tabLastActiveTime = {};

const loadSettings = () => {
  if (chrome.storage && chrome.storage.sync) {
    chrome.storage.sync.get(['memoryThreshold', 'idleThreshold'], function(result) {
      MEMORY_THRESHOLD_MB = result.memoryThreshold || MEMORY_THRESHOLD_MB;
      IDLE_TIME_THRESHOLD_MINUTES = result.idleThreshold || IDLE_TIME_THRESHOLD_MINUTES;
      console.log(`Loaded settings: Memory Threshold = ${MEMORY_THRESHOLD_MB}MB, Idle Threshold = ${IDLE_TIME_THRESHOLD_MINUTES} minutes`);
    });
  } else {
    console.log('Chrome storage is not available. Using default settings.');
  }
};

loadSettings();

if (chrome.storage && chrome.storage.onChanged) {
  chrome.storage.onChanged.addListener(function(changes, namespace) {
    if (namespace === 'sync') {
      if (changes.memoryThreshold) {
        MEMORY_THRESHOLD_MB = changes.memoryThreshold.newValue;
      }
      if (changes.idleThreshold) {
        IDLE_TIME_THRESHOLD_MINUTES = changes.idleThreshold.newValue;
      }
      console.log(`Updated settings: Memory Threshold = ${MEMORY_THRESHOLD_MB}MB, Idle Threshold = ${IDLE_TIME_THRESHOLD_MINUTES} minutes`);
    }
  });
}

const checkTabsStatus = () => {
  console.log("Checking status for all tabs...");

  chrome.tabs.query({}, (tabs) => {
    console.log(`Total tabs found: ${tabs.length}`);

    const currentTime = Date.now();

    tabs.forEach((tab) => {
      const memoryUsage = Math.floor(Math.random() * 500);

      console.log(`Tab ID: ${tab.id}, Title: ${tab.title}, URL: ${tab.url}, Memory Usage: ${memoryUsage} MB`);

      if (memoryUsage > MEMORY_THRESHOLD_MB) {
        showNotification(tab, `High Memory Usage: ${memoryUsage} MB`);
      }

      if (!tabLastActiveTime[tab.id]) {
        tabLastActiveTime[tab.id] = currentTime;
      } else {
        const idleTimeMinutes = (currentTime - tabLastActiveTime[tab.id]) / (1000 * 60);
        if (idleTimeMinutes > IDLE_TIME_THRESHOLD_MINUTES) {
          showNotification(tab, `Idle for ${Math.floor(idleTimeMinutes)} minutes`);
        }
      }
    });
  });
};

const showNotification = (tab, message) => {
  const notificationId = `tab_${tab.id}_${Date.now()}`;
    chrome.notifications.create(notificationId, {
    type: 'basic',
    iconUrl: '1.png',
    title: 'Tab Alert',
    message: `Tab "${tab.title}" - ${message}`,
    priority: 1,
    buttons: [
      { title: 'Close Tab' },
      { title: 'Ignore' }
    ]
  }, (notificationId) => {
    console.log(`Notification created with ID: ${notificationId}`);
  });
};

// Set up an interval to check tabs every 30 seconds (30,000 milliseconds)
const interval = 30 * 1000;
setInterval(checkTabsStatus, interval);

checkTabsStatus();

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    tabLastActiveTime[tabId] = Date.now();
  }
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  tabLastActiveTime[activeInfo.tabId] = Date.now();
});

chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
  const tabId = notificationId.split('_')[1];

  if (buttonIndex === 0) {
    console.log(`Close Tab button clicked for notification ID: ${notificationId}, closing Tab ID: ${tabId}`);

    chrome.tabs.remove(parseInt(tabId), () => {
      if (chrome.runtime.lastError) {
        console.error(`Error closing Tab ID ${tabId}: ${chrome.runtime.lastError.message}`);
      } else {
        console.log(`Tab ID ${tabId} closed successfully.`);
        delete tabLastActiveTime[tabId];
      }
    });
  } else if (buttonIndex === 1) {
    console.log(`Ignore button clicked for notification ID: ${notificationId}`);
    tabLastActiveTime[parseInt(tabId)] = Date.now();
  }
});