import axios from "./api/axios";

import { Route, Routes, useNavigate } from "react-router-dom";
import { useEffect, useState, cloneElement, lazy, Suspense } from "react";
import {useLocation } from 'react-router-dom'
    
    
import TopNavbar from "./layouts/TopNavbar";
import Nav from "./layouts/nav";
import Footer from "./layouts/Footer";  
import ConfirmModal from "./components/ConfimModal";
// import Alert from "../components/Alert";



const Usuarios = lazy(() => import("./pages/Usuarios"))
// const Dashboard = lazy(() => import("./pages/Dashboard"))
// const Asistencia = lazy(() => import("./pages/Asistencia"))
// const Personal = lazy(() => import("./pages/Personal"))
const Productos = lazy(() => import("./pages/Productos"))
const Inventario = lazy(() => import("./pages/Inventario"))
const Entradas = lazy(() => import("./pages/Entradas"))
const Salidas = lazy(() => import("./pages/Salidas"))
const Organizaciones = lazy(() => import("./pages/Organizaciones"))
// const Pagos = lazy(() => import("./pages/Pagos"))


const userData = JSON.parse(
  localStorage.getItem("userData")
) 
if (!(userData.name  || userData.username)) {
  navigate("/");

}
console.log(userData)
export default function app() {
  const navigate = useNavigate()
  
  const [navStatus, setNavStatus] = useState(true)
  // const [pressed, setPressed] = useState(false)
  const location = useLocation();
    
    const [html, setHtml] =  useState('')
    const [session, setSession] = useState({status:false})
    
//     const [alert, setAlert] = useState({
//       open: false,
//       status: "",
//       message: "",
//   });
//   useEffect(() => {
//     setTimeout(() => {
//         setAlert({ open: false, message: "", status: "" });
//     }, 3000);
// }, [alert.open === true]);


const [modalConfirm, setModalConfirm] = useState({
  isOpen: false,
  modalInfo: false,
});
    const [permited, setPermited] = useState(true)
             
    useEffect(() => {
      // checkSession()
      const isPasswordSure = localStorage.getItem('x')
      // if (isPasswordSure) {
      //   if( permited)  {
      //     setModalConfirm({isOpen: true,
      //                     aceptFunction: () =>  {
      //                       navigate('/dashboard/cambiar_contraseña')
      //                       setPermited(false)
      //                     }, modalInfo: "¡Su contraseña es su cédula, debe cambiarla por su seguridad!"})

      //   } else {
      //     setPermited(true)
      //   }

      // }
  }, [location ])


      
    return (    
        
            <div className="dashboard_container"> 
            <Nav getNavStatus={() => setNavStatus(prev => !prev)} status={navStatus} permission={session.permission} />
            <div className={`top_nav_and_main`}>

                <div className={`mainDashboard_container ${navStatus ? 'small' : 'large'}`}>
                <TopNavbar userData={userData}/> 
                  <main>   
                  <Suspense>
                  <Routes forceRefresh={true}>
                    {/* {session.permission.map(mod =>{
                      const module_import = cloneElement(pages[mod.module_name.replaceAll(' ', '_')], {permissions: mod.permissions})

                        return (
                          <Route exact path={mod.module_url} element={module_import} key={mod.module_url}></Route>
                          
                        )
                    })} */}
                      {/* <Route key={'cambiarContaseña'} path="/cambiar_contraseña" element={<Cambiar_contraseña  userData={userData}/>}></Route> */}
                      <Route key={'Organizaciones'} path="/Organizaciones" element={<Organizaciones  userData={userData}/>}></Route>
                      <Route key={'usuarios'} path="/usuarios" element={<Usuarios  userData={userData}/>}></Route>
                      <Route key={'productos'} path="/Productos/*" element={<Productos  userData={userData}/>}></Route>
                      <Route key={'Entradas'} path="/Entradas/" element={<Entradas  userData={userData}/>}></Route>
                      <Route key={'Salidas'} path="/Salidas/" element={<Salidas  userData={userData}/>}></Route>
                      <Route key={'Inventario'} path="/Inventario/" element={<Inventario  userData={userData}/>}></Route>
                      {/* <Route key={'Contacto'} path="/Contacto" element={<Contacto  userData={userData}/>}></Route> */}
                  </Routes>
                  </Suspense>
                  </main>
                  
                  <Footer></Footer>
                </div>

   
              
            </div>
            <ConfirmModal
                closeModal={() => {
                    setModalConfirm({ isOpen: false });
                    // setRowSelected([])
                }}
                modalInfo={modalConfirm.modalInfo}
                isOpen={modalConfirm.isOpen}
                aceptFunction={() => modalConfirm.aceptFunction()}
            />

        </div>
      
        )
        
    
}
