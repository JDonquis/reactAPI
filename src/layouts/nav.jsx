import { NavLink, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import "../css/layouts/nav.css";
import logoCircle_blue from "../assets/img/logo_secretaria.webp";
import sismed_logo from "../assets/img/sismed_logo.svg";
import logo_secretaria from "../assets/img/logo_secretaria-circle.png";

import PeopleIcon from "@mui/icons-material/People";
import EditCalendarIcon from "@mui/icons-material/EditCalendar";
import PermContactCalendarIcon from "@mui/icons-material/PermContactCalendar";
import SportsGymnasticsIcon from "@mui/icons-material/SportsGymnastics";
import DoubleArrowIcon from "@mui/icons-material/DoubleArrow";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import ListAltIcon from "@mui/icons-material/ListAlt";
import ReceiptIcon from "@mui/icons-material/Receipt";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import DragHandleIcon from "@mui/icons-material/DragHandle";
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import StorageIcon from '@mui/icons-material/Storage';
import AddBusinessIcon from '@mui/icons-material/AddBusiness';

const icons = {
  logoCircle_blue: <logoCircle_blue />,
  PeopleIcon: <PeopleIcon />,
  EditCalendarIcon: <EditCalendarIcon />,
  PermContactCalendarIcon: <PermContactCalendarIcon />,
  SportsGymnasticsIcon: <SportsGymnasticsIcon />,
  DoubleArrowIcon: <DoubleArrowIcon />,
  PointOfSaleIcon: <PointOfSaleIcon />,
  ListAltIcon: <ListAltIcon />,
  ReceiptIcon: <ReceiptIcon />,
  AccountBalanceIcon: <AccountBalanceIcon />,
};

export default function nav(props) {
  // useEffect(() => {
  //     window.addEventListener('resize', (e) => {
  //         e.target.innerWidth < 1110 ? props.getNavStatus()  : props.getNavStatus()
  //     }
  //     );

  // }, [])

  // const linkes = props.permission.map(mod => {
  //     if (mod.module_id != 9){
  //     return (
  //     <li key={mod.module_id} >
  //         <NavLink to={mod.module_url} title={mod.module_name}>
  //             {icons[mod.module_icon]}
  //             <span className="text_link"> {mod.module_name}</span>

  //         </NavLink>
  //     </li>)}
  // })

  return (
    <nav className={`left_nav ${props.status ? "open" : "closed"}`}>
      <div className="w-100  nav_into_container">
        <DragHandleIcon
          className="arrowIcon"
          onClick={() => props.getNavStatus((prev) => !prev)}
        />
        <NavLink
          className="header flex gap-3"
          to="/dashboard"
          key={"dashboard"}
        >
          <div className="logo_nav_container">
            <img
              src={logo_secretaria}
              className="logo w-full"
              alt="logo del sistema"
            />
          </div>
          <p className="system_title relative -top-1">Home</p>
        </NavLink>
        <ul className="link_container">
          {/* {linkes} */}
          <NavLink to={"/dashboard/Organizaciones"} title={"Organizaciones"}>
            <AddBusinessIcon />
            <span className="text_link">Organizaciones</span>
          </NavLink>

          <NavLink to={"/dashboard/usuarios"} title={"usuarios"}>
            <PeopleIcon />
            <span className="text_link"> Usuarios</span>
          </NavLink>

          <NavLink to={"/dashboard/productos"} title={"Productos"}>
            <StorageIcon />
            <span className="text_link"> Productos</span>
          </NavLink>

          <NavLink to={"/dashboard/Entradas"} title={"Entradas"}>
            <ArrowDownwardIcon />
            <span className="text_link"> Entradas</span>
          </NavLink>

          <NavLink to={"/dashboard/Salidas"} title={"Salidas"}>
            <ArrowOutwardIcon />
            <span className="text_link"> Salidas</span>
          </NavLink>

          <NavLink to={"/dashboard/Inventario"} title={"Inventario"}>
          <MedicalServicesIcon />
            <span className="text_link"> Inventario</span>
          </NavLink>
        </ul>
      </div>
    </nav>
  );
}
