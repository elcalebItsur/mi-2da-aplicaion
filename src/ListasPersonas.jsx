import React, { useEffect, useState } from 'react'
import Semana from './semana/Semana.jsx'
import personas from './datos/personas.json'

function ListasPersonas() {
    const [listaPersonas, setListaPersonas] = useState(personas);
    const [agregarVisible, setAgregarVisible]=useState(false);
    const [nombre, setNombre] = useState('');
    const [disponibilidad, setDisponibilidad] = useState([false,false,false,false,false,false,false]);
    const [editando, setEditando] = useState(null);

    const resetForm = () => {
        setNombre('');
        setDisponibilidad([false,false,false,false,false,false,false]);
    };

    const handleGuardar = (event) => {
        event.preventDefault();
        const nuevoNombre = nombre.trim();
        if (!nuevoNombre) return;

        let nuevaLista;
        
        if (editando !== null) {
            // Modo edición
            nuevaLista = listaPersonas.map((persona, i) =>
                i === editando ? { nombre: nuevoNombre, disponibilidad } : persona
            );
            setEditando(null);
        } else {
            // Modo agregar
            const nuevaPersona = {
                nombre: nuevoNombre,
                disponibilidad,
            };
            nuevaLista = [...listaPersonas, nuevaPersona];
        }

        setListaPersonas(nuevaLista);
        localStorage.setItem('personasStorage', JSON.stringify(nuevaLista));
        resetForm();
        setAgregarVisible(false);
    };

    const handleCancelar = () => {
        resetForm();
        setAgregarVisible(false);
        setEditando(null);
    };

    const handleEditar = (index) => {
        setNombre(listaPersonas[index].nombre);
        setDisponibilidad(listaPersonas[index].disponibilidad);
        setEditando(index);
        setAgregarVisible(true);
    };

    const handleEliminar = (index) => {
        if (window.confirm(`¿Está seguro de que desea eliminar a ${listaPersonas[index].nombre}?`)) {
            const nuevaLista = listaPersonas.filter((_, i) => i !== index);
            setListaPersonas(nuevaLista);
            localStorage.setItem('personasStorage', JSON.stringify(nuevaLista));
        }
    };

    const updatePersonaDisponibilidad = (index, nuevosChecked) => {
        const nuevaLista = listaPersonas.map((persona, i) =>
            i === index ? { ...persona, disponibilidad: nuevosChecked } : persona
        );
        setListaPersonas(nuevaLista);
        localStorage.setItem('personasStorage', JSON.stringify(nuevaLista));
    };

    useEffect(()=>{
        //Verificar si el storage esta gargado
        let personasStorage=localStorage.getItem('personasStorage')?
        JSON.parse(localStorage.getItem('personasStorage')):null;
        //Cuando no esta, cargar el json en el storage
        if(!personasStorage){
            localStorage.setItem('personasStorage',JSON.stringify(personas));
            setListaPersonas(personas);
        }else{
            setListaPersonas(personasStorage);
        }
    },[]);
    return (
        <>
            <h2>Lista Personas</h2>
            <button type='button' onClick={()=>{resetForm(); setEditando(null); setAgregarVisible(true)}}>Agregar</button>
            {agregarVisible && (
                <form onSubmit={handleGuardar}>
                    <h3>{editando !== null ? 'Editar Persona' : 'Agregar Persona'}</h3>
                    <input type="text" placeholder='Nombre de la persona' value={nombre} onChange={(e)=>setNombre(e.target.value)} />
                    <Semana diasSeleccionados={disponibilidad} cambioDeDia={setDisponibilidad} />
                    <button type='submit'>Guardar</button>
                    <button type='button' onClick={handleCancelar}>Cancelar</button>
                </form>
            )}
            <table>
                <thead>
                    <tr>
                        <th>Persona</th>
                        <th>Disponibilidad</th>
                        <th>Días Disponibles</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {listaPersonas.map((persona, index) => (
                        <tr key={index}>
                            <td>{persona.nombre}</td>
                            <td>
                                <Semana diasSeleccionados={persona.disponibilidad} cambioDeDia={(nuevosChecked) => updatePersonaDisponibilidad(index, nuevosChecked)} readOnly={true} />
                            </td>
                            <td>
                                {persona.disponibilidad.filter((dia) => dia === true).length}
                            </td>
                            <td>
                                <button type='button' onClick={()=>handleEditar(index)}>Editar</button>
                                <button type='button' onClick={()=>handleEliminar(index)}>Eliminar</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    )
}

export default ListasPersonas