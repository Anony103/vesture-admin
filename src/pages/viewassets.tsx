import { ReactElement } from "react";
import { Container } from "../components/shared/container";
import { IoIosArrowBack } from "react-icons/io";
// import { ActionIcon } from "../components/svg-icons/action-icon";
// import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import useMangeAssets from "@/hooks/use-manage-assests";
const style = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  borderRadius: 1,
  boxShadow: 24,
  p: 2,
};
function ViewAssets(): ReactElement {
  // const [customerType, setCustomerType] = useState("assets");
  const navigate = useNavigate();
  // const [open, setOpen] = useState(false);
  // const handleOpen = () => setOpen(true);
  // const handleClose = () => setOpen(false);
  const { id } = useParams();

  const {
    assetDetails,
    // assetDetailsLoading,
    // assetDetailsError,
    handleDeleteAsset,
    // currentPage,
    // setCurrentPage,
    // totalPages,
    // startDate,
    // endDate,
    // setStartDate,
    // setEndDate,
    // handleEndDateChange,
    // handleStartDateChange,
    open,
    handleClose,
    handleToggleModal,
    isLoading,
    MODAL_TYPE,
    modalState,
  } = useMangeAssets(id);

  console.log(assetDetails);
  return (
    <Container>
      <div className="min-h-screen p-4 md:p-6">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div
              onClick={() => navigate(-1)}
              className="flex gap-2 items-center text-xs cursor-pointer text-gray-600 hover:text-black"
            >
              <IoIosArrowBack />
              Back
            </div>
          </div>

          {/* Asset Card */}
          <div className="bg-white rounded-lg p-5 md:p-6 flex flex-col md:flex-row gap-6">
            {/* Image */}
            <div className="md:w-[35%] w-full">
              {assetDetails?.imageUrl ? (
                <img
                  src={assetDetails?.imageUrl && assetDetails?.imageUrl}
                  alt={assetDetails?.name}
                  className="w-full h-[220px] object-cover rounded-md border"
                />
              ) : (
                <div className="w-full h-[220px] rounded-md border flex items-center justify-center bg-[#F6EBFE] text-[#7C2EBF] text-xs">
                  No Image Available
                </div>
              )}
            </div>

            {/* Details */}
            <div className="md:w-[65%] w-full flex flex-col gap-4">
              <div className="flex flex-row justify-between">
                <h1 className="text-lg font-bold">{assetDetails?.name}</h1>
                <p
                  className="text-[#E70E02] text-xs cursor-pointer"
                  onClick={() =>
                    handleToggleModal(MODAL_TYPE.DELETE_ASSET, null)
                  }
                >
                  Delete Asset
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#F6EBFE] rounded-md p-3 text-center">
                  <p className="text-[#7C2EBF] font-bold text-sm">
                    ₦{assetDetails?.amount?.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">Amount</p>
                </div>

                <div className="bg-[#F6EBFE] rounded-md p-3 text-center">
                  <p className="text-[#7C2EBF] font-bold text-sm">
                    {assetDetails?.maxTenor} Months
                  </p>
                  <p className="text-xs text-gray-500">Max Tenor</p>
                </div>

                <div className="bg-[#F6EBFE] rounded-md p-3 text-center">
                  <p className="text-[#7C2EBF] font-bold text-sm">
                    {assetDetails?.availableUnits}
                  </p>
                  <p className="text-xs text-gray-500">Available Units</p>
                </div>

                <div className="bg-[#F6EBFE] rounded-md p-3 text-center">
                  <p className="text-[#7C2EBF] font-bold text-sm">Active</p>
                  <p className="text-xs text-gray-500">Status</p>
                </div>
              </div>

              {/* Description */}
              <div className="border rounded-md p-4">
                <p className="text-xs font-semibold text-gray-600 mb-1">
                  Description
                </p>
                <p className="text-sm text-gray-700">
                  {assetDetails?.description || "No description provided"}
                </p>
              </div>

              {/* Meta */}
              <div className="text-xs text-gray-500">
                Created on:{" "}
                {new Date(assetDetails?.created_on).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          {/* <h1 className="font-bold text-medium mb-2">Create Sub Category</h1> */}

          {/* Subcategory Form */}

          {modalState === MODAL_TYPE.DELETE_ASSET && (
            <>
              <h1 className="font-bold text-medium mb-3 text-red-600">
                Delete Asset
              </h1>

              <p className="text-xs text-gray-600 mb-4">
                Are you sure you want to delete this asset? This action
                cannot be undone.
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={handleClose}
                  className="text-xs px-4 py-2 border rounded-md"
                >
                  Cancel
                </button>

                <button
                  onClick={() => handleDeleteAsset(id)}
                  disabled={isLoading}
                  className="text-xs px-4 py-2 bg-red-600 text-white rounded-md"
                >
                  {isLoading ? "Deleting..." : "Delete"}
                </button>
              </div>
            </>
          )}
        </Box>
      </Modal>
    </Container>
  );
}

export default ViewAssets;
