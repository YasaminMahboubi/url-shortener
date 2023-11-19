<script setup>
    import { ref } from 'vue';
    const emit =  defineEmits(['showForm']);

    const userSignUp = ref(' ');
    const emailSignUp = ref(' ');
    const passSignUp = ref('');

    const errorUser = ref(false);
    const errorEmail = ref(false);
    const errorPass = ref(false);
    const showError = ref(false);

    const errors = ref('');

    const checkUsername = () => {
        let userName = userSignUp.value.trim();
        errorUser.value = /^[A-Za-z]+$/.test(userName) ? false : true;
    }

    const checkEmail = () => {
        let email = emailSignUp.value.trim();
        errorEmail.value = /^[A-Za-z0-9.-_]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(email) ? false : true;
    }

    const checkPass = () => {
        let pass = passSignUp.value.trim();
        errorPass.value = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[\d])[a-zA-Z0-9@#$%^&*!-_+]{6,}$/.test(pass) ? false : true;
    }

    const userSignupSubmit =  () => {
        let data = {
            username: userSignUp.value.trim(),
            email: emailSignUp.value.trim(),
            password : passSignUp.value.trim() 
        }
        fetch('http://localhost:3000/api/signup' , {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(resp => resp.json())
        .then(result => {
            console.log(result);
            if(result.input || result.error){
                errors.value = result.input ? result.input : result.error;
                showError.value = true;
            }
            else{
                localStorage.setItem('accessUser' , JSON.stringify(result.access));
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
                <h1 class="display-1 text-white">Register<br>Today</h1>
                <p id="secSlogan" class="h2 text-white">Register to keep track of your url views</p>
                <p class="d-inline text-white h4">Already have an account?</p> 
                <a href="" class="text-decoration-none text-success h4 m-2" @click.prevent="$emit('showForm' , 'login')">Log in</a><br>
                <a href="" class="text-decoration-none text-white h4 guest" @click.prevent="$emit('showForm' , 'onLoad')">Continue as guest</a>
            </div>
        </section>
        <section id="form" class="rounded d-flex justify-content-flex-start align-items-center">
            <form action="" class="inMiddle d-flex flex-column justify-content-center align-items-center">

               <div>
                    <label for="username">Username <span class="redFont">*</span></label>
                    <input type="text" name="username" class="p-2"  placeholder="username" @focusout="checkUsername" v-model="userSignUp" :class="{'errorClass' : errorUser}">
                    <p class="m-0" :class="{'displayOn' : errorUser}">Username only can contain letters</p>
               </div>
               <div>
                    <label for="email">Email <span class="redFont">*</span></label>
                    <input type="email" name="email" id="email" placeholder="email" class="p-2" @focusout="checkEmail" v-model="emailSignUp" :class="{'errorClass' : errorEmail}">
                    <p :class="{'changeOPacity' : errorEmail}">Invalid email</p>
               </div>

               <div>
                    <label for="password">Password <span class="redFont">*</span></label>
                    <input type="password" name="password" placeholder="password" class="p-2" @focusout="checkPass" v-model="passSignUp" :class="{'errorClass' : errorPass}">
                    <p :class="{'changeOPacity' : errorPass}">Password should have atleast one uppercase, one lowercase letter, one digit and it should be 6char or longer</p>
               </div>
            

                <div id="registerDiv" class="w-100 d-flex flex-column justify-content-center align-items-center">
                    <p class="showErrorP" :class="{'changeOPacity' : showError}">{{ errors }}</p>
                    <input type="button" value="Register" class="text-white submitForm" @click="userSignupSubmit">
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
        #registerSlogan{
            width: 80%;
            height: 80%;
        }
        #registerSlogan > div > h1{
            font-size: 3rem;
        }
        #registerSlogan > div > p{
            font-size: 1.3rem;
        }
    }
    @media screen and (max-width: 455px){
        #secSlogan {
            display: none;
        }
        input{
            width: 80%;
        }
        #form{
            width: 100% !important; 
        }
        #form > form {
            width: 90% !important;
            height: 90% !important;
            align-items: flex-start !important;
            padding: .5rem;
            padding-left: .8rem;
        }
        label{
            margin-left: .4rem;
        }
        #form > form  > input{
            width: 80% !important;
            border: none !important;
            border-radius: 0 !important;
            border-bottom: 1px solid rgb(164, 158, 158) !important;
            margin-left: .9rem !important;
        }
    }
</style>