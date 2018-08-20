const updateState = (store = {}, action: any) => {
    debugger;
    store.state = action.state;
    return store;
};
