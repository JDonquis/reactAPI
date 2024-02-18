import React, {
  useEffect,
  useLayoutEffect,
  useState,
  useRef,
  useCallback,
  lazy,
  Suspense,
} from "react";
// import "../css/basics.css";

import MUIDataTable from "mui-datatables";
// import { debounceSearchRender } from "../components/DebounceSearchRender";

import axios from "../api/axios";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SettingsIcon from "@mui/icons-material/Settings";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

// import Chip from '@material-ui/core/Chip';
import { IconButton, TextField, Autocomplete, MenuItem } from "@mui/material";
import Modal from "../components/Modal";
import ConfirmModal from "../components/ConfimModal";
import Alert from "../components/Alert";
import Input from "../components/Input";
import Button3D from "../components/Button3D";
import CircularProgress from "@mui/material/CircularProgress";
import { NavLink } from "react-router-dom";
import useDebounce from "../components/useDebounce";

export default function Products_crud(props) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = "SISMED | Productos";
  }, []);

  const [data, setData] = useState([]);

  const [typePresentations, setTypePresentations] = useState([]);
  const [TypeAdministrations, setTypeAdministrations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [Medicaments, setMedicaments] = useState([]);

  const [open, setOpen] = useState(false);
  const [modalConfirm, setModalConfirm] = useState({
    isOpen: false,
    modalInfo: false,
  });

  const [newProduct, setnewProduct] = useState({
    code: "",
    id: "",
    name: "",
    minimumStock: 100,
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
      name: "code",
      label: "Cód.",
      options: {
        filter: false,
      },
    },
    {
      name: "name",
      label: "Nombre",
      options: {
        filter: false,
      },
    },

    {
      name: "categoryName",
      label: "Categoria",
      options: {
        filter: true,
        filterList: parametersURL?.filterList[2] || [],
        sort: true,
        filterOptions: {
          names: categories ? categories.map((ent) => ent.name) : [""],
        },
      },
    },
    {
      name: "medicamentName",
      label: "T. de medicamento",
      options: {
        filter: true,
        filterList: parametersURL?.filterList[3] || [],
        sort: true,
        filterOptions: {
          names: Medicaments ? Medicaments.map((ent) => ent.name) : [""],
        },
      },
    },
    {
      name: "typePresentationName",
      label: "T. de presentación",
      options: {
        filter: true,
        filterList: parametersURL?.filterList[4] || [],
        sort: true,
        filterOptions: {
          names: typePresentations
            ? typePresentations.map((ent) => ent.name)
            : [""],
        },
      },
    },
    {
      name: "typeAdministrationName",
      label: "T. de administración",
      options: {
        filter: true,
        filterList: parametersURL?.filterList[5] || [],
        sort: true,
        filterOptions: {
          names: TypeAdministrations
            ? TypeAdministrations.map((ent) => ent.name)
            : [""],
        },
      },
    },
    {
      name: "unitPerPackage",
      label: "Unidades x envase",
      options: {
        filter: false,
      },
    },
    {
      name: "concentrationSize",
      label: "Concentración / tamaño",
      options: {
        filter: false,
      },
    },
  ];

  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  useEffect(() => {
    if (isButtonDisabled) {
      setIsButtonDisabled(false)
    }
  
    return () => {
      ''
    }
  }, [newProduct])
  

  const [totalData, setTotalData] = useState([0]);
  // const [filterObject, setFilterObject] = useState({})
  let filterObject = {};

  const handleSearch = useDebounce((searchText) => {
    // Perform search operation with the debounced term
    setParametersURL((prev) => ({ ...prev, search: searchText }));
  }, 800);
  useEffect(() => {
    let url = `dashboard/products?relation=${relation}`;
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
    console.log(url);
    getData(url);
    // url += `search?${parametersURL.search}`
    // console.log(parametersURL)
  }, [parametersURL]);

  const deleteRegister = async (id_user, fnEmptyRows) => {
    try {
      await axios.delete(`dashboard/products/${id_user}`).then((response) => {
        setData((prev) => prev.filter((eachU) => eachU.id != id_user));
        fnEmptyRows([]);
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
        if (changedColumn === "categoryName") {
          filterObject[changedColumn] =
            `&category[name]=` +
            encodeURIComponent(
              arrValues
                // .map((v) => categories.find((obj) => obj.name == v).id)
                .join()
                .replaceAll(",", "[OR]")
            );
        } else if (changedColumn == "medicamentName") {
          filterObject[changedColumn] =
            `&medicament[name]=` +
            encodeURIComponent(
              arrValues
                // .map((v) => Medicaments.find((obj) => obj.name == v).id)
                .join()
                .replaceAll(",", "[OR]")
            );
        } else if (changedColumn == "typePresentationName") {
          filterObject[changedColumn] =
            `&typePresentation[name]=` +
            encodeURIComponent(
              arrValues
                // .map((v) => typePresentations.find((obj) => obj.name == v).id)
                .join()
                .replaceAll(",", "[OR]")
            );
        } else if (changedColumn == "typeAdministrationName") {
          filterObject[changedColumn] =
            `&typeAdministration[name]=` +
            encodeURIComponent(
              arrValues
                // .map((v) => TypeAdministrations.find((obj) => obj.name == v).id)
                .join()
                .replaceAll(",", "[OR]")
            );
        }
        // filterObject[changedColumn] = `&${changedColumn}=${encodeURIComponent(arrValues.join().replaceAll(',', '[OR]'))}`;
      } else {
        delete filterObject[changedColumn]; // Elimina la propiedad del objeto si no hay valores seleccionados
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
        {/* <button className="bg-blue3 text-blue1 font-bold px-2"
          onClick={(e) => {

          }}
        >
          Entrada
          <ArrowDownwardIcon />
        </button> */}
        <IconButton
          title="Editar"
          onClick={async () =>{
           await editIconClick(selectedRows, displayData, setSelectedRows, "Crear")
            setIsButtonDisabled(true)
          }}
        >
          <ContentCopyIcon />
        </IconButton>

        <IconButton
          title="Editar"
          onClick={() =>{
            editIconClick(selectedRows, displayData, setSelectedRows, "Editar")
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

  function editIconClick(selectedRows, displayData, setSelectedRows, submitText) {
    const indx = selectedRows.data[0].dataIndex;
    const dataOfIndx = data[indx];
    setnewProduct({
      ...dataOfIndx,
      categoryObj: { name: dataOfIndx.categoryName, id: dataOfIndx.categoryId },
      medicamentObj: {
        name: dataOfIndx.medicamentName,
        id: dataOfIndx.medicamentId,
      },
      typePresentationObj: {
        name: dataOfIndx.typePresentationName,
        id: dataOfIndx.typePresentationId,
      },
      typeAdministrationObj: {
        name: dataOfIndx.typeAdministrationName,
        id: dataOfIndx.typeAdministrationId,
      },
    });
    setOpen(true);
    setSubmitStatus(submitText);
  }

  const handleAutoComplete = (newValue, name) => {
    if (newValue != null) {
      if (name == "category" && newValue.id == 2) {
        setnewProduct((prev) => ({
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
        setnewProduct((prev) => ({
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
      console.log(response.data);
      setTotalData(data.total);

      // console.log(response.data.products)
      // console.log(response.data.typePresentation)
      setData(response.data.products);
      if (relation == true) {
        setTypePresentations(response.data.typePresentations);
        setTypeAdministrations(response.data.typeAdministrations);
        setCategories(response.data.categories);
        setMedicaments(response.data.medicaments);
      }
      setIsLoading(false);
      setRelation(false);
    });
  };

  const [submitStatus, setSubmitStatus] = useState("Crear");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const search = `${newProduct.name} ${newProduct.code} ${newProduct.unitPerPackage} ${newProduct.concentrationSize} ${newProduct.categoryObj.name} ${newProduct.medicamentObj.name} ${newProduct.typePresentationObj.name} ${newProduct.typeAdministrationObj.name}`;
    try {
      setnewProduct((prev) => ({
        ...prev,
        search: search,
      }));
      console.log(newProduct);
      if (submitStatus === "Crear") {
        setSubmitStatus("cargando...");
        await axios
          .post(`/dashboard/products`, { ...newProduct, search })
          .then((response) => {
            // const client = response.data.client;
            // client.array_areas = client.areas.map((a) => a.name);
            // client.blood_name = client.blood_types.name;
            // setData((prev) => [client, ...prev]);
          });
        setAlert({
          open: true,
          status: "Exito",
        });
        setSubmitStatus("Crear");
      }
      if (submitStatus === "Editar") {
        setSubmitStatus("cargando...");
        await axios
          .put(`/dashboard/products/${newProduct.id}`, {
            ...newProduct,
            search,
          })
          .then((response) => {
            setAlert({
              open: true,
              status: "Exito",
            });
          });
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
      setnewProduct({
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
        minimumStock: 100,
      });
    } catch (error) {
      setAlert({
        open: true,
        status: "Error",
        message: `Algo salió mal`,
      });
      setSubmitStatus(() => (newProduct.id > 0 ? "Editar" : "Crear"));
    }
  };

  console.log(parametersURL);

  const [tabla, setTabla] = useState();
  useEffect(() => {
    setTabla(
      <MUIDataTable
        isRowSelectable={true}
        title={
          <div>
            <div className="flex min-h-[55px]  pt-3">
              <h1 className="text-grey text-xl relative top-1 ">Productos</h1>
            </div>
          </div>
        }
        data={data}
        columns={columns}
        options={options}
      />
    );
  }, [data]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setnewProduct((prev) => ({ ...prev, [name]: value }));
  }, []);
  console.log(newProduct);
  const [alert, setAlert] = useState({
    open: false,
    status: "",
    message: "",
  });

  return (
    <>
      <div className="flex justify-between pr-10 mt-10 items-center ">
        <Button3D
          className="mt-2"
          color={"blue1"}
          text="Nuevo producto"
          icon={"add"}
          fClick={(e) => {
            if (submitStatus == "Editar") {
              setnewProduct({
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
                minimumStock: 100,
                typeAdministrationObj: { name: "N/A", id: 1 },
              });
              console.log(newProduct);
            }
            setOpen(true);
            setSubmitStatus("Crear");
          }}
        />
        <NavLink to={"/dashboard/productos/config_products"}>
          <SettingsIcon className="mx-2" />
          Configuración de productos
        </NavLink>
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
              label={"Nombre"}
              required
              key={0}
              value={newProduct?.name}
              name={"name"}
              onChange={handleChange}
            />

            <Autocomplete
              value={newProduct?.categoryObj}
              options={categories}
              name="categoryId"
              getOptionLabel={(option) => option.name}
              // defaultValue={[Medicaments[0]]}
              filterSelectedOptions
              renderInput={(params) => (
                <TextField
                  required
                  {...params}
                  variant="outlined"
                  label="Categoria"
                  placeholder="Favorites"
                />
              )}
              onChange={(event, newValue) =>
                handleAutoComplete(newValue, "category")
              }
            />
            {newProduct.categoryId === 1 && (
              <Autocomplete
                value={newProduct?.medicamentObj}
                options={Medicaments}
                name="medicamentId"
                getOptionLabel={(option) => option.name}
                // defaultValue={[Medicaments[0]]}
                filterSelectedOptions
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    label="T. de medicamento"
                    required
                    placeholder="Favorites"
                  />
                )}
                onChange={(event, newValue) =>
                  handleAutoComplete(newValue, "medicament")
                }
              />
            )}

            <Autocomplete
              value={newProduct?.typePresentationObj}
              options={typePresentations}
              name="typePresentationId"
              getOptionLabel={(option) => option.name}
              // defaultValue={[Medicaments[0]]}
              filterSelectedOptions
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  label="Presentación"
                  placeholder="Favorites"
                />
              )}
              onChange={(event, newValue) =>
                handleAutoComplete(newValue, "typePresentation")
              }
            />

            <Autocomplete
              value={newProduct?.typeAdministrationObj}
              options={TypeAdministrations}
              name="typeAdministrationId"
              getOptionLabel={(option) => option.name}
              // defaultValue={[TypeAdministrations[0]]}
              filterSelectedOptions
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  label="Administración"
                  placeholder="Favorites"
                />
              )}
              onChange={(event, newValue) =>
                handleAutoComplete(newValue, "typeAdministration")
              }
            />

            <Input
              key={5}
              label={"Unidad por envase"}
              type="number"
              name={"unitPerPackage"}
              value={newProduct?.unitPerPackage}
              onChange={(e) => {
                if (e.target.value >= 0) handleChange(e);
              }}
            />
            <Input
              key={1}
              label={"Concentración / tamaño"}
              type="text"
              name={"concentrationSize"}
              value={newProduct?.concentrationSize}
              onChange={handleChange}
            />
            <Input
              key={7}
              label={"Alertar cuando hayan menos de:"}
              type="number"
              name={"minimumStock"}
              value={newProduct?.minimumStock}
              onChange={(e) => {
                if (e.target.value >= 0) handleChange(e);
              }}
            />

            <Button3D
              className="mt-2 col-span-2"
              color={"blue1"}
              disabled={isButtonDisabled}
              type={'submit'}
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
