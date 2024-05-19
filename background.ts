


function notify(message: { command: string, url: string, active: boolean }) {
    if (0) {
        // ブラウザの右下にポップアップウィンドウが３秒ほどあらわれる。
        browser.notifications.create({
            type: "basic",
            //   iconUrl: browser.extension.getURL("link.png"),
            title: "You clicked a link!",
            message: message.url,
        });
    }
    browser.tabs.create({active:message.active, url:message.url});
  }
  
browser.runtime.onMessage.addListener(notify);

