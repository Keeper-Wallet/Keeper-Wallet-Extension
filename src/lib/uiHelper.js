import extension from 'extensionizer';

const height = 620
const width = 360


export async function showPopup() {
    const popup = await _getPopup()
    if (popup) {
        // bring focus to existing chrome popup
        extension.windows.update(popup.id, {focused: true})
    } else {
        // create new notification popup
        extension.windows.create({
            url: 'popup.html',
            type: 'popup',
            width,
            height,
        })
            // .then((currentPopup) => {
            //     this._popupId = currentPopup.id
            // })
    }
}


export async function closePopup() {
    // closes notification popup
    const popup = await _getPopup();
    if (popup){
        extension.windows.remove(popup.id)
    }
}


async function _getPopup() {
    const windows = await _getWindows();
    return await _getPopupIn(windows)
}

/**
 * Returns all open extension windows.
 */
function _getWindows() {
    // Ignore in test environment
    if (!extension.windows) {
        return Promise.resolve([])
    }

    return new Promise((resolve, reject) => {
        extension.windows.getAll({}, (windows) => {
            resolve(windows)
        })
    })
}

/**
 * Given an array of windows, returns the 'popup' that has been opened by extension, or null if no such window exists.
 *
 * @private
 * @param {array} windows An array of objects containing data about the open extension windows.
 *
 */
function _getPopupIn(windows) {
    return windows.find((win) => {
        // Returns notification popup
        return (win && win.type === 'popup') //&& win.id === this._popupId)
    })
}


