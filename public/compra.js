document.addEventListener('DOMContentLoaded', async () => {

    // console.log(document.getElementById('selectM').value)

    //----------------------------------
    const totalTickets = 10000;
        let soldTickets = 0;

        function updateProgress(sold) {
            const percentage = (sold / totalTickets) * 100;
            document.getElementById('progressFill').style.width = percentage + '%';
            document.getElementById('percentageText').textContent = percentage.toFixed(1) + '%';
            document.getElementById('ticketsSold').textContent = sold.toLocaleString();
        }

        

        //-----extraer el numero de tickets
        const response = await fetch('/api/ventatotal');
        const totalBoletos = await response.json();
        // console.log('Tipo de dato:', typeof totalBoletos);
        // console.log('Valor:', totalBoletos);
        updateProgress(parseInt(totalBoletos))
        // --------------------



    const input = document.getElementById('contador');
    const btnIncrementar = document.getElementById('incrementar');
    const btnDecrementar = document.getElementById('decrementar');
    const labelPrecio = document.getElementById('precio');
    //const labelPrecio2 = document.getElementById('precio2');
    const PRECIO_BASE = 1; // Precio base por unidad
    const PRECIO_BASE_BS = 68;
    let cantidad = parseInt(input.value);

      function actualizarPrecio() {
        cantidad = parseInt(input.value);
        const precioTotal = cantidad * PRECIO_BASE;
        const precioTotal2 = cantidad * PRECIO_BASE_BS;
       // labelPrecio2.textContent = `${precioTotal2}.00 Bs`;

        labelPrecio.textContent = `${precioTotal} USD`;
    }


    // Asegurar valor mínimo de 1
    input.addEventListener('change', () => {
        if (input.value < 2) input.value = 2;
    });

    btnIncrementar.addEventListener('click', () => {
        input.value = parseInt(input.value) + 1;
        actualizarPrecio();
    });

    btnDecrementar.addEventListener('click', () => {
        const nuevoValor = parseInt(input.value) - 1;
        if (nuevoValor >= 1) {
            input.value = nuevoValor;
            actualizarPrecio();
        }
    });
    
    // ------------------

    const inputs = document.querySelectorAll('.dvForm input:not(.contador-input)');
    
    // Función para validar email
    function isValidEmail(email) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailPattern.test(email);
    }

    // Función para validar los campos
    function validarFormulario() {
       
        return esValido;
    }

    // Puedes llamar a esta función cuando necesites validar
    // Por ejemplo, podrías agregar un botón:
  
    const btnValidar = document.getElementById('btPedir');
    
   // btnValidar.onclick = validarFormulario;
    
    //----

    document.getElementById('pedidoForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const pedido = Object.fromEntries(formData.entries());
        
        // Añadir el precio total al pedido
        pedido.correo = document.getElementById('inEmail').value;
        pedido.nombre = document.getElementById('inName').value;
        pedido.apellido = document.getElementById('inLastName').value;
        pedido.referencias = document.getElementById('inFor').value;
       let  myInfoNumber = document.getElementById('inNumber').value + ""
        if (!myInfoNumber.includes("+")){
            myInfoNumber = "+" + myInfoNumber
        }
        pedido.numero = myInfoNumber;
        pedido.aprobado = false
        pedido.boletos = parseInt(cantidad);
        pedido.precioTotal = parseInt(document.getElementById('precio').textContent);
        // pedido.metodoPago = document.getElementById('selectM').value
        
        try {
            const response = await fetch('/api/pedidos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(pedido)
            });
    
            const data = await response.json();
            // const text = await response.text();

            // console.log('Respuesta en texto:', text); // <-- para ver si es HTML o JSON

            if (data.success) {
                alert('Pedido realizado correctamente');
                e.target.reset();
                document.getElementById('contador').value = 1;
                actualizarPrecio();
            } else {
                alert('Error al realizar el pedido');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al enviar el pedido');
        }

        //------/
              
       
         

        //-----/
    });
    //----
    
    // O llamarla directamente:
    // validarFormulario();








});