import { Container } from "../components/shared/container";
// import { useRoleAccess } from "@/hooks";
import { DataTable } from "../components/shared/data-table";
import { ColumnDef } from "@tanstack/react-table";

// import { ActionIcon } from "../components/svg-icons/action-icon";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import { modalSx, modalSlotProps } from "@/components/shared/modal-style";
import { IoEyeOutline } from "react-icons/io5";
import { IoEyeOffOutline } from "react-icons/io5";
// import TabItem from "@/components/tabItem";
// import { Tabs } from "@/data/ItemData";
// import { toast } from "react-toastify";
import { Input } from "@/components/ui/input";
import { ClipLoader } from "react-spinners";
import { ErrorPage } from "@/components/errorpage";
import useMangeUser from "@/hooks/use-manage-admin";
import { AdminUser } from "@/types/general-type";
import { RowMenu } from "@/components/shared/row-menu";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select"; // Adjust the import path as needed


const Admin = () => {
  const {
    register,
    onSubmit,
    handleSubmit,
    open,
    errors,
    // customerType,
    // setCustomerType,
    isLoading,
    allAdminsLoading,
    allAdmins,
    allAdminError,
    setVisibility,
    visibility,
    handleClose,
    handleToggleModal,
    modalState,
    MODAL_TYPE,
    setCurrentPage,
    totalPages,
    currentPage,
    // setTotalPages
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    handleEndDateChange,
    handleStartDateChange,
    onUpdateStatus,
    exportAdminsToExcel,
    roles,
    setPageSize,
    pageSize
    // ... other values
  } = useMangeUser();

  if (allAdminsLoading)
    return (
      <div className="flex justify-center items-center">
        <ClipLoader />
      </div>
    ); // Prevent undefined data access
  if (allAdminError) return <ErrorPage />;

  const columns: ColumnDef<AdminUser>[] = [
    // {
    //   accessorKey: "id",
    //   header: "ID",
    // },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => row.original.email || "-",
    },
    {
      header: "Roles",
      cell: ({ row }) => {
        const roles =
          row.original.roles?.map((role) => role.name.replace("ROLE_", "")) ||
          [];
        return roles.join(", ") || "-";
      },
    },
    {
      accessorKey: "created_on",
      header: "Created On",
      cell: ({ row }) => new Date(row.original.created_on).toLocaleDateString(),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        if (!row.original.enabled)
          return <span className="v-chip v-chip-bad">Inactive</span>;
        return <span className="v-chip v-chip-ok">Active</span>;
      },
    },
    {
      accessorKey: "status",
      header: () => <span></span>,
      cell: ({ row }) => {
        const data = row.original;
        return (
          <RowMenu
            items={[
              { label: "Activate", hidden: !!row.original.enabled, onSelect: () => handleToggleModal(MODAL_TYPE.UPDATE_ADMIN, data, true) },
              { label: "Deactivate", hidden: !row.original.enabled, onSelect: () => handleToggleModal(MODAL_TYPE.UPDATE_ADMIN, data, false) },
            ]}
          />
        );
      },
    },
  ];

  return (
    <Container>
      <article className=" mt-6 min-h-screen">
        <div className="w-[100%] flex flex-row justify-between">
          <div></div>
          <div>
            <button
              onClick={() => handleToggleModal(MODAL_TYPE.CREATE_ADMIN, null)}
              className=" text-xs flex bg-[#7C2EBF] py-3 px-4 text-white rounded-md"
            >
              Create User Role
            </button>
          </div>
        </div>
        <div className=" bg-white pb-2 rounded-md mt-2 h-auto">
          <div className="flex flex-col gap-3 border-b border-line px-4 py-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-row flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-600">From:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={handleStartDateChange}
                  className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#7C2EBF]"
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-600">To:</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={handleEndDateChange}
                  className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#7C2EBF]"
                />
              </div>

              {(startDate || endDate) && (
                <button
                  onClick={() => {
                    setStartDate("");
                    setEndDate("");
                  }}
                  className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded-md"
                >
                  Clear
                </button>
              )}
            </div>

            <button
              onClick={exportAdminsToExcel}
              disabled={allAdminsLoading}
              className="text-xs flex bg-[#7C2EBF] py-3 px-4 text-white rounded-md"
            >
              Export As Excel
            </button>
          </div>
          <DataTable
            data={allAdmins}
            columns={columns}
            loading={allAdminsLoading}
            error={allAdminError}
            useApiPagination={true}
            totalPages={totalPages || 1}
            currentPage={currentPage}
            onPageChange={(newPage) => setCurrentPage(newPage)}
            setPageSize = {setPageSize}
            pageSize = {pageSize}
          />
        </div>
        <div></div>
      </article>

      <Modal
        slotProps={modalSlotProps}
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modalSx(500)}>
          <h1 className="font-bold text-lg">
            {modalState === MODAL_TYPE.CREATE_ADMIN ? "Create Admin" : "Admin"}
          </h1>
          <div className="flex flex-col gap-5 mt-3">
            {modalState === MODAL_TYPE.CREATE_ADMIN ? (
              <form
                className="flex flex-col  gap-5"
                onSubmit={handleSubmit(onSubmit)}
              >
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold">Email</label>
                    <Input
                      className="bg-transparent text-xs border border-gray-300 h-[40px] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7C2EBF] focus:border-transparent px-2 py-2 rounded-md"
                      placeholder="example@email.com"
                      id="email"
                      {...register("username")}
                      type="email"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold">Name</label>
                    <Input
                      className="bg-transparent text-xs border border-gray-300 h-[40px] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7C2EBF] focus:border-transparent px-2 py-2 rounded-md"
                      placeholder="john doe"
                      id="name"
                      {...register("name")}
                      type="name"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold">
                      Phone Number
                    </label>
                    <Input
                      className="bg-transparent text-xs border border-gray-300 h-[40px] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7C2EBF] focus:border-transparent px-2 py-2 rounded-md"
                      placeholder="+234"
                      id="phone"
                      {...register("phone")}
                      type="number"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold">
                      Staff Number
                    </label>
                    <Input
                      className="bg-transparent text-xs border border-gray-300 h-[40px] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7C2EBF] focus:border-transparent px-2 py-2 rounded-md"
                      placeholder="245654"
                      id="staffNumber"
                      {...register("staffNumber")}
                      type="string"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold">Role</label>
                    <select
                      {...register("role", { required: "Role is required" })}
                      className="bg-transparent text-xs border border-gray-300 h-[40px] focus:outline-none focus:ring-2 focus:ring-[#7C2EBF] focus:border-transparent px-2 py-2 rounded-md"
                    >
                      <option value="">Select role</option>
                      {roles?.map((role) => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>

                    {errors?.role && (
                      <span className="text-[10px] text-red-500">
                        {errors.role.message}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs">Password</label>
                    <Input
                      type={visibility ? "text" : "password"}
                      {...register("password")}
                      error={errors?.password?.message}
                      name="password"
                      className="bg-transparent text-xs border border-gray-300 h-[40px] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7C2EBF] focus:border-transparent px-2 py-2 rounded-md pr-10"
                      id="Password"
                      placeholder="Password"
                      rightIcon={
                        <button
                          onClick={() => setVisibility(!visibility)}
                          type="button"
                        >
                          {visibility ? <IoEyeOutline /> : <IoEyeOffOutline />}
                        </button>
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs">Confirm Password</label>
                    <Input
                      type={visibility ? "text" : "password"}
                      {...register("confirmPassword")}
                      error={errors?.password?.message}
                      name="confirmPassword"
                      className="bg-transparent text-xs border border-gray-300 h-[40px] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7C2EBF] focus:border-transparent px-2 py-2 rounded-md pr-10"
                      id="Password"
                      placeholder="Password"
                      rightIcon={
                        <button
                          onClick={() => setVisibility(!visibility)}
                          type="button"
                        >
                          {visibility ? <IoEyeOutline /> : <IoEyeOffOutline />}
                        </button>
                      }
                    />
                  </div>
                </div>
                <div>
                  <button
                    type="submit"
                    className="text-xs flex bg-[#7C2EBF] py-3 px-4 text-white rounded-md hover:opacity-80"
                  >
                    {isLoading ? (
                      <ClipLoader color="white" size="20" />
                    ) : (
                      "Create Admin"
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex flex-col gap-5">
                {/* <div className="flex flex-col gap-1">
                  <label className="text-xs">Status</label>
                  <Select
                    value={watch("status")}
                    onValueChange={(value) => setValue("status", value)}
                  >
                    <SelectTrigger className="text-xs h-[40px] border-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-[#7C2EBF] focus:border-transparent">
                      <SelectValue placeholder="Select status..." />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="active" className="text-xs">
                        Active
                      </SelectItem>
                      <SelectItem value="inactive" className="text-xs">
                        Inactive
                      </SelectItem>
                      <SelectItem value="suspended" className="text-xs">
                        Suspended
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div> */}

                <p className="text-sm text-gray-600">
                  Do you want to change the status?
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => onUpdateStatus()}
                    disabled={isLoading}
                    className="text-xs flex-1 bg-[#7C2EBF] py-3 px-4 text-white rounded-md hover:opacity-80 disabled:opacity-50"
                  >
                    {isLoading ? <ClipLoader color="white" size="20" /> : "Yes"}
                  </button>
                  <button
                    onClick={handleClose}
                    disabled={isLoading}
                    className="text-xs flex-1 bg-gray-300 py-3 px-4 text-gray-700 rounded-md hover:opacity-80 disabled:opacity-50"
                  >
                    No
                  </button>
                </div>
              </div>
            )}
          </div>
        </Box>
      </Modal>
    </Container>
  );
};

export default Admin;
