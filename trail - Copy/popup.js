document.addEventListener('DOMContentLoaded', function() {
  if (chrome.storage && chrome.storage.sync) {
    chrome.storage.sync.get(['memoryThreshold', 'idleThreshold'], function(result) {
      document.getElementById('memoryThreshold').value = result.memoryThreshold || 200;
      document.getElementById('idleThreshold').value = result.idleThreshold || 30;
    });
  } else {
    console.log('Chrome storage is not available. Using default settings.');
    document.getElementById('memoryThreshold').value = 200;
    document.getElementById('idleThreshold').value = 30;
  }

  document.getElementById('saveSettings').addEventListener('click', function() {
    const memoryThreshold = parseInt(document.getElementById('memoryThreshold').value);
    const idleThreshold = parseInt(document.getElementById('idleThreshold').value);

    if (chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.set({
        memoryThreshold: memoryThreshold,
        idleThreshold: idleThreshold
      }, function() {
        console.log('Settings saved');
        alert('Settings saved successfully!');
      });
    } else {
      console.log('Chrome storage is not available. Unable to save settings.');
      alert('Unable to save settings. Chrome storage is not available.');
    }
  });
});