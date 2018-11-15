import extension from 'extensionizer';

const height = 622;
const width = 357;

export class WindowManager {
    _notificationWindowId;

    async showWindow(){
        const notificationWindow = await this._getNotificationWindow();

        if (notificationWindow) {
            extension.windows.update(notificationWindow.id, {focused: true})
        } else {
            // create new notification popup
            await new Promise((resolve, reject) => {
                extension.windows.create({
                    url: 'home.html',
                    type: 'popup',
                    width,
                    height,
                }, window => {
                    this._notificationWindowId = window.id
                    resolve()
                })
            })

        }
    }

    async closeWindow(){
        const notificationWindow = await this._getNotificationWindow()
        if (notificationWindow) extension.windows.remove(notificationWindow.id, console.error)
    }

    async _getNotificationWindow() {
        // get all extension windows
        const windows = await new Promise((resolve, reject) => extension.windows.getAll({}, windows => {
            resolve(windows || [])
        }));

        // find our ui window
        return windows.find(window => window.type === 'popup' && window.id === this._notificationWindowId)
    }
}
