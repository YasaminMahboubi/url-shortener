<template>
  <onload  @show-form="changeDisplay" v-if="startPage"/>
  <signup  @show-form="changeDisplay" v-if="showSignUpForm"/>
  <login   @show-form="changeDisplay" v-if="showLogInForm"/>
  <logedInUser @show-form="changeDisplay" v-if="userIsLoggedIn"/> 

</template>

<script setup>
import onload from "./components/onload.vue";
import signup from "./components/signup.vue";
import login from "./components/login.vue";
import logedInUser from "./components/logedInUser.vue";

import { ref } from 'vue';

  const startPage = ref(true);
  const showSignUpForm = ref(false);
  const showLogInForm = ref(false);
  const userIsLoggedIn = ref(false);

  const pages = [startPage , showSignUpForm , showLogInForm , userIsLoggedIn];

  const changeDisplay = (data) => {
    console.log(data);
    pages.forEach(page => {
      page.value = false;
    })

    switch(data){
      case 'onLoad'  : startPage.value = true;;
      break;
      case 'signup'  : showSignUpForm.value = true;
      break;
      case 'login'  : showLogInForm.value = true;
      break;
      case 'userLogedIn'  :  userIsLoggedIn.value = true;
      break;
    }
  }
</script>