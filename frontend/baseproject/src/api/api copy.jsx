import axios from "axios";
import { api } from "../api";

export const api = axios.create({
    baseURL: "http://localhost:8080",
})
