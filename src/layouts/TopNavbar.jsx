import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import axios from "../api/axios";
import {Link } from "react-router-dom";

import React from "react";

export default function TopNavbar(props) {
    console.log(props)
    const handleLogout= async (e) => {
        e.preventDefault()
        try {
            await axios.post('dashboard/logout')
            // navigate("/dashboard/areas")
            history.replaceState(null, null, location.href);
            sessionStorage.setItem('isLoggedIn', false);
            location.href = "../"
        } catch (error) {
            console.log(error)
        }

    }
    return (
        <div className="topNabvar absolute p-4 pb-0 right-0 top-4 ">
            <div className="user_info cursor-pointer hover:underline z-50">
                <span className="opacity-75 mr-3 z-50">
                    <AccountCircleIcon></AccountCircleIcon>

                </span>

                <div className="user_actions z-50 absolute transition hidden rounded-md shadow-md bg-white p-4 w-56 top-13 right-5 text-right ">
                    <ul>
                        <li className="font-bold  border-b border-b-grey mb-3">
                            <span className="mr-2"> {props.userData.name} {props.userData.lastName} </span>
                            {/* <span className="mr-2"> '{props.userData.name + ' ' + props.userData.last_name}' </span> */}
                        </li>
                        <li className="mb-1 hover:text-purple">
                            <Link to="/dashboard/cambiar_contraseña">Cambiar contraseña</Link>
                        </li>
                        <li className=" hover:text-purple">
                            <a href="" onClick={handleLogout}>Cerrar sesión</a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
