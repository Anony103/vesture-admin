import { useState } from "react";
import { useNavigate } from "react-router";
import { IoEyeOutline } from "react-icons/io5";
import { IoEyeOffOutline } from "react-icons/io5";
import { schemaLogin } from "../schemas";
import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { AuthService } from "../services";
import { toast } from "react-toastify";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../components/ui/input";
import { ClipLoader } from "react-spinners";
import { SESSION_STORAGE_KEY } from "../constants";
import { AxiosError } from 'axios';


const Login = () => {
  const navigate = useNavigate();
  const [visibility, setVisibility] = useState(false);
  const authService = new AuthService();

  type FormFields = z.infer<typeof schemaLogin>;

  const {
    register,
    setError,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({
    resolver: zodResolver(schemaLogin),
  });

  const onSubmit: SubmitHandler<FormFields> = async (values) => {
    try {
      const payload = {
        username: values.username,
        password: values.password,
      };

      const response = await authService.login(payload);
      console.log(response);

      if (response.code === 200) {
        toast.success(response?.message);
        sessionStorage.setItem(
          `${SESSION_STORAGE_KEY}_TEMP_AUTH_DATA`,
          JSON.stringify(response?.data)
        );
        sessionStorage.setItem(
          SESSION_STORAGE_KEY,
          response?.data?.token || ""
        );
        console.log(response)
        navigate("/");
      }
    } catch (error) {
      console.log(error);
        if (error instanceof AxiosError) {
      toast.error(error.response?.data?.message || "Login failed");
    } else {
      toast.error("Login failed");
    }
      setError("root", {
        type: "deps",
        message: "Login failed",
      });
      setValue("password", "");
    }
  };

  return (
    <main
     className="w-screen h-screen min-h-screen flex items-center justify-center"
    >
      <div className="text-white text-center flex flex-col gap-6 w-[100%] md:w-[26%]  rounded mx-auto py-6 ">
        <h1 className="text-2xl font-medium">PayRise</h1>
        <div className="border text-white  bg-white bg-opacity-30 backdrop-blur-md px-1 py-6 rounded-lg shadow-lg h-[70%]">
          <div>
            <p className="text-lg font-semibold">Log In</p>
            <p className="text-xs text-gray-100 mt-2">
              Enter your valid credentials to continue
            </p>
          </div>
          <section className="flex flex-col gap-6 p-[5px] mt-[5%] text-left">
            <form
              className="mt-6 flex flex-col gap-4"
              onSubmit={handleSubmit(onSubmit)}
            >
              <div className="flex flex-col gap-1">
                <label className="text-xs">Email</label>
                <Input
                  className="bg-transparent text-xs border border-gray-300 h-[40px]  placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7C2EBF] focus:border-transparent px-2 py-2 rounded-md"
                  placeholder="example@email.com"
                  id="email"
                  {...register("username")}
                />
              </div>
              <div className="flex flex-col gap-1 ">
                <label className="text-xs">Password</label>
                <Input
                  type={visibility ? "text" : "password"}
                  {...register("password")}
                  error={errors?.password?.message}
                  disabled={isSubmitting}
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
              <div className="flex flex-col">
                <button
                  // onClick={() => navigate("/")}
                  className="bg-[#7C2EBF] hover:opacity-40 text-white  py-2 px-4 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition duration-150 ease-in-out"
                  type="submit"
                >
                  {isSubmitting ? (
                    <>
                      <ClipLoader color="#fff" size={12} /> Authenticating...
                    </>
                  ) : (
                    "Login"
                  )}
                </button>
              </div>
            </form>
          </section>
        </div>
        <p 
        className="text-[#CEADEB] text-sm hover:underline hover:cursor-pointer"
         onClick = {
          ()=>{
            navigate("changePassword")
          }
         }
        >
          Forgotten your Password?
        </p>
      </div>
    </main>
  );
};

export default Login;
