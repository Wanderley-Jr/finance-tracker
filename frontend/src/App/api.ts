import axios from "axios";
import Pagination from "../components/Pagination";
import qs from "qs"

export type Page<T> = {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
}

export type Pagination<T> = {
    page?: number
    size?: number
    sort?: `${keyof T & string},${"asc"|"desc"}`[]
}

const api = axios.create({
    baseURL: "http://localhost:8080/api",
    headers: {
        "Content-Type": "application/json",
    },
    paramsSerializer: {
        serialize: (params) => qs.stringify(params, { arrayFormat: "repeat" })
    }
});

export default api;