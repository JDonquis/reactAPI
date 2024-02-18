<Button3D
className="mt-2"
color={"blue1"}
text="Nueva Salida"
icon={"add"}
fClick={(e) => {
  if (submitStatus == "Editar") {
    setNewRegister({
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
  
  <Autocomplete
    options={Object.values(dispatchersOptions)}
    getOptionLabel={(option) => option.dispatcherFullName}
    value={NewRegister}
    inputValue={NewRegister.dispatcherFullName}
    onChange={handleOptionSelect}
    onInputChange={handleInputChange}
    renderInput={(params) => (
      <TextField {...params} label="Despachador" />
    )}
  />

  <TextField
    label="Cédula del despachador"
    value={NewRegister.dispatcherCI}
    name="dispatcherCI"
    onChange={handleChange}
    required
    key={574}
  />
   <Input
    select
    label="Destino"
    value={NewRegister?.organizationId}
    defaultValue={NewRegister?.organizationId || ""}
    // defaultValue=""
    width={"100%"}
    required
    name={"organizationId"}
    onChange={handleChange}
  ></Input>
  <Input
    shrink="true"
    type={"date"}
    label={"Fecha de entrada"}
    required
    value={NewRegister?.arrivalDate}
    name={"arrivalDate"}
    onChange={handleChange}
  />
<Input
    shrink="true"
    type={"time"}
    label={"Hora de entrada"}
    placeholder={"24h"}
    required
    value={NewRegister?.arrivalTime}
    name={"arrivalTime"}
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