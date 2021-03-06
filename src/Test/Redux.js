import {Structure, Composite} from '../index';
import expect from 'expect';
import {createStore, applyMiddleware} from 'redux';
import {toggle, increment, calculator} from './Reducer';

const test = () => {
    const createComposite = () => Structure({
        toggle,
        calc: [
            increment,
            calculator
        ]
    });
    const composite = createComposite();
    let store = composite.createStore()(r => r, {toggle: false, calc: [0, 1]});

    let structure = composite.store;

    // check getState
    expect(structure.toggle.getState()).toEqual(false);
    expect(structure.calc[0].getState()).toEqual(0);
    expect(structure.calc[1].getState()).toEqual(1);

    // check dispatch
    structure.toggle.dispatch({type: 'TOGGLE'});
    expect(store.getState()).toEqual({toggle: true, calc: [0, 1]});
    structure.calc[0].dispatch({type: 'INCREMENT'});
    expect(store.getState()).toEqual({toggle: true, calc: [1, 1]});
    structure.calc[1].dispatch({type: 'DECREMENT', value: 3});
    expect(store.getState()).toEqual({toggle: true, calc: [1, -2]});

    // check subscribe
    let toggled = 0;
    let sum = [0, 0];
    structure.toggle.subscribe(() => ++toggled);
    structure.calc[0].subscribe(({getState}) => sum[0] += getState());
    structure.calc[1].subscribe(({getState}) => sum[1] += getState());
    // remember the last state: {toggle: true, calc: [1, -2]}
    store.dispatch({type: 'COMPOSITE', composite: {
        toggle: {type: 'TOGGLE'},
        calc: [{type: 'INCREMENT'}, {type: 'INCREMENT', value: 5}]
    }});
    expect(store.getState()).toEqual({toggle: false, calc: [2, 3]});
    expect(toggled).toEqual(1);
    expect(sum).toEqual([2, 3]);
    store.dispatch({type: 'COMPOSITE', composite: {
        toggle: {type: 'TOGGLE'},
        calc: [{type: 'INCREMENT'}, {type: 'INCREMENT', value: 4}]
    }});
    expect(store.getState()).toEqual({toggle: true, calc: [3, 7]});
    expect(toggled).toEqual(2);
    expect(sum).toEqual([5, 10]);

    const complex = Structure({
        increment,
        reducer: createComposite()
    });
    let complexStore = complex.createStore()(r => r, {increment: 2, reducer: {toggle: false, calc: [0, 1]}});

    structure = complex.store;

    // check getState
    expect(structure.increment.getState()).toEqual(2);
    expect(structure.reducer.structure.toggle.getState()).toEqual(false);
    expect(structure.reducer.structure.calc[0].getState()).toEqual(0);
    expect(structure.reducer.structure.calc[1].getState()).toEqual(1);

    // check dispatch
    structure.increment.dispatch({type: 'INCREMENT'});
    expect(complexStore.getState()).toEqual({increment: 3, reducer: {toggle: false, calc: [0, 1]}});
    structure.reducer.structure.toggle.dispatch({type: 'TOGGLE'});
    expect(complexStore.getState()).toEqual({increment: 3, reducer: {toggle: true, calc: [0, 1]}});
    structure.reducer.structure.calc[0].dispatch({type: 'INCREMENT'});
    expect(complexStore.getState()).toEqual({increment: 3, reducer: {toggle: true, calc: [1, 1]}});
    structure.reducer.structure.calc[1].dispatch({type: 'DECREMENT', value: 3});
    expect(complexStore.getState()).toEqual({increment: 3, reducer: {toggle: true, calc: [1, -2]}});

    // check subscribe
    let squares = 0;
    structure.increment.subscribe(({getState}) => squares += getState() * getState());
    structure.reducer.structure.toggle.subscribe(() => ++toggled);
    structure.reducer.structure.calc[0].subscribe(({getState}) => sum[0] += getState());
    structure.reducer.structure.calc[1].subscribe(({getState}) => sum[1] += getState());
    // remember the last state: {increment: 3, reducer: {toggle: true, calc: [1, -2]}}
    complexStore.dispatch({type: 'COMPOSITE', composite: {
        increment: {type: 'INCREMENT'},
        reducer: {
            toggle: {type: 'TOGGLE'},
            calc: [{type: 'INCREMENT'}, {type: 'INCREMENT', value: 5}]
        }
    }});
    expect(complexStore.getState()).toEqual({increment: 4, reducer: {toggle: false, calc: [2, 3]}});
    expect(squares).toEqual(16);
    expect(toggled).toEqual(3);
    expect(sum).toEqual([7, 13]);

    complexStore.dispatch({type: 'COMPOSITE', composite: {
        increment: {type: 'INCREMENT'},
        reducer: {
            toggle: {type: 'TOGGLE'},
            calc: [{type: 'INCREMENT'}, {type: 'INCREMENT', value: 4}]
        }
    }});
    expect(complexStore.getState()).toEqual({increment: 5, reducer: {toggle: true, calc: [3, 7]}});
    expect(squares).toEqual(41);
    expect(toggled).toEqual(4);
    expect(sum).toEqual([10, 20]);
};
export default test;
