
async function main(){
    await mongoose.connect("");
}

main()
.then(()=>{

})
.catch(()=>{

})

app.get('/',(req,res)=>{
    res.send("hi i am root");
})

//model folder is created for storing different model of database of project 