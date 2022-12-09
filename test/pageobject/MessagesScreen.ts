export const MessagesScreen = {
  get root() {
    return browser.$("[class*='messageList@messageList']");
  },

  get messages() {
    return this.root.$$("[class*='messageItemInner@messageList']");
  },

  get messagesCards() {
    return this.root.$$("[class*='cardItem@messageList']");
  },

  get closeButton() {
    return this.root.findByText$("Close");
  },

  get clearAllButton() {
    return this.root.findByText$("Clear All");
  }
};