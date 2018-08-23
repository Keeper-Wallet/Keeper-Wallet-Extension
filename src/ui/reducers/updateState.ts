export const updateState = (store = {} as any, action: any) => {

    if (action.type === 'updateState') {
        return {...store, ...action.state};
    }

    return store;
};
