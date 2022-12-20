const DataRow = (wrapped: WebdriverIO.Element) => ({
  get key() {
    return wrapped.findByTestId$('dataRowKey');
  },
  get type() {
    return wrapped.findByTestId$('dataRowType');
  },
  get value() {
    return wrapped.findByTestId$('dataRowValue');
  },
});

export const DataTransactionScreen = {
  get root() {
    return browser.$(
      "[class*='transaction@data'], [class*='transaction@customData']"
    );
  },

  async getDataRows() {
    return this.root.findAllByTestId$('dataRow').map(it => DataRow(it));
  },

  get contentScript() {
    return this.root.findByTestId$('contentScript');
  },
};
