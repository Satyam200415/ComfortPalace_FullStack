import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../api/api";

function Register() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const passwordValue = watch("password");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    console.log("Register data", data);

    try {
      const response = await api.post(`/users?role=${data.role}`,{
        firstName:data.firstName,
        lastName:data.lastName,
        email:data.email,
        password:data.password,
        confirmPassword:data.confirmPassword
      });
      console.log(response);
      setSuccessMessage("Registration successful! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <main className="cp-auth-page">
      <section className="cp-auth-card">
        <h2>Create Your Account</h2>
        <p>Join ComfortPalace and book rooms faster.</p>
        {successMessage && (
          <div style={{
            padding: "1rem",
            backgroundColor: "#dcfce7",
            color: "#166534",
            borderRadius: "0.5rem",
            marginBottom: "1rem",
            textAlign: "center",
            fontWeight: "600"
          }}>
            {successMessage}
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <label htmlFor="regFirstName">First Name</label>
          <input
            id="regFirstName"
            type="text"
            placeholder="Enter your first name"
            {...register("firstName", {
              required: "First name is required",
              pattern: {
                value: /^[A-Za-z]+$/,
                message: "First name can contain only alphabets",
              },
            })}
          />
          {errors.firstName && (
            <small className="cp-error">{errors.firstName.message}</small>
          )}

          <label htmlFor="regLastName">Last Name</label>
          <input
            id="regLastName"
            type="text"
            placeholder="Enter your last name"
            {...register("lastName", {
              required: "Last name is required",
              pattern: {
                value: /^[A-Za-z]+$/,
                message: "Last name can contain only alphabets",
              },
            })}
          />
          {errors.lastName && (
            <small className="cp-error">{errors.lastName.message}</small>
          )}

          <label htmlFor="regEmail">Email</label>
          <input
            id="regEmail"
            type="email"
            placeholder="you@example.com"
            {...register("email", { required: "Email is required" })}
          />
          {errors.email && (
            <small className="cp-error">{errors.email.message}</small>
          )}

          <label htmlFor="regPassword">Password</label>
          <input
            id="regPassword"
            type="password"
            placeholder="At least 6 characters"
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            })}
          />
          {errors.password && (
            <small className="cp-error">{errors.password.message}</small>
          )}

          <label htmlFor="regConfirmPassword">Confirm Password</label>
          <input
            id="regConfirmPassword"
            type="password"
            placeholder="Re-enter password"
            {...register("confirmPassword", {
              required: "Please confirm your password",
              validate: (value) =>
                value === passwordValue || "Passwords do not match",
            })}
          />
          {errors.confirmPassword && (
            <small className="cp-error">{errors.confirmPassword.message}</small>
          )}


          <label htmlFor="role">I want to</label>
<select
  id="role"
  {...register("role", {
    required: "Please select an option",
  })}
>
  <option value="">Select</option>
  <option value="ROLE_CUSTOMER">Book Rooms</option>
  <option value="ROLE_OWNER">List My Hotel</option>
</select>

{errors.role && (
  <small className="cp-error">{errors.role.message}</small>
)}

          <button type="submit">Register</button>
        </form>
        <p className="cp-auth-link-row">
          Already signed up? <Link to="/login">Login</Link>
        </p>
      </section>
    </main>
  );
}

export default Register;
