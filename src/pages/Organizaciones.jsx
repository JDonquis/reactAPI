import React, { useEffect, useState, useCallback, useRef } from "react";
// import "../css/basics.css";

import MUIDataTable from "mui-datatables";

import axios from "../api/axios";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SettingsIcon from "@mui/icons-material/Settings";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
// import Chip from '@material-ui/core/Chip';
import { IconButton, TextField, Autocomplete, MenuItem } from "@mui/material";
import Modal from "../components/Modal";
import ConfirmModal from "../components/ConfimModal";
import Alert from "../components/Alert";
import Input from "../components/Input";
import Button3D from "../components/Button3D";
import CircularProgress from "@mui/material/CircularProgress";

// import { NavLink } from "react-router-dom";
import useDebounce from "../components/useDebounce";

const filterConfiguration = {
  conditionName: "&condition[name]=",
  categoryName: "&category[name]=",
  typeAdministrationName: "&typeAdministration[name]=",
  typePresentationName: "&typePresentation[name]=",
  organizationName: "&organization[name]=",
  day: "&organizations[day]=",
  month: "&organizations[month]=",
  year: "&organizations[year]=",
};
let filterObject = {};

const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const days = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
  23, 24, 25, 26, 27, 28, 29, 30, 31,
];

export default function Organizaciones(props) {
  let arrStatusProducts = [
    { id: 1, name: "Buen estado" },
    { id: 2, name: "Vencido" },
    { id: 3, name: "Defectuoso" },
  ];
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = "SISMED | Organizaciones";
  }, []);

  // 559 573 719 724
  const [dataTable, setDataTable] = useState([]);
  const [generalData, setGeneralData] = useState({
    typePresentations: [],
    TypeAdministrations: [],
    categories: [],
    Medicaments: [],
    organizations: [],
  });

  const [open, setOpen] = useState(false);
  const [modalConfirm, setModalConfirm] = useState({
    isOpen: false,
    modalInfo: false,
  });

  const [NewRegister, setNewRegister] = useState({
    name: "",
    authorityFullname: "",
    authorityCi: "",
  });

  const [relation, setRelation] = useState(true);
  const [parametersURL, setParametersURL] = useState({
    page: 1,
    rowsPerPage: 25,
    search: "",
    orderBy: "",
    orderDirection: "",
    filter: "",
    total: 0,
    filterList: [],
  });

  const columns = [
    {
      name: "name",
      label: "Entidad",
      options: {
        filter: false,
        sort: true,
      },
    },
    {
      name: "authorityFullname",
      label: "Encargado",
      options: {
        filter: false,
        sort: true,
      },
    },
    {
      name: "authorityCi",
      label: "C.I del encargado",
      options: {
        filter: false,
        sort: true,
      },
    },
  ];
  const searchRef = useRef(null);
  const [isSearchHidden, setIsSearchHidden] = useState("hidden");

  const handleClickOutside = (event) => {
    if (searchRef.current && !searchRef.current.contains(event.target)) {
    }
    setIsSearchHidden("hidden");
  };

  const [productsSearched, setProductsSearched] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchProductText, setSearchProductText] = useState("");
  const handleSearchForSelect = useDebounce(async (searchText) => {
    try {
      const response = await axios.get(
        `dashboard/products?search[all]=${searchText}`
      );
      const responseSearch = response.data.products;
      // console.log(response.data.products)
      if (responseSearch.length > 0) {
        setProductsSearched(responseSearch);
      } else {
        setProductsSearched("No se encontró ningún producto");
      }

      // Realiza las acciones necesarias con la respuesta de la solicitud
      // console.log(response.data);
    } catch (error) {
      // Maneja los errores de la solicitud
      console.error(error);
    }
  }, 400);
  const [person, setPerson] = useState({
    authorityFullname: "",
    authorityCi: "",
  });
  // const [nameOptions, setNameOptions] = useState();

  const [authorityptions, setAuthorityptions] = useState(
    JSON.parse(localStorage.getItem("authorities")) || [
      { authorityFullname: "", authorityCi: "" },
    ]
  );

  const handleInputChange = (event, value) => {
    setNewRegister((prev) => ({
      ...prev,
      authorityFullname: value,
      authorityCi: "",
    }));

    // Aquí puedes realizar alguna acción adicional según tus necesidades cuando el texto del nombre cambie
  };

  const handleOptionSelect = (event, value) => {
    if (value) {
      setNewRegister((prev) => ({
        ...prev,
        authorityFullname: value.authorityFullname,
        authorityCi: value.authorityCi,
      }));

      // Aquí puedes realizar alguna acción adicional según tus necesidades cuando se seleccione una opción
    } else {
      // Si no se selecciona una opción, puedes reiniciar el nombre completo y cédula en el estado
      setNewRegister((prev) => ({
        ...prev,
        authorityFullname: "",
        authorityCi: "",
      }));
    }
  };
  // console.log(NewRegister);
  const [totalData, setTotalData] = useState([0]);
  // const [filterObject, setFilterObject] = useState({})

  const handleSearch = useDebounce((searchText) => {
    // Perform search operation with the debounced term
    setParametersURL((prev) => ({ ...prev, search: searchText }));
  }, 800);
  useEffect(() => {
    let url = `dashboard/organizations?`;
    url += `&page=${parametersURL.page}`;
    url += `&rowsPerPage=${parametersURL.rowsPerPage}`;

    if (parametersURL.search) {
      url += `&search[all]=${parametersURL.search}`;
    }
    if (parametersURL.filter.length > 0) {
      url += `${parametersURL.filter}`;
    }
    if (parametersURL.orderBy.length > 0) {
      url += `&orderBy=${parametersURL.orderBy}&orderDirection=${parametersURL.orderDirection}`;
    }
    // console.log(url);
    getData(url);
    // url += `search?${parametersURL.search}`
    // console.log(parametersURL)
  }, [parametersURL]);

  const deleteRegister = async (id_user, fnEmptyRows) => {
    try {
      await axios
        .delete(`dashboard/organizations/${id_user}`)
        .then((response) => {
          setDataTable((prev) => prev.filter((eachU) => eachU.id != id_user));
          fnEmptyRows([]);
          setAlert({
            open: true,
            status: "Exito",
            message: response.data.message || "",
          });
        });
    } catch (error) {
      setAlert({
        open: true,
        status: "Error",
        message: error.response.data.errors
          ? Object.values(error.response.data.errors)[0][0]
          : error.response?.data?.Message || "Algo salió mal",
      });
    }
  };
  // const [rowSelected, setRowSelected] = useState([])
  const options = {
    count: totalData,
    rowsPerPage: parametersURL.rowsPerPage,
    page: parametersURL.page - 1,
    serverSide: true,

    onChangePage: (currentPage) => {
      setParametersURL((prev) => ({ ...prev, page: currentPage + 1 }));
    },

    onChangeRowsPerPage: (numberOfRows) => {
      setParametersURL((prev) => ({ ...prev, rowsPerPage: numberOfRows }));
    },

    onFilterChange: (
      changedColumn,
      filterList,
      typeFilter,
      columnIndex,
      displayData
    ) => {
      let arrValues = filterList[columnIndex];
      // let newFilterObject = { ...filterObject }; // Copia el objeto de filtro actual
      // let copyText= textFilterUrl
      if (typeFilter == "reset") {
        setParametersURL((prev) => ({ ...prev, filter: [], filterList: [] }));
        return;
      }
      console.log(arrValues);
      if (arrValues.length > 0) {
        filterObject[changedColumn] = `${
          filterConfiguration[changedColumn]
        }${encodeURIComponent(arrValues.join().replaceAll(",", "[OR]"))}`;
        console.log({ filterList, filterObject });

        // if (changedColumn === "categoryName") {
        //   filterObject[changedColumn] =
        //     `&categoryId=` +
        //     encodeURIComponent(
        //       arrValues
        //         .map((v) => categories.find((obj) => obj.name == v).id)
        //         .join()
        //         .replaceAll(",", "[OR]")
        //     );
        // } else if (changedColumn == "medicamentName") {
        //   filterObject[changedColumn] =
        //     `&medicamentId=` +
        //     encodeURIComponent(
        //       arrValues
        //         .map((v) => Medicaments.find((obj) => obj.name == v).id)
        //         .join()
        //         .replaceAll(",", "[OR]")
        //     );
        // } else if (changedColumn == "typePresentationName") {
        //   filterObject[changedColumn] =
        //     `&typePresentationId=` +
        //     encodeURIComponent(
        //       arrValues
        //         .map((v) => typePresentations.find((obj) => obj.name == v).id)
        //         .join()
        //         .replaceAll(",", "[OR]")
        //     );
        // } else if (changedColumn == "typeAdministrationName") {
        //   filterObject[changedColumn] =
        //     `&typeAdministrationId=` +
        //     encodeURIComponent(
        //       arrValues
        //         .map((v) => TypeAdministrations.find((obj) => obj.name == v).id)
        //         .join()
        //         .replaceAll(",", "[OR]")
        //     );
        // }
        // filterObject[changedColumn] = `&${changedColumn}=${encodeURIComponent(arrValues.join().replaceAll(',', '[OR]'))}`;
      } else {
        delete filterObject[changedColumn]; // Elimina la propiedad del objeto si no hay valores seleccionados
        console.log("se eliminóooooo");
      }

      // setFilterObject(newFilterObject); // Actualiza el objeto de filtro
      setParametersURL((prev) => ({
        ...prev,
        filter: Object.values(filterObject).join(""),
        page: 1,
        filterList,
      }));
    },

    onSearchChange: (searchText) => {
      handleSearch(searchText);
    },

    onColumnSortChange: (changedColumn, direction) => {
      setParametersURL((prev) => ({
        ...prev,
        orderBy: changedColumn,
        orderDirection: direction,
      }));
    },

    filterType: "multiselect",
    selectableRowsOnClick: true,
    selectableRowsHideCheckboxes: true,
    selectableRows: "single",
    fixedHeader: true,
    textLabels: {
      body: {
        noMatch: isLoading ? (
          <CircularProgress color="inherit" size={33} />
        ) : (
          "No se han encontrado datos"
        ),
      },
    },

    tableBodyMaxHeight: "60vh",
    // count: 2,

    // customSearchRender: debounceSearchRender(500),
    rowsPerPageOptions: [10, 25, 50, 100],
    customToolbarSelect: (selectedRows, displayData, setSelectedRows) => (
      <div>
        <IconButton
          title="Editar"
          onClick={() => {
            editIconClick(selectedRows, displayData, setSelectedRows);
          }}
        >
          <EditIcon />
        </IconButton>

        <IconButton
          title="Eliminar"
          onClick={() => {
            setModalConfirm({
              isOpen: true,
              modalInfo: "¿Quiere eliminar a este usuario?",
              aceptFunction: () =>
                deleteRegister(
                  data[selectedRows.data[0].dataIndex].id,
                  setSelectedRows
                ),
            });
          }}
        >
          <DeleteIcon />
        </IconButton>
      </div>
    ),
  };

  function editIconClick(selectedRows, displayData, setSelectedRows) {
    const indx = selectedRows.data[0].dataIndex;
    const dataOfIndx = dataTable[indx];
    setNewRegister({
      ...dataOfIndx,
    });
    setOpen(true);
    setSubmitStatus("Editar");
  }

  const getData = async (url) => {
    await axios.get(url).then((response) => {
      setIsLoading(true);
      const res = response.data;
      console.log(response.data);
      // console.log(res);
      setTotalData(res.total);

      // console.log(response.data.products)
      // console.log(response.data.typePresentation)

      setDataTable(res.data);
      setIsLoading(false);
      setRelation(false);
    });
  };
  console.log({ NewRegister });
  const [submitStatus, setSubmitStatus] = useState("Crear");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (submitStatus === "Crear") {
        console.log({ submitStatus });
        setSubmitStatus("cargando...");
        await axios
          .post(`/dashboard/organizations`, NewRegister)
          .then((response) => {
            console.log(response);
            // const client = response.data.client;
            // client.array_areas = client.areas.map((a) => a.name);
            // client.blood_name = client.blood_types.name;
            // setDataTable((prev) => [client, ...prev]);
            setSubmitStatus("Crear");
          });
      }
      if (submitStatus === "Editar") {
        setSubmitStatus("cargando...");
        await axios
          .put(`/dashboard/organizations/${NewRegister.id}`, NewRegister)
          .then((response) => {});
      }
      setAlert({
        open: true,
        status: "Exito",
      });
      setParametersURL({
        page: 1,
        rowsPerPage: 25,
        search: "",
        orderBy: "",
        orderDirection: "",
        filter: "",
        filterList: [],
        total: 0,
      });
      setOpen(false);

      setNewRegister({
        name: "",
        authorityFullname: "",
        authorityCi: "",
      });
    } catch (error) {
      setAlert({
        open: true,
        status: "Error",
        message: `Algo salió mal`,
      });
      setSubmitStatus(() => (NewRegister.id > 0 ? "Editar" : "Crear"));
    }
  };

  // console.log(authorityptions);

  const [tabla, setTabla] = useState();
  useEffect(() => {
    setTabla(
      <MUIDataTable
        isRowSelectable={true}
        title={"Organizaciones"}
        data={dataTable}
        columns={columns}
        options={options}
      />
    );
  }, [dataTable]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    // console.log({name, value})
    // setNewRegister((prev) => ({ ...prev, [name]: value }));
    if (name.includes("_")) {
      // Campo dentro de products
      const [fieldName, index] = name.split("_");
      setNewRegister((prev) => {
        const updatedProducts = [...prev.products];
        updatedProducts[index][fieldName] = value;
        return {
          ...prev,
          products: updatedProducts,
        };
      });
    } else {
      // Otro campo en newRegister
      setNewRegister((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  }, []);
  // console.log({ productsSearched });
  const [alert, setAlert] = useState({
    open: false,
    status: "",
    message: "",
  });

  return (
    <>
      <div className="flex ">
        <Button3D
          className="mt-2"
          color={"blue1"}
          text={`Nuevo`}
          icon={"add"}
          fClick={(e) => {
            if (submitStatus == "Editar") {
              setNewRegister({
                name: "",
                authorityFullname: "",
                authorityCi: "",
              });
            }
            setOpen(true);
            setSubmitStatus("Crear");
          }}
        />
      </div>

      <Modal
        show={open}
        onClose={() => setOpen(false)}
        content={
          <form
            onSubmit={handleSubmit}
            className=" md:w-[500px] gap-4 grid grid-cols-2 "
          >
            <Input
              label={"Organización"}
              required
              key={"1r0"}
              name={"name"}
              onChange={handleChange}
              value={NewRegister?.name}
            />
            <Input
              label={"Nombre del encargado"}
              key={10}
              name={"authorityFullname"}
              onChange={handleChange}
              value={NewRegister?.authorityFullname}
            />
            <Input
              label={"C.I del encargado"}
              key={310}
              name={"authorityCi"}
              className={"col-span-2"}
              onChange={handleChange}
              value={NewRegister?.authorityCi}
            />

            <Button3D
              className="mt-2 col-span-2"
              color={"blue1"}
              text={submitStatus}
              fClick={(e) => {}}
            />
          </form>
        }
      ></Modal>

      {tabla}

      <Alert
        open={alert.open}
        setAlert={setAlert}
        status={alert.status}
        message={alert.message}
      />

      <ConfirmModal
        closeModal={() => {
          setModalConfirm({ isOpen: false });
          // setRowSelected([])
        }}
        modalInfo={modalConfirm.modalInfo}
        isOpen={modalConfirm.isOpen}
        aceptFunction={() => modalConfirm.aceptFunction()}
      />
    </>
  );
}
