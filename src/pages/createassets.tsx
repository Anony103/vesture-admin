import Backbutton from "../components/shared/backbutton";
import Button from "../components/shared/button";
import { Container } from "../components/shared/container";
import fileicon from "../assets/fileicon.svg";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectValue,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import useMangeAssets from "@/hooks/use-manage-assests";
import CustomFileUpload from "@/components/shared/CustomFileUpload";
import useMangeAssetsCategories from "@/hooks/use-manage-categories";
// import { Controller } from 'react-hook-form';
import { AssetCategory } from "@/types/table-type";
import { Trash2 } from "lucide-react";
import { AssetType } from "@/types/table-type";
const Createassets = () => {
  //   const navigate = useNavigate();
  const {
    handleSubmit,
    register,
    onSubmit,
    watch,
    setValue,
    errors,
    isLoading,
    typeToCreate,
    handleCreateBulk,
    handleCreateSingle,
    handleFileChange,
    handleFileRemove,
    file,
    handleFileUpload,
    setSelectedCategory,
    // selectedCategory
    preview,
    setPreview,
    // editMode,
  } = useMangeAssets();
  const {
    allAssetsCategoriesLoading,
    allAssetsCategoriesError,
    allAssetsCategories,
  } = useMangeAssetsCategories();
  console.log(allAssetsCategories);

  const rawAmount = watch("amount");
  let assetSelected: AssetType | null = null; // or whatever type/default you expect

  const stored = sessionStorage.getItem("selectedAsset");
  if (stored) {
    try {
      assetSelected = JSON.parse(stored);
    } catch (error) {
      console.error("Invalid JSON in sessionStorage for selectedAsset:", error);
      // Optionally clear corrupted data
      sessionStorage.removeItem("selectedAsset");
    }
  }

  return (
    <Container>
      <div className="flex flex-col gap-4 min-h-screen">
        <div className="flex justify-between items-center">
          <Backbutton />
          <div></div>
        </div>
        <div className="bg-white rounded-md w-[100%] p-4">
          <div className="flex flex-row justify-between items-center">
            {typeToCreate === "single" ? (
              <h1 className="font-bold text-lg">Single Assets</h1>
            ) : typeToCreate === "bulk" ? (
              <h1 className="font-bold text-lg">Bulk Assets</h1>
            ) : (
              ""
            )}

            <div>
              {typeToCreate === "single" ? (
                <Button
                  color="lightpurple"
                  onClick={handleCreateBulk}
                  name="Upload Bulk"
                />
              ) : typeToCreate === "bulk" ? (
                <Button
                  color="lightpurple"
                  onClick={handleCreateSingle}
                  name="Upload Single"
                />
              ) : (
                ""
              )}
            </div>
          </div>
          {typeToCreate === "single" ? (
            <form onSubmit={handleSubmit(onSubmit)}>
              <section className="grid md:grid-cols-3 gap-x-6 gap-y-6 mt-4">
                {/* Asset Name */}
                <Input
                  label="Asset Name"
                  placeholder="Asset Name"
                  className="text-xs h-[40px]"
                  error={errors?.name?.message}
                  {...register("name")}
                />

                {/* Category */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold">Category</label>
                  <Select
                    key = {watch("category")}
                    value={watch("category")}
                    onValueChange={(val) => {
                      const selectedCategory = allAssetsCategories?.find(
                        (cat: AssetCategory) => cat.id === val
                      );
                      setValue("category", val); // still store the ID if you want
                      setSelectedCategory(selectedCategory);
                      // setValue("category", selectedCategory?.name);
                    }}
                  >
                    <SelectTrigger className="h-[40px] text-xs">
                      <SelectValue placeholder="SELECT ONE" />
                    </SelectTrigger>
                    <SelectContent>
                      {!allAssetsCategoriesLoading &&
                      !allAssetsCategoriesError &&
                      allAssetsCategories?.length > 0 ? (
                        allAssetsCategories.map((cat: AssetCategory) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="p-2 text-xs text-gray-400">
                          {allAssetsCategoriesError
                            ? "Failed to load"
                            : "No categories found"}
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-red-500 text-xs">
                      {errors.category.message}
                    </p>
                  )}
                </div>

                {/* Sub Category */}
                {/* <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold">Sub Category</label>
                  <Select
                    onValueChange={(val) => setValue("subCategory", val)}
                    defaultValue={watch("subCategory")}
                  >
                    <SelectTrigger className="h-[40px] text-xs">
                      <SelectValue placeholder="SELECT ONE" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="commercial">Commercial</SelectItem>
                      <SelectItem value="residential">Residential</SelectItem>
                      <SelectItem value="land">Land</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.subCategory && (
                    <p className="text-red-500 text-xs">
                      {errors.subCategory.message}
                    </p>
                  )}
                </div> */}

                {/* Amount */}
                <Input
                  label="Amount"
                  type="text"
                  className="text-xs h-[40px] border rounded px-2"
                  value={rawAmount.toLocaleString()} // display formatted
                  onChange={(e) => {
                    const val = e.target.value.replace(/,/g, ""); // remove commas
                    setValue("amount", Number(val) || 0); // store raw number
                  }}
                  placeholder="Amount"
                  error={errors?.amount?.message}
                />
                {/* <Controller
                  name="amount"
                  control={control}
                  render={({ field: { onChange, value, ...field } }) => (
                    <Input
                      label="Amount"
                      placeholder="Amount"
                      type="text" // Change to text to allow comma formatting
                      className="text-xs h-[40px]"
                      {...field}
                      value={formatWithCommas(value || "")}
                      onChange={(e) => {
                        const rawValue = removeCommas(e.target.value);
                        // Only allow numbers
                        if (rawValue === "" || /^\d+$/.test(rawValue)) {
                          onChange(rawValue === "" ? "" : Number(rawValue));
                        }
                      }}
                      error={errors?.amount?.message}
                    />
                  )}
                /> */}

                {/* Max Tenor */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold">Max Tenor</label>
                  <Select
                    onValueChange={(val) => setValue("maxTenor", val)}
                    // onValueChange={field.onChange}
                    value={watch("maxTenor")}
                    key={watch("maxTenor")}
                  >
                    <SelectTrigger className="h-[40px] text-xs">
                      <SelectValue placeholder="SELECT ONE" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 Months</SelectItem>
                      <SelectItem value="6">6 Months</SelectItem>
                      <SelectItem value="9">9 Months</SelectItem>
                      <SelectItem value="12">12 Months</SelectItem>
                      <SelectItem value="15">15 Months</SelectItem>
                      <SelectItem value="18">18 Months</SelectItem>
                      <SelectItem value="21">21 Months</SelectItem>
                      <SelectItem value="24">24 Months</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.maxTenor && (
                    <p className="text-red-500 text-xs">
                      {errors.maxTenor.message}
                    </p>
                  )}
                </div>

                {/* Available Units */}
                <Input
                  label="Available Units"
                  placeholder="Available Units"
                  type="number"
                  error={errors?.availableUnits?.message}
                  className="text-xs h-[40px]"
                  {...register("availableUnits", { valueAsNumber: true })}
                />

                {/* Description */}
                <div className="flex flex-col gap-1 md:col-span-3">
                  <label className="text-xs font-semibold">Description</label>
                  <textarea
                    className="bg-transparent text-xs border border-gray-300 h-[100px] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7C2EBF] focus:border-transparent px-2 py-2 rounded-md"
                    placeholder="Description"
                    {...register("description")}
                  />
                  {errors.description && (
                    <p className="text-red-500 text-xs">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                {/* File Upload */}
                <article className="md:col-span-1">
                  <div className="flex text-sm font-semibold mb-2">
                    Asset Image
                  </div>

                  {/* Upload Area */}
                  {!preview ? (
                    <label className="flex flex-col justify-center items-center p-4 border border-dotted border-[#A8A8A8] text-[#E4E4E4] font-semibold w-full rounded cursor-pointer">
                      <div className="mx-auto w-[70%] text-center flex flex-col">
                        <div className="flex items-center justify-center">
                          <img
                            src={fileicon}
                            alt="fileIcon"
                            className="text-sm"
                          />
                        </div>
                        <p className="text-[#E4E4E4] font-medium text-sm">
                          Click to upload or drag and drop file here
                        </p>
                      </div>
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;

                          const previewUrl = URL.createObjectURL(file);
                          setPreview(previewUrl);

                          const reader = new FileReader();
                          reader.onload = () => {
                            const base64String =
                              reader.result?.toString() || "";
                            console.log("Base64:", base64String.slice(0, 50)); // for debugging
                            setValue("image", base64String, {
                              shouldValidate: true,
                            });
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                    </label>
                  ) : (
                    /* Preview Area */
                    <div className="relative flex justify-center mt-2">
                      <img
                        src={preview}
                        alt="Preview"
                        className="w-24 h-24 object-cover rounded-md border"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setPreview("");
                          setValue("image", "");
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] px-2 py-1 rounded-full hover:bg-red-600 transition"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )}

                  {errors.image && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.image.message}
                    </p>
                  )}
                </article>
              </section>

              <div className="mt-4">
                <Button
                  type="submit"
                  color="purple"
                  name={assetSelected ? "Edit Asset" : "Create Assets"}
                  loading={isLoading}
                />
              </div>
            </form>
          ) : typeToCreate === "bulk" ? (
            <section>
              <CustomFileUpload
                label="Assets Sheets"
                description="Upload your spreadsheet file here"
                handleFileChange={handleFileChange}
                handleFileRemove={handleFileRemove}
                file={file}
                uploading={isLoading}
                field="assetSheet"
                sampleDownload="/sample/assets_template.csv"
              />
              <div className="mt-4">
                <Button
                  type="button"
                  onClick={handleFileUpload}
                  color="purple"
                  name={"Create Assets"}
                  loading={isLoading}
                />
              </div>
            </section>
          ) : (
            ""
          )}
        </div>
      </div>
    </Container>
  );
};

export default Createassets;
