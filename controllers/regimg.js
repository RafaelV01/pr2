import { registerDataimg,archivoimg } from "../controllers/global.js";

const guardarimg = document.getElementById('btnadd')

async function reg_img(){
    const nombre = document.getElementById('edtname').value
    const email = document.getElementById('edtuser').value
    const urlimagen = document.getElementById('fileimg').files[0];

    try{
        let archivourl=''
        if(urlimagen){
            archivourl=await archivoimg(urlimagen,nombre)
        }
        const datos = registerDataimg(
            nombre,
            email,
            archivourl
        )

        const verificar =await datos
        alert('El usuario se registro exitosamente..')    
        window.location.href = "regimg.html";
    }catch(e){
        console.error("error add ",e)
        alert("registro fallido")
    } 
    
}

window.addEventListener("DOMContentLoaded",async()=>
    {
        guardarimg.addEventListener('click',reg_img);
    })