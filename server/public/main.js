const app = new Vue({
    el: "#main",
    data(){
        return {
            urlInp: '',
            resultUrl: '',
            resultUrlLink: '',
        }
    },
    methods:{
        restart(){
            this.urlInp = '';
            this.resultUrl = '';
        },
        copyText(){
            navigator.clipboard.writeText(this.resultUrl);
        },
        converting(how){
            let inputData = this.urlInp;
            let fetchUrl = how == 'generate' ? '/api/urlReq' : '/api/regenerate';

            fetch(fetchUrl , {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ urlReq: inputData })
                })
                .then(resp => resp.json())
                .then(result => {
                    this.resultUrl = result.message;
                    this.resultUrlLink = result.message;
                })
                .catch(er => console.error(er))
        }
    }
})




















