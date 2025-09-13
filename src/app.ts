import express from "express"
// import {   } from "express" 

// import  from "express/lib/request.js";
const app=express();

app.get("/",(req,res)=>{
    res.send("Auth Service is up and running")
})
export default app;