document.addEventListener('DOMContentLoaded', () => {
    function actualizarContador() {
        // Fecha objetivo: 18 de enero 2025, 5:00 PM
        const fechaObjetivo = new Date('2025-05-15T17:00:00');
        // Fecha actual
        const ahora = new Date();
        
        // Diferencia en milisegundos
        const diferencia = fechaObjetivo - ahora;
        
        // Si ya pasó la fecha
        if (diferencia < 0) {
            document.getElementById('lbconta').innerHTML = "¡ Tiempo cumplido !";
            return;
        }
        
        // Cálculo de tiempo restante
        const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
        const horas = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
        const segundos = Math.floor((diferencia % (1000 * 60)) / 1000);
        
        // Formatear el texto
        const texto = `${dias}d ${horas}h ${minutos}m ${segundos}s`;
        
        // Actualizar el label
        document.getElementById('lbconta').innerHTML = texto;
    }
    
    // Actualizar cada segundo
    setInterval(actualizarContador, 1000);
    
    // Primera actualización inmediata
    actualizarContador();

    // Countdown Timer
    function startCountdown() {
        const countdownElement = document.getElementById('countdown');
        let time = 3600; // 1 hour in seconds

        const timer = setInterval(() => {
            const hours = Math.floor(time / 3600);
            const minutes = Math.floor((time % 3600) / 60);
            const seconds = time % 60;

            countdownElement.textContent = `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

            if (time <= 0) {
                clearInterval(timer);
                countdownElement.textContent = "¡Tiempo agotado!";
            }
            time--;
        }, 1000);
    }

    // Initialize countdown
    //startCountdown();

    // Smooth scroll for buttons
    document.querySelectorAll('.buy-button').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelector('.payment-methods').scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Add animation on scroll
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, {
        threshold: 0.1
    });

    document.querySelectorAll('.prize-card, .payment-item').forEach(element => {
        observer.observe(element);
    });


     

    

});

// function copyToClipboard() {
//     // El texto o número a copiar
//     const textToCopy = "123456"; // Puedes cambiar esto por cualquier texto o número
  
//     // Crear un elemento de texto temporalmente para copiarlo
//     const textarea = document.createElement('textarea');
//     textarea.value = textToCopy;
//     document.body.appendChild(textarea);
//     textarea.select(); // Selecciona el contenido
//     document.execCommand('copy'); // Copia al portapapeles
//     document.body.removeChild(textarea); // Elimina el textarea temporal
  
//     // Mostrar mensaje de éxito
//     const statusMessage = document.getElementById('statusMessage');
//     statusMessage.textContent = '¡Texto copiado al portapapeles!';
//     statusMessage.style.color = 'green';
  
//     // Opcional: Limpiar el mensaje después de unos segundos
//     setTimeout(() => {
//       statusMessage.textContent = '';
//     }, 3000);
//   }