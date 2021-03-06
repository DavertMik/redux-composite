import {Structure} from 'redux-composite';

const toggle = (state, action) => state === undefined ? false : (action.type === 'TOGGLE' ? !state : state);
const inc = (state, action) => state === undefined ? 0 : (action.type === 'INCREMENT' ? state + 1 : state);

let highLevelState = {toggle: false, inc: [1, 2]};
const composite1 = Structure({
    toggle,
    inc: [inc, inc]
});
const highLevelDispatch1 = (reducer => action => {
    return highLevelState = reducer(highLevelState, action);
})(composite1.reducer);

const createStore1 = () => ({dispatch: highLevelDispatch1})

composite1.createStore({createStore: createStore1})()
const store1 = composite1.store;

store1.toggle.dispatch({type: 'TOGGLE'}); // highLevelState is {toggle: true, inc: [1, 2]}
store1.inc[1].dispatch({type: 'INCREMENT'}); // highLevelState is {toggle: true, inc: [1, 3]}

highLevelState = {toggle: false, inc: [1, 2]};
const composite2 = Structure({
    toggle,
    inc: Structure([inc, inc])
});
const highLevelDispatch2 = (reducer => action => {
    return highLevelState = reducer(highLevelState, action);
})(composite2.reducer);
const createStore2 = () => ({dispatch: highLevelDispatch2})

composite2.createStore({createStore: createStore2})()
const store2 = composite2.store;

store2.inc.store.dispatch({
    type: 'COMPOSITE',
    composite: [{type: 'INCREMENT'}, {type: 'INCREMENT'}]
}); // highLevelState is {toggle: false, inc: [2, 3]}

store2.inc.structure[0].dispatch({type: 'INCREMENT'}); // highLevelState is {toggle: false, child: [3, 3]}
