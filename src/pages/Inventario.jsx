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
  medicamentName: "&medicament[name]=",
  day: "&inventories[day]=",
  month: "&inventories[month]=",
  year: "&inventories[year]=",
};
let filterObject = {};

const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const days = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
  23, 24, 25, 26, 27, 28, 29, 30, 31,
];
function createData(name, calories, fat, carbs, protein) {
  return { name, calories, fat, carbs, protein };
}

const rows = [
  createData("Frozen yoghurt", 159, 6.0, 24, 4.0),
  createData("Ice cream sandwich", 237, 9.0, 37, 4.3),
  createData("Eclair", 262, 16.0, 24, 6.0),
  createData("Cupcake", 305, 3.7, 67, 4.3),
  createData("Gingerbread", 356, 16.0, 49, 3.9),
];

export default function Inventario(props) {
  let arrStatusProducts = [
    { id: 1, name: "Buen estado" },
    { id: 2, name: "Vencido" },
    { id: 3, name: "Defectuoso" },
  ];
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = "SISMED | Inventario";
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
    code: "",
    id: "",
    arrivalDate: "",
    arrivalTime: "",
    authorityFullname: "",
    authorityCi: "",
    authorityObj: { authorityFullname: "", authorityCi: "" },

    products: [
      //   {
      //   loteNumber: "",
      //   quantity: "",
      //   expirationDate: "",
      //   conditionId: "",
      //   name: "",
      //   categoryId: "",
      //   categoryObj: { name: "", id: "" },
      //   medicamentId: "",
      //   medicamentObj: { name: "N/A", id: 1 },
      //   typePresentationId: "",
      //   typePresentationObj: { name: "N/A", id: 1 },
      //   typeAdministrationId: "",
      //   typeAdministrationObj: { name: "N/A", id: 1 },
      //   unitPerPackage: "",
      //   concentrationSize: "",
      // }
    ],
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
      name: "entityName",
      label: "Entidad",
      options: {
        filter: false,
        sort: true,
      },
    },
    {
      name: "code",
      label: "Cód. del Producto",
      options: {
        filter: false,
        sort: false,
      },
    },
    {
      name: "name",
      label: "producto",
      options: {
        filter: false,
        customBodyRenderLite: (value, tableMeta) => {
          const rowData = dataTable[tableMeta];
          return (
            <p>
              {rowData.name} {rowData.unitPerPackage}{" "}
              {rowData.typePresentationName} {rowData.concentrationSize}
            </p>
          );
        },
      },
    },
    {
      name: "stock",
      label: "Stock",
      options: {
        filter: false,
        customBodyRender: (stock, tableMeta) => {
          const minimumStock = dataTable[tableMeta.rowIndex].minimumStock;
          console.log(tableMeta.rowIndex);

          if (stock < minimumStock) {
            return (
              <p className="text-red font-bold">
                {stock}
                <ErrorOutlineIcon className="relative -top-1.5" />
              </p>
            );
          } else {
            return <p className=" font-bold">{stock}</p>;
          }
        },
      },
    },
    {
      name: "categoryName",
      label: "Categoria",
      options: {
        display: "excluded",
        filter: true,
        display: false,
        filterList: parametersURL?.filterList[4] || [],
        sort: true,
        filterOptions: {
          names: generalData.categories
            ? generalData.categories.map((ent) => ent.name)
            : [""],
        },
      },
    },
    {
      name: "typePresentationName",
      label: "Presentación",
      options: {
        display: "excluded",

        filter: true,
        filterList: parametersURL?.filterList[5] || [],
        sort: true,
        filterOptions: {
          names: generalData.typePresentations
            ? generalData.typePresentations.map((ent) => ent.name)
            : [""],
        },
      },
    },

    {
      name: "unitPerPackage",
      label: "Unidades x envase",
      options: {
        display: "excluded",

        filter: false,
      },
    },
    {
      name: "concentrationSize",
      label: "Concentración / tamaño",
      options: {
        display: "excluded",
        filter: false,
      },
    },

    {
      name: "typeAdministrationName",
      label: "Administración",
      options: {
        display: false,
        filter: true,
        filterList: parametersURL?.filterList[8] || [],
        sort: true,
        filterOptions: {
          names: generalData.typeAdministrations
            ? generalData.typeAdministrations.map((ent) => ent.name)
            : [""],
        },
      },
    },
    {
      name: "medicamentName",
      label: "Tipo de medicamento",
      options: {
        display: false,
        filter: true,
        filterList: parametersURL?.filterList[9] || [],
        sort: true,
        filterOptions: {
          names: generalData.medicaments
            ? generalData.medicaments.map((ent) => ent.name)
            : [""],
        },
      },
    },

    {
      name: "stockExpired",
      label: "Vencidos",
      options: {
        filter: false,
      },
    },
    {
      name: "stockBad",
      label: "Defectuosos",
      options: {
        filter: false,
      },
    },
    {
      name: "entries",
      label: "Entradas",
      options: {
        filter: false,
      },
    },

    {
      name: "outputs",
      label: "Salidas",
      options: {
        filter: false,
      },
    },
    {
      name: "conditionName",
      label: "condición",
      options: {
        filter: true,
        display: "excluded",
        filterList: parametersURL?.filterList[14] || [],
        sort: true,
        filterOptions: {
          names: generalData.conditions
            ? generalData.conditions.map((ent) => ent.name)
            : [""],
        },
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
  localStorage.setItem(
    "authorities",
    JSON.stringify({
      27253194: { authorityFullname: "pepe aurelio", authorityCi: "27253194" },
      139382382: {
        authorityFullname: "Javier Hernandez",
        authorityCi: "139382382",
      },
    })
  );

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
    let url = `dashboard/inventories?relation=${relation}`;
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
        .delete(`dashboard/inventories/${id_user}`)
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
        filterObject[changedColumn] = `${filterConfiguration[changedColumn]}${encodeURIComponent(arrValues.join().replaceAll(",", "[OR]"))}`;
        console.log({ filterList, filterObject });

    
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
    // selectableRowsOnClick: true,
    selectableRowsHideCheckboxes: true,
    // selectableRows: "single",
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
    expandableRowsHeader: false,
    expandableRowsOnClick: true,
    expandableRows: true,
    renderExpandableRow: (rowData, rowMeta) => {
      // console.log(rowData, rowMeta);

      return (
        <React.Fragment>
          <tr>
            <td colSpan={6}>
              <div>
                <table style={{ minWidth: "650" }} aria-label="simple table">
                  <thead>
                    <tr className="text-left">
                      <th className="p-2">Lote</th>
                      <th className="p-2">Fecha de vencimiento</th>
                      <th className="p-2">Cantidad</th>
                      <th className="p-2">Condición</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ...dataTable[rowMeta.rowIndex].lots.good,
                      ...dataTable[rowMeta.rowIndex].lots.bad,
                      ...dataTable[rowMeta.rowIndex].lots.expired,
                    ].map((row) => {
                      const conditionColor = () => {
                        if (rowMeta.conditionId == 3) {
                          return "bg-red text-white";
                        } else if (rowMeta.condition == 2) {
                          return "bg-orange text-white";
                        } else {
                          return "bg-blue3 text-blue1";
                        }
                      };
                      return (
                        <tr
                          key={row.loteNumber}
                          className={`font-bold cursor-pointer hover:brightness-50 ${conditionColor()}`}
                        >
                          <td
                            className={`p-2 px-3 pl-5 border-b border-opacity-80  bg-light bg-opacity-20 border-light `}
                            scope="row"
                          >
                            {row.loteNumber}
                          </td>
                          <td className="p-2 px-3 pl-5 border-b border-opacity-80  bg-light bg-opacity-20 border-light">
                            {row.expirationDate}
                          </td>
                          <td className="p-2 px-3 pl-5 border-b border-opacity-80  bg-light bg-opacity-20 border-light">
                            {row.stock}
                          </td>
                          <td className="p-2 px-3 pl-5 border-b border-opacity-80  bg-light bg-opacity-20 border-light">
                            {row.conditionName}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </td>
          </tr>
        </React.Fragment>
      );
    },
  };

  function editIconClick(selectedRows, displayData, setSelectedRows) {
    const indx = selectedRows.data[0].dataIndex;
    const dataOfIndx = dataTable[indx];
    setNewRegister({
      ...dataOfIndx,
      // categoryObj: { name: dataOfIndx.categoryName, id: dataOfIndx.categoryId },
      products: [
        {
          loteNumber: dataOfIndx.loteNumber,
          quantity: dataOfIndx.quantity,
          expirationDate: dataOfIndx.expirationDate,
          conditionId: dataOfIndx.conditionId,
          code: dataOfIndx.productCode,
          name: dataOfIndx.name,
          categoryId: dataOfIndx.categoryId,
          categoryName: dataOfIndx.categoryName,
          medicamentId: dataOfIndx.medicamentId,
          medicamentName: dataOfIndx.medicamentName,
          typePresentationId: dataOfIndx.typePresentationId,
          typePresentationName: dataOfIndx.typePresentationName,
          typeAdministrationId: dataOfIndx.typeAdministrationId,
          typeAdministrationName: dataOfIndx.typeAdministrationName,
          unitPerPackage: dataOfIndx.unitPerPackage,
          concentrationSize: dataOfIndx.concentrationSize,
          description: dataOfIndx.description,
        },
      ],
    });
    setOpen(true);
    setSubmitStatus("Editar");
  }

  const handleAutoComplete = (newValue, name) => {
    if (newValue != null) {
      if (name == "category" && newValue.id == 2) {
        setNewRegister((prev) => ({
          ...prev,
          [name + "Id"]: newValue.id,
          categoryObj: newValue,
          medicamentId: 1,
          typePresentationId: 1,
          typeAdministrationId: 1,
          medicamentObj: { name: "N/A", id: 1 },
          typePresentationObj: { name: "N/A", id: 1 },
          typeAdministrationObj: { name: "N/A", id: 1 },
        }));
      } else {
        setNewRegister((prev) => ({
          ...prev,
          [name + "Id"]: newValue.id,
          [name + "Obj"]: newValue,
        }));
      }
    }
  };

  const getData = async (url) => {
    await axios.get(url).then((response) => {
      setIsLoading(true);
      const res = response.data;
      // console.log(response.data);
      // console.log(res);
      setTotalData(res.total);

      // console.log(response.data.products)
      // console.log(response.data.typePresentation)
      if (relation == true) {
        setGeneralData({ ...res, inventories: "" });
      }
      setDataTable(res.inventories);
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
        setSubmitStatus("cargando...");
        await axios
          .post(`/dashboard/inventories`, NewRegister)
          .then((response) => {
            // const client = response.data.client;
            // client.array_areas = client.areas.map((a) => a.name);
            // client.blood_name = client.blood_types.name;
            // setDataTable((prev) => [client, ...prev]);
          });
        setAlert({
          open: true,
          status: "Exito",
          message: `la entrada ha sido creado`,
        });
        setSubmitStatus("Crear");
      }
      if (submitStatus === "Editar") {
        setSubmitStatus("cargando...");
        await axios
          .put(`/dashboard/inventories/${NewRegister.id}`, NewRegister)
          .then((response) => {});
      }
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
      setAlert({
        open: true,
        status: "Exito",
        message: `${NewRegister.name} ha sido editado`,
      });
      localStorage.setItem(
        "authorities",
        JSON.stringify({
          ...authorityptions,
          [NewRegister.authorityCi]: {
            authorityFullname: NewRegister.authorityFullname,
            authorityCi: NewRegister.authorityCi,
          },
        })
      );
      setNewRegister({});
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
        title={
          <div>
            <div className="flex min-h-[55px]  pt-3">
              <h1 className="text-grey text-xl relative top-1 ">
                Inventario de
              </h1>

              <span className="relative -top-2">
                <Input
                  name="user_type"
                  id=""
                  select
                  defaultValue={props.userData.entityCode}
                  size="small"
                  className="ml-4 bg-blue/0 py-1 font-bold"
                  onChange={(e) => {
                    setParametersURL((prev) => ({
                      ...prev,
                      filter: `&inventories[entityCode]=${e.target.value}`,
                      page: 1,
                    }));
                  }}
                  // value={user_type_selected}
                >
                  {generalData.entities?.map((option) => (
                    <MenuItem key={option.code} value={option.code}>
                      {option.name}
                    </MenuItem>
                  ))}
                  <MenuItem key={"todos"} value={"*"}>
                    Todos
                  </MenuItem>
                </Input>
              </span>
            </div>
          </div>
        }
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
      <div className="mt-2 h-14"></div>

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
