import {Structure} from 'redux-composite';

let highLevelState = {toggle: false, inc: [1, 2]};
const getHighLevelState = () => highLevelState;
const dummyReducer = () => {};

const composite1 = Structure({
    toggle: dummyReducer,
    inc: [dummyReducer, dummyReducer]
});

composite1.createStore({createStore: () => ({
    getState: getHighLevelState
})})();
const store1 = composite1.store;

store1.toggle.getState(); // false
store1.inc[0].getState(); // 1
store1.inc[1].getState(); // 2

const composite2 = Structure({
    toggle: dummyReducer,
    inc: Structure([dummyReducer, dummyReducer])
});

composite2.createStore({createStore: () => ({
    getState: getHighLevelState
})})();
const store2 = composite2.store;

store2.toggle.getState(); // false
store2.inc.store.getState(); // [1, 2]
store2.inc.structure[0].getState(); // 1
store2.inc.structure[1].getState(); // 2
highLevelState.inc[0] = 3;
store2.inc.structure[0].getState(); // 3
composite2.getState(); // {toggle: false, inc: [3, 2]}
