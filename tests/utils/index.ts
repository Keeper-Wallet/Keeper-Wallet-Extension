import { Key, WebElement } from 'selenium-webdriver';

export const clear = async (input: WebElement) => {
    // some input controls are not cleared by input.clear()
    await input.sendKeys(Key.HOME, Key.chord(Key.SHIFT, Key.END), Key.BACK_SPACE);
};
