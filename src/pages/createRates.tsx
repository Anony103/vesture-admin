import Backbutton from "../components/shared/backbutton";
import Button from "../components/shared/button";
import { Container } from "../components/shared/container";
// import fileicon from "../assets/fileicon.svg";
import { Input } from "@/components/ui/input";
import { TENOR_PRODUCTS } from "@/schemas";
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

                {/* Tenor: only Smart Lock and Target Savings have one */}
                {TENOR_PRODUCTS.includes(watch("savingsType")) && (
                  <div className="flex flex-col gap-1 md:col-span-2">
                    <label className="text-xs font-semibold">Applies to</label>
                    <Select
                      onValueChange={(val) => setValue("tenorMode", val as "ANY" | "BAND")}
                      defaultValue={watch("tenorMode")}
                    >
                      <SelectTrigger className="h-[40px] text-xs">
                        <SelectValue placeholder="Select tenor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ANY">Any tenor (used when no range below fits the plan)</SelectItem>
                        <SelectItem value="BAND">A range of days</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.tenorMode && (
                      <p className="text-red-500 text-xs">{errors.tenorMode.message}</p>
                    )}
                    {watch("tenorMode") === "BAND" && (
                      <>
                        <div className="grid grid-cols-2 gap-x-6 mt-2">
                          <Input
                            label="From (days)"
                            placeholder="e.g., 85"
                            type="number"
                            min={1}
                            className="text-xs h-[40px]"
                            error={errors?.minTenorDays?.message}
                            {...register("minTenorDays", {
                              setValueAs: (v) => (v === "" || v === null || v === undefined ? undefined : Number(v)),
                            })}
                          />
                          <Input
                            label="To (days)"
                            placeholder="e.g., 95"
                            type="number"
                            min={1}
                            className="text-xs h-[40px]"
                            error={errors?.maxTenorDays?.message}
                            {...register("maxTenorDays", {
                              setValueAs: (v) => (v === "" || v === null || v === undefined ? undefined : Number(v)),
                            })}
                          />
                        </div>
                        <p className="text-[11px] text-gray-500 mt-1">
                          A plan gets this rate when its length in days is inside the range (both ends included). A plan of
                          3 months is about 90 days (89-92), 6 months about 180, 9 months about 270 and 12 months about
                          365, so give a little room, for example 85 to 95. Ranges of one product must not overlap.
                        </p>
                      </>
                    )}
                  </div>
                )}

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
