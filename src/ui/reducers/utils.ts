export const simpleFabric = defaultState => action => (state, data) => {
    state = state == null ? defaultState : state;
    const { type, payload } = data;
    return type === action ? payload : state;
};
