import Backbutton from "../components/shared/backbutton";
import Button from "../components/shared/button";
import { Container } from "../components/shared/container";
import CustomFileUpload from "@/components/shared/CustomFileUpload";
// import useCreditEntry from "@/hooks/use-credit-entry";
import useEmployeeInfo from "@/hooks/use-employee-info";

const CreateEmployeeInformation = () => {
  //   const navigate = useNavigate();
  const {
    handleFileRemove,
    handleFileUpload,
    isLoading,
    file,
    handleFileChange,
  } = useEmployeeInfo();

  return (
    <Container>
      <div className="flex flex-col gap-4 min-h-screen">
        <div className="flex justify-between items-center">
          <Backbutton />
          <div></div>
        </div>
        <div className="bg-white rounded-md w-[100%] p-4">
          {/* <section>
              <article>
                <div className="flex text-sm font-semibold">Credit Entry</div>
                <label className="flex flex-col justify-center item-center h-45 border border-dotted border-[#A8A8A8] text-[#E4E4E4] font-semibold w-[100%] mt-2 rounded">
                  <div className="mx-auto w-[20%] text-center mt-10 flex flex-col">
                    <div className="flex item-center justify-center">
                      <img
                        src={fileicon}
                        alt="fileIcon"
                        className="item-center text-sm "
                      />
                    </div>
                    <p className="text-[#E4E4E4] font-medium text-sm">
                      Click to upload or drag and drop file here
                    </p>
                  </div>

                  <input
                    type="file"
                    //   onChange={handleFileChange}
                    className="mb-4 invisible p-2 border"
                    accept=".jpg, .jpeg, .png"
                    //   disabled={fileUploaded}
                  />
                </label>
              </article>
              <div className="mt-2">
                <span className="text-[#434343] text-sm flex gap-1">Click <p className="text-[#7C2EBF] cursor-pointer hover:underline">here to download</p> a sample of the acceptable spreadsheet</span>
              </div>
            </section> */}
          <CustomFileUpload
            label="Staff Information"
            description="Upload your spreadsheet file here"
            handleFileChange={handleFileChange}
            handleFileRemove={handleFileRemove}
            file={file}
            uploading={isLoading}
            field="assetSheet"
            sampleDownload="/sample/employeeInfo_template.xlsx"
          />
          <div className="mt-4">
            <Button
              type="button"
              onClick={handleFileUpload}
              color="purple"
              name="Upload Staff Information"
              loading={isLoading}
            />
          </div>
        </div>
      </div>
    </Container>
  );
};

export default CreateEmployeeInformation;
