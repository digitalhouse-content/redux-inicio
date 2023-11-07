import {configureStore} from "@reduxjs/toolkit";
import contadorReducer from '../reducers/contadorReducer';
import { pokemonSlice } from '../reducers/apiSlice';
import createSagaMiddleware from 'redux-saga';
import watchGetPokemons from '../reducers/saga/saga';
import rootSaga from '../reducers/saga';

const sagaMiddleware = createSagaMiddleware();

const store = configureStore({
	reducer: {
		contador: contadorReducer,
		pokemons: pokemonSlice.reducer,
	},
	middleware: [sagaMiddleware]
})

// Ejectuar saga
sagaMiddleware.run(rootSaga)


export default store;
