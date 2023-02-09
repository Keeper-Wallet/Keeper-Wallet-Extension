import ObservableStore from 'obs-store';
import Browser from 'webextension-polyfill';

import { type ExtensionStorage } from '../storage/storage';

const height = 622;
const width = 357;

export class WindowManager {
  #store;

  constructor({ extensionStorage }: { extensionStorage: ExtensionStorage }) {
    this.#store = new ObservableStore(
      extensionStorage.getInitState({
        notificationWindowId: undefined,
        inShowMode: undefined,
      })
    );

    extensionStorage.subscribe(this.#store);
  }

  async showWindow() {
    const { inShowMode } = this.#store.getState();

    if (inShowMode) {
      return null;
    }

    this.#store.updateState({ inShowMode: true });

    const notificationWindow = await this.#getNotificationWindow();

    if (notificationWindow?.id) {
      await Browser.windows.update(notificationWindow.id, { focused: true });
    } else {
      const { id: notificationWindowId } = await Browser.windows.create({
        url: 'notification.html',
        type: 'popup',
        focused: true,
        width,
        height,
      });

      this.#store.updateState({ notificationWindowId });
    }

    this.#store.updateState({ inShowMode: false });
  }

  async #getNotificationWindow() {
    const windows =
      (await Browser.windows.getAll({ windowTypes: ['popup'] })) ?? [];

    const { notificationWindowId } = this.#store.getState();

    return windows.find(window => window.id === notificationWindowId);
  }

  async resizeWindow(newWidth: number, newHeight: number) {
    const notificationWindow = await this.#getNotificationWindow();

    if (notificationWindow?.id) {
      await Browser.windows.update(notificationWindow.id, {
        width: newWidth,
        height: newHeight,
      });
    }
  }

  async closeWindow() {
    const notificationWindow = await this.#getNotificationWindow();

    if (notificationWindow?.id) {
      await Browser.windows.remove(notificationWindow.id);
    }

    this.#store.updateState({ notificationWindowId: undefined });
  }
}
