import { ReactElement, useState } from "react";
import { Container } from "../components/shared/container";
import { IoEyeOutline } from "react-icons/io5";
import { IoEyeOffOutline } from "react-icons/io5";
import Button from "../components/shared/button";
import { Input } from "@/components/ui/input";
import useUpdatePassword from "@/hooks/use-update-password";

// interface Props {
//     title:string
// }

function Settings(): ReactElement {
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    onSubmit,
    errors,
    isLoading,
    handleSettingOptionsChange,
    settingOptions,
    handleSave,
    setHour,
    hour,
  } = useUpdatePassword();

  return (
    <Container>
      <article className="mt-6 min-h-screen">
        <div className="bg-white mt-2 h-[50%] py-6 px-2 rounded-md">
          <div className="grid md:grid-cols-3">
            {/* LEFT SIDE MENU */}
            <section className="px-4 border-r-2">
              {/* <ul className="flex flex-col gap-x-4 gap-y-8 text-sm">
                <li className="bg-[#F6EBFE] text-[#7C2EBF] py-5 px-2 rounded-md font-semibold">
                  Security
                </li>
                <li className="py-1 px-2 cursor-pointer hover:text-[#7C2EBF] transition">
                  Logout
                </li>
              </ul> */}

              <ul className="flex flex-col gap-x-4 gap-y-8 text-sm">
                {["Security", "Auto Save"].map((item) => {
                  return (
                    <li
                      className={`${
                        settingOptions === item ? "bg-[#F6EBFE]" : ""
                      } text-[#7C2EBF] py-5 px-2 rounded-md font-semibold cursor-pointer`}
                      onClick={() => handleSettingOptionsChange(item)}
                    >
                      {item}
                    </li>
                  );
                })}
                <li className="py-1 px-2 cursor-pointer hover:text-[#7C2EBF] transition">
                  Logout
                </li>
              </ul>
            </section>

            {/* UPDATE PASSWORD FORM */}
            <section className="md:col-span-2 px-4">
              {settingOptions === "Security" ? (
                <div>
                  <h1 className="text-lg font-bold mb-6">Update Password</h1>
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid md:grid-cols-2 gap-x-4 gap-y-8">
                      {/* OLD PASSWORD */}
                      <div className="relative">
                        <Input
                          label="Old Password"
                          placeholder="Enter old password"
                          type={showPassword ? "text" : "password"}
                          className="text-xs h-[40px] pr-10"
                          error={errors.oldPassword?.message}
                          {...register("oldPassword", {
                            required: "Old password is required",
                          })}
                        />
                        <span
                          className="absolute mt-2 right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-600"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <IoEyeOutline />
                          ) : (
                            <IoEyeOffOutline />
                          )}
                        </span>
                      </div>

                      {/* NEW PASSWORD */}
                      <div className="relative">
                        <Input
                          label="New Password"
                          placeholder="Enter new password"
                          type={showPassword ? "text" : "password"}
                          className="text-xs h-[40px] pr-10"
                          error={errors.newPassword?.message}
                          {...register("newPassword", {
                            required: "New password is required",
                            minLength: {
                              value: 6,
                              message: "Minimum 6 characters",
                            },
                          })}
                        />
                        <span
                          className="absolute mt-2 right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-600"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <IoEyeOutline />
                          ) : (
                            <IoEyeOffOutline />
                          )}
                        </span>
                      </div>

                      {/* CONFIRM PASSWORD */}
                      <div className="relative md:col-span-2">
                        <Input
                          label="Confirm Password"
                          placeholder="Re-enter new password"
                          type={showPassword ? "text" : "password"}
                          className="text-xs h-[40px] pr-10"
                          error={errors.confirmPassword?.message}
                          {...register("confirmPassword", {
                            required: "Please confirm your password",
                            validate: (value, formValues) =>
                              value === formValues.newPassword ||
                              "Passwords do not match",
                          })}
                        />
                        <span
                          className="absolute mt-2 right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-600"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <IoEyeOutline />
                          ) : (
                            <IoEyeOffOutline />
                          )}
                        </span>
                      </div>
                    </div>

                    {/* SUBMIT BUTTON */}
                    <div className="mt-6">
                      <Button
                        color="purple"
                        name="Update Password"
                        type="submit"
                        loading={isLoading}
                      />
                    </div>
                  </form>
                </div>
              ) : (
                ""
              )}
              {settingOptions === "Auto Save" ? (
                <div>
                  <h1 className="text-lg font-bold mb-6"></h1>
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid md:grid-cols-2 gap-x-4 gap-y-8">
                      {/* OLD PASSWORD */}
                      {/* <div className="relative">
                        <Input
                          label="Old Password"
                          placeholder="Enter old password"
                          type={showPassword ? "text" : "password"}
                          className="text-xs h-[40px] pr-10"
                          error={errors.oldPassword?.message}
                          {...register("oldPassword", {
                            required: "Old password is required",
                          })}
                        />
                        <span
                          className="absolute mt-2 right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-600"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <IoEyeOutline />
                          ) : (
                            <IoEyeOffOutline />
                          )}
                        </span>
                      </div> */}
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-700">
                          Debit Hour:{" "}
                          {/* <span className="text-purple-600">
                            {watch("hourOfDay") || 1}
                          </span> */}
                        </label>

                        <input
                          type="range"
                          min={1}
                          max={23}
                          step={1}
                          value={hour} // controlled by state
                          onChange={(e) => setHour(Number(e.target.value))} // update state
                          style={{
                            background: `linear-gradient(
                             to right,
                           #E2CEF3 0%,
                             #E2CEF3 ${(hour / 23) * 100}%,
                            #e5e7eb ${(hour / 23) * 100}%,
                            #e5e7eb 100%
                            )`,
                          }}
                          className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                        />

                        <div className="flex justify-between text-xs text-gray-400">
                          <span>1am</span>
                          <span>12pm</span>
                          <span>11pm</span>
                        </div>
                      </div>
                    </div>

                    {/* SUBMIT BUTTON */}
                    <div className="mt-6">
                      <Button
                        color="purple"
                        name="Save"
                        type="button"
                        onClick={() => handleSave()}
                        loading={isLoading}
                      />
                    </div>
                  </form>
                </div>
              ) : (
                ""
              )}
            </section>
          </div>
        </div>
      </article>
    </Container>
  );
}

export default Settings;
