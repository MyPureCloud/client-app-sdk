  const enterFullscreen = () => {
    document.getElementById('fullscreenImage').requestFullscreen();
  }
  const clipboardWrite = () => {
    const textInput = document.getElementById('clipboardTextInput').value;
    const type = "text/plain";
    const blob = new Blob([textInput], { type });
    const data = [new ClipboardItem({ [type]: blob })];
    navigator.clipboard.write(data);
  }
  const clipboardWriteText = () => {
    const textInput = document.getElementById('clipboardTextInput').value;
    navigator.clipboard.writeText(textInput);
  }
  const clipboardReadText = (trigger) => {
    navigator.clipboard.readText().then((data) => {
      const clipboardHistory = document.getElementById('clipboardHistory');
      const text = document.createElement('p');
      text.innerHTML = (trigger ? trigger : 'button trigger: ') + data;
      clipboardHistory.prepend(text);
    })
  }
  const clipboardRead = async (trigger) => {
    const clipboardHistory = document.getElementById('clipboardHistory');
    const clipboardImg = document.getElementById('clipboardImage');
    navigator.clipboard.read().then(async (data) => {
      for (let i = 0; i < data.length; i++) {
        if (data[i].types.includes('image/png')) {
          data[i].getType('image/png').then((blob) => {
            clipboardImg.src = URL.createObjectURL(blob);
          });
        } else if(data[i].types.includes('image/jpeg')) {
          data[i].getType('image/jpeg').then((blob) => {
            clipboardImg.src = URL.createObjectURL(blob);
          });
        } else if(data[i].types.includes('text/plain')){
          data[i].getType('text/plain').then(async (blob) => {
            const clipboardText = await blob.text();
            const text = document.createElement('p');
            text.innerHTML = (trigger ? trigger : 'button trigger: ') + clipboardText;
            clipboardHistory.prepend(text);
          });
        }
      }
    })
  }
  document.addEventListener('copy', function() {
    clipboardReadText('copy event: ');
  }); 
  document.addEventListener('paste', function() {
    clipboardReadText('paste event: ');
  }); 

  const displayCapture = async () => {
    let captureStream = null;
    try {
      captureStream = await navigator.mediaDevices.getDisplayMedia();
    } catch(err) {
      console.error("Error: " + err);
    }
    return captureStream;
  }
 
  const testTimeoutPermission = (functionToTest) => {
    setTimeout(() => {
      functionToTest();
    }, 5000)
  };

  let intervals = [];
  const testIntervalPermission = (functionToTest) => {
    let newInterval = setInterval(() => {
      functionToTest();
    }, 2000)
    intervals.push(newInterval);
  };

  const stopIntervalPermissions = () => {
    intervals.forEach(curr => {
      clearInterval(curr);
    })
  }