<script setup>
    import {ref , reactive} from 'vue'
    import generator from './generator.vue';

    const startIndex = ref(0);

    const urlHistory = reactive({array: []});

    const user = ref(" ");

    const regeneratedLink = ref('');
  
    const changeStartIndex = (page) => {
      startIndex.value =  ( page -1 ) * 3;
      console.log(startIndex.value);
    }

    const loadingPage  = ()  => {
        let jwtAccess = JSON.parse(localStorage.getItem('accessUser'));
          fetch('http://localhost:3000/api/getUserById' , {
            method: "GET",
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${jwtAccess}`
            }
        })
        .then(resp => resp.json())
        .then(result =>{
          if(result){
            urlHistory.array = result.arrayData;
            user.value = result.username;
          }
        })
        .catch(er => console.error())
    }
    window.addEventListener('load' , loadingPage);
    
    const logOut = () => {
      localStorage.removeItem('accessUser');
      window.location.href = 'http://localhost:5173';
    }

    const copyText = (shortUrl) => {
      navigator.clipboard.writeText(`http://localhost:3000/copy/${shortUrl}`);
    }

    const changeAndReaload = (orgUrl , how) => {
      let fetchReq = how == "delete" ? 'http://localhost:3000/api/deleteUrl' : 'http://localhost:3000/api/regenerate';
      let jwtAccess = JSON.parse(localStorage.getItem('accessUser'));

      let data = {
         urlReq: orgUrl
       }

      fetch(fetchReq , {
          method: "POST",
          headers:{
             'Content-Type': 'application/json',
             'Authorization': `Bearer ${jwtAccess}`
          },
          body: JSON.stringify(data)
      })
      .then(resp => resp.json())
      .then(result => {
        urlHistory.array = result.historyResult;
          if(how == 'regenerate'){
            let findCHangedUrl = result.historyResult.find(url => url.original == orgUrl);
            regeneratedLink.value = findCHangedUrl.shortUrl;
          }
      })
      .catch(err => console.error(err))
    }

    loadingPage();

    const handleUpdatedHistory = (updatedArray) => {
      urlHistory.array = updatedArray;
    }

    const increaseViews = (shortUrl) => {
      if(localStorage.getItem('accessUser')){
        fetch( shortUrl )
        .then(res => res.json())
        .then(result => {
          handleUpdatedHistory(result.historyResult)
          window.open(result.org, '_blank');
        })    
        .catch(err => console.error(err))  
      }
    }
  </script>

<template>
  <div id="main" class="align-items-center">
      <div id="generator" class="container">
        <header class="m-2">
          <h2>welcome <span class="redFont">{{ user }}</span></h2>
          <i id="logoutIcon" class="fa-solid fa-arrow-right-from-bracket" title="logout" @click="logOut"></i>
        </header>
          <div id="generateNewUrlH" class="row">
              <h2>Generate new url: </h2>
          </div>
        <generator @updatedHistory="handleUpdatedHistory" @increaseGeneratedviews="increaseViews" :key="regeneratedLink" regenerated-link="regeneratedLink"></generator>
      </div>
      <hr>
      <div id="history" class="d-flex flex-column">
          <p id="ifNoHistory" v-if="urlHistory.length == 0">empty history</p>
          <div id="urlDetailsContainer">
              <div class="urlDetails" v-for="item in urlHistory.array.slice(startIndex,startIndex+3)">

              <div  class="showUrl d-flex flex-column justify-content-center align-items-flex-start">
                  <p>short url: </p>
                  <a target="_blank" @click="increaseViews(item.shortUrl)">{{ item.shortUrl }}</a><br>
                  <p>original: </p>
                  <a :href="item.original" target="_blank">{{ item.original }}</a>
                  <p id="views">Views : {{ item.clicked }}</p>
              </div>
                <div class="editUrl d-flex justify-content-center align-items-center">
                  <i :class="icon" class="fa-solid fa-copy rounded-circle"  title="copy short url to clipboard" @click="copyText(item.short)"></i>
                  <i :class="icon" class="fa-solid fa-rotate rounded-circle" title="regenerate url" @click="changeAndReaload(item.original , 'regenerate')"></i>
                  <i :class="icon" class="fa-solid fa-trash rounded-circle" title="delete url" @click="changeAndReaload(item.original , 'delete')"></i>
                </div>
          </div>
          </div>
          <div id="pageNumber" class="d-flex justify-content-center">
              <button class="pagenumberButton" v-for="page in Math.ceil(urlHistory.array.length/3)" @click="changeStartIndex(page)">{{ page }}</button>
          </div>
      </div>
    </div>
  </template>
  
  
  <style scoped>
  header > h2 , header > i{
    margin-top: 3rem !important;
  }
    div#main{
      width: 100%;
      height: 100%;
      display: flex;
      gap: .5rem;
      background-color: #333333;
    }
    #main > div {
      width: 50%;
      height: 95%;
    }
    hr{
      width: .1rem;
      height: 80%;
      background-color: #666;
    }
    #history{
      grid-template-rows: .5fr 3fr 1fr !important; 
      padding: .9rem;
      gap: 1rem;
      padding-top: 3%;
    }
    #urlDetailsContainer{
      width: calc(100% - .5rem);
      height: 90%;
    }
    .urlDetails{
      width: calc(100% - .5rem);
      display: grid;
      min-height: 30% !important;
      grid-template-columns: 2fr .5fr;
    }
    .urlDetails:not(.urlDetails:nth-child(3)){
      border-bottom: 1px solid #666;
    }
    .urlDetails > div {
      padding: 1rem;
    }
    .editUrl {
      gap: 1.5rem;
      color: #E4414C;
    }
    .editUrl > i:hover{
      color: #fff;
    }
    i{
      font-size: 1.4rem;
    }
    .showUrl > p{
      margin-bottom: 0;
      color: #888;
    }
    #views{
      color: rgb(28, 203, 28) !important;
      /* color: #03a9d2 !important; */
    }
    .showUrl > a{
      font-size: 2rem;
      color: #fff;
      text-wrap: wrap !important;
    }
    #pageNumber{
      width: 100%;
      padding: .5rem;
      gap: 2rem;
    }
    #pageNumber > button{
      font-size: 2rem;
      background-color: transparent;
      color: #666;
    }
    #pageNumber > button:hover{
        color: #fff;
    }
    #generator {
      padding-top: 10%;
      padding-left: 8%;
    }
    header > i , header > h2{
      position: absolute;
      top: 5%;
      color: #fff;
    }
    header > i {
      left: 96%;
    }
    .showUrl > a {
      font-size: 1rem;
    }
    #generateNewUrlH{
      color: #fff !important;
      margin-bottom: 2rem;
    }
    #ifNoHistory{
     color: #999;
     position: absolute;
     top: 50%;
     left: 70%;
    }

    #logoutIcon:hover{
      color: rgb(28, 203, 28);
    }
    @media screen and (max-width: 450px){
      header{
        top: 2%;
        left: 90%;
      }
      header > i {
        top: 4.2% !important;
      }
      #generateNewUrlH{
        margin-top: 4rem;
        margin-left: 9% !important;
      }
      .editUrl{
        justify-content: flex-end !important;
        margin-bottom: .4rem;
      }
      .urlDetails{
        padding-bottom: .5rem;
      }
    }
    @media screen and (min-width: 451px) and (max-width: 1259px){
      header{
        top: 2%;
        left: 90%;
      }
      p , a{
        font-size: 1rem;
        margin-left: 1rem;
      }
    }
    @media screen and (max-width:848px){
      #main{
        flex-direction: column !important;
        align-items: flex-start !important;
      }
      #main > div{
        width: 100% !important;
      }
      header > h2{
        left: 5%;
      }
      #generateNewUrlH{
        width: 100%;
        margin-left: 0;
      }
    }
  @media screen and (min-width: 700px) and (max-width:800px){
    #generateNewUrlH{
        margin-left: 2%;
      }
  }
  @media screen and (max-width: 700px) {
    header > h2 , header > i{
        top: 3%;
      }
      header> i{
        left: 89%;
      }
      #generateNewUrlH{
        margin-left: 7%;
      }
      .urlDetails{
        grid-template-columns: 1fr;
        grid-template-rows: 2fr 1fr;
      }
  }
  </style>