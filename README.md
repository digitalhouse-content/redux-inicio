## Redux

1. definimos los types de acciones en un archivo, son constantes que tienen un string que describe una accion

2. creamos las acciones que seria la logica, estas son funciones (ejem: pueden recibir parametro como el id para enviar por payload)
que en su cuerpo reciben el type y el payload este ultimo es opcional

3. Creamos el reducer con el estado inical y el switch, importo cada uno de los types que irian en los case y en el reducer le asigno al state= initialState en caso de que no me venga

4. Creamos el index de los reducer para combinarlos y exportarlos, en caso de tener varios los voy agregando, lo agrego como una propiedad de un objeto: despues va el reducer ejem: "cart: cartReducer"
5. Creamos la store y agregamos como componente padre en App mediante Provider
6. Creamos lo diferentes eventos en la UI mediante funiones, con el useSelector para acceder a la store y el dispatch llamamos las acciones

## Consideraciones para Redux Saga

1. Instalar redux-saga

```bash
npm install redux-saga
```

2. Crear la funcion que va a hacer el fetch de los datos

```javascript
const fetchPokemon = async (page = 0) => {
	const resp = await fetch(
		`https://pokeapi.co/api/v2/pokemon?limit=10&offset=${page * 10}`
	);
	const data = await resp.json();
	return data;
};
```

3. Crear la funcion generadora que va a escuchar las acciones
   Las funciones generadoras son un tipo especial de función en JavaScript que permite pausar y reanudar su ejecución. Se declaran usando la palabra clave function\* y contienen la palabra clave yield para pausar la ejecución y devolver un valor.

Aquí hay un ejemplo básico de una función generadora:

```javascript
function* ejemploGenerador() {
	yield 1;
	yield 2;
	yield 3;
	return "Fin";
}

const generador = ejemploGenerador();

console.log(generador.next()); // { value: 1, done: false }
console.log(generador.next()); // { value: 2, done: false }
console.log(generador.next()); // { value: 3, done: false }
console.log(generador.next()); // { value: "Fin", done: true }
console.log(generador.next()); // { value: undefined, done: true }
```

En este ejemplo, la función generadora ejemploGenerador genera valores del 1 al 3 utilizando la palabra clave yield. Cada vez que se llama a generador.next(), la ejecución se reanuda hasta alcanzar el próximo yield o hasta que la función llega a su declaración return.

Para nuestro ejemplo es la siguiente:

```javascript
function* getPokemons(action) {
	const page = action.payload;

	try {
		// Actualizar el estado del store
		yield put(startLoadingPokemons());

		// Obtener datos de la API
		const data = yield call(fetchPokemon, page);

		// Guardar datos en el store si es exitoso
		yield put(setPokemons({pokemons: data.results, page}));
	} catch (error) {
		// En caso de tener un error ejecuto una acción
		yield put(failedFetch({error: error.message}));
		console.log(error);
	}
}
```

4. Que son los efectos?
   Los efectos son objetos JavaScript simples que contienen información sobre una acción que debe realizarse. Los efectos son pequeños y simples, lo que los hace fáciles de probar. Los efectos se pasan a las funciones de efectos, que son funciones generadoras que se ejecutan en segundo plano por el middleware de redux-saga.

Ejemplos de efectos:

```javascript
import {call, put, takeEvery, takeLatest} from "redux-saga/effects";
```

Que hace call?
call es un efecto que instruye al middleware para que llame a la función. También se puede usar para llamar a otra saga. El middleware suspenderá la ejecución de la saga hasta que la promesa se resuelva.
en nuestro caso es en:

```javascript
const data = yield call(fetchPokemon, page);
```

Que hace put?
put es un efecto que instruye al middleware para que despache una acción al store.
en nuestro caso es en:

```javascript
yield put(setPokemons({ pokemons: data.results, page}));
```

Que hace takeEvery?
takeEvery es un efecto que instruye al middleware para que ejecute una tarea en cada acción de un tipo específico. Por ejemplo:

```javascript
// Saga principal para observar la acción getPokemons
function* watchGetPokemons() {
	yield takeEvery("pokemon/fetchPokemons", getPokemons);
}
```

Esta funcion se encarga de escuchar la accion y ejecutar la funcion getPokemons

Que hace takeLatest?
Aunque no la usamos en el proyecto se encarga de ejecutar la ultima accion que se ejecuto, por ejemplo si se ejecuta 3 veces la accion getPokemons, solo se ejecutara la ultima

5. Exportamos la funcion generadora
   En nuestro caso es la funcion watchGetPokemons

```javascript
export default watchGetPokemons;
```

6. Creamos el index.js de sagas donde va a estar nuestro rootSaga

```javascript
import {all} from "redux-saga/effects";

// Saga principal que combina todas las sagas individuales
export default function* rootSaga() {
	yield all([watchGetPokemons()]);
}
```

Vamos a definir todo lo que hace este archivo:

A. Importamos all de redux-saga/effects

B. Importamos la funcion generadora watchGetPokemons

C. Creamos la funcion generadora rootSaga que va a ser la que combine todas las sagas individuales

D. Usamos el all para combinar todas las sagas individuales

E. Exportamos la funcion generadora rootSaga

7. Creamos nuestra accion en el slice
   Este se encarga de crear la accion y el type

```javascript
export const fetchPokemons = createAction("pokemon/fetchPokemons");
```

8. En nuestra store agregamos el middleware

```javascript
import createSagaMiddleware from "redux-saga";
import rootSaga from "./sagas";
import {configureStore} from "@reduxjs/toolkit";
import {pokemonSlice} from "../reducers/apiSlice";

const sagaMiddleware = createSagaMiddleware();

const store = configureStore({
	reducer: {
		pokemons: pokemonSlice.reducer,
	},
	middleware: [sagaMiddleware],
});

// Ejectuar saga
sagaMiddleware.run(rootSaga);

export default store;
```

Vamos a definir todo lo que hace este archivo:

A. Importamos createSagaMiddleware de redux-saga

B. Importamos rootSaga de sagas

C. Importamos configureStore de @reduxjs/toolkit

D. Importamos pokemonSlice de apiSlice

E. Creamos el middleware sagaMiddleware

F. Creamos la store con configureStore

G. Ejecutamos el rootSaga con sagaMiddleware.run(rootSaga)

H. Exportamos la store


Documentacion de referencia:
https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Statements/function*

https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Operators/yield

https://redux-toolkit.js.org/tutorials/overview

https://redux-saga.js.org/docs/api