<script setup>
    import { ref } from 'vue';
    const emit =  defineEmits(['showForm']);

    const userEmail = ref('');
    const password = ref('');

    const errorUserEmail = ref(false);
    const errorPass = ref(false);
    const showError = ref(false);

    const errors = ref("");

    const checkUserEmail = () => {
        let userEmailInp = userEmail.value.trim();
        errorUserEmail.value = /^[A-Za-z]+$/.test(userEmailInp) ? false :  /^[A-Za-z0-9.-_]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(userEmailInp) ? false  : true;
    }

    const chcekPassLogin = () => {
        let passInp = password.value.trimEnd();
        errorPass.value = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[\d])[a-zA-Z0-9@#$%^&*!-_+]{6,}$/.test(passInp) ? false : true;
    }

    const userLogInSubmit = () => {
        let data = {
            userEmail: userEmail.value.trim(),
            password : password.value.trim() 
        }
        fetch('http://localhost:3000/api/login' , {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(resp => resp.json())
        .then(result => {
            if(!result.access){
                showError.value = true;
                errors.value = result.generalError ? result.generalError : result.passErr ? result.passErr : result.userError
            }
            else{
                localStorage.setItem('accessUser' ,JSON.stringify(result.access));
                emit('showForm' , 'userLogedIn');
            }
        })
        .catch(err => console.error(err))
    }
</script>
<template>
    <section class="main">
        <section id="registerSlogan" class="rounded d-flex justify-content-center align-items-center">
            <div>
                <h1 class="display-1 text-white">Welcome<br>back</h1>
                <p class="d-inline text-white h4">Don't have an account?</p>
                <a href="" class="text-decoration-none text-success h4 m-2" @click.prevent="$emit('showForm' , 'signup')">Sign up</a><br>
                <a href="" class="text-decoration-none text-white h4 guest" @click.prevent="$emit('showForm' , 'onLoad')">Continue as guest</a>
            </div>
        </section>
        <section id="form" class="rounded d-flex justify-content-center align-items-center">
        <form action="" class="inMiddle d-flex flex-column justify-content-center align-items-center">
                    <div>
                        <label for="username">Username or email<span class="redFont">*</span></label>
                        <input type="text" name="username" placeholder="username or email" class="p-2" v-model="userEmail" @focusout="checkUserEmail" :class="{'errorClass' : errorUserEmail}">
                        <p :class="{'changeOPacity' : errorUserEmail}"> Invalid username or email</p>
                    </div>
                    <div>
                        <label for="password">Password <span class="redFont">*</span></label>
                        <input type="password" name="password" placeholder="password" class="p-2" v-model="password" @focusout="chcekPassLogin" :class="{'errorClass' : errorPass}">
                        <p :class="{'changeOPacity' : errorPass}">Invalid password</p>
                    </div>
                <div id="registerDiv" class="w-100 d-flex flex-column justify-content-center align-items-center">  
                    <p class="showErrorP" :class="{'changeOPacity' : showError}">{{ errors }}</p>
                    <input type="button" value="Login" class="text-white submitForm" @click="userLogInSubmit">
                </div>
            </form>
        </section>
    </section>
</template>



<style>
    .main{
        width: 100%;
        height: 100%;
        display: flex;
        background-color: #000 !important;
    }
    input{
    width: 60%;
    outline: none;
    border: 1px solid #888;
    border-radius: .5rem;
    }
    @media screen and (min-width: 450px) and (max-width: 850px) {
        .main{
            flex-direction: column;
            align-items: center;
        }
        #form{
            width: 90% !important;
            justify-content: center !important;
        }
        .inMiddle{
            gap: .2rem;
        }
        #registerDiv{
            margin-top: 1rem;
        }
    }
   
</style>