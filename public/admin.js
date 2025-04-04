document.addEventListener('DOMContentLoaded', () => {
    
    const btPedidos = document.getElementById('btPedidos')
    const btRegistros = document.getElementById('btRegistros')
    const btGanador = document.getElementById('btGanador')
    const contenPed = document.getElementById('contenedorPedidos')
    const contenReg = document.getElementById('contenedorRegistros')
    const contenGan = document.getElementById('contenedorGanador')

    // Al hacer clic en la X, cerramos:
document.getElementById('closeModal').addEventListener('click', () => {
    document.getElementById('modalBoleto').style.display = "none";
  });

    btPedidos.addEventListener('click', () => {
        contenPed.style.display = 'grid';
        contenReg.style.display = 'none';
        contenGan.style.display = 'none';
        console.log('pedidos')
    })

    btRegistros.addEventListener('click', () => {
        contenPed.style.display = 'none';
        contenReg.style.display = 'flex';
        contenGan.style.display = 'none';
        console.log('registros')

    })

    btGanador.addEventListener('click', () => {
        contenPed.style.display = 'none';
        contenReg.style.display = 'none';
        contenGan.style.display = 'grid';
        console.log('ganador')

    })
    
    const correo= document.getElementById('inCorreo').value = ''
        const ref = document.getElementById('inRef').value = ''
        const tick = document.getElementById('inTicket').value = ''
        console.log(ref)
        console.log(tick)
        console.log(correo)


    const consultar = document.getElementById('btConsult')
    consultar.addEventListener('click', async () => {
        const correo= document.getElementById('inCorreo').value
        const ref = document.getElementById('inRef').value
        const tick = document.getElementById('inTicket').value


        try {
            const response = await fetch(`/api/consulta?correo=${correo}&ref=${ref}&tick=${tick}`);

            const pedidos = await response.json()
            //total, tickets, client;
            
            // console.log(pedidos.clients)
             const contenedor = document.getElementById('contenedorConsultas');
             contenedor.innerHTML = '';
             const clientes = pedidos.clients
            //   console.log('¿Es array Clientes?', Array.isArray(clientes)); // Debe ser true si es array

                clientes.forEach( async pedido =>{
                    // console.log('corre: ', pedido.pedido_correo)
                    const res = await fetch(`/api/array?correo=${pedido.pedido_correo}`);
                    const numero_tickets = await res.json()
                    const tickets = numero_tickets.tickets
                    console.log('tii: ', tickets)
                    let stringTickets = ''
                     console.log('¿Es array?', Array.isArray(tickets)); // Debe ser true si es array
                    let myBoolean = false
                    console.log('Lo que hay en tick es: ', tick)
                    tickets.forEach( ticket =>{
                    //   console.log('numeros hallados:', ticket.tickets_numero)
                    if(ticket.tickets_numero.includes(tick)){
                        myBoolean= true
                        console.log('se encontró el ticket!!')
                    }
                      stringTickets = stringTickets + ticket.tickets_numero + ", "
                    })

                    const res2 = await fetch(`/api/totaltickets?correo=${pedido.pedido_correo}`);
                    const totalTickets = await res2.json()
                    const total = totalTickets.total[0].user_cantidad_boletos
                     console.log('total: ', total)
 
                    if(myBoolean || (!tick && tick.trim() == '')){
                        myBoolean=false
                        //---construccion del div que contendrá los datos                      
                    const divPedido = document.createElement('div');
                    // console.log(numero_tickets)
                    //console.log('aprobado: ' , pedido.pedido_aprobado)
                    //    console.log(pedido.pedido_referencias)
                    divPedido.className = 'divConsu';
                    divPedido.classList.add('glow-button2')
                    const item1 = document.createElement('div')
                    item1.innerHTML= `
                    <div class="subDiv"> Nombre </div>
                    <div class="subDiv">
                    ${pedido.pedido_nombre} ${pedido.pedido_apellido}
                    </div>

                    `
                    const item2 = document.createElement('div')
                    item2.innerHTML= `
                     <div class="subDiv"> Correo </div>
                      <div class="subDiv"> ${pedido.pedido_correo} </div>
                    `
                    const item3 = document.createElement('div')
                    item3.innerHTML= `
                   <div class="subDiv"> Contacto </div>
                    <div class="subDiv"> 
                    <button class="btContact" onclick="contact('${pedido.pedido_numero}')">
                     <img src="images/whatsapp-logo-variant-svgrepo-com (1).svg" style="width:50px;height:50px;fill:white;">
                    </button>
                  </div>
                    `
                    const item4 = document.createElement('div')
                    item4.innerHTML= `
                    <div class="subDiv"> Total Tickets Comprados </div>
                    <div class="subDiv"> ${total} </div>
                    `
                    const item5 = document.createElement('div')
                    item5.innerHTML= `
                     <div class="subDiv"> Nro Tickets Comprados </div>
                     <div class="subDiv"> ${stringTickets} <br> <br> </div>
                      `
                    item1.className = 'item-consu'
                    item2.className = 'item-consu'
                    item3.className = 'item-consu'
                    item4.className = 'item-consu'
                    item5.className = 'item-consu'
                    divPedido.appendChild(item1)
                    divPedido.appendChild(item2)
                    divPedido.appendChild(item3)
                    divPedido.appendChild(item4)
                    divPedido.appendChild(item5)
                    contenedor.appendChild(divPedido);

                    }
                    
    
        
                 })
            
            // pedidos.forEach(pedido => {
            //     const divPedido = document.createElement('div');
            //     // console.log('aprobado: ' , pedido.pedido_aprobado)
            //     console.log(pedido.pedido_referencias)
            //     divPedido.className = `dvPedido ${pedido.pedido_aprobado ? 'aprobado' : 'pendiente'}`;

            //     divPedido.innerHTML = `
            //     <h3>Pedido #${pedido.pedido_referencias}</h3>
            //     <p><strong>Cliente:</strong> ${pedido.pedido_nombre} ${pedido.pedido_apellido}</p>
            //     <p><strong>Correo:</strong> ${pedido.pedido_correo}</p>
            //     <p><strong>Número:</strong> ${pedido.pedido_numero}</p>
            //     <p><strong>Precio Total:</strong> $${pedido.pedido_precio_total} USD</p>
            //     <p><strong>No. de Boletos:</strong> ${pedido.pedido_boletos} </p>
            //     <button 
            //         class="btnAprobar" 
            //         onclick="aprobarPedido('${pedido.pedido_referencias}')"
            //         ${pedido.pedido_aprobado ? 'disabled' : ''}
            //     >
            //          ${pedido.pedido_aprobado ? 'Aprobado' : 'Aprobar'}
            //     </button>
            //     <button 
            //         class="btnCancelar" 
            //         onclick="cancelarPedido('${pedido.pedido_referencias}', '${pedido.pedido_correo}')"
            //     >
            //         X
            //     </button>
            // `;

            //     contenedor.appendChild(divPedido);
            // });
        } catch (error) {
            console.error('Error al cargar:', error);
        }

    })


    cargarPedidos()

    cargarTickera()
});

function formatoBoleto(num) {
    return String(num).padStart(4, '0');
  }

async function cargarTickera(){
    // const contenGan = document.getElementById('contenedorGanador')
    try {
        // 1) Obtenemos la lista de boletos aprobados desde el backend
        const response = await fetch('/api/tickets');
        const boletosAprobados = await response.json(); 
        // Suponiendo que sea un array de strings como ['0001','0005','0147']

        // 2) Convertimos en un Set para buscar rápido
        const setAprobados = new Set(boletosAprobados);

        // 3) Tomamos el contenedor
        const contenedor = document.getElementById('contenedorGanador');
        contenedor.innerHTML = ''; // Limpia por si acaso

        // 4) Generamos los 10,000 boletos
        for (let i = 0; i < 10000; i++) {
          const numBoleto = formatoBoleto(i); // '0001', '0002', etc.
          
          // Creamos el div
          const divBoleto = document.createElement('div');
          divBoleto.classList.add('boleto');
          
          // Checamos si está aprobado
          if (setAprobados.has(numBoleto)) {
            divBoleto.classList.add('aprobadoo');   // verde
            divBoleto.classList.add('glow-button');   // verde
            divBoleto.addEventListener('click', ()=>{
                mostrarModalBoleto(numBoleto);
            })
          } else {
            divBoleto.classList.add('disponible'); // blanco
          }

          // Texto interno del div
          divBoleto.textContent = numBoleto;

          // Agregamos al contenedor
          contenedor.appendChild(divBoleto);
        }
      } catch (error) {
        console.error('Error al cargar boletos:', error);
      }

}

async function mostrarModalBoleto(numBoleto) {
    // 1) Seleccionamos el modal
    const modal = document.getElementById('modalBoleto');
    let ref = ''
    let tick = ''
    const res = await fetch(`/api/correo?numero=${numBoleto}`)
    const correo2  = await res.json()

    let correo = correo2.tickets[0].tickets_correo
    console.log(correo)
    // 2) Cambiamos el título, por ejemplo
    document.getElementById('tituloBoleto').innerText = `Boleto #${numBoleto}`;
     const response = await fetch(`/api/consulta?correo=${correo}&ref=${ref}&tick=${tick}`);

     const pedidos = await response.json()
     const clientes = pedidos.clients
     document.getElementById('detalleBoleto').innerHTML = ''
     clientes.forEach(async pedido =>{
        document.getElementById('detalleBoleto').innerHTML = `
           <p><strong>Propietario:</strong> ${pedido.pedido_nombre} ${pedido.pedido_apellido}</p>
           <p><strong>Correo:</strong> ${pedido.pedido_correo}</p>
           <p><strong>Telefono:</strong> ${pedido.pedido_numero}</p>
           
         `;
     })
    // 3) Si necesitas más datos del boleto (dueño, correo, etc.),
    //    podrías hacer un fetch a tu backend usando numBoleto
    //    y luego mostrar esos datos en #detalleBoleto, p.ej.:
    //
    // fetch(`/api/boleto/${numBoleto}`)
    //   .then(res => res.json())
    //   .then(data => {
    //     document.getElementById('detalleBoleto').innerHTML = `
    //       <p>Propietario: ${data.propietario}</p>
    //       <p>Correo: ${data.correo}</p>
    //       ...
    //     `;
    //   })
    //   .catch(err => console.error(err));
    //
    // Por simplicidad, aquí sólo ponemos un texto fijo:
    // document.getElementById('detalleBoleto').innerText = "Aquí datos del boleto...";
  
    // 4) Mostramos el modal
    modal.style.display = "block";
  }
  



async function cargarPedidos() {
    // console.log("h3")
    try {
        const response = await fetch('/api/pedidos');

        const pedidos = await response.json();
        console.log(pedidos)
        const contenedor = document.getElementById('contenedorPedidos');
        contenedor.innerHTML = '';

        pedidos.forEach(pedido => {
            const divPedido = document.createElement('div');
            // console.log('aprobado: ' , pedido.pedido_aprobado)
            console.log(pedido.pedido_referencias)
            divPedido.className = `dvPedido ${pedido.pedido_aprobado ? 'aprobado' : 'pendiente'}`;

            divPedido.innerHTML = `
                <h3>Pedido #${pedido.pedido_referencias}</h3>
                <p><strong>Cliente:</strong> ${pedido.pedido_nombre} ${pedido.pedido_apellido}</p>
                <p><strong>Correo:</strong> ${pedido.pedido_correo}</p>
                <p><strong>Número:</strong> ${pedido.pedido_numero}</p>
                <p><strong>Precio:</strong> $${pedido.pedido_precio_total} USD</p>
                <p><strong>No. de Boletos:</strong> ${pedido.pedido_boletos} </p>
                <p><strong>Fecha de Compra:</strong> ${pedido.pedido_date} </p>

                <button 
                    class="btnAprobar" 
                    onclick="aprobarPedido('${pedido.pedido_referencias}', '${pedido.pedido_correo}', '${pedido.pedido_boletos}')"
                    ${pedido.pedido_aprobado ? 'disabled' : ''}
                >
                     ${pedido.pedido_aprobado ? 'Aprobado' : 'Aprobar'}
                </button>
                <button 
                    class="btnCancelar" 
                    onclick="cancelarPedido('${pedido.pedido_referencias}', '${pedido.pedido_correo}')"
                    ${pedido.pedido_aprobado ? 'disabled' : ''}
                >
                    X
                </button>
            `;
            
            contenedor.appendChild(divPedido);
        });
    } catch (error) {
        console.error('Error al cargar los pedidos:', error);
    }
}

function contact(number){
    window.location.href=`https://wa.me/${number}`
}

async function aprobarPedido(referencia, correo, boletos) {
    console.log('la referencia pasada es: ', referencia)
    console.log('Y la cantidad es: ', boletos)
    try {
        const response = await fetch(`/api/pedidos/${referencia}/${correo}/${boletos}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();  // <--- Esperamos la promesa aquí
        console.log('Data recibida:', data);
        if (response.ok) {
            // Recargar los pedidos para mostrar los cambios
            cargarPedidos();
        } else {
            console.log('respons: ', response)
            console.error('Error al aprobar el pedido');
        }
    } catch (error) {
        console.error('Error xd:', error);
    }
}

async function cancelarPedido(referencia, correo) {
    console.log('la referencia pasada es: ', referencia)
    console.log('el correo pasado es: ', correo)



    try {
        const response = await fetch(`/api/pedidos/${referencia}/${correo}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();  // <--- Esperamos la promesa aquí
        console.log('Data recibida:', data);
        if (response.ok) {
            // Recargar los pedidos para mostrar los cambios
            cargarPedidos();
        } else {
            console.log('respons: ', response)
            console.error('Error al aprobar el pedido');
        }
    } catch (error) {
        console.error('Error xd:', error);
    }



}


