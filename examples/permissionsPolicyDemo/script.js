window.addEventListener('DOMContentLoaded', () => {
  const clipboardTextInput = document.getElementById('clipboardTextInput');
  const clipboardHistory = document.getElementById('clipboardHistory');

  const enterFullscreen = () => {
    const image = document.getElementById('fullscreenImage');
    if (image.requestFullscreen) {
      image.requestFullscreen();
    } else if (image.webkitRequestFullscreen) {
      // Safari
      image.webkitRequestFullscreen();
    }
  };

  const clipboardWrite = async eventSrc => {
    const textInput = clipboardTextInput.value;
    const type = 'text/plain';
    const blob = new Blob([textInput], { type });
    const clipboardItems = [new ClipboardItem({ [type]: blob })];
    try {
      await navigator.clipboard.write(clipboardItems);
      prependLog(
        buildLogMsg('clipboardWrite', `Wrote '${textInput}' as blob to clipboard`, eventSrc)
      );
    } catch (e) {
      prependLog(
        buildLogMsg('clipboardWrite', `Failed to write text as blob to clipboard: ${e}`, eventSrc)
      );
    }
  };

  const clipboardWriteText = async eventSrc => {
    const textInput = clipboardTextInput.value;
    try {
      await navigator.clipboard.writeText(textInput);
      prependLog(buildLogMsg('clipboardWriteText', `Wrote '${textInput}' to clipboard`, eventSrc));
    } catch (e) {
      prependLog(
        buildLogMsg('clipboardWriteText', `Failed to write text to clipboard: ${e}`, eventSrc)
      );
    }
  };

  const clipboardReadText = async eventSrc => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      prependLog(
        buildLogMsg('clipboardReadText', `Read '${clipboardText}' as text from clipboard`, eventSrc)
      );
    } catch (e) {
      prependLog(
        buildLogMsg('clipboardReadText', `Failed to read text from clipboard: ${e}`, eventSrc)
      );
    }
  };

  const clipboardRead = async eventSrc => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      const clipboardImg = document.getElementById('clipboardImage');

      await Promise.all(
        clipboardItems.map(async clipboardItem => {
          if (clipboardItem.types.includes('image/png')) {
            const blob = await clipboardItem.getType('image/png');
            clipboardImg.src = URL.createObjectURL(blob);
            prependLog(
              buildLogMsg(
                'clipboardRead',
                'Read clipboard item as image/png (See inline Clipboard Image)',
                eventSrc
              )
            );
          } else if (clipboardItem.types.includes('image/jpeg')) {
            const blob = await clipboardItem.getType('image/jpeg');
            clipboardImg.src = URL.createObjectURL(blob);
            prependLog(
              buildLogMsg(
                'clipboardRead',
                'Read clipboard item as image/jpeg (See inline Clipboard Image)',
                eventSrc
              )
            );
          } else if (clipboardItem.types.includes('text/plain')) {
            const blob = await clipboardItem.getType('text/plain');
            const clipboardText = await blob.text();
            prependLog(
              buildLogMsg(
                'clipboardRead',
                `Read clipboard item as text/plain: '${clipboardText}'`,
                eventSrc
              )
            );
          } else {
            prependLog(
              buildLogMsg(
                'clipboardRead',
                `Unsupported content type(s): ${clipboardItem.types.join(', ')}`,
                eventSrc
              )
            );
          }
        })
      );
    } catch (e) {
      prependLog(buildLogMsg('clipboardRead', `Failed to read from clipboard: ${e}`, eventSrc));
    }
  };

  const displayCapture = async () => {
    let captureStream = null;
    try {
      captureStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
    } catch (e) {
      console.error('Error: ' + e);
    }
    return captureStream;
  };

  const buildDelayListener = (listenerFn, durationMillis = 5000) => {
    return (...args) => {
      setTimeout(() => {
        listenerFn(...args);
      }, durationMillis);
    };
  };

  const intervals = [];
  const buildIntervalListener = (listenerFn, durationMillis = 2000) => {
    return (...args) => {
      intervals.push(
        setInterval(() => {
          listenerFn(...args);
        }, durationMillis)
      );
    };
  };

  const clearListenerIntervals = () => {
    if (!intervals.length) return;

    intervals.forEach(curr => {
      clearInterval(curr);
    });
    intervals.splice(0, intervals.length);
  };

  const buildLogMsg = (category, msg, eventSrc) => {
    if (!eventSrc || eventSrc instanceof UIEvent) {
      eventSrc = 'User Action';
    }
    return `${category} (${eventSrc}): ${msg}`;
  };

  const prependLog = (logMsg, element = clipboardHistory) => {
    const logEntry = document.createElement('p');
    logEntry.innerText = logMsg;
    element.prepend(logEntry);
  };

  // ----- Setup listeners

  const listenerMap = new Map([
    ['#clipboardWriteText', clipboardWriteText],
    ['#clipboardWrite', clipboardWrite],
    ['#clipboardWriteTimer', buildDelayListener(clipboardWrite.bind(this, 'Timer'))],
    ['#clipboardWriteInterval', buildIntervalListener(clipboardWrite.bind(this, 'Interval'))],
    ['#clipboardRead', clipboardRead],
    ['#clipboardReadText', clipboardReadText],
    ['#clipboardReadTimer', buildDelayListener(clipboardRead.bind(this, 'Timer'))],
    ['#clipboardReadInterval', buildIntervalListener(clipboardRead.bind(this, 'Interval'))],
    ['#clearIntervals', clearListenerIntervals],
    ['#fullscreen', enterFullscreen],
    ['#displayCapture', displayCapture]
  ]);

  listenerMap.forEach((listener, selector) => {
    document.querySelector(selector).addEventListener('click', listener);
  });

  document.addEventListener('copy', function () {
    clipboardReadText('copy Event');
  });

  document.addEventListener('paste', function () {
    clipboardReadText('paste Event');
  });
});
