import invariant from 'tiny-invariant';
import Browser from 'webextension-polyfill';

const NOTIFICATION_WINDOW_URL = Browser.runtime.getURL('/notification.html');

export class WindowManager {
  #lastWindowPromise: Promise<Browser.Windows.Window | void> =
    Promise.resolve();

  async #getNotificationWindowId() {
    const windows = await Browser.windows.getAll({
      populate: true,
      windowTypes: ['popup'],
    });

    const win = windows.find(
      w => w.tabs?.some(tab => tab.url?.startsWith(NOTIFICATION_WINDOW_URL)),
    );

    return win?.id;
  }

  showWindow() {
    this.#lastWindowPromise = this.#lastWindowPromise
      .catch(() => undefined)
      .then(async win => {
        const notificationWindowId =
          win?.id ?? (await this.#getNotificationWindowId());

        try {
          invariant(notificationWindowId);
          return await Browser.windows.update(notificationWindowId, {
            focused: true,
          });
        } catch (e) {
          return Browser.windows.create({
            url: NOTIFICATION_WINDOW_URL,
            type: 'popup',
            focused: true,
            width: 357,
            height: 622,
          });
        }
      });
  }

  async resizeWindow(newWidth: number, newHeight: number) {
    const notificationWindowId = await this.#getNotificationWindowId();
    if (notificationWindowId == null) return;

    await Browser.windows.update(notificationWindowId, {
      width: newWidth,
      height: newHeight,
    });
  }

  async closeWindow() {
    const notificationWindowId = await this.#getNotificationWindowId();
    if (notificationWindowId == null) return;

    await Browser.windows.remove(notificationWindowId);
  }
}
