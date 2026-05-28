import {axios,get,post} from "./request"

export const ajax = {
    getFilterData:(body)=>post("/admin/getFilterData",body),
}