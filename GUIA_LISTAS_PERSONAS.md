# Guía completa de `ListasPersonas`, `Semana` y `Dia`

Esta guía explica en detalle cómo funciona el flujo de datos y eventos en tu aplicación React, especialmente en los componentes:

- `src/ListasPersonas.jsx`
- `src/semana/Semana.jsx`
- `src/semana/Dia.jsx`

Se describe el manejo de estado, cómo se integran los componentes entre sí, y cómo se persiste la información con `localStorage`.

---

## 1. Propósito general

`ListasPersonas` es el componente principal que administra una lista de personas y su disponibilidad semanal. Cada persona tiene:

- `nombre`: texto
- `disponibilidad`: un arreglo de 7 valores booleanos (`true` / `false`), uno por cada día de la semana

El propósito principal es:

- mostrar la lista de personas
- permitir agregar una persona
- permitir editar una persona
- permitir eliminar una persona
- guardar los cambios en `localStorage`
- permitir marcar la disponibilidad por persona usando el subcomponente `Semana`

---

## 2. Estructura de `ListasPersonas.jsx`

### 2.1 Importaciones

```jsx
import React, { useEffect, useState } from 'react'
import Semana from './semana/Semana.jsx'
import personas from './datos/personas.json'
```

- `useState` y `useEffect` son hooks de React.
- `Semana` es el componente que muestra los botones de los días.
- `personas` es el arreglo inicial cargado desde un archivo JSON.

### 2.2 Estados declarados

```jsx
const [listaPersonas, setListaPersonas] = useState(personas)
const [agregarVisible, setAgregarVisible]=useState(false)
const [nombre, setNombre] = useState('')
const [disponibilidad, setDisponibilidad] = useState([false,false,false,false,false,false,false])
const [editando, setEditando] = useState(null)
```

Significado de cada estado:

- `listaPersonas`: arreglo de objetos que muestra todas las personas.
- `agregarVisible`: controla si se ve el formulario para agregar/editar.
- `nombre`: texto del input actual del formulario.
- `disponibilidad`: arreglo actual de días seleccionados en el formulario.
- `editando`: índice de la persona que se está editando o `null` si es un nuevo registro.

---

## 3. Manejadores de formulario y acciones

### 3.1 `resetForm`

```js
const resetForm = () => {
  setNombre('')
  setDisponibilidad([false,false,false,false,false,false,false])
}
```

Resetea el formulario al estado inicial.

### 3.2 `handleGuardar`

```js
const handleGuardar = (event) => {
  event.preventDefault()
  const nuevoNombre = nombre.trim()
  if (!nuevoNombre) return

  let nuevaLista
  
  if (editando !== null) {
    nuevaLista = listaPersonas.map((persona, i) =>
      i === editando ? { nombre: nuevoNombre, disponibilidad } : persona
    )
    setEditando(null)
  } else {
    const nuevaPersona = {
      nombre: nuevoNombre,
      disponibilidad,
    }
    nuevaLista = [...listaPersonas, nuevaPersona]
  }

  setListaPersonas(nuevaLista)
  localStorage.setItem('personasStorage', JSON.stringify(nuevaLista))
  resetForm()
  setAgregarVisible(false)
}
```

#### Explicación

- Previene la recarga de la página con `event.preventDefault()`.
- Valida que el nombre no sea vacío.
- Diferencia entre dos modos:
  - `editando !== null`: actualiza la persona existente.
  - `editando === null`: agrega una nueva persona.
- Actualiza el estado principal y el `localStorage`.
- Cierra el formulario.

### 3.3 `handleCancelar`

```js
const handleCancelar = () => {
  resetForm()
  setAgregarVisible(false)
  setEditando(null)
}
```

Cancela la operación actual y restaura el formulario.

### 3.4 `handleEditar`

```js
const handleEditar = (index) => {
  setNombre(listaPersonas[index].nombre)
  setDisponibilidad(listaPersonas[index].disponibilidad)
  setEditando(index)
  setAgregarVisible(true)
}
```

Carga los datos de la persona seleccionada en el formulario para poder editar.

### 3.5 `handleEliminar`

```js
const handleEliminar = (index) => {
  if (window.confirm(`¿Está seguro de que desea eliminar a ${listaPersonas[index].nombre}?`)) {
    const nuevaLista = listaPersonas.filter((_, i) => i !== index)
    setListaPersonas(nuevaLista)
    localStorage.setItem('personasStorage', JSON.stringify(nuevaLista))
  }
}
```

Elimina la persona después de la confirmación del usuario.

### 3.6 `updatePersonaDisponibilidad`

```js
const updatePersonaDisponibilidad = (index, nuevosChecked) => {
  const nuevaLista = listaPersonas.map((persona, i) =>
    i === index ? { ...persona, disponibilidad: nuevosChecked } : persona
  )
  setListaPersonas(nuevaLista)
  localStorage.setItem('personasStorage', JSON.stringify(nuevaLista))
}
```

Actualiza solo la propiedad `disponibilidad` de una persona dentro de la lista, manteniendo el resto igual.

---

## 4. Uso de `useEffect` y `localStorage`

```js
useEffect(() => {
  let personasStorage = localStorage.getItem('personasStorage') ?
    JSON.parse(localStorage.getItem('personasStorage')) : null

  if (!personasStorage) {
    localStorage.setItem('personasStorage', JSON.stringify(personas))
    setListaPersonas(personas)
  } else {
    setListaPersonas(personasStorage)
  }
}, [])
```

### Flujo

1. Al montar el componente, se ejecuta `useEffect`.
2. Busca `personasStorage` en `localStorage`.
3. Si no existe, guarda los datos iniciales (`personas.json`) en `localStorage`.
4. Si existe, carga esos datos a `listaPersonas`.

Esto asegura persistencia de datos entre recargas de la página.

---

## 5. Renderizado del componente

### 5.1 Botón `Agregar`

```jsx
<button type='button' onClick={() => { resetForm(); setEditando(null); setAgregarVisible(true) }}>Agregar</button>
```

Hace visible el formulario y limpia el estado para crear una nueva persona.

### 5.2 Formulario de agregar/editar

```jsx
{agregarVisible && (
  <form onSubmit={handleGuardar}>
    <h3>{editando !== null ? 'Editar Persona' : 'Agregar Persona'}</h3>
    <input type="text" placeholder='Nombre de la persona' value={nombre} onChange={(e) => setNombre(e.target.value)} />
    <Semana diasSeleccionados={disponibilidad} cambioDeDia={setDisponibilidad} />
    <button type='submit'>Guardar</button>
    <button type='button' onClick={handleCancelar}>Cancelar</button>
  </form>
)}
```

El formulario se muestra solo cuando `agregarVisible` es `true`.

### 5.3 Tabla de personas

Renderiza todos los registros en `listaPersonas`:

```jsx
{listaPersonas.map((persona, index) => (
  <tr key={index}>
    <td>{persona.nombre}</td>
    <td>
      <Semana diasSeleccionados={persona.disponibilidad} cambioDeDia={(nuevosChecked) => updatePersonaDisponibilidad(index, nuevosChecked)} />
    </td>
    <td>{persona.disponibilidad.filter((dia) => dia === true).length}</td>
    <td>
      <button type='button' onClick={() => handleEditar(index)}>Editar</button>
      <button type='button' onClick={() => handleEliminar(index)}>Eliminar</button>
    </td>
  </tr>
))}
```

La tabla muestra:

- nombre
- disponibilidad interactiva
- cantidad de días seleccionados
- acciones de editar y eliminar

---

## 6. Flujo de datos entre los componentes

### 6.1 Propiedades de `Semana`

En `ListasPersonas` se usa `Semana` con estas props:

```jsx
<Semana diasSeleccionados={disponibilidad} cambioDeDia={setDisponibilidad} />
```

Y dentro de cada fila:

```jsx
<Semana diasSeleccionados={persona.disponibilidad} cambioDeDia={(nuevosChecked) => updatePersonaDisponibilidad(index, nuevosChecked)} />
```

Propiedades clave:

- `diasSeleccionados`: el estado inicial que `Semana` debe mostrar.
- `cambioDeDia`: función que recibe el nuevo arreglo cuando cambia un día.

### 6.2 Cómo `Semana` actualiza el estado

Dentro de `Semana`:

```js
const [checked, setChecked] = useState(diasSeleccionados)

React.useEffect(() => {
  setChecked(diasSeleccionados)
}, [diasSeleccionados])
```

- `checked` es el estado local con los valores actuales de la semana.
- `useEffect` sincroniza `checked` cuando cambian las props.

Función de clic:

```js
const clickDia = (indice) => {
  let nuevosChecked = [...checked]
  nuevosChecked[indice] = !nuevosChecked[indice]

  setChecked(nuevosChecked)
  if (cambioDeDia) {
    cambioDeDia(nuevosChecked)
  }
}
```

### 6.3 Relación con `Dia`

`Semana` renderiza cada día mediante `Dia`:

```jsx
<Die key={dia} marcado={checked[indice]} texto={extendida ? dia : dia.substring(0,2)} click={() => { clickDia(indice) }}></Dia>
```

`Dia` recibe:

- `texto`: etiqueta del botón
- `marcado`: valor booleano actual
- `click`: función para el evento `onClick`

---

## 7. Detalle de `Semana.jsx`

Archivo completo:

```jsx
import React, { useState } from 'react'
import Dia from './Dia'

function Semana({ laboral = false, diasSeleccionados = [false,false,false,false,false,false,false], extendida = false, cambioDeDia }) {
  let dias = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo']
  const [checked, setChecked] = useState(diasSeleccionados)

  React.useEffect(() => {
    setChecked(diasSeleccionados)
  }, [diasSeleccionados])

  const clickDia = (indice) => {
    let nuevosChecked = [...checked]
    nuevosChecked[indice] = !nuevosChecked[indice]

    setChecked(nuevosChecked)
    if (cambioDeDia) {
      cambioDeDia(nuevosChecked)
    }
  }

  return (
    <div className='semana'>
      {dias.map((dia, indice) =>
        (indice <= 4 || (!laboral && indice >= 5)) &&
        <Dia key={dia} marcado={checked[indice]} texto={extendida ? dia : dia.substring(0,2)} click={() => { clickDia(indice) }}></Dia>
      )}
      <div>{checked.filter((elemento) => elemento === true).length}/{laboral ? '5' : '7'}</div>
    </div>
  )
}

export default Semana
```

### 7.1 Qué hace cada parte

- `dias`: arreglo con los nombres de la semana.
- `checked`: estado local que contiene los días seleccionados.
- `useEffect`: sincroniza el estado local con la prop cuando cambia.
- `clickDia(indice)`: alterna el valor del día y notifica al padre.
- renderiza un `Dia` por cada día visible.
- muestra el total de días seleccionados.

### 7.2 Consideraciones

- El valor inicial de `diasSeleccionados` se copia para evitar mutar el arreglo original.
- Se usa spread `[...]` para crear un nuevo arreglo antes de cambiar un valor.
- Al llamar `cambioDeDia`, el componente padre recibe el arreglo actualizado.

---

## 8. Detalle de `Dia.jsx`

Archivo completo:

```jsx
import React from 'react'
import './Dia.css'

function Dia({ texto, marcado, click }) {
  return (
    <button className={'dia ' + (marcado && 'marcado')} type="button" onClick={click}>
      {texto}
    </button>
  )
}

export default Dia
```

### 8.1 Responsabilidad de `Dia`

- Es un componente totalmente presentacional.
- No guarda estado propio de `marcado`.
- Recibe el estilo y el texto desde el padre.
- Solo dispara el evento `click`.

### 8.2 Por qué está bien así

- el estado real se mantiene en `Semana`
- `Dia` solo muestra lo que le indican
- hace el código más fácil de entender y de probar

---

## 9. Flujo completo de un evento de clic en un día

1. Se hace clic en un botón `Dia`.
2. `Dia` ejecuta la función `click` que le pasó `Semana`.
3. `Semana.clickDia(indice)` crea `nuevosChecked` y actualiza su propio estado.
4. `Semana` llama a `cambioDeDia(nuevosChecked)`.
5. `ListasPersonas` recibe el arreglo nuevo y actualiza el estado principal.
6. Si la `Semana` pertenece a una fila de tabla, `updatePersonaDisponibilidad` reemplaza la disponibilidad de esa persona en la lista.
7. `ListasPersonas` guarda el nuevo `listaPersonas` en `localStorage`.

---

## 10. Modo de edición completo

### 10.1 Qué sucede al pulsar `Editar`

- `handleEditar(index)` carga el nombre y la disponibilidad del registro seleccionado.
- `setEditando(index)` indica que el formulario no es nuevo.
- `setAgregarVisible(true)` muestra el formulario.

### 10.2 Durante la edición

- el input de nombre muestra el valor actual.
- `Semana` recibe `diasSeleccionados={disponibilidad}` y marca los días correctos.
- Al cambiar un día, `Semana` actualiza `setDisponibilidad`.

### 10.3 Guardar cambios

- `handleGuardar` detecta `editando !== null`.
- Recorre `listaPersonas` y reemplaza solo la persona en ese índice.
- Restaura `editando` a `null` y cierra el formulario.

---

## 11. Ejemplo de estructura de datos

Cada persona se guarda en la lista así:

```js
{
  nombre: 'Juan',
  disponibilidad: [true, false, true, false, false, true, false]
}
```

- `true` significa que ese día está seleccionado.
- `false` significa que no está seleccionado.
- El índice corresponde a:
  0 = Lunes
  1 = Martes
  2 = Miércoles
  3 = Jueves
  4 = Viernes
  5 = Sábado
  6 = Domingo

---

## 12. Resumen de responsabilidades por componente

### `ListasPersonas`
- administra los registros completos
- controla la visibilidad del formulario
- maneja agregar, editar, eliminar
- persiste datos en `localStorage`
- pasa la disponibilidad a `Semana`

### `Semana`
- muestra los 7 días
- mantiene un estado local sincronizado con el padre
- notifica cambios de selección al padre
- muestra el contador de días seleccionados

### `Dia`
- botón simple visual
- muestra el texto del día
- aplica clase `marcado` cuando está activo
- dispara la acción de clic

---

## 13. Tips para mejorar después

Si en el futuro quieres mejorar este flujo, puedes:

- extraer el formulario a un componente `FormularioPersona`
- usar claves únicas en lugar de índices
- agregar validación de nombre más robusta
- mostrar mensajes de éxito o error
- deshabilitar el botón `Guardar` si el nombre está vacío
- estilizar mejor el modal de confirmación usando un componente personalizado

---

## 14. Diagrama de interacción (texto)

1. Usuario hace clic en `Agregar` / `Editar`
2. `ListasPersonas` muestra formulario
3. Usuario escribe nombre y selecciona días
4. `Semana` actualiza disponibilidad y manda el arreglo al padre
5. `ListasPersonas` guarda los cambios
6. `localStorage` persiste los datos
7. `ListasPersonas` vuelve a renderizar la tabla

---

## 15. Preguntas frecuentes rápidas

- ¿Por qué `Semana` usa `useEffect`?
  - Para sincronizar su estado local cuando `diasSeleccionados` cambia desde el padre.

- ¿Por qué no se usa `checked[indice] = !checked[indice]` directamente?
  - Porque en React se debe crear un nuevo arreglo para que el estado detecte el cambio.

- ¿Qué significa `editando === null`?
  - Que el formulario está en modo agregar, no en modo editar.

- ¿Por qué el `key` del `map` usa el índice?
  - Es funcional, pero en producción es mejor usar una clave única.

---

## 16. Conclusión

El flujo está diseñado así:

- `ListasPersonas` controla los datos y la persistencia.
- `Semana` controla la selección de días y comunica cambios.
- `Dia` es el botón individual que representa un día.

Con esta estructura, el dato real vive en el componente principal, y los subcomponentes solo actúan como interfaz visual y emisores de eventos.

Si quieres, puedo agregar un ejemplo visual con un diagrama Mermaid en el mismo archivo MD.