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

// import Chip from '@material-ui/core/Chip';
import Input from "../components/Input";
import { IconButton, TextField, Autocomplete, MenuItem } from "@mui/material";
import Modal from "../components/Modal";
import ConfirmModal from "../components/ConfimModal";
import Alert from "../components/Alert";
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
  day: "&entries[day]=",
  month: "&entries[month]=",
  year: "&entries[year]=",
};
let filterObject = {};

const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const days = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
  23, 24, 25, 26, 27, 28, 29, 30, 31,
];
const currentDate = new Date();
export default function Entradas(props) {
  document.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      const guideNumberInput = document.querySelector("#guideNumber");
      if (guideNumberInput && guideNumberInput === document.activeElement) {
        event.preventDefault();
        requestGuide(guideNumberInput.value);
      }
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = "SISMED | Entradas";
  }, []);

  // 559 573 719 724
  const [dataTable, setDataTable] = useState([]);
  const [generalData, setGeneralData] = useState({
    typePresentations: [],
    TypeAdministrations: [],
    categories: [],
    Medicaments: [],
    organizations: [],
    conditions: [],
  });

  const [open, setOpen] = useState(false);
  const [modalConfirm, setModalConfirm] = useState({
    isOpen: false,
    modalInfo: false,
    content: <></>,
  });

  const [typeOfGuide, setTypeOfGuide] = useState("nueva");

  const [NewRegister, setNewRegister] = useState({
    code: "",
    id: "",
    organizationId: "",
    arrivalDate: "",
    arrivalTime: "",
    authorityFullname: "",
    authorityCi: "",
    authorityObj: { authorityFullname: "", authorityCi: "" },
    arrivalDate: new Date().toISOString().split("T")[0],

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
      name: "entryCode",
      label: "Cód. de entrada",
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
    {
      name: "arrivalDate",
      label: "F. De entrada",
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
      name: "arrivalTime",
      label: "Hora",
      options: {
        filter: false,
      },
    },
    {
      name: "organizationName",
      label: "Origen",
      options: {
        filter: true,

        filterList: parametersURL?.filterList[8] || [],
        sort: true,
        filterOptions: {
          names: generalData.organizations
            ? generalData.organizations.map((ent) => ent.name)
            : [""],
        },
      },
    },
    {
      name: "loteNumber",
      label: "Lote",
      options: {
        display: "excluded",
        filter: false,
        sort: false,
      },
    },

    {
      name: "productCode",
      label: "Cód. del Producto",
      options: {
        filter: false,
        sort: false,
        display: "excluded",
      },
    },
    {
      name: "productName",
      label: "producto",
      options: {
        display: "excluded",
        filter: false,
        customBodyRenderLite: (value, tableMeta) => {
          const rowData = dataTable[tableMeta];
          return (
            <p>
              {`${rowData.name} ${
                rowData.unitPerPackage != "N/A" && rowData.unitPerPackage
              }${" "}
                                  ${
                                    rowData.typePresentationName != "N/A" &&
                                    rowData.typePresentationName
                                  }${" "}
                                  ${
                                    rowData.concentrationSize != "N/A" &&
                                    product.concentrationSize
                                  }`}
            </p>
          );
        },
      },
    },

    {
      name: "quantity",
      label: "Cantidad",
      options: {
        display: "excluded",
        filter: false,
      },
    },

    {
      name: "categoryName",
      label: "Categoria",
      options: {
        display: "excluded",
        filter: true,
        display: false,
        filterList: parametersURL?.filterList[11] || [],
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
        filterList: parametersURL?.filterList[12] || [],
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
        display: "excluded",
        filter: true,
        filterList: parametersURL?.filterList[15] || [],
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
        filterList: parametersURL?.filterList[16] || [],
        sort: true,
        filterOptions: {
          names: generalData.medicaments
            ? generalData.medicaments.map((ent) => ent.name)
            : [""],
        },
      },
    },

    // {
    //   name: "conditionName",
    //   label: "condición",
    //   options: {
    //     filter: true,
    //     display: "excluded",
    //     filterList: parametersURL?.filterList[18] || [],
    //     sort: true,
    //     filterOptions: {
    //       names: generalData.conditions
    //         ? generalData.conditions.map((ent) => ent.name)
    //         : [""],
    //     },
    //   },
    // },
    {
      name: "expirationDate",
      label: "F. vencimiento",
      options: {
        display: "excluded",
        filter: false,
      },
    },

    {
      name: "authorityFullname",
      label: "Encargado de recibir",
      options: {
        // display: "excluded",
        filter: false,
      },
    },
    {
      name: "authorityCi",
      label: "C.I de encargado de recibir",
      options: {
        filter: false,
      },
    },
    {
      name: "description",
      label: "Observación",
      options: {
        display: false,
        filter: false,
        display: "excluded",
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
  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log({ name, value });

    if (name.includes("_")) {
      // Campo dentro de products
      const [fieldName, index] = name.split("_");

      setNewRegister((prev) => {
        const updatedProducts = [...prev.products];
        updatedProducts[index][fieldName] = value;

        if (fieldName === "conditionId") {
          updatedProducts[index]["conditionName"] =
            generalData?.conditions?.find((obj) => obj.id == value).name;
        }
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
  };

  const requestGuide = async (guide = NewRegister.guide, justForBill) => {
    await axios
      .get(`dashboard/entries?entries[guide]=${guide}`)
      .then((response) => {
        const data = response.data.entries;
        if (data.length > 0) {
          const arrGuide = {
            ...data[0],
            products: data[0].products,
          };

          for (let i = 1; i < data.length; i++) {
            arrGuide.products.push(...data[i].products);
          }
          if (justForBill) {
            setModalPdf(true);
          }
          setNewRegister(arrGuide);
          document.querySelector("#guideNumber").disabled = true;
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
    let url = `dashboard/entries?relation=${relation}`;
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
      await axios.post(`/dashboard/cancellation/1`, obj).then((response) => {
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
        {/* <IconButton
          title="Editar"
          onClick={() =>
            editIconClick(selectedRows, displayData, setSelectedRows)
          }
        >
          <EditIcon />
        </IconButton> */}

        <IconButton
          title="Eliminar"
          onClick={() => {
            setModalConfirm({
              isOpen: true,
              // textInfo: 'textInfo',
              modalInfo: (
                <>
                  <p className="mb-2">
                    Especifique porqué cancelará esta entrada
                  </p>{" "}
                  <Input
                    key={8329}
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

                deleteRegister(
                  {
                    code: dataTable[selectedRows.data[0].dataIndex].entryCode,
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
            <td colSpan={8}>
              <div className="max-w-[1150px] overflow-auto text-sm">
                <table className="ml-12 max-w-[500px] overflow-x-auto">
                  <thead className="text-sm">
                    <tr className="text-left">
                      <th
                        style={{
                          background: "#011140",
                          color: "white",
                          fontZize: "10px",
                        }}
                        className="p-2"
                      >
                        Lote
                      </th>
                      <th
                        style={{
                          background: "#011140",
                          color: "white",
                          fontZize: "10px",
                        }}
                        className="p-2"
                      >
                        Producto
                      </th>
                      <th
                        style={{
                          background: "#011140",
                          color: "white",
                          fontZize: "10px",
                        }}
                        className="p-2"
                      >
                        Cantidad
                      </th>
                      <th
                        style={{
                          background: "#011140",
                          color: "white",
                          fontZize: "10px",
                        }}
                        className="p-2"
                      >
                        F. de vencimiento
                      </th>
                      <th
                        style={{
                          background: "#011140",
                          color: "white",
                          fontZize: "10px",
                        }}
                        className="p-2"
                      >
                        Condición
                      </th>
                      <th
                        style={{
                          background: "#011140",
                          color: "white",
                          fontZize: "10px",
                        }}
                        className="p-2"
                      >
                        Categoria
                      </th>
                      <th
                        style={{
                          background: "#011140",
                          color: "white",
                          fontZize: "10px",
                        }}
                        className="p-2"
                      >
                        T. de medicamento
                      </th>
                      <th
                        style={{
                          background: "#011140",
                          color: "white",
                          fontZize: "10px",
                        }}
                        className="p-2"
                      >
                        Observación
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {dataTable[rowMeta.rowIndex].products.map((row) => {
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
                          className={`font-bold ${conditionColor()}`}
                        >
                          <td
                            className="p-2 px-3 border-b border-opacity-80  bg-light bg-opacity-20 border-light"
                            scope="row"
                          >
                            {row.loteNumber}
                          </td>
                          <td className="p-2 px-3 border-b border-opacity-80  bg-light bg-opacity-20 border-light">
                            <p>
                              {`${row.name} ${
                                row.unitPerPackage != "N/A"
                                  ? row.unitPerPackage
                                  : ""
                              }${" "}
                                  ${
                                    row.typePresentationName != "N/A"
                                      ? row.typePresentationName
                                      : ""
                                  }${" "}
                                  ${
                                    row.concentrationSize != "N/A"
                                      ? row.concentrationSize
                                      : ""
                                  }`}
                            </p>
                          </td>
                          <td className="p-2 px-3 border-b border-opacity-80  bg-light bg-opacity-20 border-light">
                            {row.quantity}
                          </td>
                          <td className="p-2 px-3 border-b border-opacity-80  bg-light bg-opacity-20 border-light">
                            {row.expirationDate}
                          </td>
                          <td className="p-2 px-3 border-b border-opacity-80  bg-light bg-opacity-20 border-light">
                            {row.conditionName}
                          </td>
                          <td className="p-2 px-3 border-b border-opacity-80  bg-light bg-opacity-20 border-light">
                            {row.categoryName}
                          </td>
                          <td className="p-2 px-3 border-b border-opacity-80  bg-light bg-opacity-20 border-light">
                            {row.medicamentName}
                          </td>
                          <td className="p-2 px-3 border-b border-opacity-80 min-w-[400px] bg-light bg-opacity-20 border-light">
                            {row.description}
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
          code: dataOfIndx.productCode,
          name: dataOfIndx.productName,
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
      setDataTable(res.entries);
      if (relation == true) {
        setGeneralData({ ...res, entries: "" });
      }
      setIsLoading(false);
      setRelation(false);
    });
  };
  const [submitStatus, setSubmitStatus] = useState("Crear");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (submitStatus === "Crear") {
        setSubmitStatus("cargando...");
        await axios
          .post(`/dashboard/entries`, NewRegister)
          .then((response) => {});
      }
      if (submitStatus === "Actualizar") {
        setSubmitStatus("cargando...");
        await axios
          .put(`/dashboard/entries/${NewRegister.guide}`, NewRegister)
          .then((response) => {});
      }
      setAlert({
        open: true,
        status: "Exito",
      });
      setSubmitStatus("Crear");
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
      const objAutority = {
        ...authorityptions,
        [NewRegister.authorityCi]: {
          authorityFullname: NewRegister.authorityFullname,
          authorityCi: NewRegister.authorityCi,
        },
      };

      localStorage.setItem("authorities", JSON.stringify(objAutority));
      setNewRegister({
        code: "",
        id: "",
        name: "",
        categoryId: "",
        medicamentId: "",
        organizationId: "",
        typePresentationId: "",
        typeAdministrationId: "",
        arrivalDate: "",
        arrivalTime: "",
        guide: "",
        authorityFullname: "",
        authorityCi: "",
        authorityObj: { authorityFullname: "", authorityCi: "" },
        unitPerPackage: "",
        concentrationSize: "",
        categoryObj: { name: "", id: "" },
        medicamentObj: { name: "N/A", id: 1 },
        typePresentationObj: { name: "N/A", id: 1 },
        typeAdministrationObj: { name: "N/A", id: 1 },
        arrivalDate: new Date().toISOString().split("T")[0],
      });
    } catch (error) {
      setAlert({
        open: true,
        status: "Error",
        message: `Algo salió mal`,
      });
      setSubmitStatus(() =>
        NewRegister.entryCode > 0 ? "Actualizar" : "Crear"
      );
    }
  };

  console.log({ NewRegister });

  const [tabla, setTabla] = useState();
  useEffect(() => {
    setTabla(
      <MUIDataTable
        isRowSelectable={true}
        title={
          <div>
            <div className="flex min-h-[55px]  pt-3">
              <h1 className="text-grey text-xl relative top-1 ">Entradas de</h1>

              <span className="relative -top-2">
                <Input
                  name="user_type"
                  id=""
                  select
                  defaultValue={2}
                  size="small"
                  className=" ml-4 bg-blue/0 py-1 font-bold"
                  onChange={(e) => {
                    // setUser_type_selected(
                    //     e.target.value
                    // );
                  }}
                  // value={user_type_selected}
                >
                  {generalData.organizations?.map((option) => (
                    <MenuItem key={option.id} value={option.id}>
                      {option.name}
                    </MenuItem>
                  ))}
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

  // console.log({ productsSearched });
  const [alert, setAlert] = useState({
    open: false,
    status: "",
    message: "",
  });

  return (
    <>
      <Button3D
        className="mt-2"
        color={"blue1"}
        text="Nueva entrada"
        icon={"add"}
        fClick={(e) => {
          // if (submitStatus == "A") {
          //   setNewRegister({
          //     code: "",
          //     id: "",
          //     name: "",
          //     categoryId: "",
          //     medicamentId: "",
          //     organizationId: "",
          //     typePresentationId: "",
          //     typeAdministrationId: "",
          //     arrivalDate: "",
          //     arrivalTime: "",
          //     guide: "",
          //     authorityFullname: "",
          //     authorityCi: "",
          //     authorityObj: { authorityFullname: "", authorityCi: "" },
          //     unitPerPackage: "",
          //     concentrationSize: "",
          //     categoryObj: { name: "", id: "" },
          //     medicamentObj: { name: "N/A", id: 1 },
          //     typePresentationObj: { name: "N/A", id: 1 },
          //     typeAdministrationObj: { name: "N/A", id: 1 },
          //   });
          //   // console.log(NewRegister);
          // }
          setOpen(true);
          // setSubmitStatus("Crear");
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
                className={`mr-2 hover:cursor-pointer hover:text-black hover:bg-light ${
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
                      code: "",
                      id: "",
                      name: "",
                      categoryId: "",
                      medicamentId: "",
                      organizationId: "",
                      typePresentationId: "",
                      typeAdministrationId: "",
                      arrivalDate: "",
                      arrivalTime: "",
                      guide: "",
                      authorityFullname: "",
                      authorityCi: "",
                      authorityObj: { authorityFullname: "", authorityCi: "" },
                      unitPerPackage: "",
                      concentrationSize: "",
                      categoryObj: { name: "", id: "" },
                      medicamentObj: { name: "N/A", id: 1 },
                      typePresentationObj: { name: "N/A", id: 1 },
                      typeAdministrationObj: { name: "N/A", id: 1 },
                      products: [],
                    });
                    setTypeOfGuide(e.target.value);
                    setSubmitStatus("Crear");
                  }}
                  className={`hidden  `}
                />
                Nueva Guía
              </label>
              |
              <label
                className={` ml-2 hover:cursor-pointer hover:text-black hover:bg-light ${
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
                      code: "",
                      id: "",
                      name: "",
                      categoryId: "",
                      medicamentId: "",
                      organizationId: "",
                      typePresentationId: "",
                      typeAdministrationId: "",
                      arrivalDate: "",
                      arrivalTime: "",
                      guide: "",
                      authorityFullname: "",
                      authorityCi: "",
                      authorityObj: { authorityFullname: "", authorityCi: "" },
                      unitPerPackage: "",
                      concentrationSize: "",
                      categoryObj: { name: "", id: "" },
                      medicamentObj: { name: "N/A", id: 1 },
                      typePresentationObj: { name: "N/A", id: 1 },
                      typeAdministrationObj: { name: "N/A", id: 1 },
                      products: [],
                    });

                    setTypeOfGuide(e.target.value);
                    setSubmitStatus("Actualizar");
                  }}
                  className={`hidden `}
                />
                Existente
              </label>
              <>
                <TextField
                  label="Nro guia"
                  id="guideNumber"
                  value={NewRegister.guide}
                  name="guide"
                  onChange={(e) => {
                    handleChange(e);
                  }}
                  required
                  type="number"
                  key={574}
                  size={"small"}
                  className={`relative top-1 ml-3 ${
                    typeOfGuide !== "nueva" ? "" : "hidden"
                  }`}
                />
                <Button3D
                  className={`col-span-3 relative top-2 ml-2 h-8 ${
                    typeOfGuide !== "nueva" ? "" : "hidden"
                  }`}
                  type={"button"}
                  color={"blue1"}
                  text={<SearchIcon className="text-white" />}
                  fClick={requestGuide}
                />
              </>
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
                  onFocus={(e) => {
                    setIsSearchHidden("absolute");
                  }}
                  onBlur={(e) => {
                    // setTimeout(() => {
                    setIsSearchHidden("hidden");
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
                  <table className=" ">
                    <tr className="header  pb-0 text-left  bg-ligther text-dark text-xs">
                      <th className="text-xs">Cód. produ.</th>
                      <th>Nombre</th>
                      <th>presentación</th>
                      <th>Uni. x env.</th>
                      <th>Concentración / tamaño</th>
                      <th>T. de medicamento</th>
                      <th>Categoria</th>
                      <th>Administración</th>
                    </tr>
                    {typeof productsSearched == "string" ? (
                      <p className="col-span-8 text-center py-4 font-bold">
                        {" "}
                        {productsSearched}{" "}
                      </p>
                    ) : (
                      <tbody>
                        {productsSearched?.map((product, i) => {
                          return (
                            <tr
                              key={`${product.id}+${i}`}
                              className=" body border-b border-b-grey border-opacity-10   text-black items-center   hover:bg-blue1 hover:text-white cursor-pointer py-3"
                              onMouseDown={(e) => {
                                if (
                                  submitStatus == "Editar" &&
                                  NewRegister.products.length == 1
                                ) {
                                  window.alert(
                                    "En editar no  puede ingresar más de un producto"
                                  );
                                  return;
                                }
                                setNewRegister((prev) => ({
                                  ...prev,
                                  products: [
                                    ...prev?.products,
                                    {
                                      loteNumber: "",
                                      quantity: "",
                                      expirationDate: "",
                                      description: "Sin novedad",
                                      conditionId: "",
                                      ...product,
                                      key: "",
                                    },
                                  ],
                                }));
                                // document.querySelector(`#loteNumber_${NewRegister.products.length-1}`).focus()
                                // console.log({product})
                                // setIsSearchHidden('hidden')
                              }}
                            >
                              <td className="p-2 px-6">{product.code}</td>
                              <td className="p-2 px-6"> {product.name}</td>
                              <td className="p-2 px-6">
                                {product.typePresentationName}
                              </td>
                              <td className="p-2 px-6">
                                {product.unitPerPackage}
                              </td>
                              <td className="p-2 px-6">
                                {product.concentrationSize}
                              </td>
                              <td className="p-2 px-6">
                                {product.medicamentName}
                              </td>
                              <td className="p-2 px-6">
                                {product.categoryName}
                              </td>
                              <td className="p-2 px-6">
                                {product.typeAdministrationName}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    )}
                  </table>
                </div>
              </div>
              <table>
                <thead className="border border-light w-full">
                  {/* <div className="parent_products  selected_products_cont border border-light"> */}

                  {/* <div className="header  px-2 py-1 bg-light text-dark text-xs grid grid-cols-subgrid px-30  items-center justify-between">
                  <p>#</p>
                  <p>Nro Lote</p>
                  <p>Cantidad</p>
                  <p>F. de vencimiento</p>
                  <p>Estado</p>
                  <p>Observación</p>
                  <p>Cód. produ.</p>
                  <p>Producto</p>
                  <p>T. de medicamento</p>
                  <p className="opacity-50">
                    <DeleteIcon />
                  </p>
                </div> */}
                  <tr className="header py-1 p-0 bg-light text-dark text-xs">
                    <th>#</th>
                    <th>Nro Lote</th>
                    <th>Cantidad</th>
                    <th>F. de vencimiento</th>
                    <th>Estado</th>
                    <th>Observación</th>
                    <th>Cód. produ.</th>
                    <th>Producto</th>
                    <th>T. de medicamento</th>
                    <th className="opacity-50">
                      <DeleteIcon />
                    </th>
                  </tr>
                </thead>
                {/* <div className="body px-2 grid grid-cols-subgrid px-30  items-center text-sm justify-between"> */}
                <tbody className="pl-5">
                  {NewRegister?.products?.map((product, i) => {
                    if (product.hasOwnProperty("key")) {
                      return (
                        <tr
                          key={product.id + "a" + i}
                          className="text-dark text-sm "
                        >
                          <td className="m">{i + 1}</td>
                          <td className="p-2 px-3  border-b border-opacity-80 min-w-[140px]  border-light">
                            <Input
                              label={"Nro lote"}
                              key={`loteNumber_${i}`}
                              value={NewRegister.products[i]?.loteNumber}
                              name={`loteNumber_${i}`}
                              id={`loteNumber_${i}`}
                              // data-index={i + 100}
                              size="small"
                              type={"text"}
                              onChange={handleChange}
                            />
                          </td>
                          <td className="p-2 px-3  border-b border-opacity-80 border-light">
                            <Input
                              size="small"
                              // data-index={i}
                              label={"Cantidad"}
                              required
                              key={`quantity_${i}`}
                              value={NewRegister.products[i]?.quantity}
                              name={`quantity_${i}`}
                              onChange={handleChange}
                              type={"number"}
                            />
                          </td>

                          <td className="p-2 px-3  border-b border-opacity-80 border-light">
                            <Input
                              size="small"
                              // data-index={i}
                              shrink="true"
                              type={"date"}
                              label={"F. de vencimiento"}
                              required
                              key={`expirationDate_${i}`}
                              value={NewRegister.products[i]?.expirationDate}
                              name={`expirationDate_${i}`}
                              onChange={handleChange}
                            />
                          </td>
                          <td className="p-2 px-3  border-b border-opacity-80 border-light">
                            <Input
                              size="small"
                              data-index={i}
                              select
                              label="Estado"
                              value={NewRegister.products[i]?.conditionId}
                              width={"100%"}
                              key={`conditionId_${i}`}
                              required
                              name={`conditionId_${i}`}
                              onChange={handleChange}
                            >
                              {generalData.conditions?.map((option) => (
                                <MenuItem key={option.id} value={option.id}>
                                  {option.name}
                                </MenuItem>
                              ))}
                            </Input>
                          </td>
                          <td className="p-2  pl-2 border-b border-opacity-80 border-light">
                            <Input
                              label={"Observación"}
                              key={`description_${i}`}
                              value={NewRegister.products[i]?.description}
                              name={`description_${i}`}
                              size="small"
                              multiline
                              className="text-xs"
                              // data-index={i}
                              onChange={(e) => {
                                if (e.target.value.trim().length < 150) {
                                  handleChange(e);
                                }
                              }}
                            />
                          </td>
                          <td className="p-2 px-3  border-b border-opacity-80 border-light">
                            {product.code}
                          </td>
                          <td className="p-2 px-3  border-b border-opacity-80 border-light">
                            <p>
                              <b>{product.name}</b>{" "}
                              {product.unitPerPackage != "N/A"
                                ? product.unitPerPackage
                                : ""}{" "}
                              {product.typePresentationName != "N/A"
                                ? product.typePresentationName
                                : ""}{" "}
                              {product.concentrationSize != "N/A"
                                ? product.concentrationSize
                                : ""}
                            </p>
                          </td>
                          <td className="p-2 px-3  border-b border-opacity-80 border-light">
                            <p>{product.medicamentName}</p>
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
                          key={product.id + product.loteNumber}
                          className="body px-2 bg-light px-30 bg-opacity-50 text-dark items-center text-sm justify-between"
                        >
                          <td className="p-2 px-3 pl-5 border-b border-opacity-80  border-light">
                            {i + 1}
                          </td>
                          <td className="p-2 px-3 pl-5 border-b border-opacity-80  border-light">
                            <p>{product.loteNumber}</p>
                          </td>
                          <td className="p-2 px-3 pl-5 border-b border-opacity-80  border-light">
                            <p>{product.quantity}</p>
                          </td>
                          <td className="p-2 px-3 pl-5 border-b border-opacity-80  border-light">
                            <p>{product.expirationDate}</p>
                          </td>
                          <td className="p-2 px-3 pl-5 border-b border-opacity-80  border-light">
                            <p>{product.conditionName}</p>
                          </td>
                          <td className="p-2 px-3 pl-5 border-b border-opacity-80  border-light">
                            <p>{product.description}</p>
                          </td>
                          <td className="p-2 px-3 pl-5 border-b border-opacity-80  border-light">
                            {product.code}
                          </td>
                          <td className="p-2 px-3 pl-5 border-b border-opacity-80  border-light">
                            <p>
                              <b>{product.name}</b> {product.unitPerPackage}{" "}
                              {product.typePresentationName}{" "}
                              {product.concentrationSize}
                            </p>
                          </td>
                          <td className="p-2 px-3 pl-5 border-b border-opacity-80  border-light">
                            <p>{product.medicamentName}</p>
                          </td>

                          <td className="p-2 px-2 border-b border-opacity-80  border-light">
                            <p></p>
                          </td>
                        </tr>
                      );
                    }
                  })}
                </tbody>
              </table>
            </div>

            {typeOfGuide == "nueva" && (
              <TextField
                label="Nro guia"
                value={NewRegister.guide}
                name="guide"
                onChange={(e) => {
                  handleChange(e);
                }}
                required
                type="number"
                key={5724}
              />
            )}
            <Input
              select
              label="Institución"
              readOnly={typeOfGuide == "nueva" ? false : true}
              disabled={typeOfGuide == "nueva" ? false : true}
              value={NewRegister?.organizationId}
              defaultValue={NewRegister?.organizationId || ""}
              // defaultValue=""
              width={"100%"}
              required
              name={"organizationId"}
              onChange={handleChange}
            >
              {generalData.organizations?.map((option) =>
                option.id != 1 ? (
                  <MenuItem key={option.id} value={option.id}>
                    {option.name}
                  </MenuItem>
                ) : (
                  ""
                )
              )}
            </Input>
            {/* <Input
              label={"Nro Guía"}
              readOnly={typeOfGuide == "nueva" ? false: true}
              disabled={typeOfGuide == "nueva" ? false: true}
              required
              key={2}
              value={NewRegister?.guide}
              name={"guide"}
              onChange={handleChange}
            /> */}

            <Input
              shrink="true"
              type={"date"}
              label={"Fecha de entrada"}
              readOnly={typeOfGuide == "nueva" ? false : true}
              disabled={typeOfGuide == "nueva" ? false : true}
              required
              value={NewRegister?.arrivalDate}
              name={"arrivalDate"}
              onChange={handleChange}
            />
            <Input
              shrink="true"
              type={"time"}
              label={"Hora de entrada"}
              readOnly={typeOfGuide == "nueva" ? false : true}
              disabled={typeOfGuide == "nueva" ? false : true}
              placeholder={"24h"}
              required
              value={NewRegister?.arrivalTime}
              name={"arrivalTime"}
              onChange={handleChange}
            />
            <Autocomplete
              options={Object.values(authorityptions)}
              getOptionLabel={(option) => option.authorityFullname}
              readOnly={typeOfGuide == "nueva" ? false : true}
              disabled={typeOfGuide == "nueva" ? false : true}
              value={NewRegister}
              inputValue={NewRegister?.authorityFullname || ""}
              onChange={handleOptionSelect}
              onInputChange={handleInputChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Nombre del encargado de recibir"
                  readOnly={typeOfGuide == "nueva" ? false : true}
                  disabled={typeOfGuide == "nueva" ? false : true}
                />
              )}
            />

            <TextField
              label="Cédula del encargado"
              readOnly={typeOfGuide == "nueva" ? false : true}
              disabled={typeOfGuide == "nueva" ? false : true}
              value={NewRegister.authorityCi}
              name="authorityCi"
              onChange={handleChange}
              required
              key={574}
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
        content={modalConfirm.content}
      />
    </>
  );
}
