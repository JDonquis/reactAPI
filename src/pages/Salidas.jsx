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
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import BadgeIcon from "@mui/icons-material/Badge";

import InputAdornment from "@mui/material/InputAdornment";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
// import Chip from '@material-ui/core/Chip';
import { IconButton, TextField, Autocomplete, MenuItem } from "@mui/material";
import Modal from "../components/Modal";
import ConfirmModal from "../components/ConfimModal";
import Alert from "../components/Alert";
import Input from "../components/Input";
import OuputGuide from "../components/OuputGuide.jsx";
import Button3D from "../components/Button3D";
import CircularProgress from "@mui/material/CircularProgress";
// import { NavLink } from "react-router-dom";
import useDebounce from "../components/useDebounce";

const filterConfiguration = {
  conditionName: "&condition[name]=",
  categoryName: "&category[name]=",
  typeAdministrationName: "&typeAdministration[name]=",
  typePresentationName: "&typePresentation[name]=",
  medicamentName: "&medicament[name]=",
  organizationName: "&organization[name]=",
  day: "&outputs[day]=",
  month: "&outputs[month]=",
  year: "&outputs[year]=",
};
let filterObject = {};

const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const days = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
  23, 24, 25, 26, 27, 28, 29, 30, 31,
];

export default function Salidas(props) {
  document.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      const guideNumberInput = document.querySelector("#guideNumber");
      if (guideNumberInput && guideNumberInput === document.activeElement) {
        event.preventDefault();
        requestGuide("guide", guideNumberInput.value);
      }
    }
  });
  let arrStatusProducts = [
    { id: 1, name: "Buen estado" },
    { id: 2, name: "Vencido" },
    { id: 3, name: "Defectuoso" },
  ];
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = "SISMED | Salidas";
  }, []);

  // 559 573 719 724
  const [dataTable, setDataTable] = useState([]);
  const [generalData, setGeneralData] = useState({
    conditions: [],
    typePresentations: [],
    TypeAdministrations: [],
    categories: [],
    Medicaments: [],
    organizations: [{ id: 1, name: "Paciente" }],
  });
  const [greatestGuide, setGreatestGuide] = useState(0);

  const [open, setOpen] = useState(false);
  const [modalPdf, setModalPdf] = useState(false);
  const [modalConfirm, setModalConfirm] = useState({
    isOpen: false,
    modalInfo: false,
  });

  const [NewRegister, setNewRegister] = useState({
    code: "",
    id: "",
    authorityFullname: "",
    authorityCi: "",
    authorityObj: { authorityFullname: "", authorityCi: "" },
    guide: "new",
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
    departureDate: new Date().toISOString().split("T")[0],
  });
  const [infoBill, setInfoBill ] = useState({
    code: "",
    id: "",
    authorityFullname: "",
    authorityCi: "",
    authorityObj: { authorityFullname: "", authorityCi: "" },
    guide: "new",
    products: [
    ],
    departureDate: new Date().toISOString().split("T")[0],
  })

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
      name: "day",
      label: "Dia",
      options: {
        display: "excluded",

        filter: true,
        filterList: parametersURL?.filterList[0] || [],

        filterOptions: {
          names: days,
        },
      },
    },
    {
      name: "month",
      label: "Mes",
      options: {
        display: "excluded",
        filter: true,
        filterList: parametersURL?.filterList[1] || [],

        filterOptions: {
          names: months,
        },
      },
    },
    {
      name: "year",
      label: "Año",
      options: {
        display: "excluded",
        filter: true,
        filterList: parametersURL?.filterList[2] || [],

        filterOptions: {
          names: generalData?.years,
        },
      },
    },
    {
      name: "entityName",
      label: "Entidad",
      options: {
        filter: false,
        sort: true,
      },
    },
    {
      name: "outputCode",
      label: "cód. de salida",
      options: {
        filter: false,
      },
    },
    {
      name: "guide",
      label: "nro. guia",
      options: {
        filter: false,
      },
    },
    // {
    //   name: "totalQuantity",
    //   label: "Producti",
    //   options: {
    //     filter: false,
    //   },
    // },

   
    {
      name: "departureDate",
      label: "Fecha",
      options: {
        filter: false,
        customBodyRender: (value) => {
          // console.log(value}
          const [year, month, day] = value?.split("-") || "n/a";
          return (
            <p>
              {day}-{month}-{year}
            </p>
          );
        },
      },
    },
    {
      name: "departureTime",
      label: "Hora",
      options: {
        filter: false,
      },
    },
    {
      name: "organizationName",
      label: "Destino",
      options: {
        filter: true,

        filterList: parametersURL?.filterList[7] || [],
        sort: true,
        filterOptions: {
          names: generalData.organizations
            ? generalData.organizations.map((ent) => ent.name)
            : [""],
        },
      },
    },

    // {
    //   name: "quantity",
    //   label: "Cantidad de salida",
    //   options: {
    //     filter: false,
    //   },
    // },
    //  {
    //       name: "quantity",
    //       label: "Stock",
    //       options: {
    //         filter: false,
    //       },
    //     },

    // {
    //   name: "conditionName",
    //   label: "condición",
    //   options: {
    //     filter: true,

    //     filterList: parametersURL?.filterList[17] || [],
    //     sort: true,
    //     filterOptions: {
    //       names: generalData.conditions
    //         ? generalData.conditions.map((ent) => ent.name)
    //         : [""],
    //     },
    //   },
    // },

    {
      name: "receiverFullname",
      label: "Encargado de recibir",
      options: {
        filter: false,
      },
    },
    {
      name: "receiverCi",
      label: "C.I del encargado de recibir",
      options: {
        display: false,
        filter: false,
      },
    },
    {
      name: "authorityFullname",
      label: "Despachador",
      options: {
        filter: false,
      },
    },
    {
      name: "authorityCi",
      label: "C.I del despachador",
      options: {
        display: false,
        filter: false,
      },
    },
    {
      name: "description",
      label: "Observación",
      options: {
        display: false,
        filter: false,
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
  const [users, setUsers] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchProductText, setSearchProductText] = useState("");
  const handleSearchForSelect = useDebounce(async (searchText) => {
    try {
      const response = await axios.get(
        `dashboard/inventories?search[all]=${searchText}`
      );
      const responseSearch = response.data.inventories;
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

  const authoritiesOptions = JSON.parse(
    localStorage.getItem("authorities")
  ) || [{ authorityFullname: "", authorityCi: "" }];

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
    let url = `dashboard/outputs?relation=${relation}`;
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

  const deleteRegister = async (obj, fnEmptyRows) => {
    try {
      await axios.post(`/dashboard/cancellation/2`, obj).then((response) => {
        // setDataTable((prev) => prev.filter((eachU) => eachU.id != id_user));
        setParametersURL({
          page: 1,
          rowsPerPage: 25,
          search: "",
          orderBy: "",
          orderDirection: "",
          filter: "",
          total: 0,
          filterList: [],
        });

        setAlert({
          open: true,
          status: "Exito",
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
          title="Descargar factura de la guia"
          onClick={() => {
            requestGuide(
              "outputCode",
              dataTable[selectedRows.data[0].dataIndex].outputCode,
              true
            );
          }}
        >
          <BadgeIcon />
        </IconButton>
        <IconButton
          title="Eliminar"
          onClick={() => {
            setModalConfirm({
              isOpen: true,
              // textInfo: 'textInfo',
              modalInfo: (
                <>
                  <p className="mb-2">
                    Especifique porqué cancelará esta salida
                  </p>{" "}
                  <Input
                    key={832349}
                    id={"cancelDescription"}
                    name={"cancelDescription"}
                    Color={"white"}
                    required
                    multiline
                  />{" "}
                </>
              ),
              aceptFunction: (e) => {
                let cancelDescription =
                  document.querySelector("#cancelDescription").value;
                console.log(dataTable[selectedRows.data[0].dataIndex]);
                deleteRegister(
                  {
                    code: dataTable[selectedRows.data[0].dataIndex].outputCode,
                    cancelDescription,
                  },
                  setSelectedRows
                );
              },
            });
          }}
        >
          <DeleteIcon />
        </IconButton>
        {/* <IconButton
          title="Editar"
          onClick={() =>
            editIconClick(selectedRows, displayData, setSelectedRows)
          }
        >
          <EditIcon />
        </IconButton> */}

        {/* <IconButton
          title="Eliminar"
          onClick={() => {
            setModalConfirm({
              isOpen: true,
              modalInfo: "¿Quiere eliminar a este usuario?",
              aceptFunction: () =>
                deleteRegister(
                  dataTable[selectedRows.data[0].dataIndex].id,
                  setSelectedRows
                ),
            });
          }}
        >
          <DeleteIcon />
        </IconButton> */}
      </div>
    ),
    expandableRowsHeader: false,
    expandableRowsOnClick: true,
    expandableRows: true,
    renderExpandableRow: (rowData, rowMeta) => {
      // console.log(rowData, rowMeta);
      return (
        <React.Fragment>
          <tr>
            <td colSpan={10}>
              <div>
                <table
                  style={{ minWidth: "650", marginLeft: "40px" }}
                  aria-label="simple table"
                >
                  <thead className="">
                    <tr className="text-left">
                      <th className="p-2">Lote</th>
                      <th className="p-2">Producto</th>
                      <th className="p-2">Cantidad</th>
                      <th className="p-2">F. de vencimiento</th>
                      <th className="p-2">Condición</th>
                      <th className="p-2">Categoria</th>
                      <th className="p-2">T. de medicamento</th>
                      <th className="p-2">Observación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dataTable[rowMeta.rowIndex].products.map((row) => (
                      <tr
                        key={row.loteNumber}
                        className="cursor-pointer bg-blue3 bg-opacity-50"
                      >
                        <td
                          className="p-2 px-3 pl-5 border-b border-opacity-80  bg-light bg-opacity-20 border-light"
                          scope="row"
                        >
                          {row.loteNumber}
                        </td>
                        <td className="p-2 px-3 pl-5 border-b border-opacity-80  bg-light bg-opacity-20 border-light">
                          <p>
                          <b>{row.name}</b> {row.unitPerPackage != "N/A" ?  row.unitPerPackage : ''} {" "}
                                  {row.typePresentationName != 'N/A' ?  row.typePresentationName : ''} {" "}
                                  {row.concentrationSize != 'N/A' ?  row.concentrationSize : ''}
                          </p>
                        </td>
                        <td className="p-2 px-3 pl-5 border-b border-opacity-80  bg-light bg-opacity-20 border-light">
                          {row.quantity}
                        </td>
                        <td className="p-2 px-3 pl-5 border-b border-opacity-80  bg-light bg-opacity-20 border-light">
                          {row.expirationDate}
                        </td>
                        <td className="p-2 px-3 pl-5 border-b border-opacity-80  bg-light bg-opacity-20 border-light">
                          {row.conditionName}
                        </td>
                        <td className="p-2 px-3 pl-5 border-b border-opacity-80  bg-light bg-opacity-20 border-light">
                          {row.categoryName}
                        </td>
                        <td className="p-2 px-3 pl-5 border-b border-opacity-80  bg-light bg-opacity-20 border-light">
                          {row.medicamentName}
                        </td>
                        <td className="p-2 px-3 pl-5 border-b border-opacity-80 min-w-[400px] bg-light bg-opacity-20 border-light">
                          {row.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </td>
          </tr>
        </React.Fragment>
      );
    },
    setRowProps: (row, dataIndex, rowIndex) => {
      if (dataTable[dataIndex].status == "2") {
        return {
          style: {
            opacity: ".8",
            textDecoration: "line-through",
            background: "#f3f3f3",
            color: "red",
          },
        };
      }
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
          code: dataOfIndx.code,
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
        // console.log({ organizationsById : {...res.organizations}})
        const organizationsById = {};
        res.organizations.forEach((org) => {
          organizationsById[org.id] = org.code;
        });
        setGeneralData({
          ...res,
          organizations: [{ id: 1, name: "Paciente" }, ...res.organizations],
          outputs: "",
          organizationsById,
        });
      }
      setDataTable(res.outputs);
      setIsLoading(false);
    });
    if (relation == true) {
      await axios
        .get("/dashboard/users?user[entityCode]=1[OR]1-1[OR]1-2[OR]1-3[OR]1-4")
        .then((response) => {
          const usersByEntities = {};
          response.data.data.forEach((user) => {
            if (usersByEntities[user.entityCode]) {
              usersByEntities[user.entityCode].push({ ...user });
            } else {
              usersByEntities[user.entityCode] = [{ ...user }];
            }
          });
          console.log({ usersByEntities });
          setUsers(usersByEntities);
        });
    }
    setRelation(false);
  };

  const requestGuide = async (type, guide, justForBill = false) => {
    await axios
      .get(`dashboard/outputs?outputs[${type}]=${guide}`)
      .then((response) => {
        const data = response.data.outputs;
        if (data.length > 0) {
          const arrGuide = {
            ...data[0],
            products: [...data[0].products],
          };

          for (let i = 1; i < data.length; i++) {
            arrGuide.products.push(...data[i].products);
          }
          if (justForBill == true) {
            setInfoBill(arrGuide)
            setModalPdf(true);
          } else {
            console.log(data);
           

            setNewRegister(arrGuide);
            document.querySelector("#guideNumber").disabled = true;
          }
        } else {
          setAlert({
            open: true,
            status: "Error",
            message: `No se encontró ninguna guia ${guide}`,
          });
          return;
        }
      });
  };

  const [submitStatus, setSubmitStatus] = useState("Crear");
  console.log(generalData?.organizationsById);
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (submitStatus === "Crear") {
        setSubmitStatus("cargando...");
        await axios.post(`/dashboard/outputs`, NewRegister).then((response) => {
          // const client = response.data.client;
          // client.array_areas = client.areas.map((a) => a.name);
          // client.blood_name = client.blood_types.name;
          // setDataTable((prev) => [client, ...prev]);
          const data = response.data.outputs;
          const infoBillResponse = {
            ...data[0],
            products: [...data[0].products],
          };

          for (let i = 1; i < data.length; i++) {
            infoBillResponse.products.push(...data[i].products);
          }
          setSubmitStatus("Crear");
          setAlert({
            open: true,
            status: "Exito",
            message: (
              <>
                <PDFDownloadLink
                  fileName={`guia de salida`}
                  document={<OuputGuide output={infoBillResponse} />}
                >
                  <button className="hover:bg-dark p-3 mt-1 bg-white bg-opacity-5 block border border-white rounded-md">
                    <BadgeIcon />
                    <span className="font-bold ml-3">Descargar Carnet pdf</span>
                  </button>
                </PDFDownloadLink>
              </>
            ),
          });
        });
      }
      if (submitStatus === "Actualizar") {
        setSubmitStatus("cargando...");
        await axios
          .put(`/dashboard/outputs/${NewRegister.guide}`, NewRegister)
          .then((response) => {
            const infoBillResponse = response.data.outputs;
            setAlert({
              open: true,
              status: "Exito",
              message: (
                <>
                  <PDFDownloadLink
                    fileName={`guia de salida`}
                    document={<OuputGuide output={infoBillResponse} />}
                  >
                    <button className="hover:bg-dark p-3 mt-1 bg-white bg-opacity-5 block border border-white rounded-md">
                      <BadgeIcon />
                      <span className="font-bold ml-3">
                        Descargar Carnet pdf
                      </span>
                    </button>
                  </PDFDownloadLink>
                </>
              ),
            });
          });
      }
      setOpen(false);

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

      const objauthority = {
        ...authoritiesOptions,
        [NewRegister.authorityCi]: {
          authorityFullname: NewRegister.authorityFullname,
          authorityCi: NewRegister.authorityCi,
        },
      };
      console.log(objauthority);

      localStorage.setItem("authorities", JSON.stringify(objauthority));
      setNewRegister({
        authorityCi: "",
        authorityFullname: "",
        departureTime: "",
        organizationId: "",
        code: "",
        id: "",
        name: "",
        categoryId: "",
        medicamentId: "",
        receiverFullname: "",
        receiverCi: "",
        typePresentationId: "",
        typeAdministrationId: "",
        unitPerPackage: "",
        concentrationSize: "",
        categoryObj: { name: "", id: "" },
        medicamentObj: { name: "N/A", id: 1 },
        typePresentationObj: { name: "N/A", id: 1 },
        typeAdministrationObj: { name: "N/A", id: 1 },
        guide: "new",
        products: [],
        departureDate: new Date().toISOString().split("T")[0],
      });
      setTypeOfGuide("nueva");
    } catch (error) {
      setAlert({
        open: true,
        status: "Error",
        message: `Algo salió mal`,
      });
      setSubmitStatus(() =>
        NewRegister.outputCode > 0 ? "Actualizar" : "Crear"
      );
    }
  };

  // console.log(authorityptions);
  console.log({ props });
  const [tabla, setTabla] = useState();
  useEffect(() => {
    setTabla(
      <MUIDataTable
        isRowSelectable={true}
        title={
          <div>
            <div className="flex min-h-[55px]  pt-3">
              <h1 className="text-grey text-xl relative top-1 ">Salidas de</h1>

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
                      filter: `&outputs[entityCode]=${e.target.value}`,
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
        // console.log({ updatedProducts });
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
  const [selectedRow, setSelectedRow] = useState(null);

  const handleRowClick = (index) => {
    setSelectedRow(index);
  };

  const [typeOfGuide, setTypeOfGuide] = useState("nueva");

  return (
    <>
      <Button3D
        className="mt-2"
        color={"blue1"}
        text="Nueva Salida"
        icon={"add"}
        fClick={(e) => {
          if (submitStatus == "Editar") {
            setNewRegister({
              authorityCi: "",
              authorityFullname: "",
              departureTime: "",
              organizationId: "",
              code: "",
              id: "",
              name: "",
              categoryId: "",
              medicamentId: "",
              typePresentationId: "",
              typeAdministrationId: "",
              unitPerPackage: "",
              concentrationSize: "",
              categoryObj: { name: "", id: "" },
              medicamentObj: { name: "N/A", id: 1 },
              typePresentationObj: { name: "N/A", id: 1 },
              typeAdministrationObj: { name: "N/A", id: 1 },
              guide: "new",
              products: [],
            });
            // console.log(NewRegister);
          }
          setOpen(true);
          setSubmitStatus("Crear");
        }}
      />

      <Modal
        show={open}
        onClose={() => setOpen(false)}
        content={
          <form
            onSubmit={handleSubmit}
            className=" w-full gap-4 grid grid-cols-3 "
          >
            <div className="col-span-2">
              <label
                className={`hover:cursor-pointer hover:text-black hover:bg-light ${
                  typeOfGuide === "nueva"
                    ? " border-b-2 border-blue2 font-bold"
                    : ""
                }`}
              >
                <input
                  type="radio"
                  value="nueva"
                  checked={typeOfGuide === "nueva"}
                  onChange={(e) => {
                    setNewRegister({
                      authorityCi: "",
                      authorityFullname: "",
                      departureTime: "",
                      organizationId: "",
                      code: "",
                      id: "",
                      name: "",
                      categoryId: "",
                      medicamentId: "",
                      typePresentationId: "",
                      typeAdministrationId: "",
                      unitPerPackage: "",
                      receiverFullname: "",
                      receiverCi: "",
                      concentrationSize: "",
                      categoryObj: { name: "", id: "" },
                      medicamentObj: { name: "N/A", id: 1 },
                      typePresentationObj: { name: "N/A", id: 1 },
                      typeAdministrationObj: { name: "N/A", id: 1 },
                      guide: "new",
                      products: [],
                    });
                    setTypeOfGuide(e.target.value);
                    setSubmitStatus("Crear");
                  }}
                  className={`hidden  `}
                />
                Nueva Guía
              </label>

              <label
                className={` mx-3 hover:cursor-pointer hover:text-black hover:bg-light ${
                  typeOfGuide === "existente"
                    ? " border-b-2 border-blue2 font-bold"
                    : ""
                }`}
              >
                <input
                  type="radio"
                  value="existente"
                  checked={typeOfGuide === "existente"}
                  onChange={(e) => {
                    console.log("click");
                    setNewRegister({
                      authorityCi: "",
                      authorityFullname: "",
                      departureTime: "",
                      organizationId: "",
                      code: "",
                      id: "",
                      name: "",
                      categoryId: "",
                      medicamentId: "",
                      typePresentationId: "",
                      typeAdministrationId: "",
                      unitPerPackage: "",
                      concentrationSize: "",
                      receiverFullname: "",
                      receiverCi: "",
                      categoryObj: { name: "", id: "" },
                      medicamentObj: { name: "N/A", id: 1 },
                      typePresentationObj: { name: "N/A", id: 1 },
                      typeAdministrationObj: { name: "N/A", id: 1 },
                      guide: "",
                      products: [],
                    });
                    setTypeOfGuide(e.target.value);
                    setSubmitStatus("Actualizar");
                  }}
                  className={`hidden `}
                />
                Existente
              </label>
              {typeOfGuide !== "nueva" && (
                <>
                  <TextField
                    label="Nro guia"
                    value={NewRegister.guide}
                    id="guideNumber"
                    name="guide"
                    onChange={(e) => {
                      handleChange(e);
                    }}
                    required
                    type="number"
                    key={574}
                    size={"small"}
                    className={"mt-4"}
                  />
                  <Button3D
                    className=" col-span-3 mt-5 ml-2 h-8"
                    type={"button"}
                    color={"blue1"}
                    text={<SearchIcon className="text-white" />}
                    // fClick={() => }
                  />
                </>
              )}
            </div>
            <div className="col-span-3">
              <div className="flex items-center gap-3 rounded-t-lg  bg-light text-dark p-4 relative">
                <b>Productos:</b>
                <Input
                  label="Buscar productos"
                  type="search"
                  key={842793}
                  id="fsdad"
                  name={`e${Math.random()}`}
                  value={searchProductText}
                  className="max-w-[300px] "
                  // autoComplete={"off"}
                  autoComplete="random-string-123"
                  size={"small"}
                  onFocus={() => {
                    if (isSearchHidden == "hidden") {
                      setIsSearchHidden("absolute");
                    }
                    if (e.target.value.trim() == "") {
                      setIsSearchHidden("hidden");
                    }
                  }}
                  // Color={"white"}
                  onChange={(e) => {
                    setProductsSearched("Buscando...");
                    handleSearchForSelect(e.target.value);
                    setSearchProductText(e.target.value);
                    if (isSearchHidden == "hidden") {
                      setIsSearchHidden("absolute");
                    }
                    if (e.target.value.trim() == "") {
                      setIsSearchHidden("hidden");
                    }
                    // document.addEventListener("click", handleClickOutside);
                  }}
                  onBlur={(e) => {
                    // setTimeout(() => {
                    // setIsSearchHidden("hidden");
                    // }, 100);
                  }}
                  // Color={"dark"}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <SearchIcon className="text-dark" />
                      </InputAdornment>
                    ),
                  }}
                />
                <div
                  ref={searchRef}
                  className={`bg-ligther shadow-2xl  absolute left-20 max-h-96 overflow-auto  rounded-lg  border-t-0 top-[73px] z-50   ${isSearchHidden}`}
                >
                  <table className="parent_products bg-opacity-0">
                    <thead className="header px-2 py-1 pb-0 bg-ligther text-dark text-xs ">
                      <tr>
                        <th className="text-left">Cód. produ.</th>
                        <th className="text-left">Producto</th>
                        <th className="text-left">Stock</th>
                        <th className="text-left">Vencidos</th>
                        <th className="text-left">Defectuosos</th>
                      </tr>
                    </thead>

                    {typeof productsSearched === "string" ? (
                      <p className="col-span-8 text-center py-4 font-bold">
                        {/* Aqui se muestra el texto que dice buscando o que no se encontró ninguno */}
                        {productsSearched}
                      </p>
                    ) : (
                      <tbody>
                        {productsSearched?.map((product, i) => {
                          const isRowSelected = selectedRow === i;
                          // if (produ)
                          return (
                            <React.Fragment key={i}>
                              <tr
                                onClick={() => {
                                  console.log([
                                    ...product.lots.good,
                                    ...product.lots.bad,
                                    ...product.lots.expired,
                                  ]);
                                  handleRowClick((prev) =>
                                    prev == i ? null : i
                                  );
                                }}
                                className={`body border-b border-b-grey border-opacity-10 px-3 px-30 text-black hover:bg-blue1 hover:text-white duration-75 cursor-pointer py-3 ${
                                  isRowSelected ? "bg-blue1 text-white" : ""
                                }`}
                              >
                                <td className="p-4">{product.code}</td>
                                <td className="p-4">
                                <b>{product.name}</b> {product.unitPerPackage != "N/A" ?  product.unitPerPackage : ''} {" "}
                                  {product.typePresentationName != 'N/A' ?  product.typePresentationName : ''} {" "}
                                  {product.concentrationSize != 'N/A' ?  product.concentrationSize : ''}
                                </td>
                                <td className="p-4">
                                  <span className="bg-blue3 p-1 px-3 rounded text-blue1 font-bold">
                                    {product.stock}
                                  </span>
                                </td>
                                <td className="p-4">
                                  <span className="bg-red p-1 px-3 rounded text-white">
                                    {product.stockExpired}
                                  </span>
                                </td>
                                <td className="p-4">
                                  <span className="bg-orange p-1 px-3 rounded text-white">
                                    {product.stockBad}
                                  </span>
                                </td>

                                {isRowSelected && (
                                  <table>
                                    <thead>
                                      <tr className="bg-blue2">
                                        <th>Lote</th>
                                        <th>F. de vencimiento</th>
                                        <th>Cantidad</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {[
                                        ...product?.lots?.good,
                                        ...product?.lots?.bad,
                                        ...product?.lots?.expired,
                                      ].map((row) => {
                                        // console.log(key);
                                        const conditionColor = () => {
                                          if (row.conditionId == 3) {
                                            return "bg-red text-white";
                                          } else if (row.condition == 2) {
                                            return "bg-orange text-white";
                                          } else {
                                            return "bg-blue3 text-blue1";
                                          }
                                        };
                                        return (
                                          <tr
                                            key={row.loteKey}
                                            className={
                                              NewRegister.products.some(
                                                (obj) => obj?.key == row.loteKey
                                              )
                                                ? "hover:cursor-not-allowed bg-ligth"
                                                : `${conditionColor()} font-bold cursor-pointer hover:brightness-110 `
                                            }
                                            onClick={(e) => {
                                              console.log(row)
                                              if (
                                                !NewRegister.products.some(
                                                  (obj) =>
                                                    obj?.key == row.loteKey
                                                )
                                              ) {
                                                setNewRegister((prev) => ({
                                                  ...prev,
                                                  products: [
                                                    ...prev.products,
                                                    {
                                                      ...product,

                                                      product: `${product.name} ${product.unitPerPackage != "N/A" ?  product.unitPerPackage : ''}${" "}
                                                      ${product.typePresentationName != 'N/A' ?  product.typePresentationName : ''}${" "}
                                                      ${product.concentrationSize != 'N/A' ?  product.concentrationSize : ''}`,
                                                      lots: "",
                                                      ...row,
                                                      key: row.loteKey,
                                                      description:
                                                        "Sin novedad",
                                                    },
                                                  ],
                                                }));
                                                setIsSearchHidden("hidden");
                                              }
                                              // console.log(product.productId)
                                            }}
                                          >
                                            <td className="p-2 px-3 pl-5 border-b border-opacity-80 bg-light bg-opacity-20 border-light">
                                              {row.loteNumber}
                                            </td>
                                            <td className="p-2 px-3 pl-5 border-b border-opacity-80 bg-light bg-opacity-20 border-light">
                                              {row.expirationDate}
                                            </td>
                                            <td className="p-2 px-3 pl-5 border-b border-opacity-80 bg-light bg-opacity-20 border-light">
                                              {row.stock}
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                )}
                              </tr>
                            </React.Fragment>
                          );
                        })}
                      </tbody>
                    )}
                  </table>
                </div>
              </div>

              <table className="border border-light w-full ">
                <thead className="header text-left px-2 py-1 bg-light text-dark text-xs px-30  ">
                  <tr>
                    <th>#</th>
                    {/* <th>Nro Guia</th> */}
                    <th>Nro Lote</th>
                    <th>Cód del producto</th>
                    <th>Producto</th>
                    <th>F. Vencimiento</th>
                    {/* <th>Stock</th> */}
                    <th>Cantidad de salida</th>
                    <th>Observación</th>

                    <th className="opacity-50">
                      <DeleteIcon />
                    </th>
                  </tr>
                </thead>
                {/* <div className="body px-2 grid grid-cols-subgrid px-30  items-center text-sm justify-between"> */}
                <tbody className="">
                  {...NewRegister?.products?.map((product, i) => {
                    console.log({ product }, `bucle ${i}`);
                    if (product.hasOwnProperty("key")) {
                      return (
                        <tr
                          key={product.id}
                          className="body px-2  px-30  text-dark items-center text-sm justify-between"
                        >
                          <td className="p-4">{i + 1}</td>
                          {/* <td className="p-4">{product.guide}</td> */}
                          <td className="p-4">{product.loteNumber}</td>
                          <td className="p-4">{product.code}</td>

                          <td className="p-4">{product.product}</td>
                          <td className="p-4">{product.expirationDate}</td>
                          {/* <td className="p-4">{product.stock}</td> */}
                          <td className="p-4 flex items-center gap-2 min-w-[160px] max-w-[160px]">
                            <Input
                              size="small"
                              data-index={i}
                              label={"Cantidad"}
                              required
                              key={`quantity_${i}`}
                              // defaultValuevalue={product.stock}
                              value={NewRegister.products[i]?.quantity}
                              name={`quantity_${i}`}
                              InputProps={{
                                inputProps: { 
                                    max: product.stock, min: 0
                                }
                            }}
                              // onChange={() => {}}
                              onInput={(e) => {
                                e.target.value <= +product?.stock &&
                                e.target.value >= 0
                                  ? handleChange(e)
                                  : "";
                              }}
                              type={"number"}
                            />

                            <span className={`min-w-[30px]`}>
                              / {product.stock}
                            </span>
                          </td>
                          <td className="p-4">
                            <Input
                              label={"Observación"}
                              key={`description_${i}`}
                              value={NewRegister.products[i]?.description}
                              name={`description_${i}`}
                              size="small"
                              multiline
                              // data-index={i}
                              onChange={handleChange}
                            />
                          </td>

                          <td className="p-4">
                            <button
                              onClick={(e) => {
                                setNewRegister((prev) => ({
                                  ...prev,
                                  products: prev.products.filter(
                                    (eachProduct, j) => i !== j
                                  ),
                                }));
                              }}
                              type="button"
                              className="bg-light p-1 pr-1 font-bold text-dark hover:bg-red hover:text-light rounded-md text-center"
                            >
                              x
                            </button>
                          </td>
                        </tr>
                      );
                    } else {
                      return (
                        <tr
                          key={product.id}
                          className="body px-2  px-30  text-dark bg-light bg-opacity-70 items-center text-sm justify-between"
                        >
                          <td className="p-4">{i + 1}</td>
                          {/* <td className="p-4">{product.guide}</td> */}
                          <td className="p-4">{product.loteNumber}</td>
                          <td className="p-4">{product.code}</td>

                          <td className="p-4">
                            {" "}
                            {`${product.name} ${product.unitPerPackage}${" "}
                                  ${product.typePresentationName}${" "}
                                  ${product.concentrationSize}`}
                          </td>
                          <td className="p-4">{product.expirationDate}</td>
                          <td className="p-4">{product.quantity}</td>
                          <td className="p-4">{product.description}</td>
                          <td className="p-4"></td>
                        </tr>
                      );
                    }
                  })}
                </tbody>
              </table>
            </div>

            <Autocomplete
              options={Object.values(authoritiesOptions)}
              getOptionLabel={(option) => option.authorityFullname}
              value={NewRegister}
              inputValue={NewRegister.authorityFullname}
              onChange={handleOptionSelect}
              readOnly={typeOfGuide == "nueva" ? false : true}
              disabled={typeOfGuide == "nueva" ? false : true}
              onInputChange={handleInputChange}
              renderInput={(params) => (
                <TextField
                  readOnly={typeOfGuide == "nueva" ? false : true}
                  disabled={typeOfGuide == "nueva" ? false : true}
                  {...params}
                  label="Nombre del despachador"
                />
              )}
            />

            <TextField
              label="Cédula del despachador"
              value={NewRegister.authorityCi}
              name="authorityCi"
              onChange={handleChange}
              required
              type="number"
              key={57234}
              readOnly={typeOfGuide == "nueva" ? false : true}
              disabled={typeOfGuide == "nueva" ? false : true}
            />
            {typeOfGuide == "nueva" ? (
              <Input
                select
                label="Destino"
                readOnly={typeOfGuide == "existente" ? true : false}
                disabled={typeOfGuide == "nueva" ? false : true}
                value={NewRegister?.organizationId}
                defaultValue={NewRegister?.organizationId}
                // defaultValue=""
                width={"100%"}
                required
                name={"organizationId"}
                onChange={handleChange}
              >
                {generalData.organizations?.map((option) => (
                  <MenuItem key={option.id} value={option.id}>
                    {option.name}
                  </MenuItem>
                ))}
              </Input>
            ) : (
              <span>{NewRegister.organizationName}</span>
            )}
            {NewRegister.organizationId === 1 ||
            generalData?.organizationsById?.[NewRegister?.organizationId] ==
              "nocode" ||
            !users?.[
              generalData?.organizationsById?.[NewRegister?.organizationId]
            ] ? (
              <>
                <Input
                  label={"Nombre de quien recibe"}
                  shrink={NewRegister?.receiverFullname ? true : false}
                  required
                  key={0}
                  name={"receiverFullname"}
                  onChange={handleChange}
                  value={NewRegister?.receiverFullname}
                  readOnly={typeOfGuide == "nueva" ? false : true}
                  disabled={typeOfGuide == "nueva" ? false : true}
                />
                <Input
                  label={"C.I de quien recibe"}
                  shrink={NewRegister?.receiverCi ? true : false}
                  required
                  type={"number"}
                  key={43242423}
                  name={"receiverCi"}
                  onChange={handleChange}
                  readOnly={typeOfGuide == "nueva" ? false : true}
                  disabled={typeOfGuide == "nueva" ? false : true}
                  value={NewRegister?.receiverCi}
                />
              </>
            ) : (
              ""
            )}
            {NewRegister.organizationId > 1 &&
            generalData?.organizationsById?.[NewRegister?.organizationId] !==
              "nocode" &&
            users?.[
              generalData?.organizationsById?.[NewRegister?.organizationId]
            ] ? (
              <Input
                select
                label="Recibe"
                value={NewRegister?.receiverObj}
                defaultValue={NewRegister?.receiverCi || ""}
                // defaultValue=""
                width={"100%"}
                required
                readOnly={typeOfGuide == "nueva" ? false : true}
                disabled={typeOfGuide == "nueva" ? false : true}
                name={"receiverCi"}
                onChange={(e) => {
                  setNewRegister((prev) => ({
                    ...prev,
                    receiverObj: e.target.value,
                    receiverCi: e.target.value.split("_")[0],
                    receiverFullname: e.target.value.split("_")[1],
                  }));
                  handleChange(e.target.value);
                }}
              >
                {users?.[
                  generalData?.organizationsById[NewRegister.organizationId]
                ]?.map((user) => (
                  <MenuItem
                    key={user.id}
                    value={`${user.ci}_${user.name + " " + user.lastName}`}
                  >
                    {user.name} {user.lastName}
                  </MenuItem>
                ))}
              </Input>
            ) : (
              ""
            )}
            <Input
              shrink="true"
              type={"date"}
              label={"Fecha de salida"}
              required
              value={NewRegister?.departureDate}
              name={"departureDate"}
              onChange={handleChange}
              readOnly={typeOfGuide == "nueva" ? false : true}
              disabled={typeOfGuide == "nueva" ? false : true}
            />
            <Input
              shrink="true"
              type={"time"}
              label={"Hora de salida"}
              placeholder={"24h"}
              required
              value={NewRegister?.departureTime}
              name={"departureTime"}
              readOnly={typeOfGuide == "nueva" ? false : true}
              disabled={typeOfGuide == "nueva" ? false : true}
              onChange={handleChange}
            />

            {/* <Input
    label={"Nro de lote"}
    required
    key={1}
    value={NewRegister?.loteNumber}
    name={"loteNumber"}
    onChange={handleChange}
  /> */}

            <Button3D
              className="mt-2 col-span-3"
              color={"blue1"}
              text={submitStatus}
              fClick={(e) => {}}
            />
          </form>
        }
      ></Modal>
      {tabla}

      <Modal
        show={modalPdf}
        onClose={() => setModalPdf(false)}
        content={
          <PDFViewer style={{ width: "1000px", height: "800px" }}>
            <OuputGuide output={infoBill} userData={props.userData} />
          </PDFViewer>
        }
      ></Modal>
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
