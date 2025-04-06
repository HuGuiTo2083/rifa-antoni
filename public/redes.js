

// Función que copia el texto al portapapeles

const ig = document.getElementById('btRedesIG')
     
const wa = document.getElementById('btRedesWA')

const tt = document.getElementById('btRedesTT')

ig.addEventListener('click', () => {
   window.location.href = "https://www.instagram.com/ganamosconantoni?igsh=MTFyaGRrdzN0cnJ4NQ=="

})

tt.addEventListener('click', () => {
  window.location.href = "https://www.tiktok.com/@undeliverydepartededios?_t=ZM-8vVpzUb81Wo&_r=1"

})

wa.addEventListener('click', () => {

    window.location.href = "https://wa.me/+584125742187"

}
)



const closeTerms = document.getElementById('btCloseTerms')
    const terms = document.getElementById('terms')
    closeTerms.addEventListener('click', ()=>{
  terms.style.display = 'none'
    })


