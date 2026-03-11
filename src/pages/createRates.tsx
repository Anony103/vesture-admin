import Backbutton from "../components/shared/backbutton";
import Button from "../components/shared/button";
import { Container } from "../components/shared/container";
// import fileicon from "../assets/fileicon.svg";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectValue,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import useMangeInterestRates from "@/hooks/use-manage-interest-rates";
// import { Controller } from 'react-hook-form';
// import { AssetCategory } from "@/types/table-type";
// import { Trash2 } from "lucide-react";

const CreateRates = () => {
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
    savingTypes,
    // handleCreateBulk,
    // handleCreateSingle,
    // handleFileChange,
    // handleFileRemove,
    // file,
    // handleFileUpload,
    // setSelectedCategory,
    // // selectedCategory
    // preview,
    // setPreview,
  } = useMangeInterestRates();
  // const {
  //   allAssetsCategoriesLoading,
  //   allAssetsCategoriesError,
  //   allAssetsCategories,
  // } = useMangeAssetsCategories();

  return (
    <Container>
      <div className="flex flex-col gap-4 min-h-screen">
        <div className="flex justify-between items-center">
          <Backbutton />
          <div></div>
        </div>
        <div className="bg-white rounded-md w-[100%] p-4">
          <div className="flex flex-row justify-between items-center">
            <h1 className="font-bold text-lg">Interest Rates</h1>
          </div>
          {typeToCreate === "single" ? (
            <form onSubmit={handleSubmit(onSubmit)}>
              <section className="grid md:grid-cols-2 gap-x-6 gap-y-6 mt-4">
                {/* Savings Type (replaces Asset Name) */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold">Savings Type</label>

                  {
                    <Select
                      onValueChange={(value) => setValue("savingsType", value)}
                      defaultValue={watch("savingsType")}
                    >
                      <SelectTrigger className="h-[40px] text-xs">
                        <SelectValue placeholder="Select savings type" />
                      </SelectTrigger>
                      <SelectContent>
                        {savingTypes
                          ? savingTypes.map((type) => (
                              <SelectItem key={type.id} value={type.value}>
                                {type.name}
                              </SelectItem>
                            ))
                          : "No Options"}
                      </SelectContent>
                    </Select>
                  }

                  {errors.savingsType && (
                    <p className="text-red-500 text-xs">
                      {errors.savingsType.message}
                    </p>
                  )}
                </div>

                {/* Annual Rate (%) */}
                <Input
                  label="Annual Rate (%)"
                  placeholder="e.g., 8.5"
                  type="number"
                  step="0.01"
                  className="text-xs h-[40px]"
                  error={errors?.annualRate?.message}
                  {...register("annualRate", {
                    required: "Annual rate is required",
                    valueAsNumber: true,
                    min: { value: 0, message: "Rate must be positive" },
                    max: {
                      value: 100,
                      message: "Rate cannot be more than 100%",
                    },
                  })}
                />
                {/* <Input
                  label="Annual Rate (%)"
                  placeholder="e.g., 8.5"
                  type="number"
                  step="0.01"
                  min={0}
                  max={100}
                  className="text-xs h-[40px]"
                  error={errors?.annualRate?.message}
                  {...register("annualRate", {
                    required: "Annual rate is required",
                    valueAsNumber: true,
                    min: {
                      value: 0,
                      message: "Rate must be between 0 and 100",
                    },
                    max: {
                      value: 100,
                      message: "Rate cannot be more than 100%",
                    },
                  })}
                /> */}

                {/* Active Status */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold">Status</label>
                  <Select
                    onValueChange={(val) => setValue("active", val === "true")}
                    defaultValue={watch("active") ? "true" : "false"}
                  >
                    <SelectTrigger className="h-[40px] text-xs">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Active</SelectItem>
                      <SelectItem value="false">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.active && (
                    <p className="text-red-500 text-xs">
                      {errors.active.message}
                    </p>
                  )}
                </div>
              </section>

              <div className="mt-4">
                <Button
                  type="submit"
                  color="purple"
                  name="Create Interest Rates"
                  loading={isLoading}
                />
              </div>
            </form>
          ) : (
            ""
          )}
        </div>
      </div>
    </Container>
  );
};

export default CreateRates;
