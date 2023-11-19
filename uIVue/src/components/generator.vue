<script setup>
     import { reactive, ref } from 'vue';
     const emit =  defineEmits(['updatedHistory','increaseGeneratedviews']);
     const props = defineProps(['regeneratedLink']);

    const display = ref(false);
    const urlInp = ref('');
    const resultUrl = ref('');
    const resultUrlLink = ref('');
    const loginActive = ref(false);

    const urlExist = ref(true);
    const errorMesssage = ref('');

    const restart = () => {
      urlInp.value = '';
      resultUrl.value = '';  
      display.value = false;
    }

    const copyText = () => {
      navigator.clipboard.writeText(resultUrl.value);
    }

    const converting = (how) => {
      display.value = true;
      let inputData = urlInp.value;

      let jwtAccessHeader = localStorage.getItem('accessUser') ?  `Bearer ${JSON.parse(localStorage.getItem('accessUser'))} ` : " ";
      let fetchUrl = how == 'generate' ? 'http://localhost:3000/api/urlReq' : 'http://localhost:3000/api/regenerate';

    fetch(fetchUrl , {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': jwtAccessHeader
        },
        body: JSON.stringify({ urlReq: inputData })
    })
    .then(resp => resp.json())
    .then(result => {
      console.log(result);
            if(result.errorMessage){
              urlExist.value = false;
              errorMesssage.value = result.errorMessage;
            }
            else{
              urlExist.value = true;
              resultUrl.value = result.message;
              resultUrlLink.value = result.message;
              if(result.historyResult){
                  emit('updatedHistory' , result.historyResult);
              }
            }
    })
    .catch(er => console.error(er))
    }

    const redirectToOrgPage = (org) => {
      window.open(org, '_blank');
    }

    const handleOpeningShortLInk = (urlInp) => {
      if(localStorage.getItem('accessUser')){
        emit('increaseGeneratedviews' , resultUrl.value);
      }else{
        redirectToOrgPage(urlInp)
      }
    }
</script>


<template>
    <div class="row d-flex align-items-center" id="inpField">
            <form @submit.prevent="converting('generate')" class="w-100">
            <input type="text" name="urlInp" id="urlInp" v-model="urlInp" class="w-50 rounded p-2" placeholder="enter your url">
            <button type="submit" id="submit" class="p-2 rounded "><i class="fa-solid fa-arrow-right"></i></button>
            </form>
    </div>
    <div class="row" id="showResult" :class="{'displayFlex' : display}" v-if="urlExist">
            <a id="resultUrl" target="_blank" @click="handleOpeningShortLInk(urlInp)">{{resultUrl}}</a>
            <div id="buttons" class="d-flex align-items-center">
                <button id="copy" @click="copyText" class="m-2 rounded p-2"><i class="fa-solid fa-copy"></i></button>
                <button id="regenerate" @click="converting('regenerate')" class="m-2 rounded p-2">regenerate</button>
                <button id="restart"  @click="restart" class="m-2 rounded p-2">restart</button>
            </div>
    </div>
    <p v-if="!urlExist" id="error">{{ errorMesssage }}</p>
</template>



<style>
   #resultUrl {
          color: #fff;
    }
    #error{
      color: red;
      font-size: 2rem;
    }
    @media screen and (max-width: 450px){
      #inpField > form > input{
        width: 75% !important;
      }
    }
    @media screen and (max-width: 559px){
        #inpField , #showResult{
        margin-left: 2.6rem;
        }
    }
    @media screen  and (min-width: 600px) and (max-width: 700px) {
        #inpField , #showResult{
          margin-left: 7%;
        }
        #inpField > form > input {
          width: 70% !important;
        }
        .urlDetails{
          grid-template-columns: 3fr 1fr !important;
        }
        .editUrl{
          padding-top: .5rem;
          height: auto !important;
          display: flex !important;
          flex-direction: column;
        }
    }  
    @media screen and (min-width: 750px) and (max-width: 850px){
        #urlInp ,  #resultUrl{
            width: 70% !important;
            margin-left: 12%;
        }
        #buttons{
            margin-left: 12%;
        }
    }
    @media screen and (max-width:848px){
        body{
            overflow-x: hidden;
        }
      form > input{
        width: 100% !important;
        margin-left: 0 !important;
      }
      #inpField , .showResult {
        width: 100% !important;
      }
      #generator , .showResult{
        padding-left: 0 !important;
      }
      #showResult > a , #buttons{
        margin-left:  0 !important;
      }
      .urlDetails{
        margin: 0 !important;
      }
    }
    @media screen and (min-width: 700px) and (max-width:800px){
        form > input{
        margin-left: 2% !important;
      }
    }
    @media screen and (min-width: 560px) and (max-width:595px){
        form > input{
        margin-left: 7% !important;
      }
    }


</style>