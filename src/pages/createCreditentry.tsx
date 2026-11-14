import Backbutton from "../components/shared/backbutton";
import Button from "../components/shared/button";
import { Container } from "../components/shared/container";
import CustomFileUpload from "@/components/shared/CustomFileUpload";
import useCreditEntry from "@/hooks/use-credit-entry";
import { UploadResultDialog } from "@/components/shared/upload-result-dialog";

const CreateCredit = () => {
  //   const navigate = useNavigate();
  const {
    handleFileRemove,
    handleFileUpload,
    isLoading,
    file,
    handleFileChange,
    uploadResult,
    clearUploadResult,
  } = useCreditEntry();

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
          <div className="mb-4 rounded-md border border-gray-200 bg-gray-50 p-3 text-xs text-gray-700 space-y-1">
            <p>
              Columns: <span className="font-semibold">Name, Unique Id (BVN), Amount, Investment Type, Period</span>. Investment Type is SMALLVEST, TARGET_LOCK, SMART_LOCK
              or BUY_NOW_PAY_LATER (the older names SAVE_SMALL_SMALL and TARGET_SAVINGS are accepted too).
            </p>
            <p>
              <span className="font-semibold">Period</span> (for example 2026-11) is the payroll month. A plan is credited once per period, so uploading the
              same file again changes nothing. Leave it empty to use the current month.
            </p>
            <p>
              A credit goes to the customer&apos;s oldest open plan of that type. It is refused if it would take a Target Lock or Smart Lock past its amount,
              or a purchase past what is owed. A plan is activated at the bank once it holds ₦50,000 (a purchase starts once its initial payment is in).
              Use <span className="font-semibold">Salary Invest</span> to see who to deduct and download the expected amounts.
            </p>
          </div>
          <CustomFileUpload
            label="Credit Entry"
            description="Upload your spreadsheet file here"
            handleFileChange={handleFileChange}
            handleFileRemove={handleFileRemove}
            file={file}
            uploading={isLoading}
            field="assetSheet"
            sampleDownload="/sample/sample_credit_entries.csv"
          />
          <div className="mt-4">
            <Button
              type="button"
              onClick={handleFileUpload}
              color="purple"
              name="Create Credit Entry"
              loading={isLoading}
            />
          </div>
        </div>
      </div>
      <UploadResultDialog result={uploadResult} onClose={clearUploadResult} subject="Credit entries" />
    </Container>
  );
};

export default CreateCredit;
