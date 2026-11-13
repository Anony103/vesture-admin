import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowRight, Eye, EyeOff, Lock, Mail, ShieldCheck, TriangleAlert } from "lucide-react";
import { AuthCard } from "../components/shared/auth-card";
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
  const [capsLock, setCapsLock] = useState(false);
  const [shaking, setShaking] = useState(false);
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
      // a quick shake of the form says "no" without a second message
      setShaking(true);
      window.setTimeout(() => setShaking(false), 600);
    }
  };

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Log in with your admin credentials to continue."
      footer={
        <button type="button" className="font-medium text-brand hover:underline" onClick={() => navigate("changePassword")}>
          Forgotten your password?
        </button>
      }
    >
      <form className={`flex flex-col gap-1 ${shaking ? "v-shake" : ""}`} onSubmit={handleSubmit(onSubmit)}>
        <Input
          label="Email"
          className="pl-10 text-sm"
          leftIcon={<Mail size={16} className="ml-2.5 text-fg3" />}
          placeholder="example@email.com"
          id="email"
          autoComplete="username"
          {...register("username")}
        />
        <Input
          label="Password"
          type={visibility ? "text" : "password"}
          {...register("password")}
          error={errors?.password?.message}
          disabled={isSubmitting}
          name="password"
          className="pl-10 pr-11 text-sm"
          leftIcon={<Lock size={16} className="ml-2.5 text-fg3" />}
          id="Password"
          placeholder="Password"
          autoComplete="current-password"
          onKeyUp={(e) => setCapsLock(e.getModifierState("CapsLock"))}
          rightIcon={
            <button
              onClick={() => setVisibility(!visibility)}
              type="button"
              aria-label={visibility ? "Hide password" : "Show password"}
              className="grid h-8 w-8 place-items-center rounded-lg text-fg3 transition-colors hover:bg-panel-hi hover:text-fg"
            >
              {visibility ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
          }
        />
        {capsLock && (
          <p role="status" className="v-chip v-chip-warn mb-1 self-start">
            <TriangleAlert size={12} /> Caps Lock is on
          </p>
        )}
        <button className="v-btn v-btn-primary v-sheen group mt-2 h-12 w-full text-sm" type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <ClipLoader color="#fff" size={14} /> Authenticating...
            </>
          ) : (
            <>
              Log in
              <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
            </>
          )}
        </button>
        <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-fg3">
          <ShieldCheck size={13} /> Sessions end automatically after 5 minutes of inactivity.
        </p>
      </form>
    </AuthCard>
  );
};

export default Login;
