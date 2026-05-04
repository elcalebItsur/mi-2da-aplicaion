import React, { useState } from 'react'
import Dia from './Dia'

function Semana({laboral=false,diasSeleccionados = [false,false,false,false,false,false,false],extendida=false, cambioDeDia, readOnly=false}) {
    let dias=['Lunes','Martes','Miercoles','Jueves','Viernes','Sabado','Domingo'];
        const [checked,setChecked]=useState(diasSeleccionados);

        React.useEffect(() => {
            setChecked(diasSeleccionados);
        }, [diasSeleccionados]);

        const clickDia=(indice)=>{
            
            //Cuando se usa el mismo arreglo para actualizar el set no 
            // detecta cambios y tarda en guardar el estado o no lo cambia
            //let nuevosChecked=[checked[0],checked[1]..]
            //Desestructura el arreglo checked
            let nuevosChecked=[...checked];
            nuevosChecked[indice]=!nuevosChecked[indice];

            setChecked(nuevosChecked);
            if (cambioDeDia) {
                cambioDeDia(nuevosChecked);
            }
        }

        return (
        <div className='semana'>
            {
                dias.map((dia,indice)=>
                    (indice<=4 || (!laboral && indice>=5)) && 
                    <Dia key={dia} marcado={checked[indice]} texto={extendida?dia:dia.substring(0,2)} 
                    click={readOnly ? () => {} : ()=>{clickDia(indice); }}></Dia> //clickDia(0)
                    //  click={clickDia}></Dia>
                    //  click={clickDia(indice)}></Dia>
                )
            }
        
            <div>{checked.filter((elemento)=>elemento===true).length}/{laboral?'5':'7'}</div> 
        </div>
    )
}

export default Semana