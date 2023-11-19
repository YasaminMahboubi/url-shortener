<template>
    <div class="container">
        <div class="row" id="header">
            <div id="slogan" class="col-sm">
                <p><span class="redFont">urls</span><br>
                the shorter,<br>the better</p>
            </div>
            <div id="register" class="col-sm d-flex justify-content-end align-items-center">
                <button class="rounded " @click="$emit('showForm' , 'login')">Login</button>
                <button class="rounded " @click="$emit('showForm' , 'signup')">Signup</button>
            </div>
        </div>
        <generator></generator>
    </div>
</template>

<script setup>
    import { ref } from 'vue';
    import generator from './generator.vue';
    const loginActive = ref(false);
    const emit =  defineEmits(['showForm']);

    const hovering = () => {
        loginActive.value = true;
    }

    const undoHover = () => {
        loginActive.value = false;
    }

    window.addEventListener('load' , () => {
        let access = localStorage.getItem('accessUser');
        if(access){
            emit('showForm' , 'userLogedIn');
        }
    })
</script>


<style scoped>
#inpField , #showResult{
    height: 30%;
}
@media screen and (max-width: 850px) {
    #header{
        display: flex;
        flex-direction: column-reverse;
    }
    #register{
        padding-top: 3rem;
    }
    #slogan {
        padding: 2rem;
        margin: 3rem;
        font-size: 2rem;
    }
    #register > button{
        padding: 1rem;
    }
}


</style>