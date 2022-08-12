import { extension } from 'lib/extension';
import ObservableStore from 'obs-store';
import ExtensionStore from '../storage/storage';

const height = 622;
const width = 357;

interface ExtensionWindow {
  id: string;
  type: string;
}

export class WindowManager {
  private store;

  constructor({ localStore }: { localStore: ExtensionStore }) {
    this.store = new ObservableStore(
      localStore.getInitState({
        notificationWindowId: undefined,
        inShowMode: undefined,
      })
    );

    localStore.subscribe(this.store);
  }

  async showWindow() {
    const { inShowMode } = this.store.getState();

    if (inShowMode) {
      return null;
    }

    this.store.updateState({ inShowMode: true });
    const notificationWindow = await this._getNotificationWindow();

    if (notificationWindow) {
      extension.windows.update(notificationWindow.id, { focused: true });
    } else {
      // create new notification popup
      await new Promise<void>(resolve => {
        extension.windows.create(
          {
            url: 'notification.html',
            type: 'popup',
            focused: true,
            width,
            height,
          },
          (window: { id: string }) => {
            this.store.updateState({ notificationWindowId: window.id });
            resolve();
          }
        );
      });
    }

    this.store.updateState({ inShowMode: false });
  }

  async resizeWindow(width: number, height: number) {
    const notificationWindow = await this._getNotificationWindow();
    if (notificationWindow) {
      await extension.windows.update(notificationWindow.id, { width, height });
    }
  }

  async closeWindow() {
    const notificationWindow = await this._getNotificationWindow();
    if (notificationWindow) {
      extension.windows.remove(notificationWindow.id, console.error);
      this.store.updateState({ notificationWindowId: undefined });
    }
  }

  async _getNotificationWindow() {
    // get all extension windows
    const windows = await new Promise<ExtensionWindow[]>(resolve =>
      extension.windows.getAll({}, (windows: ExtensionWindow[]) => {
        resolve(windows || []);
      })
    );

    const { notificationWindowId } = this.store.getState();

    // find our ui window
    return windows.find(
      window => window.type === 'popup' && window.id === notificationWindowId
    );
  }
}
